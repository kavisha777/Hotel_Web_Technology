<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BookingReceivedMail;
use App\Mail\BookingConfirmedMail;
use App\Models\Booking;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    private const ACTIVE_STATUSES = ['pending', 'confirmed'];

    /**
     * Check room availability.
     */
    public function availability(Request $request)
    {
        $validated = $request->validate([
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'guests' => ['required', 'integer', 'min:1'],
        ]);

        $checkIn = $validated['check_in'];
        $checkOut = $validated['check_out'];
        $guests = $validated['guests'];

        $rooms = Room::where('status', 'available')
            ->where('capacity', '>=', $guests)
            ->whereDoesntHave('bookings', function ($query) use ($checkIn, $checkOut) {
                $query->whereIn('status', self::ACTIVE_STATUSES)
                    ->where('check_in', '<', $checkOut)
                    ->where('check_out', '>', $checkIn);
            })
            ->get();

        return response()->json([
            'success' => true,
            'rooms' => $rooms,
        ]);
    }

    /**
     * Get unavailable dates for a room.
     */
    public function unavailableDates($roomId)
    {
        $room = Room::findOrFail($roomId);

        $bookings = $room->bookings()
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->where('check_out', '>', today())
            ->get(['check_in', 'check_out']);

        $unavailableDates = [];

        foreach ($bookings as $booking) {
            $start = Carbon::parse($booking->check_in);
            $end = Carbon::parse($booking->check_out);

            // The checkout date is available for the next guest.
            while ($start->lt($end)) {
                $unavailableDates[] = $start->toDateString();
                $start->addDay();
            }
        }

        return response()->json([
            'success' => true,
            'unavailable_dates' => array_values(array_unique($unavailableDates)),
        ]);
    }

    /**
     * Create a booking.
     */
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
                    'room_id' => 'This room is currently unavailable.',
                ]);
            }

            if ($validated['guests'] > $room->capacity) {
                throw ValidationException::withMessages([
                    'guests' => 'The number of guests exceeds this room’s capacity.',
                ]);
            }

            $overlappingBooking = Booking::where('room_id', $room->id)
                ->whereIn('status', self::ACTIVE_STATUSES)
                ->where('check_in', '<', $validated['check_out'])
                ->where('check_out', '>', $validated['check_in'])
                ->exists();

            if ($overlappingBooking) {
                throw ValidationException::withMessages([
                    'room_id' => 'This room is already booked for the selected dates.',
                ]);
            }

            $nights = Carbon::parse($validated['check_in'])
                ->diffInDays(Carbon::parse($validated['check_out']));

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

        // Send booking received email.
        // Email failure must not cancel the booking.
        try {
            $emailBooking = $booking->load('room');

            Mail::to($booking->guest_email)
                ->send(new BookingReceivedMail($emailBooking));

        } catch (\Throwable $e) {
            Log::error('Booking received email failed: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Your booking has been submitted successfully.',
            'booking' => $booking->load('room'),
        ], 201);
    }

    /**
     * Get bookings belonging to the logged-in user.
     */
    public function myBookings(Request $request)
    {
        $bookings = Booking::with('room')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Cancel a user's own booking.
     */
    public function cancel(Request $request, $id)
    {
        $booking = Booking::where('user_id', $request->user()->id)
            ->findOrFail($id);

        if (!in_array($booking->status, self::ACTIVE_STATUSES)) {
            return response()->json([
                'success' => false,
                'message' => 'This booking cannot be cancelled.',
            ], 422);
        }

        if (Carbon::parse($booking->check_in)->startOfDay()->lte(today())) {
            return response()->json([
                'success' => false,
                'message' => 'Bookings cannot be cancelled on or after the check-in date.',
            ], 422);
        }

        $booking->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your booking has been cancelled successfully.',
            'booking' => $booking->fresh()->load('room'),
        ]);
    }

    /**
     * Get all bookings for the admin dashboard.
     */
    public function adminIndex()
    {
        $bookings = Booking::with(['user', 'room'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Admin confirms or cancels a booking.
     */
    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:confirmed,cancelled'],
        ]);

        $result = DB::transaction(function () use ($id, $validated) {

            $booking = Booking::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            $oldStatus = $booking->status;
            $newStatus = $validated['status'];

            if ($oldStatus === $newStatus) {
                return [
                    'booking' => $booking,
                    'old_status' => $oldStatus,
                    'changed' => false,
                ];
            }

            if ($newStatus === 'confirmed') {

                if (Carbon::parse($booking->check_in)->startOfDay()->lt(today())) {
                    throw ValidationException::withMessages([
                        'status' => 'A booking with a past check-in date cannot be confirmed.',
                    ]);
                }

                $room = Room::whereKey($booking->room_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($room->status !== 'available') {
                    throw ValidationException::withMessages([
                        'status' => 'This room is currently unavailable.',
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
                        'status' => 'This booking overlaps with another confirmed booking.',
                    ]);
                }

                // Cancel overlapping pending bookings.
                Booking::where('room_id', $booking->room_id)
                    ->where('id', '!=', $booking->id)
                    ->where('status', 'pending')
                    ->where('check_in', '<', $booking->check_out)
                    ->where('check_out', '>', $booking->check_in)
                    ->update([
                        'status' => 'cancelled',
                    ]);
            }

            $booking->update([
                'status' => $newStatus,
            ]);

            return [
                'booking' => $booking->fresh()->load(['user', 'room']),
                'old_status' => $oldStatus,
                'changed' => true,
            ];
        });

        // Send confirmation email only when the status changes to confirmed.
        if (
            $validated['status'] === 'confirmed'
            && $result['changed']
        ) {
            try {
                $emailBooking = $result['booking']->load('room');

                Mail::to($emailBooking->guest_email)
                    ->send(new BookingConfirmedMail($emailBooking));

            } catch (\Throwable $e) {
                Log::error('Booking confirmation email failed: ' . $e->getMessage());
            }
        }

        $message = $validated['status'] === 'confirmed'
            ? 'Booking confirmed successfully.'
            : 'Booking cancelled successfully.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'booking' => $result['booking']->fresh()->load(['user', 'room']),
        ]);
    }
}
