#!/bin/bash
# Laravel 12 + Redis + MariaDB Nix Proof of Concept
# This script demonstrates how Nix can be used to create a reproducible
# development environment for a Laravel application with Redis and MariaDB

# Print colored output
print_header() {
    echo -e "\n\033[1;36m==== $1 ====\033[0m"
}

print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

print_command() {
    echo -e "\033[1;33m$\033[0m $1"
}

# Check if Nix is installed
if ! command -v nix &> /dev/null; then
    print_error "Nix is not installed. Please install Nix first."
    print_info "You can use the install-nix.sh script to install Nix."
    exit 1
fi

# Create project directory
PROJECT_DIR="laravel-nix-demo"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

print_header "Laravel 12 + Redis + MariaDB Nix Proof of Concept"
print_info "This demo will show how Nix can be used to create a reproducible development environment"
print_info "Working in directory: $(pwd)"

# Create a shell.nix file for reproducible development environment
print_header "Creating Reproducible Development Environment"
print_info "Defining a development environment with PHP, Composer, Redis, and MariaDB"

cat > shell.nix << 'EOF'
{ pkgs ? import <nixpkgs> {} }:

let
  # Define PHP version
  php = pkgs.php82;
  
  # Define MariaDB version
  mariadb = pkgs.mariadb;
  
  # Define Redis version
  redis = pkgs.redis;
  
  # Create a PHP with extensions
  phpWithExtensions = php.buildEnv {
    extensions = { all, enabled }: with all; enabled ++ [
      redis
      pdo
      pdo_mysql
      mbstring
      tokenizer
      xml
      ctype
      json
      bcmath
      curl
      fileinfo
      gd
      intl
      sodium
      zip
    ];
    extraConfig = ''
      memory_limit = 512M
      upload_max_filesize = 100M
      post_max_size = 100M
      display_errors = On
      error_reporting = E_ALL
    '';
  };
  
  # Create a Composer with PHP
  composerEnv = pkgs.stdenv.mkDerivation {
    name = "composer-env";
    buildInputs = [ phpWithExtensions pkgs.composer ];
  };
  
in pkgs.mkShell {
  name = "laravel-redis-mariadb-env";
  buildInputs = [
    # PHP and Composer
    phpWithExtensions
    pkgs.composer
    
    # Database
    mariadb
    
    # Cache
    redis
    
    # Node.js for frontend
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    
    # Utilities
    pkgs.git
    pkgs.curl
    pkgs.jq
    pkgs.gnused
    pkgs.which
  ];
  
  # Environment variables
  shellHook = ''
    export LARAVEL_ENV_VERSION="1.0.0"
    export PATH="$PWD/vendor/bin:$PATH"
    export MYSQL_HOST=127.0.0.1
    export MYSQL_PORT=3306
    export MYSQL_DATABASE=laravel
    export MYSQL_USER=laravel
    export MYSQL_PASSWORD=laravel
    export REDIS_HOST=127.0.0.1
    export REDIS_PORT=6379
    
    # Create data directories
    mkdir -p ./.data/mysql
    mkdir -p ./.data/redis
    
    echo "Laravel + Redis + MariaDB Development Environment v$LARAVEL_ENV_VERSION"
    echo ""
    echo "Available commands:"
    echo "  start-services  - Start MariaDB and Redis"
    echo "  stop-services   - Stop MariaDB and Redis"
    echo "  create-project  - Create a new Laravel project"
    echo "  setup-redis     - Configure Laravel to use Redis"
    echo "  setup-db        - Configure Laravel to use MariaDB"
    echo "  serve           - Start the Laravel development server"
    echo ""
    
    # Define helper functions
    start-services() {
      echo "Starting MariaDB..."
      mkdir -p ./.data/mysql
      mysqld --datadir=./.data/mysql --socket=./.data/mysql.sock \
        --pid-file=./.data/mysql.pid --user=$USER \
        --skip-networking=0 --port=3306 \
        --default-authentication-plugin=mysql_native_password &
      
      # Wait for MariaDB to start
      echo "Waiting for MariaDB to start..."
      while ! mysqladmin ping -h 127.0.0.1 --silent; do
        sleep 1
      done
      
      # Create database and user if they don't exist
      echo "Setting up MariaDB database and user..."
      mysql -h 127.0.0.1 -e "CREATE DATABASE IF NOT EXISTS laravel;"
      mysql -h 127.0.0.1 -e "CREATE USER IF NOT EXISTS 'laravel'@'%' IDENTIFIED BY 'laravel';"
      mysql -h 127.0.0.1 -e "GRANT ALL PRIVILEGES ON laravel.* TO 'laravel'@'%';"
      mysql -h 127.0.0.1 -e "FLUSH PRIVILEGES;"
      
      echo "Starting Redis..."
      mkdir -p ./.data/redis
      redis-server --dir ./.data --port 6379 --daemonize yes
      
      echo "Services started successfully!"
    }
    
    stop-services() {
      echo "Stopping MariaDB..."
      if [ -f ./.data/mysql.pid ]; then
        kill $(cat ./.data/mysql.pid)
        rm -f ./.data/mysql.pid
      fi
      
      echo "Stopping Redis..."
      redis-cli shutdown
      
      echo "Services stopped successfully!"
    }
    
    create-project() {
      echo "Creating new Laravel project..."
      composer create-project laravel/laravel laravel-app
      cd laravel-app
      echo "Laravel project created successfully!"
    }
    
    setup-redis() {
      echo "Configuring Laravel to use Redis..."
      cd laravel-app
      
      # Install predis package
      composer require predis/predis
      
      # Update .env file
      sed -i 's/CACHE_DRIVER=file/CACHE_DRIVER=redis/g' .env
      sed -i 's/SESSION_DRIVER=file/SESSION_DRIVER=redis/g' .env
      sed -i 's/REDIS_HOST=127.0.0.1/REDIS_HOST=127.0.0.1/g' .env
      sed -i 's/REDIS_PASSWORD=null/REDIS_PASSWORD=null/g' .env
      sed -i 's/REDIS_PORT=6379/REDIS_PORT=6379/g' .env
      
      echo "Redis configuration completed!"
    }
    
    setup-db() {
      echo "Configuring Laravel to use MariaDB..."
      cd laravel-app
      
      # Update .env file
      sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=mysql/g' .env
      sed -i 's/DB_HOST=127.0.0.1/DB_HOST=127.0.0.1/g' .env
      sed -i 's/DB_PORT=3306/DB_PORT=3306/g' .env
      sed -i 's/DB_DATABASE=laravel/DB_DATABASE=laravel/g' .env
      sed -i 's/DB_USERNAME=root/DB_USERNAME=laravel/g' .env
      sed -i 's/DB_PASSWORD=/DB_PASSWORD=laravel/g' .env
      
      # Run migrations
      php artisan migrate
      
      echo "Database configuration completed!"
    }
    
    serve() {
      echo "Starting Laravel development server..."
      cd laravel-app
      php artisan serve
    }
  '';
}
EOF

print_success "Created shell.nix with a reproducible development environment"

# Create a default.nix file for packaging
print_header "Creating Nix Package Definition"
print_info "Defining how to package our Laravel application as a Nix package"

cat > default.nix << 'EOF'
{ pkgs ? import <nixpkgs> {} }:

let
  # Define PHP version
  php = pkgs.php82;
  
  # Create a PHP with extensions
  phpWithExtensions = php.buildEnv {
    extensions = { all, enabled }: with all; enabled ++ [
      redis
      pdo
      pdo_mysql
      mbstring
      tokenizer
      xml
      ctype
      json
      bcmath
      curl
      fileinfo
      gd
      intl
      sodium
      zip
    ];
    extraConfig = ''
      memory_limit = 512M
      upload_max_filesize = 100M
      post_max_size = 100M
    '';
  };
  
in pkgs.stdenv.mkDerivation {
  name = "laravel-app";
  version = "1.0.0";
  
  # This is a placeholder. In a real project, you would use the actual source
  src = ./laravel-app;
  
  buildInputs = [
    phpWithExtensions
    pkgs.composer
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];
  
  buildPhase = ''
    # Copy source to build directory
    cp -r $src/* .
    
    # Install PHP dependencies
    export HOME=$PWD
    composer install --no-dev --optimize-autoloader
    
    # Install and build frontend assets
    npm ci
    npm run build
    
    # Optimize Laravel
    php artisan optimize
  '';
  
  installPhase = ''
    # Create output directory
    mkdir -p $out/share/laravel
    
    # Copy application to output
    cp -r . $out/share/laravel
    
    # Create wrapper script
    mkdir -p $out/bin
    cat > $out/bin/laravel-app << EOF2
    #!/bin/sh
    ${phpWithExtensions}/bin/php $out/share/laravel/artisan serve "\$@"
    EOF2
    chmod +x $out/bin/laravel-app
  '';
  
  meta = {
    description = "Laravel application with Redis and MariaDB";
    platforms = pkgs.lib.platforms.all;
  };
}
EOF

print_success "Created default.nix for packaging the Laravel application"

# Create a docker-compose.nix file for containerization
print_header "Creating Docker Compose Configuration"
print_info "Setting up a Nix-based Docker Compose configuration"

cat > docker-compose.nix << 'EOF'
{ pkgs ? import <nixpkgs> {} }:

let
  # Import the Laravel application package
  laravelApp = import ./default.nix { inherit pkgs; };
  
  # Create a Docker image for the Laravel application
  laravelImage = pkgs.dockerTools.buildImage {
    name = "laravel-app";
    tag = "latest";
    
    # Copy the Laravel application
    copyToRoot = pkgs.buildEnv {
      name = "laravel-app-root";
      paths = [
        laravelApp
        pkgs.bash
        pkgs.coreutils
        pkgs.php82
      ];
    };
    
    # Configure the container
    config = {
      Cmd = [ "/bin/laravel-app" ];
      ExposedPorts = {
        "8000/tcp" = {};
      };
      Env = [
        "DB_HOST=mariadb"
        "DB_PORT=3306"
        "DB_DATABASE=laravel"
        "DB_USERNAME=laravel"
        "DB_PASSWORD=laravel"
        "REDIS_HOST=redis"
        "REDIS_PORT=6379"
      ];
    };
  };
  
  # Create a Docker Compose configuration
  dockerCompose = pkgs.writeTextFile {
    name = "docker-compose.yml";
    text = ''
      version: '3'
      
      services:
        app:
          image: laravel-app:latest
          ports:
            - "8000:8000"
          depends_on:
            - mariadb
            - redis
          environment:
            - DB_HOST=mariadb
            - DB_PORT=3306
            - DB_DATABASE=laravel
            - DB_USERNAME=laravel
            - DB_PASSWORD=laravel
            - REDIS_HOST=redis
            - REDIS_PORT=6379
      
        mariadb:
          image: mariadb:10.6
          ports:
            - "3306:3306"
          environment:
            - MYSQL_DATABASE=laravel
            - MYSQL_USER=laravel
            - MYSQL_PASSWORD=laravel
            - MYSQL_ROOT_PASSWORD=root
          volumes:
            - mariadb_data:/var/lib/mysql
      
        redis:
          image: redis:7.0
          ports:
            - "6379:6379"
          volumes:
            - redis_data:/data
      
      volumes:
        mariadb_data:
        redis_data:
    '';
    destination = "/docker-compose.yml";
  };
  
in {
  # Export the Docker image and Docker Compose configuration
  inherit laravelImage dockerCompose;
  
  # Create a script to build and run the Docker Compose setup
  runScript = pkgs.writeScriptBin "run-docker-compose" ''
    #!/bin/sh
    
    # Copy the Docker Compose configuration
    cp ${dockerCompose}/docker-compose.yml .
    
    # Load the Laravel Docker image
    docker load < ${laravelImage}
    
    # Run Docker Compose
    docker-compose up
  '';
}
EOF

print_success "Created docker-compose.nix for containerization"

# Create a README
print_header "Creating Documentation"
cat > README.md << 'EOF'
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
EOF

print_success "Created README.md with documentation"

# Create a run script
print_header "Creating Demo Run Script"
cat > run-demo.sh << 'EOF'
#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Laravel 12 + Redis + MariaDB Nix Demo ===${NC}"
echo -e "${YELLOW}This script will demonstrate Nix capabilities for Laravel development${NC}"

# Enter the Nix shell
echo -e "\n${GREEN}Entering reproducible development environment...${NC}"
echo -e "${YELLOW}$ nix-shell --command \"bash -c 'echo Laravel environment ready! PHP version: \$(php -v | head -n 1); echo MariaDB version: \$(mariadb --version); echo Redis version: \$(redis-server --version)'\"${NC}"
nix-shell --command "bash -c 'echo Laravel environment ready! PHP version: \$(php -v | head -n 1); echo MariaDB version: \$(mariadb --version); echo Redis version: \$(redis-server --version)'"

echo -e "\n${GREEN}Demo completed!${NC}"
echo "This demonstrates how Nix provides reproducible environments for Laravel development"
echo -e "\n${YELLOW}To continue with the full demo, enter the Nix shell and follow the instructions:${NC}"
echo -e "$ nix-shell"
echo -e "$ start-services"
echo -e "$ create-project"
echo -e "$ setup-redis"
echo -e "$ setup-db"
echo -e "$ serve"
EOF

chmod +x run-demo.sh
print_success "Created run-demo.sh script"

print_header "Laravel + Redis + MariaDB Nix PoC Setup Complete"
print_info "The proof of concept has been set up in: $(pwd)"
print_info "To run the demo, execute: ./run-demo.sh"
print_info "This will demonstrate how Nix can provide reproducible environments for Laravel development"

cd ..
