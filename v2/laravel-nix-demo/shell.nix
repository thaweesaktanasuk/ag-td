{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "laravel-redis-mariadb-env";
  buildInputs = with pkgs; [
    # PHP and Composer
    php82
    php82Packages.composer

    # PHP extensions are included in the main PHP package

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
