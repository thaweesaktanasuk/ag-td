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
