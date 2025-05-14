#!/bin/bash
# Script to run all tests for the Laravel + Redis + MariaDB Nix environment

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section header
print_header() {
    echo -e "\n${BLUE}==== $1 =====${NC}"
}

# Check if we're in a Nix shell
if [ -z "$IN_NIX_SHELL" ]; then
    echo -e "${RED}Error: Not running in a Nix shell. Run 'nix-shell' first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "shell.nix" ]; then
    echo -e "${RED}Error: Not in the laravel-nix-demo directory. Please run this script from the laravel-nix-demo directory.${NC}"
    exit 1
fi

# Start Redis if it's not already running
print_header "Checking Redis"
if ! redis-cli ping &> /dev/null; then
    echo -e "${YELLOW}Redis is not running. Starting Redis...${NC}"
    redis-server --port 6379 --daemonize yes
    sleep 2
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}Redis started successfully.${NC}"
    else
        echo -e "${RED}Failed to start Redis. Please check the Redis configuration.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Redis is already running.${NC}"
fi

# Check if Laravel app exists
if [ ! -d "laravel-app" ]; then
    echo -e "${RED}Error: Laravel app directory not found. Please run 'create-project' first.${NC}"
    exit 1
fi

# Make test scripts executable
chmod +x test-environment.sh

# Run environment tests
print_header "Running Environment Tests"
./test-environment.sh
ENV_TEST_RESULT=$?

# Run Redis cache tests
print_header "Running Redis Cache Tests"
cd laravel-app
php ../test-redis-cache.php
REDIS_TEST_RESULT=$?

# Run API tests
print_header "Running API Tests"
php artisan test --filter=ProductApiTest
API_TEST_RESULT=$?

# Print summary
print_header "Test Summary"
if [ $ENV_TEST_RESULT -eq 0 ]; then
    echo -e "Environment Tests: ${GREEN}PASSED${NC}"
else
    echo -e "Environment Tests: ${RED}FAILED${NC}"
fi

if [ $REDIS_TEST_RESULT -eq 0 ]; then
    echo -e "Redis Cache Tests: ${GREEN}PASSED${NC}"
else
    echo -e "Redis Cache Tests: ${RED}FAILED${NC}"
fi

if [ $API_TEST_RESULT -eq 0 ]; then
    echo -e "API Tests: ${GREEN}PASSED${NC}"
else
    echo -e "API Tests: ${RED}FAILED${NC}"
fi

# Overall result
if [ $ENV_TEST_RESULT -eq 0 ] && [ $REDIS_TEST_RESULT -eq 0 ] && [ $API_TEST_RESULT -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please check the output above.${NC}"
    exit 1
fi
