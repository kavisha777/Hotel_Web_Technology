<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            [
                'name' => 'Deluxe Ocean View',
                'description' => 'Enjoy a relaxing coastal escape with beautiful ocean views and a comfortable modern interior.',
                'room_type' => 'Deluxe Room',
                'facilities' => [
                    'Ocean View',
                    'Air Conditioning',
                    'Free Wi-Fi',
                    'Private Bathroom',
                    'King Size Bed',
                    'Balcony',
                ],
                'price_per_night' => 12000,
                'capacity' => 2,
                'image' => 'rooms/ocean-view.jpg',
                'status' => 'available',
            ],
            [
                'name' => 'Luxury Family Suite',
                'description' => 'A spacious family suite offering extra comfort, modern facilities and a relaxing atmosphere.',
                'room_type' => 'Family Suite',
                'facilities' => [
                    'Air Conditioning',
                    'Free Wi-Fi',
                    'Private Bathroom',
                    'Two Bedrooms',
                    'Television',
                    'Mini Refrigerator',
                ],
                'price_per_night' => 18000,
                'capacity' => 4,
                'image' => 'rooms/family-suite.jpg',
                'status' => 'available',
            ],
            [
                'name' => 'Premium Garden Villa',
                'description' => 'Relax in a peaceful private villa surrounded by beautiful tropical garden scenery.',
                'room_type' => 'Private Villa',
                'facilities' => [
                    'Garden View',
                    'Air Conditioning',
                    'Free Wi-Fi',
                    'Private Bathroom',
                    'Private Terrace',
                    'Outdoor Seating',
                ],
                'price_per_night' => 15000,
                'capacity' => 3,
                'image' => 'rooms/garden-villa.jpg',
                'status' => 'available',
            ],
        ];

        foreach ($rooms as $room) {
            Room::updateOrCreate(
                ['name' => $room['name']],
                $room
            );
        }
    }
}
