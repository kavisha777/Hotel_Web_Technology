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
                'description' => 'Enjoy stunning ocean views from this elegant room with a private balcony and modern comforts.',
                'room_type' => 'Deluxe Room',
                'facilities' => ['Ocean View', 'Air Conditioning', 'Free Wi-Fi', 'Private Bathroom', 'King Size Bed', 'Balcony'],
                'price_per_night' => 12000,
                'capacity' => 2,
                'image' => 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Luxury Family Suite',
                'description' => 'A spacious family suite with comfortable bedrooms and everything needed for a relaxing family holiday.',
                'room_type' => 'Family Suite',
                'facilities' => ['Air Conditioning', 'Free Wi-Fi', 'Private Bathroom', 'Two Bedrooms', 'Television', 'Mini Refrigerator'],
                'price_per_night' => 18000,
                'capacity' => 4,
                'image' => 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Premium Garden Villa',
                'description' => 'A peaceful private villa surrounded by tropical greenery and beautiful garden scenery.',
                'room_type' => 'Private Villa',
                'facilities' => ['Garden View', 'Air Conditioning', 'Free Wi-Fi', 'Private Bathroom', 'Private Terrace', 'Outdoor Seating'],
                'price_per_night' => 15000,
                'capacity' => 3,
                'image' => 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Ocean Honeymoon Suite',
                'description' => 'An elegant ocean-facing suite designed for a peaceful and memorable coastal escape.',
                'room_type' => 'Honeymoon Suite',
                'facilities' => ['Ocean View', 'Jacuzzi', 'King Size Bed', 'Balcony', 'Free Wi-Fi'],
                'price_per_night' => 22000,
                'capacity' => 2,
                'image' => 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Beachfront Bungalow',
                'description' => 'Stay close to the beach in this charming bungalow with a relaxing tropical atmosphere.',
                'room_type' => 'Bungalow',
                'facilities' => ['Beach Access', 'Ocean View', 'Air Conditioning', 'Free Wi-Fi', 'Private Bathroom'],
                'price_per_night' => 20000,
                'capacity' => 3,
                'image' => 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Coastal Penthouse',
                'description' => 'Experience premium coastal living in a spacious penthouse with a private terrace.',
                'room_type' => 'Penthouse',
                'facilities' => ['Ocean View', 'Private Terrace', 'Swimming Pool', 'Free Wi-Fi', 'Kitchen'],
                'price_per_night' => 28000,
                'capacity' => 5,
                'image' => 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Classic Garden Room',
                'description' => 'A comfortable and affordable room overlooking the beautiful tropical garden.',
                'room_type' => 'Standard Room',
                'facilities' => ['Garden View', 'Air Conditioning', 'Free Wi-Fi', 'Private Bathroom'],
                'price_per_night' => 9000,
                'capacity' => 2,
                'image' => 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Private Pool Villa',
                'description' => 'Enjoy privacy and luxury in a beautiful villa featuring your own swimming pool.',
                'room_type' => 'Private Villa',
                'facilities' => ['Private Pool', 'Kitchen', 'Ocean View', 'Free Wi-Fi', 'Air Conditioning'],
                'price_per_night' => 35000,
                'capacity' => 6,
                'image' => 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Tropical Comfort Room',
                'description' => 'A bright and welcoming room with modern facilities for a comfortable stay.',
                'room_type' => 'Standard Room',
                'facilities' => ['Air Conditioning', 'Free Wi-Fi', 'Television', 'Private Bathroom'],
                'price_per_night' => 10000,
                'capacity' => 2,
                'image' => 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Sunset Ocean Suite',
                'description' => 'Watch beautiful coastal sunsets from this stylish suite with a private balcony.',
                'room_type' => 'Deluxe Room',
                'facilities' => ['Ocean View', 'Balcony', 'King Size Bed', 'Free Wi-Fi', 'Air Conditioning'],
                'price_per_night' => 19000,
                'capacity' => 3,
                'image' => 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Executive Business Suite',
                'description' => 'A refined suite with a comfortable workspace and modern conveniences.',
                'room_type' => 'Executive Suite',
                'facilities' => ['Work Desk', 'Free Wi-Fi', 'Air Conditioning', 'Television', 'Mini Refrigerator'],
                'price_per_night' => 17000,
                'capacity' => 2,
                'image' => 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Seaside Family Villa',
                'description' => 'A spacious villa with generous living areas, ideal for a family coastal holiday.',
                'room_type' => 'Family Suite',
                'facilities' => ['Ocean View', 'Two Bedrooms', 'Kitchen', 'Free Wi-Fi', 'Air Conditioning'],
                'price_per_night' => 26000,
                'capacity' => 5,
                'image' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Luxury Garden Suite',
                'description' => 'Relax in a stylish suite surrounded by lush greenery and peaceful outdoor spaces.',
                'room_type' => 'Garden Suite',
                'facilities' => ['Garden View', 'Private Terrace', 'King Size Bed', 'Free Wi-Fi', 'Air Conditioning'],
                'price_per_night' => 16000,
                'capacity' => 3,
                'image' => 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Royal Coastal Villa',
                'description' => 'A premium villa offering spacious accommodation and an exceptional coastal experience.',
                'room_type' => 'Luxury Villa',
                'facilities' => ['Ocean View', 'Private Pool', 'Kitchen', 'Private Terrace', 'Free Wi-Fi'],
                'price_per_night' => 40000,
                'capacity' => 6,
                'image' => 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900',
                'status' => 'available',
            ],
            [
                'name' => 'Deluxe Twin Room',
                'description' => 'A practical and elegant room with twin beds, suitable for friends travelling together.',
                'room_type' => 'Deluxe Room',
                'facilities' => ['Twin Beds', 'Garden View', 'Free Wi-Fi', 'Air Conditioning', 'Private Bathroom'],
                'price_per_night' => 11000,
                'capacity' => 2,
                'image' => 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900',
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
