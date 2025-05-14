<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create sample products
        $products = [
            [
                'name' => 'Laptop Pro',
                'description' => 'High-performance laptop for professionals',
                'price' => 1299.99,
                'stock' => 50,
                'sku' => 'LAPTOP-PRO-001',
                'is_active' => true,
            ],
            [
                'name' => 'Smartphone X',
                'description' => 'Latest smartphone with advanced features',
                'price' => 899.99,
                'stock' => 100,
                'sku' => 'SMARTPHONE-X-001',
                'is_active' => true,
            ],
            [
                'name' => 'Wireless Headphones',
                'description' => 'Noise-cancelling wireless headphones',
                'price' => 199.99,
                'stock' => 200,
                'sku' => 'HEADPHONES-001',
                'is_active' => true,
            ],
            [
                'name' => 'Smart Watch',
                'description' => 'Fitness and health tracking smartwatch',
                'price' => 249.99,
                'stock' => 75,
                'sku' => 'SMARTWATCH-001',
                'is_active' => true,
            ],
            [
                'name' => 'Tablet Mini',
                'description' => 'Compact tablet for entertainment and productivity',
                'price' => 399.99,
                'stock' => 60,
                'sku' => 'TABLET-MINI-001',
                'is_active' => true,
            ],
        ];

        // Insert products into the database
        foreach ($products as $productData) {
            Product::create($productData);
        }
    }
}
