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
    private const ACTIVE_STATUSES = ['pending', 'confirmed'];

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
                $query->whereIn('status', self::ACTIVE_STATUSES)
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

    public function unavailableDates(string $roomId)
    {
        $room = Room::findOrFail($roomId);

        $bookings = Booking::where('room_id', $room->id)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->whereDate('check_out', '>', today())
            ->orderBy('check_in')
            ->get(['check_in', 'check_out']);

        return response()->json([
            'bookings' => $bookings,
        ]);
    }

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
                ->whereIn('status', self::ACTIVE_STATUSES)
                ->where('check_in', '<', $validated['check_out'])
                ->where('check_out', '>', $validated['check_in'])
                ->exists();

            if ($overlap) {
                throw ValidationException::withMessages([
                    'room_id' => [
                        'This room is already reserved for some or all of these dates. Please choose different dates.',
                    ],
                ]);
            }

            $checkIn = Carbon::parse($validated['check_in']);
            $checkOut = Carbon::parse($validated['check_out']);

            $nights = (int) $checkIn->diffInDays($checkOut);

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

    public function myBookings(Request $request)
    {
        $bookings = Booking::with('room')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    // Guests can cancel their own pending or confirmed bookings
    // before the check-in date.
    public function cancel(Request $request, string $id)
    {
        $result = DB::transaction(function () use ($request, $id) {
            $booking = Booking::where('user_id', $request->user()->id)
                ->whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if (!in_array($booking->status, self::ACTIVE_STATUSES, true)) {
                throw ValidationException::withMessages([
                    'status' => ['This booking cannot be cancelled.'],
                ]);
            }

            if (Carbon::parse($booking->check_in)->startOfDay()->lte(today()->startOfDay())) {
                throw ValidationException::withMessages([
                    'status' => [
                        'Bookings cannot be cancelled on or after the check-in date.',
                    ],
                ]);
            }

            $booking->update([
                'status' => 'cancelled',
            ]);

            return $booking->fresh()->load('room');
        });

        return response()->json([
            'message' => 'Booking cancelled successfully.',
            'booking' => $result,
        ]);
    }

    public function adminIndex()
    {
        $bookings = Booking::with(['user', 'room'])
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    public function updateStatus(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['confirmed', 'cancelled'])],
        ]);

        $result = DB::transaction(function () use ($id, $validated) {
            $existingBooking = Booking::findOrFail($id);

            $room = Room::whereKey($existingBooking->room_id)
                ->lockForUpdate()
                ->firstOrFail();

            $booking = Booking::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($booking->status === 'cancelled') {
                throw ValidationException::withMessages([
                    'status' => ['This booking has already been cancelled.'],
                ]);
            }

            $cancelledPendingCount = 0;

            if ($validated['status'] === 'confirmed') {
                if (Carbon::parse($booking->check_in)->startOfDay()->lt(today()->startOfDay())) {
                    throw ValidationException::withMessages([
                        'status' => ['Past bookings cannot be confirmed.'],
                    ]);
                }

                if ($room->status !== 'available') {
                    throw ValidationException::withMessages([
                        'status' => ['This room is unavailable.'],
                    ]);
                }

                $confirmedOverlap = Booking::where('room_id', $booking->room_id)
                    ->where('id', '!=', $booking->id)
                    ->where('status', 'confirmed')
                    ->where('check_in', '<', $booking->check_out)
                    ->where('check_out', '>', $booking->check_in)
                    ->exists();

                if ($confirmedOverlap) {
                    throw ValidationException::withMessages([
                        'status' => [
                            'This booking overlaps an existing confirmed booking. It cannot be confirmed.',
                        ],
                    ]);
                }

                $overlappingPending = Booking::where('room_id', $booking->room_id)
                    ->where('id', '!=', $booking->id)
                    ->where('status', 'pending')
                    ->where('check_in', '<', $booking->check_out)
                    ->where('check_out', '>', $booking->check_in);

                $cancelledPendingCount = $overlappingPending->update([
                    'status' => 'cancelled',
                ]);
            }

            $booking->update([
                'status' => $validated['status'],
            ]);

            return [
                'booking' => $booking,
                'cancelled_pending_count' => $cancelledPendingCount,
            ];
        });

        $message = $validated['status'] === 'confirmed'
            ? 'Booking confirmed successfully.'
            : 'Booking cancelled successfully.';

        if ($result['cancelled_pending_count'] > 0) {
            $message .= ' ' . $result['cancelled_pending_count']
                . ' overlapping pending booking(s) were automatically cancelled.';
        }

        return response()->json([
            'message' => $message,
            'booking' => $result['booking']->load(['user', 'room']),
            'cancelled_pending_count' => $result['cancelled_pending_count'],
        ]);
    }
}
