# Laravel 12 + Redis + MariaDB Nix Demo

This project demonstrates how Nix can be used to create a reproducible development environment for a Laravel 12 application with Redis for caching and MariaDB for the database.

## Features

- **Reproducible Development Environment**: Using `shell.nix` to ensure all developers have identical environments
- **Deterministic Builds**: Package the Laravel application with `default.nix`
- **Containerization**: Build Docker images with Nix for deployment using `docker-compose.nix`

## Getting Started

1. Install Nix: Follow instructions in `install-nix.sh`
2. Enter the development environment:
   ```
   nix-shell
   ```
3. Start the services:
   ```
   start-services
   ```
4. Create a new Laravel project:
   ```
   create-project
   ```
5. Configure Laravel to use Redis and MariaDB:
   ```
   setup-redis
   setup-db
   ```
6. Start the Laravel development server:
   ```
   serve
   ```

## Building and Deployment

- Build the Laravel application package:
  ```
  nix-build default.nix
  ```

- Build and run the Docker Compose setup:
  ```
  nix-build docker-compose.nix -A runScript
  ./result/bin/run-docker-compose
  ```

## Benefits of Using Nix

- **Consistent Development Environment**: All developers work with the same versions of PHP, MariaDB, Redis, and other dependencies
- **Reproducible Builds**: Builds are deterministic and can be reproduced on any machine with Nix
- **Isolated Dependencies**: Each project can have its own set of dependencies without conflicts
- **Easy Onboarding**: New developers can get started with a single command
- **CI/CD Integration**: Nix builds can be integrated into CI/CD pipelines for consistent testing and deployment
