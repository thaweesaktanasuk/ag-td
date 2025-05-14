# Laravel + Redis + MariaDB Development Environment with Nix

This project demonstrates how to use Nix to create a reproducible development environment for a Laravel application with Redis for caching and MariaDB/SQLite for database storage.

## 🚀 Features

- **Reproducible Development Environment**: Same environment for all team members
- **Isolated Dependencies**: No conflicts with system packages
- **Declarative Configuration**: Environment defined in code
- **Redis Caching**: Improved performance with Redis
- **RESTful API**: Complete CRUD operations for Products
- **Comprehensive Tests**: Environment, Redis, and API tests

## 📋 Prerequisites

- [Nix Package Manager](https://nixos.org/download.html) installed
- Git for version control

## 🛠️ Quick Start

### Clone the Repository

```bash
git clone https://github.com/thaweesaktanasuk/ag-td.git
cd ag-td/v2/laravel-nix-demo
```

### Enter the Nix Shell

```bash
nix-shell
```

This will download and set up all required dependencies in an isolated environment.

### Start Services

```bash
start-services
```

This will start Redis and initialize MariaDB.

### Create or Use Existing Laravel Project

If this is a new setup:

```bash
create-project
```

### Configure Laravel

```bash
setup-redis  # Configure Redis for caching
setup-db     # Configure database
```

### Start the Laravel Server

```bash
serve
```

The application will be available at http://localhost:8000.

## 🧪 Running Tests

We have comprehensive tests to ensure everything is working correctly:

```bash
./run-tests.sh
```

This will run:
1. Environment tests
2. Redis cache tests
3. API tests

You can also run individual test suites:

```bash
# Environment tests
./test-environment.sh

# Redis cache tests
php test-redis-cache.php

# API tests
cd laravel-app && php artisan test --filter=ProductApiTest
```

## 📚 API Documentation

The API provides CRUD operations for Products with Redis caching.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (cached) |
| GET | `/api/products/{id}` | Get a specific product (cached) |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/{id}` | Update a product |
| DELETE | `/api/products/{id}` | Delete a product |
| GET | `/api/products/cache/clear` | Clear the product cache |

### Example Requests

#### Get All Products

```bash
curl -X GET http://localhost:8000/api/products
```

#### Get a Specific Product

```bash
curl -X GET http://localhost:8000/api/products/1
```

#### Create a Product

```bash
curl -X POST \
  http://localhost:8000/api/products \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "stock": 100,
    "sku": "PROD-001",
    "is_active": true
  }'
```

#### Update a Product

```bash
curl -X PUT \
  http://localhost:8000/api/products/1 \
  -H 'Content-Type: application/json' \
  -d '{
    "price": 89.99,
    "stock": 50
  }'
```

#### Delete a Product

```bash
curl -X DELETE http://localhost:8000/api/products/1
```

#### Clear Cache

```bash
curl -X GET http://localhost:8000/api/products/cache/clear
```

## 🏗️ Project Structure

```
laravel-nix-demo/
├── .data/                  # Data directories for Redis and MariaDB (gitignored)
├── .gitignore              # Git ignore configuration
├── shell.nix               # Nix environment configuration
├── test-environment.sh     # Environment test script
├── test-redis-cache.php    # Redis cache test script
├── run-tests.sh            # Test runner script
├── laravel-app/            # Laravel application
│   ├── app/
│   │   ├── Models/
│   │   │   └── Product.php # Product model
│   │   └── Http/Controllers/Api/
│   │       └── ProductController.php # API controller with Redis caching
│   ├── database/
│   │   ├── migrations/     # Database migrations
│   │   └── seeders/       # Database seeders
│   ├── routes/
│   │   └── api.php        # API routes
│   └── tests/
│       └── Feature/
│           └── ProductApiTest.php # API tests
```

## 🔧 Nix Configuration

The `shell.nix` file defines the development environment with:

- PHP 8.2 with Redis extension
- Composer for PHP dependencies
- MariaDB for database storage
- Redis for caching
- Node.js and npm for frontend assets
- Various utilities (git, curl, jq, etc.)

## 🔄 Redis Caching

The application uses Redis for caching to improve performance:

- Product listings are cached for 10 minutes
- Individual products are cached for 10 minutes
- Cache is automatically invalidated when products are created, updated, or deleted
- Cache can be manually cleared with the `/api/products/cache/clear` endpoint

## 📊 Database

The application can use either:

- **SQLite**: Simple file-based database (default)
- **MariaDB**: Full-featured relational database

The database configuration can be changed in the `.env` file.

## 🧩 Helper Functions

The Nix shell provides several helper functions:

- `start-services`: Start Redis and MariaDB
- `stop-services`: Stop Redis and MariaDB
- `create-project`: Create a new Laravel project
- `setup-redis`: Configure Laravel to use Redis
- `setup-db`: Configure Laravel to use the database
- `serve`: Start the Laravel development server

## 🤝 Contributing

1. Enter the Nix shell: `nix-shell`
2. Make your changes
3. Run the tests: `./run-tests.sh`
4. Submit a pull request

## 🔍 Troubleshooting

### Redis Connection Issues

If you encounter Redis connection issues:

1. Check if Redis is running: `redis-cli ping`
2. If not, start Redis: `redis-server --port 6379 --daemonize yes`
3. Check Redis configuration in `.env`

### Database Issues

If you encounter database issues:

1. Check database configuration in `.env`
2. For SQLite, ensure the database file exists: `touch laravel-app/database/database.sqlite`
3. Run migrations: `cd laravel-app && php artisan migrate`

### Nix Shell Issues

If you encounter issues with the Nix shell:

1. Make sure Nix is installed: `nix --version`
2. Try rebuilding the environment: `nix-shell --pure`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
