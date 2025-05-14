{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation {
  name = "laravel-app";
  version = "1.0.0";

  # This is a placeholder. In a real project, you would use the actual source
  src = ./laravel-app;

  buildInputs = with pkgs; [
    php82
    php82Packages.composer
    nodejs_20
    nodePackages.npm
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
    ${pkgs.php82}/bin/php $out/share/laravel/artisan serve "\$@"
    EOF2
    chmod +x $out/bin/laravel-app
  '';

  meta = {
    description = "Laravel application with Redis and MariaDB";
    platforms = pkgs.lib.platforms.all;
  };
}
