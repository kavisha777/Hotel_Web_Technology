<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Room;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        Room::insert([
            [
                'name' => 'Deluxe Ocean View',
                'description' => 'A comfortable room with beautiful coastal views.',
                'price_per_night' => 12000,
                'capacity' => 2,
                'image' => 'rooms/ocean-view.jpg',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Luxury Family Suite',
                'description' => 'A spacious suite designed for family comfort.',
                'price_per_night' => 18000,
                'capacity' => 4,
                'image' => 'rooms/family-suite.jpg',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Premium Garden Villa',
                'description' => 'A peaceful room surrounded by greenery.',
                'price_per_night' => 15000,
                'capacity' => 3,
                'image' => 'rooms/garden-villa.jpg',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}