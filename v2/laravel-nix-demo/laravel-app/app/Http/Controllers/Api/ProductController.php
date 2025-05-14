<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        // Use Redis cache for products list with a 10-minute expiration
        $products = Cache::remember('products.all', 600, function () {
            Log::info('Cache miss for products.all - fetching from database');
            return Product::all();
        });

        return response()->json([
            'success' => true,
            'data' => $products,
            'message' => 'Products retrieved successfully',
            'cache_hit' => !Cache::missing('products.all')
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        // Validate the request
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'sku' => 'required|string|unique:products,sku',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create the product
        $product = Product::create($request->all());

        // Clear the products cache
        Cache::forget('products.all');

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        // Use Redis cache for individual product with a 10-minute expiration
        $product = Cache::remember("products.{$id}", 600, function () use ($id) {
            Log::info("Cache miss for products.{$id} - fetching from database");
            return Product::find($id);
        });

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product retrieved successfully',
            'cache_hit' => !Cache::missing("products.{$id}")
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        // Find the product
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Validate the request
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'stock' => 'integer|min:0',
            'sku' => "string|unique:products,sku,{$id}",
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update the product
        $product->update($request->all());

        // Clear the product caches
        Cache::forget('products.all');
        Cache::forget("products.{$id}");

        return response()->json([
            'success' => true,
            'data' => $product,
            'message' => 'Product updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        // Find the product
        $product = Product::find($id);

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        // Delete the product
        $product->delete();

        // Clear the product caches
        Cache::forget('products.all');
        Cache::forget("products.{$id}");

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Clear all product caches.
     */
    public function clearCache(): JsonResponse
    {
        // Get all product IDs
        $productIds = Product::pluck('id');

        // Clear all individual product caches
        foreach ($productIds as $id) {
            Cache::forget("products.{$id}");
        }

        // Clear the products list cache
        Cache::forget('products.all');

        return response()->json([
            'success' => true,
            'message' => 'Product caches cleared successfully'
        ]);
    }
}
