<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@coastalhaven.com'],
            [
                'name' => 'Coastal Haven Admin',
                'password' => Hash::make('ChangeThisAdminPassword123!'),
                'role' => 'admin',
            ]
        );
    }
}
