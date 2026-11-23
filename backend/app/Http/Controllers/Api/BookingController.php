<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class BookingController extends Controller
{
    // Check room availability
    public function availability(Request $request)
    {
        $validated = $request->validate([
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests' => 'required|integer|min:1',
        ]);

        $rooms = Room::where('status', 'available')
            ->where('capacity', '>=', $validated['guests'])
            ->whereDoesntHave('bookings', function ($query) use ($validated) {
                $query->where('status', 'confirmed')
                    ->where('check_in', '<', $validated['check_out'])
                    ->where('check_out', '>', $validated['check_in']);
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rooms,
        ]);
    }

    // Create a booking
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'guests' => 'required|integer|min:1',
        ]);

        $booking = DB::transaction(function () use ($request, $validated) {

            $room = Room::where('id', $validated['room_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($room->status !== 'available') {
                throw ValidationException::withMessages([
                    'room_id' => ['This room is currently unavailable.'],
                ]);
            }

            if ($validated['guests'] > $room->capacity) {
                throw ValidationException::withMessages([
                    'guests' => ['The selected room cannot accommodate this number of guests.'],
                ]);
            }

            $overlap = Booking::where('room_id', $room->id)
                ->where('status', 'confirmed')
                ->where('check_in', '<', $validated['check_out'])
                ->where('check_out', '>', $validated['check_in'])
                ->exists();

            if ($overlap) {
                throw ValidationException::withMessages([
                    'room_id' => ['This room is already booked for the selected dates.'],
                ]);
            }

            $nights = Carbon::parse($validated['check_in'])
                ->diffInDays(Carbon::parse($validated['check_out']));

            $totalPrice = $nights * $room->price_per_night;

            return Booking::create([
                'user_id' => $request->user()->id,
                'room_id' => $room->id,
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'guests' => $validated['guests'],
                'total_price' => $totalPrice,
                'status' => 'pending',
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Booking submitted successfully.',
            'data' => $booking->load('room'),
        ], 201);
    }

    // Guest: view own bookings
    public function myBookings(Request $request)
    {
        $bookings = Booking::with('room')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    // Guest: cancel own booking
    public function cancel(Request $request, $id)
    {
        $booking = Booking::where('user_id', $request->user()->id)
            ->findOrFail($id);

        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'This booking cannot be cancelled.',
            ], 422);
        }

        if (
            $booking->status === 'confirmed' &&
            $booking->check_in <= now()->toDateString()
        ) {
            return response()->json([
                'success' => false,
                'message' => 'A booking that has already started cannot be cancelled online.',
            ], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully.',
        ]);
    }

    // Admin: view all bookings
    public function adminIndex()
    {
        $bookings = Booking::with(['user', 'room'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings,
        ]);
    }

    // Admin: confirm or cancel a booking
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:confirmed,cancelled',
        ]);

        $booking = DB::transaction(function () use ($id, $validated) {

            $booking = Booking::where('id', $id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($booking->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'status' => ['This booking has already been cancelled.'],
                ]);
            }

            if ($validated['status'] === 'confirmed') {

                if ($booking->check_in < now()->toDateString()) {
                    throw ValidationException::withMessages([
                        'status' => ['A past booking cannot be confirmed.'],
                    ]);
                }

                $room = Room::where('id', $booking->room_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($room->status !== 'available') {
                    throw ValidationException::withMessages([
                        'status' => ['This room is unavailable.'],
                    ]);
                }

                $overlap = Booking::where('room_id', $booking->room_id)
                    ->where('id', '!=', $booking->id)
                    ->where('status', 'confirmed')
                    ->where('check_in', '<', $booking->check_out)
                    ->where('check_out', '>', $booking->check_in)
                    ->exists();

                if ($overlap) {
                    throw ValidationException::withMessages([
                        'status' => ['Another confirmed booking overlaps these dates.'],
                    ]);
                }
            }

            $booking->update([
                'status' => $validated['status'],
            ]);

            return $booking;
        });

        return response()->json([
            'success' => true,
            'message' => 'Booking status updated successfully.',
            'data' => $booking,
        ]);
    }
}
