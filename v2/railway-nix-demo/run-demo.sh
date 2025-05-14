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
