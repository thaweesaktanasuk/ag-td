#!/bin/bash
# Railway Systems Nix Proof of Concept
# This script demonstrates how Nix can be used in railway systems development

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
PROJECT_DIR="railway-nix-demo"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

print_header "Railway Systems Nix Proof of Concept"
print_info "This demo will show how Nix can be used for railway systems development"
print_info "Working in directory: $(pwd)"

# Create a shell.nix file for reproducible development environment
print_header "Creating Reproducible Development Environment"
print_info "Defining a development environment with specific tools and versions"

cat > shell.nix << 'EOF'
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
EOF

print_success "Created shell.nix with a reproducible development environment"

# Create a simple railway simulation script
print_header "Creating Railway Simulation Demo"
print_info "Creating a simple Python script for railway simulation"

mkdir -p src
cat > src/train_simulation.py << 'EOF'
#!/usr/bin/env python3
"""
Simple Railway Simulation Demo
This demonstrates a basic train movement simulation
"""
import os
import sys
import time
import random
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

def simulate_train_movement(train_id, distance, speed_kmh, delay_probability=0.05):
    """Simulate a train moving along a track with possible delays"""
    print(f"Train {train_id}: Simulation started - Distance: {distance}km, Speed: {speed_kmh}km/h")
    
    # Convert km/h to km/s for simulation
    speed_kms = speed_kmh / 3600
    
    # Initialize position and time
    position = 0
    elapsed_time = 0
    positions = []
    times = []
    
    # Simulate until train reaches destination
    while position < distance:
        # Random delay (signal issues, station stops, etc.)
        if random.random() < delay_probability:
            delay = random.uniform(10, 60)  # Delay between 10-60 seconds
            print(f"Train {train_id}: Delay of {delay:.1f} seconds at position {position:.2f}km")
            elapsed_time += delay
        
        # Normal movement for 1 minute
        time_step = 60  # 1 minute in seconds
        position += speed_kms * time_step
        elapsed_time += time_step
        
        # Record for plotting
        positions.append(min(position, distance))
        times.append(elapsed_time / 60)  # Convert to minutes for plotting
    
    # Final report
    total_time_minutes = elapsed_time / 60
    print(f"Train {train_id}: Reached destination in {total_time_minutes:.2f} minutes")
    print(f"Train {train_id}: Average speed: {distance/(elapsed_time/3600):.2f}km/h")
    
    return positions, times

def plot_train_movement(train_data):
    """Plot the movement of multiple trains"""
    plt.figure(figsize=(10, 6))
    
    for train_id, (positions, times) in train_data.items():
        plt.plot(times, positions, label=f"Train {train_id}")
    
    plt.xlabel("Time (minutes)")
    plt.ylabel("Distance (km)")
    plt.title("Railway Traffic Simulation")
    plt.grid(True)
    plt.legend()
    
    # Save the plot
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"simulation_result_{timestamp}.png"
    plt.savefig(filename)
    print(f"Simulation plot saved as {filename}")
    
    # Show the plot if not in CI environment
    if os.environ.get('CI') != 'true':
        plt.show()

def main():
    """Run a simulation with multiple trains"""
    print("=== Railway Traffic Simulation ===")
    print(f"Configuration path: {os.environ.get('RAILWAY_CONFIG_PATH', 'Not set')}")
    print(f"Simulation version: {os.environ.get('RAILWAY_SIM_VERSION', 'Not set')}")
    
    # Simulate multiple trains
    train_data = {}
    
    # Express train
    train_data[1] = simulate_train_movement(
        train_id=1, 
        distance=100,  # 100 km route
        speed_kmh=120,  # 120 km/h
        delay_probability=0.02  # Low delay probability
    )
    
    # Local train with more stops
    train_data[2] = simulate_train_movement(
        train_id=2, 
        distance=100,  # Same route
        speed_kmh=80,  # Slower speed
        delay_probability=0.1  # More frequent stops/delays
    )
    
    # Plot the results
    plot_train_movement(train_data)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
EOF

chmod +x src/train_simulation.py
print_success "Created railway simulation script"

# Create a default.nix file for packaging
print_header "Creating Nix Package Definition"
print_info "Defining how to package our railway simulation as a Nix package"

cat > default.nix << 'EOF'
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
EOF

print_success "Created default.nix for packaging the simulation"

# Create a release.nix file for CI/CD
print_header "Creating CI/CD Configuration"
print_info "Setting up a Nix-based CI/CD pipeline configuration"

cat > release.nix << 'EOF'
{ pkgs ? import <nixpkgs> {} }:

{
  # Build the railway simulation package
  railway-simulation = import ./default.nix { inherit pkgs; };
  
  # Create a Docker image for deployment
  docker-image = pkgs.dockerTools.buildImage {
    name = "railway-simulation";
    tag = "latest";
    
    # Include our railway simulation package
    contents = [ (import ./default.nix { inherit pkgs; }) ];
    
    # Configure the container
    config = {
      Cmd = [ "/bin/railway-sim" ];
      Env = [
        "RAILWAY_SIM_VERSION=1.0.0"
        "CI=true"
      ];
      WorkingDir = "/";
    };
  };
  
  # Define a test suite
  test-suite = pkgs.stdenv.mkDerivation {
    name = "railway-simulation-tests";
    src = ./.;
    
    buildInputs = with pkgs; [
      python3
      python3Packages.numpy
      python3Packages.matplotlib
      python3Packages.pytest
    ];
    
    doCheck = true;
    
    checkPhase = ''
      # Run the simulation in test mode
      export CI=true
      export RAILWAY_CONFIG_PATH="$PWD/config"
      python3 src/train_simulation.py
      
      # Check that the output file was created
      if ls simulation_result_*.png 1> /dev/null 2>&1; then
        echo "Test passed: Simulation generated output file"
        touch $out  # Create output file to indicate success
      else
        echo "Test failed: No simulation output found"
        exit 1
      fi
    '';
  };
}
EOF

print_success "Created release.nix for CI/CD pipeline"

# Create a README
print_header "Creating Documentation"
cat > README.md << 'EOF'
# Railway Simulation Nix Demo

This project demonstrates how Nix can be used in railway systems development to create reproducible environments, package applications, and set up CI/CD pipelines.

## Features

- **Reproducible Development Environment**: Using `shell.nix` to ensure all developers have identical environments
- **Deterministic Builds**: Package the simulation with `default.nix`
- **CI/CD Integration**: Configure testing and deployment with `release.nix`
- **Containerization**: Build Docker images with Nix for deployment

## Getting Started

1. Install Nix: Follow instructions in `install-nix.sh`
2. Enter the development environment:
   ```
   nix-shell
   ```
3. Run the simulation:
   ```
   ./src/train_simulation.py
   ```

## Building and Testing

- Build the package:
  ```
  nix-build default.nix
  ```

- Run tests:
  ```
  nix-build release.nix -A test-suite
  ```

- Build Docker image:
  ```
  nix-build release.nix -A docker-image
  ```

## Safety-Critical Considerations

In a real railway system, Nix would provide:

- Auditable builds for safety certification
- Atomic updates to prevent partial system updates
- Rollback capability for recovery from failed updates
- Reproducible environments for incident investigation
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

echo -e "${BLUE}=== Railway Nix Demo ===${NC}"
echo -e "${YELLOW}This script will demonstrate Nix capabilities for railway systems${NC}"

# Enter the Nix shell
echo -e "\n${GREEN}Entering reproducible development environment...${NC}"
echo -e "${YELLOW}$ nix-shell --command \"python3 src/train_simulation.py\"${NC}"
nix-shell --command "python3 src/train_simulation.py"

# Build the package
echo -e "\n${GREEN}Building the railway simulation package...${NC}"
echo -e "${YELLOW}$ nix-build${NC}"
nix-build

# Run the built package
echo -e "\n${GREEN}Running the built package...${NC}"
echo -e "${YELLOW}$ ./result/bin/railway-sim${NC}"
./result/bin/railway-sim

echo -e "\n${GREEN}Demo completed!${NC}"
echo "This demonstrates how Nix provides reproducible environments and builds for railway systems"
EOF

chmod +x run-demo.sh
print_success "Created run-demo.sh script"

print_header "Railway Nix PoC Setup Complete"
print_info "The proof of concept has been set up in: $(pwd)"
print_info "To run the demo, execute: ./run-demo.sh"
print_info "This will demonstrate how Nix can provide reproducible environments for railway systems"

cd ..
