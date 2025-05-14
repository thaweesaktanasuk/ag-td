{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "railway-simulation-env";
  buildInputs = with pkgs; [
    # Core development tools
    gcc
    gnumake
    python3
    python3Packages.numpy
    python3Packages.matplotlib
    
    # Simulation tools (example packages)
    graphviz  # For system diagrams
    gnuplot   # For data visualization
    
    # Database for storing simulation results
    sqlite
    
    # Version control
    git
  ];
  
  # Environment variables
    shellHook = ''
    export RAILWAY_SIM_VERSION="1.0.0"
    export RAILWAY_CONFIG_PATH="$PWD/config"
    
    echo "Railway Simulation Environment v$RAILWAY_SIM_VERSION"
    echo "Safety-critical development environment initialized"
    echo "Using configuration from: $RAILWAY_CONFIG_PATH"
    
    # Create config directory if it doesn't exist
    mkdir -p $RAILWAY_CONFIG_PATH
  '';
}
