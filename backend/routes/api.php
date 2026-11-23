
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;

// Public routes
Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Coastal Haven API is running!',
        'project' => 'Coastal Haven - Jaffna',
    ]);
});

Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{id}', [RoomController::class, 'show']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/availability', [BookingController::class, 'availability']);

// Authenticated guest routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Guest bookings
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);
    Route::patch('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {

        // Room management
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{id}', [RoomController::class, 'update']);
        Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

        // Booking management
        Route::get('/bookings', [BookingController::class, 'adminIndex']);
        Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    });
});
