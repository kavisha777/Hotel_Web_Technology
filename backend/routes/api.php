<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\BookingController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// API health check
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Coastal Haven API is running.',
    ]);
});

// Room routes
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

// IMPORTANT: Customers must access booked dates without admin permission.
Route::get(
    '/rooms/{roomId}/unavailable-dates',
    [BookingController::class, 'unavailableDates']
);

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Room availability search
Route::get('/availability', [BookingController::class, 'availability']);


/*
|--------------------------------------------------------------------------
| Authenticated User Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // User details
    Route::get('/me', [AuthController::class, 'me']);

    // Logout
    Route::post('/logout', [AuthController::class, 'logout']);

    // Customer bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);

    // Cancel customer's own pending booking
    Route::patch(
        '/bookings/{id}/cancel',
        [BookingController::class, 'cancel']
    );

});


/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

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
