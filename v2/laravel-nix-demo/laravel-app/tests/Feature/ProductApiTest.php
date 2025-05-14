<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Clear the cache before each test
        Cache::flush();
    }

    /**
     * Test getting all products.
     */
    public function test_get_all_products(): void
    {
        // Create some test products
        Product::factory()->count(3)->create();

        // First request (cache miss)
        $response = $this->getJson('/api/products');
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message',
                    'cache_hit'
                ])
                ->assertJson([
                    'success' => true,
                    'message' => 'Products retrieved successfully',
                    'cache_hit' => false
                ]);

        // Second request (cache hit)
        $response = $this->getJson('/api/products');
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Products retrieved successfully',
                    'cache_hit' => true
                ]);
    }

    /**
     * Test getting a single product.
     */
    public function test_get_single_product(): void
    {
        // Create a test product
        $product = Product::factory()->create();

        // First request (cache miss)
        $response = $this->getJson("/api/products/{$product->id}");
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message',
                    'cache_hit'
                ])
                ->assertJson([
                    'success' => true,
                    'message' => 'Product retrieved successfully',
                    'cache_hit' => false
                ]);

        // Second request (cache hit)
        $response = $this->getJson("/api/products/{$product->id}");
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Product retrieved successfully',
                    'cache_hit' => true
                ]);
    }

    /**
     * Test getting a non-existent product.
     */
    public function test_get_nonexistent_product(): void
    {
        $response = $this->getJson('/api/products/999');
        $response->assertStatus(404)
                ->assertJson([
                    'success' => false,
                    'message' => 'Product not found'
                ]);
    }

    /**
     * Test creating a product.
     */
    public function test_create_product(): void
    {
        $productData = [
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'price' => 99.99,
            'stock' => 10,
            'sku' => 'TEST-SKU-001',
            'is_active' => true
        ];

        $response = $this->postJson('/api/products', $productData);
        $response->assertStatus(201)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ])
                ->assertJson([
                    'success' => true,
                    'message' => 'Product created successfully'
                ]);

        // Check that the product was created in the database
        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'sku' => 'TEST-SKU-001'
        ]);
    }

    /**
     * Test validation when creating a product.
     */
    public function test_create_product_validation(): void
    {
        $response = $this->postJson('/api/products', [
            // Missing required fields
            'description' => 'This is a test product'
        ]);

        $response->assertStatus(422)
                ->assertJsonStructure([
                    'success',
                    'message',
                    'errors'
                ])
                ->assertJson([
                    'success' => false,
                    'message' => 'Validation failed'
                ]);
    }

    /**
     * Test updating a product.
     */
    public function test_update_product(): void
    {
        // Create a test product
        $product = Product::factory()->create();

        $updateData = [
            'name' => 'Updated Product Name',
            'price' => 149.99
        ];

        $response = $this->putJson("/api/products/{$product->id}", $updateData);
        $response->assertStatus(200)
                ->assertJsonStructure([
                    'success',
                    'data',
                    'message'
                ])
                ->assertJson([
                    'success' => true,
                    'message' => 'Product updated successfully'
                ]);

        // Check that the product was updated in the database
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product Name',
            'price' => 149.99
        ]);
    }

    /**
     * Test deleting a product.
     */
    public function test_delete_product(): void
    {
        // Create a test product
        $product = Product::factory()->create();

        $response = $this->deleteJson("/api/products/{$product->id}");
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Product deleted successfully'
                ]);

        // Check that the product was deleted from the database
        $this->assertDatabaseMissing('products', [
            'id' => $product->id
        ]);
    }

    /**
     * Test clearing the cache.
     */
    public function test_clear_cache(): void
    {
        // Create some test products
        Product::factory()->count(3)->create();

        // First request to populate the cache
        $this->getJson('/api/products');

        // Clear the cache
        $response = $this->getJson('/api/products/cache/clear');
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Product caches cleared successfully'
                ]);

        // Next request should be a cache miss
        $response = $this->getJson('/api/products');
        $response->assertStatus(200)
                ->assertJson([
                    'success' => true,
                    'message' => 'Products retrieved successfully',
                    'cache_hit' => false
                ]);
    }
}
