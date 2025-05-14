#!/bin/bash
# Test script for Laravel + Redis + MariaDB Nix environment
# This script tests the entire setup including environment, services, and API endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print section header
print_header() {
    echo -e "\n${BLUE}==== $1 =====${NC}"
}

# Function to print test result
print_result() {
    local test_name=$1
    local result=$2
    local message=$3
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        echo -e "       ${RED}$message${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Function to print summary
print_summary() {
    echo -e "\n${BLUE}==== Test Summary ====${NC}"
    echo -e "Total tests: $TESTS_TOTAL"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}Some tests failed. Please check the output above.${NC}"
        exit 1
    fi
}

# Function to check if a command exists
check_command() {
    local cmd=$1
    if command -v $cmd &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check if a service is running
check_service() {
    local service=$1
    local check_cmd=$2
    
    eval $check_cmd &> /dev/null
    return $?
}

# Function to make an API request
make_api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    
    if [ -n "$data" ]; then
        response=$(curl -s -X $method -H "Content-Type: application/json" -d "$data" -w "%{http_code}" http://localhost:8000/api/$endpoint)
    else
        response=$(curl -s -X $method -w "%{http_code}" http://localhost:8000/api/$endpoint)
    fi
    
    status_code=${response: -3}
    response_body=${response:0:${#response}-3}
    
    if [ "$status_code" = "$expected_status" ]; then
        return 0
    else
        echo "Expected status $expected_status, got $status_code. Response: $response_body"
        return 1
    fi
}

# Start testing
print_header "Testing Nix Environment"

# Test 1: Check if Nix is installed
if check_command nix; then
    print_result "Nix is installed" "PASS"
else
    print_result "Nix is installed" "FAIL" "Nix command not found"
fi

# Test 2: Check if we're in a Nix shell
if [ -n "$IN_NIX_SHELL" ]; then
    print_result "Running in Nix shell" "PASS"
else
    print_result "Running in Nix shell" "FAIL" "Not running in a Nix shell. Run 'nix-shell' first."
    exit 1
fi

# Test 3: Check PHP version
if php -v | grep -q "PHP 8.2"; then
    print_result "PHP 8.2 is available" "PASS"
else
    print_result "PHP 8.2 is available" "FAIL" "PHP 8.2 not found"
fi

# Test 4: Check PHP Redis extension
if php -m | grep -q "redis"; then
    print_result "PHP Redis extension is available" "PASS"
else
    print_result "PHP Redis extension is available" "FAIL" "Redis extension not found"
fi

# Test 5: Check Composer
if check_command composer; then
    print_result "Composer is available" "PASS"
else
    print_result "Composer is available" "FAIL" "Composer not found"
fi

# Test 6: Check MariaDB
if check_command mariadb; then
    print_result "MariaDB is available" "PASS"
else
    print_result "MariaDB is available" "FAIL" "MariaDB not found"
fi

# Test 7: Check Redis
if check_command redis-cli; then
    print_result "Redis CLI is available" "PASS"
else
    print_result "Redis CLI is available" "FAIL" "Redis CLI not found"
fi

print_header "Testing Services"

# Test 8: Check if Redis server is running
if check_service "Redis" "redis-cli ping"; then
    print_result "Redis server is running" "PASS"
else
    print_result "Redis server is running" "FAIL" "Redis server is not running"
    echo -e "${YELLOW}Starting Redis server...${NC}"
    redis-server --port 6379 --daemonize yes
    sleep 2
    if check_service "Redis" "redis-cli ping"; then
        print_result "Redis server started successfully" "PASS"
    else
        print_result "Redis server started successfully" "FAIL" "Could not start Redis server"
    fi
fi

# Test 9: Check if Laravel app exists
if [ -d "laravel-app" ]; then
    print_result "Laravel app directory exists" "PASS"
else
    print_result "Laravel app directory exists" "FAIL" "Laravel app directory not found"
    exit 1
fi

# Change to Laravel app directory
cd laravel-app

# Test 10: Check if .env file exists
if [ -f ".env" ]; then
    print_result "Laravel .env file exists" "PASS"
else
    print_result "Laravel .env file exists" "FAIL" ".env file not found"
    exit 1
fi

# Test 11: Check if Laravel server is running
if curl -s http://localhost:8000 > /dev/null; then
    print_result "Laravel server is running" "PASS"
else
    print_result "Laravel server is running" "FAIL" "Laravel server is not running"
    echo -e "${YELLOW}Starting Laravel server in the background...${NC}"
    php artisan serve > /dev/null 2>&1 &
    LARAVEL_PID=$!
    sleep 5
    if curl -s http://localhost:8000 > /dev/null; then
        print_result "Laravel server started successfully" "PASS"
    else
        print_result "Laravel server started successfully" "FAIL" "Could not start Laravel server"
        exit 1
    fi
fi

print_header "Testing API Endpoints"

# Test 12: GET /api/products
if make_api_request "GET" "products" "" "200"; then
    print_result "GET /api/products" "PASS"
else
    print_result "GET /api/products" "FAIL" "$(make_api_request "GET" "products" "" "200")"
fi

# Test 13: POST /api/products (Create a product)
product_data='{"name":"Test Product","description":"A test product","price":99.99,"stock":10,"sku":"TEST-001","is_active":true}'
if make_api_request "POST" "products" "$product_data" "201"; then
    print_result "POST /api/products" "PASS"
else
    print_result "POST /api/products" "FAIL" "$(make_api_request "POST" "products" "$product_data" "201")"
fi

# Test 14: GET /api/products/1 (Get a specific product)
if make_api_request "GET" "products/1" "" "200"; then
    print_result "GET /api/products/1" "PASS"
else
    print_result "GET /api/products/1" "FAIL" "$(make_api_request "GET" "products/1" "" "200")"
fi

# Test 15: PUT /api/products/1 (Update a product)
update_data='{"price":89.99,"stock":20}'
if make_api_request "PUT" "products/1" "$update_data" "200"; then
    print_result "PUT /api/products/1" "PASS"
else
    print_result "PUT /api/products/1" "FAIL" "$(make_api_request "PUT" "products/1" "$update_data" "200")"
fi

# Test 16: GET /api/products/cache/clear (Clear cache)
if make_api_request "GET" "products/cache/clear" "" "200"; then
    print_result "GET /api/products/cache/clear" "PASS"
else
    print_result "GET /api/products/cache/clear" "FAIL" "$(make_api_request "GET" "products/cache/clear" "" "200")"
fi

# Test 17: DELETE /api/products/1 (Delete a product)
if make_api_request "DELETE" "products/1" "" "200"; then
    print_result "DELETE /api/products/1" "PASS"
else
    print_result "DELETE /api/products/1" "FAIL" "$(make_api_request "DELETE" "products/1" "" "200")"
fi

# Test 18: Check Redis caching
echo -e "\n${YELLOW}Testing Redis caching...${NC}"
# First request should be a cache miss
start_time=$(date +%s.%N)
curl -s http://localhost:8000/api/products > /dev/null
end_time=$(date +%s.%N)
first_request_time=$(echo "$end_time - $start_time" | bc)

# Second request should be a cache hit and faster
start_time=$(date +%s.%N)
curl -s http://localhost:8000/api/products > /dev/null
end_time=$(date +%s.%N)
second_request_time=$(echo "$end_time - $start_time" | bc)

echo -e "First request time: $first_request_time seconds"
echo -e "Second request time: $second_request_time seconds"

if (( $(echo "$second_request_time < $first_request_time" | bc -l) )); then
    print_result "Redis caching is working" "PASS"
else
    print_result "Redis caching is working" "FAIL" "Second request was not faster than first request"
fi

# Clean up
if [ -n "$LARAVEL_PID" ]; then
    echo -e "\n${YELLOW}Stopping Laravel server...${NC}"
    kill $LARAVEL_PID
fi

# Print summary
print_summary
