<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    // Search for available rooms
    public function availability(Request $request)
    {
        $validated = $request->validate([
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
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
            'rooms' => $rooms,
            'message' => $rooms->isEmpty()
                ? 'No rooms are available for these dates.'
                : 'Available rooms retrieved successfully.',
        ]);
    }

    // Create a booking
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'guest_name' => ['required', 'string', 'max:255'],
            'guest_email' => ['required', 'email', 'max:255'],
            'guest_contact_number' => ['required', 'string', 'max:30'],
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
        ]);

        $booking = DB::transaction(function () use ($validated, $request) {

            $room = Room::whereKey($validated['room_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($room->status !== 'available') {
                throw ValidationException::withMessages([
                    'room_id' => ['This room is currently unavailable.'],
                ]);
            }

            if ($validated['guests'] > $room->capacity) {
                throw ValidationException::withMessages([
                    'guests' => ['The number of guests exceeds this room capacity.'],
                ]);
            }

            $overlap = Booking::where('room_id', $room->id)
                ->where('status', 'confirmed')
                ->where('check_in', '<', $validated['check_out'])
                ->where('check_out', '>', $validated['check_in'])
                ->exists();

            if ($overlap) {
                throw ValidationException::withMessages([
                    'room_id' => ['This room has already been booked for the selected dates.'],
                ]);
            }

            $checkIn = Carbon::parse($validated['check_in']);
            $checkOut = Carbon::parse($validated['check_out']);

            $nights = $checkIn->diffInDays($checkOut);

            $totalPrice = $nights * (float) $room->price_per_night;

            return Booking::create([
                'user_id' => $request->user()->id,
                'room_id' => $room->id,
                'guest_name' => $validated['guest_name'],
                'guest_email' => $validated['guest_email'],
                'guest_contact_number' => $validated['guest_contact_number'],
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'guests' => $validated['guests'],
                'total_price' => $totalPrice,
                'status' => 'pending',
            ]);
        });

        return response()->json([
            'message' => 'Booking submitted successfully. Awaiting administrator confirmation.',
            'booking' => $booking->load('room'),
        ], 201);
    }

    // Display bookings belonging to the logged-in guest
    public function myBookings(Request $request)
    {
        $bookings = Booking::with('room')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    // Cancel a guest's own booking
    public function cancel(Request $request, string $id)
    {
        $booking = Booking::where('user_id', $request->user()->id)
            ->findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending bookings can be cancelled by guests.',
            ], 422);
        }

        $booking->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Booking cancelled successfully.',
            'booking' => $booking->fresh(),
        ]);
    }

    // Display all bookings for administrators
    public function adminIndex()
    {
        $bookings = Booking::with(['user', 'room'])
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    // Update booking status by administrator
    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'cancelled'])],
        ]);

        $booking = DB::transaction(function () use ($id, $validated) {

            $booking = Booking::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($booking->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'status' => ['This booking has already been cancelled.'],
                ]);
            }

            if ($validated['status'] === 'confirmed') {

                if ($booking->check_in->isPast()) {
                    throw ValidationException::withMessages([
                        'status' => ['Past bookings cannot be confirmed.'],
                    ]);
                }

                $room = Room::whereKey($booking->room_id)
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
            'message' => 'Booking status updated successfully.',
            'booking' => $booking->load(['user', 'room']),
        ]);
    }
}
