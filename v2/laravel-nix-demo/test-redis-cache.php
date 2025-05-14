<?php
/**
 * Redis Cache Test Script for Laravel
 * 
 * This script tests the Redis caching functionality in the Laravel application.
 * It verifies that:
 * 1. Redis connection is working
 * 2. Cache operations (set, get, forget) are working
 * 3. Cache expiration is working
 * 
 * Usage: php test-redis-cache.php
 */

// Bootstrap Laravel
require __DIR__ . '/laravel-app/vendor/autoload.php';
$app = require_once __DIR__ . '/laravel-app/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

// Colors for output
function green($text) {
    return "\033[0;32m$text\033[0m";
}

function red($text) {
    return "\033[0;31m$text\033[0m";
}

function blue($text) {
    return "\033[0;34m$text\033[0m";
}

function yellow($text) {
    return "\033[0;33m$text\033[0m";
}

// Test counter
$testsTotal = 0;
$testsPassed = 0;
$testsFailed = 0;

// Function to print test result
function printResult($testName, $result, $message = '') {
    global $testsTotal, $testsPassed, $testsFailed;
    
    $testsTotal++;
    
    if ($result) {
        echo green("✓ PASS") . ": $testName\n";
        $testsPassed++;
    } else {
        echo red("✗ FAIL") . ": $testName\n";
        if ($message) {
            echo "       " . red($message) . "\n";
        }
        $testsFailed++;
    }
}

// Function to print section header
function printHeader($title) {
    echo "\n" . blue("==== $title ====") . "\n";
}

// Function to print summary
function printSummary() {
    global $testsTotal, $testsPassed, $testsFailed;
    
    echo "\n" . blue("==== Test Summary ====") . "\n";
    echo "Total tests: $testsTotal\n";
    echo green("Passed: $testsPassed") . "\n";
    echo red("Failed: $testsFailed") . "\n";
    
    if ($testsFailed == 0) {
        echo "\n" . green("All tests passed!") . "\n";
        exit(0);
    } else {
        echo "\n" . red("Some tests failed. Please check the output above.") . "\n";
        exit(1);
    }
}

// Start testing
printHeader("Testing Redis Connection");

// Test 1: Check Redis connection
try {
    $ping = Redis::connection()->ping();
    printResult("Redis connection", $ping === true || $ping === "PONG", "Redis ping failed");
} catch (\Exception $e) {
    printResult("Redis connection", false, $e->getMessage());
}

printHeader("Testing Basic Cache Operations");

// Test 2: Set and get cache
$cacheKey = 'test_key';
$cacheValue = 'test_value_' . time();

try {
    Cache::put($cacheKey, $cacheValue, 60);
    $retrieved = Cache::get($cacheKey);
    printResult("Cache set and get", $retrieved === $cacheValue, "Expected '$cacheValue', got '$retrieved'");
} catch (\Exception $e) {
    printResult("Cache set and get", false, $e->getMessage());
}

// Test 3: Check if cache exists
try {
    $exists = Cache::has($cacheKey);
    printResult("Cache has", $exists, "Cache key '$cacheKey' should exist");
} catch (\Exception $e) {
    printResult("Cache has", false, $e->getMessage());
}

// Test 4: Forget cache
try {
    Cache::forget($cacheKey);
    $exists = Cache::has($cacheKey);
    printResult("Cache forget", !$exists, "Cache key '$cacheKey' should not exist after forget");
} catch (\Exception $e) {
    printResult("Cache forget", false, $e->getMessage());
}

printHeader("Testing Cache Expiration");

// Test 5: Cache expiration
$expiringKey = 'expiring_key';
$expiringValue = 'expiring_value_' . time();

try {
    Cache::put($expiringKey, $expiringValue, 1); // 1 second expiration
    $beforeExpire = Cache::has($expiringKey);
    
    echo yellow("Waiting for cache to expire (2 seconds)...") . "\n";
    sleep(2);
    
    $afterExpire = Cache::has($expiringKey);
    printResult("Cache expiration", $beforeExpire && !$afterExpire, 
                "Cache should exist before expiration and not exist after expiration");
} catch (\Exception $e) {
    printResult("Cache expiration", false, $e->getMessage());
}

printHeader("Testing Cache Remember");

// Test 6: Cache remember
$rememberKey = 'remember_key';
$callCount = 0;

try {
    // First call should execute the callback
    $value1 = Cache::remember($rememberKey, 60, function () use (&$callCount) {
        $callCount++;
        return 'remembered_value_' . time();
    });
    
    // Second call should retrieve from cache without executing the callback
    $value2 = Cache::remember($rememberKey, 60, function () use (&$callCount) {
        $callCount++;
        return 'different_value_' . time();
    });
    
    printResult("Cache remember", $callCount === 1 && $value1 === $value2, 
                "Callback should be executed only once, got executed $callCount times");
} catch (\Exception $e) {
    printResult("Cache remember", false, $e->getMessage());
}

printHeader("Testing Cache Performance");

// Test 7: Cache performance
try {
    // Clear the test key
    Cache::forget('performance_test');
    
    // First access (cache miss)
    $start = microtime(true);
    Cache::remember('performance_test', 60, function () {
        usleep(100000); // Simulate a 100ms database query
        return 'performance_value';
    });
    $firstTime = microtime(true) - $start;
    
    // Second access (cache hit)
    $start = microtime(true);
    Cache::remember('performance_test', 60, function () {
        usleep(100000); // Simulate a 100ms database query
        return 'performance_value';
    });
    $secondTime = microtime(true) - $start;
    
    echo "First access time (cache miss): " . round($firstTime * 1000, 2) . "ms\n";
    echo "Second access time (cache hit): " . round($secondTime * 1000, 2) . "ms\n";
    
    printResult("Cache performance", $secondTime < $firstTime, 
                "Cache hit should be faster than cache miss");
} catch (\Exception $e) {
    printResult("Cache performance", false, $e->getMessage());
}

// Print summary
printSummary();
