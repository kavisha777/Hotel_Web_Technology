<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    // Display reviews and average rating for a room.
    public function index(string $roomId)
    {
        $reviews = Review::with('user:id,name')
            ->where('room_id', $roomId)
            ->latest()
            ->get();

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => round(
                $reviews->avg('rating') ?? 0,
                1
            ),
            'total_reviews' => $reviews->count(),
        ]);
    }

    // Submit a review for an eligible completed booking.
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $booking = Booking::where('id', $validated['booking_id'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($booking->status !== 'confirmed') {
            throw ValidationException::withMessages([
                'booking_id' => ['Only confirmed bookings can be reviewed.'],
            ]);
        }

        if ($booking->check_out->startOfDay()->gt(today())) {
            throw ValidationException::withMessages([
                'booking_id' => ['You can review this room after your stay is completed.'],
            ]);
        }

        if (Review::where('booking_id', $booking->id)->exists()) {
            throw ValidationException::withMessages([
                'booking_id' => ['You have already reviewed this booking.'],
            ]);
        }

        $review = Review::create([
            'booking_id' => $booking->id,
            'room_id' => $booking->room_id,
            'user_id' => $request->user()->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
        ]);

        return response()->json([
            'message' => 'Thank you! Your review has been submitted.',
            'review' => $review->load('user:id,name'),
        ], 201);
    }
}
