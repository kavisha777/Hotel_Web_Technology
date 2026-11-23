<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Coastal Haven API is running!',
        'project' => 'Coastal Haven - Jaffna'
    ]);
});