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
