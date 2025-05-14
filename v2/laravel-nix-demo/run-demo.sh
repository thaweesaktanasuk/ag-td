#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Laravel 12 + Redis + MariaDB Nix Demo ===${NC}"
echo -e "${YELLOW}This script will demonstrate Nix capabilities for Laravel development${NC}"

# Enter the Nix shell
echo -e "\n${GREEN}Entering reproducible development environment...${NC}"
echo -e "${YELLOW}$ nix-shell --command \"bash -c 'echo Laravel environment ready! PHP version: \$(php -v | head -n 1); echo MariaDB version: \$(mariadb --version); echo Redis version: \$(redis-server --version)'\"${NC}"
nix-shell --command "bash -c 'echo Laravel environment ready! PHP version: \$(php -v | head -n 1); echo MariaDB version: \$(mariadb --version); echo Redis version: \$(redis-server --version)'"

echo -e "\n${GREEN}Demo completed!${NC}"
echo "This demonstrates how Nix provides reproducible environments for Laravel development"
echo -e "\n${YELLOW}To continue with the full demo, enter the Nix shell and follow the instructions:${NC}"
echo -e "$ nix-shell"
echo -e "$ start-services"
echo -e "$ create-project"
echo -e "$ setup-redis"
echo -e "$ setup-db"
echo -e "$ serve"
