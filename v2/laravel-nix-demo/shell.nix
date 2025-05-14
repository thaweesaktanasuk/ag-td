{ pkgs ? import <nixpkgs> {} }:

let
  # Define PHP version with Redis extension
  php = pkgs.php82.buildEnv {
    extensions = { all, enabled }: with all; enabled ++ [
      redis
    ];
    extraConfig = ''
      memory_limit = 512M
      upload_max_filesize = 100M
      post_max_size = 100M
      display_errors = On
      error_reporting = E_ALL
    '';
  };
in

pkgs.mkShell {
  name = "laravel-redis-mariadb-env";
  buildInputs = with pkgs; [
    # PHP with Redis extension and Composer
    php
    php82Packages.composer

    # Database
    mariadb

    # Cache
    redis

    # Node.js for frontend
    nodejs_20
    nodePackages.npm

    # Utilities
    git
    curl
    jq
    gnused
    which
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

      # Clean up any existing pid files
      rm -f ./.data/mysql.pid

      # Create data directory
      mkdir -p ./.data/mysql

      # Completely reinitialize the database
      echo "Initializing MariaDB database..."
      rm -rf ./.data/mysql/*
      mysql_install_db --datadir=./.data/mysql --auth-root-authentication-method=normal

      # Start MariaDB server with TCP only (completely disable socket)
      echo "Starting MariaDB server..."

      # First, check if any MariaDB process is already running
      if pgrep -x "mysqld" > /dev/null; then
        echo "MariaDB is already running. Stopping it..."
        pkill -x "mysqld"
        sleep 2
      fi

      # Start MariaDB with TCP only and no defaults
      echo "Starting MariaDB with TCP only..."
      mysqld --no-defaults \
        --datadir=./.data/mysql \
        --pid-file=./.data/mysql.pid \
        --user=$USER \
        --skip-networking=0 \
        --bind-address=127.0.0.1 \
        --port=3306 \
        --skip-grant-tables \
        --skip-host-cache \
        --skip-name-resolve \
        --skip-slave-start \
        --skip-external-locking \
        --skip-log-bin \
        --skip-sync-frm \
        --skip-symbolic-links &

      # Wait for MariaDB to start
      echo "Waiting for MariaDB to start..."
      while ! mysqladmin -h 127.0.0.1 -P 3306 ping --silent; do
        sleep 1
      done

      # Create database (no need to create users with --skip-grant-tables)
      echo "Setting up MariaDB database..."
      mysql -h 127.0.0.1 -e "CREATE DATABASE IF NOT EXISTS laravel;"

      echo "Starting Redis..."
      mkdir -p ./.data/redis
      redis-server --dir ./.data --port 6379 --daemonize yes

      echo "Services started successfully!"
    }

    stop-services() {
      echo "Stopping MariaDB..."
      if [ -f ./.data/mysql.pid ]; then
        kill $(cat ./.data/mysql.pid) 2>/dev/null || true
        rm -f ./.data/mysql.pid
      fi

      # Make sure all mysqld processes are stopped
      if pgrep -x "mysqld" > /dev/null; then
        echo "Killing remaining mysqld processes..."
        pkill -x "mysqld" || true
      fi

      echo "Stopping Redis..."
      redis-cli shutdown 2>/dev/null || true

      # Make sure all redis-server processes are stopped
      if pgrep -x "redis-server" > /dev/null; then
        echo "Killing remaining redis-server processes..."
        pkill -x "redis-server" || true
      fi

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

      # We don't need to install predis since we have the native Redis extension
      # But we'll add the Redis configuration to the Laravel config

      # Update .env file
      sed -i 's/CACHE_DRIVER=file/CACHE_DRIVER=redis/g' .env
      sed -i 's/SESSION_DRIVER=file/SESSION_DRIVER=redis/g' .env
      sed -i 's/REDIS_HOST=127.0.0.1/REDIS_HOST=127.0.0.1/g' .env
      sed -i 's/REDIS_PASSWORD=null/REDIS_PASSWORD=null/g' .env
      sed -i 's/REDIS_PORT=6379/REDIS_PORT=6379/g' .env

      # Update the Redis client in config/database.php to use phpredis
      if [ -f config/database.php ]; then
        # Check if the file contains the Redis client configuration
        if grep -q "'client' => 'predis'" config/database.php; then
          # Change from predis to phpredis
          sed -i "s/'client' => 'predis'/'client' => 'phpredis'/g" config/database.php
        elif grep -q "'client' => env('REDIS_CLIENT', 'predis')" config/database.php; then
          # Change the default from predis to phpredis
          sed -i "s/'client' => env('REDIS_CLIENT', 'predis')/'client' => env('REDIS_CLIENT', 'phpredis')/g" config/database.php
        fi
      fi

      echo "Redis configuration completed!"
    }

    setup-db() {
      echo "Configuring Laravel to use MariaDB..."
      cd laravel-app

      # Update .env file - with skip-grant-tables, any username/password will work
      sed -i 's/DB_CONNECTION=mysql/DB_CONNECTION=mysql/g' .env
      sed -i 's/DB_HOST=127.0.0.1/DB_HOST=127.0.0.1/g' .env
      sed -i 's/DB_PORT=3306/DB_PORT=3306/g' .env
      sed -i 's/DB_DATABASE=laravel/DB_DATABASE=laravel/g' .env
      sed -i 's/DB_USERNAME=.*/DB_USERNAME=root/g' .env
      sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=/g' .env

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
