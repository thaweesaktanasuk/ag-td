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
