<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class RoomController extends Controller
{
    // Display all rooms
    public function index()
    {
        $rooms = Room::latest()->get();

        return response()->json($rooms);
    }

    // Display one room
    public function show(string $id)
    {
        $room = Room::findOrFail($id);

        return response()->json($room);
    }

    // Create a room
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'room_type' => ['required', 'string', 'max:100'],
            'facilities' => ['required', 'array', 'min:1'],
            'facilities.*' => ['required', 'string', 'max:100'],
            'price_per_night' => ['required', 'numeric', 'min:0.01'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', Rule::in(['available', 'unavailable'])],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')
                ->store('rooms', 'public');
        }

        $room = Room::create($validated);

        return response()->json([
            'message' => 'Room created successfully.',
            'room' => $room,
        ], 201);
    }

    // Update a room
    public function update(Request $request, string $id)
    {
        $room = Room::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'room_type' => ['sometimes', 'required', 'string', 'max:100'],
            'facilities' => ['sometimes', 'required', 'array', 'min:1'],
            'facilities.*' => ['required', 'string', 'max:100'],
            'price_per_night' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1'],
            'status' => ['sometimes', 'required', Rule::in(['available', 'unavailable'])],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
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
            'message' => 'Room updated successfully.',
            'room' => $room->fresh(),
        ]);
    }

    // Delete a room
    public function destroy(string $id)
    {
        $room = Room::findOrFail($id);

        if ($room->bookings()->exists()) {
            return response()->json([
                'message' => 'This room cannot be deleted because it has booking records.',
            ], 409);
        }

        if ($room->image) {
            Storage::disk('public')->delete($room->image);
        }

        $room->delete();

        return response()->json([
            'message' => 'Room deleted successfully.',
        ]);
    }
}
