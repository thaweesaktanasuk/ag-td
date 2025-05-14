{ pkgs ? import <nixpkgs> {} }:

pkgs.stdenv.mkDerivation {
  name = "railway-simulation";
  version = "1.0.0";
  
  src = ./.;
  
  buildInputs = with pkgs; [
    python3
    python3Packages.numpy
    python3Packages.matplotlib
  ];
  
  installPhase = ''
    mkdir -p $out/bin
    mkdir -p $out/share/railway-simulation
    
    cp -r src/* $out/share/railway-simulation/
    
    # Create wrapper script
    cat > $out/bin/railway-sim << EOF2
    #!/bin/sh
    export RAILWAY_SIM_VERSION="1.0.0"
    export RAILWAY_CONFIG_PATH="\$HOME/.railway-sim/config"
    
    # Create config directory if it doesn't exist
    mkdir -p \$RAILWAY_CONFIG_PATH
    
    exec ${pkgs.python3}/bin/python3 $out/share/railway-simulation/train_simulation.py "\$@"
    EOF2
    
    chmod +x $out/bin/railway-sim
  '';
  
  meta = {
    description = "Railway simulation for demonstrating Nix in railway systems";
    platforms = pkgs.lib.platforms.all;
  };
}
