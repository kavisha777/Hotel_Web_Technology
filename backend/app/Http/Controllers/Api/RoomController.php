<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    // Public: list available rooms
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Room::all(),
        ]);
    }

    // Public: view one room
    public function show($id)
    {
        $room = Room::findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $room,
        ]);
    }

    
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'required|string',
        'price_per_night' => 'required|numeric|min:0.01',
        'capacity' => 'required|integer|min:1',
        'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        'status' => 'required|in:available,unavailable',
    ]);

    if ($request->hasFile('image')) {
        $validated['image'] = $request->file('image')
            ->store('rooms', 'public');
    }

    $room = Room::create($validated);

    return response()->json([
        'success' => true,
        'message' => 'Room created successfully.',
        'data' => $room,
    ], 201);
}

public function update(Request $request, $id)
{
    $room = Room::findOrFail($id);

    $validated = $request->validate([
        'name' => 'sometimes|required|string|max:255',
        'description' => 'sometimes|required|string',
        'price_per_night' => 'sometimes|required|numeric|min:0.01',
        'capacity' => 'sometimes|required|integer|min:1',
        'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        'status' => 'sometimes|required|in:available,unavailable',
    ]);

    if ($request->hasFile('image')) {
        if ($room->image) {
            Storage::disk('public')->delete($room->image);
        }

        $validated['image'] = $request->file('image')
            ->store('rooms', 'public');
    }

    $room->update($validated);

    return response()->json([
        'success' => true,
        'message' => 'Room updated successfully.',
        'data' => $room,
    ]);
}


    // Admin: delete room
    public function destroy($id)
    {
        $room = Room::findOrFail($id);

        if ($room->bookings()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This room has booking records and cannot be deleted.',
            ], 422);
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully.',
        ]);
    }
}
