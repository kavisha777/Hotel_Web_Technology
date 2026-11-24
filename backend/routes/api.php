<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\ReviewController;

// Public routes
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Coastal Haven API is running.',
    ]);
});

Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

Route::get(
    '/rooms/{roomId}/unavailable-dates',
    [BookingController::class, 'unavailableDates']
);

Route::get(
    '/rooms/{roomId}/reviews',
    [ReviewController::class, 'index']
);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/availability', [BookingController::class, 'availability']);

// Authenticated user routes
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);

    Route::patch(
        '/bookings/{id}/cancel',
        [BookingController::class, 'cancel']
    );

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])
    ->prefix('admin')
    ->group(function () {

        // Room management
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{id}', [RoomController::class, 'update']);
        Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

        // Booking management
        Route::get('/bookings', [BookingController::class, 'adminIndex']);

        Route::patch(
            '/bookings/{id}/status',
            [BookingController::class, 'updateStatus']
        );
    });