#!/bin/bash
# Nix Installation Script
# This script installs Nix package manager and ensures it works in all shell sessions

# Print colored output
print_info() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

# Check if Nix is already installed
if command -v nix &> /dev/null; then
    print_warning "Nix is already installed. Current version:"
    nix --version
    read -p "Do you want to continue with the installation? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installation aborted."
        exit 0
    fi
fi

# Determine installation method
print_info "Checking for systemd..."
if systemctl --version &> /dev/null; then
    print_info "systemd detected. Multi-user installation is possible."
    read -p "Do you want to perform a multi-user installation? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        INSTALL_CMD="sh <(curl -L https://nixos.org/nix/install) --daemon"
        MULTI_USER=true
    else
        INSTALL_CMD="sh <(curl -L https://nixos.org/nix/install)"
        MULTI_USER=false
    fi
else
    print_warning "systemd not detected. Proceeding with single-user installation."
    INSTALL_CMD="sh <(curl -L https://nixos.org/nix/install)"
    MULTI_USER=false
fi

# Install Nix
print_info "Installing Nix with command: $INSTALL_CMD"
eval "$INSTALL_CMD"

# Check if installation was successful
if [ $? -ne 0 ]; then
    print_error "Nix installation failed. Please check the error messages above."
    exit 1
fi

# Fix shell configuration for non-login shells if single-user installation
if [ "$MULTI_USER" = false ]; then
    print_info "Ensuring Nix works in non-login shells..."
    
    # Check if configuration already exists in .bashrc
    if ! grep -q "nix.sh" ~/.bashrc; then
        echo 'if [ -e $HOME/.nix-profile/etc/profile.d/nix.sh ]; then . $HOME/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer' >> ~/.bashrc
        print_success "Added Nix configuration to ~/.bashrc"
    else
        print_info "Nix configuration already exists in ~/.bashrc"
    fi
    
    # Check if configuration already exists in .zshrc (if zsh is installed)
    if command -v zsh &> /dev/null && [ -f ~/.zshrc ] && ! grep -q "nix.sh" ~/.zshrc; then
        echo 'if [ -e $HOME/.nix-profile/etc/profile.d/nix.sh ]; then . $HOME/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer' >> ~/.zshrc
        print_success "Added Nix configuration to ~/.zshrc"
    fi
fi

# Source Nix in current shell
print_info "Sourcing Nix in current shell..."
if [ -e $HOME/.nix-profile/etc/profile.d/nix.sh ]; then
    . $HOME/.nix-profile/etc/profile.d/nix.sh
    print_success "Nix sourced in current shell"
else
    print_warning "Could not find Nix profile script. You may need to restart your shell."
fi

# Verify installation
print_info "Verifying Nix installation..."
if command -v nix &> /dev/null; then
    NIX_VERSION=$(nix --version)
    print_success "Nix is installed and working: $NIX_VERSION"
    
    # Test in a new shell
    print_info "Testing Nix in a new shell..."
    if bash -c "nix --version" &> /dev/null; then
        NEW_SHELL_VERSION=$(bash -c "nix --version")
        print_success "Nix works in new shell sessions: $NEW_SHELL_VERSION"
    else
        print_error "Nix does not work in new shell sessions. You may need to restart your terminal or source your shell configuration files."
    fi
else
    print_error "Nix installation verification failed. Please restart your terminal and try running 'nix --version'."
fi

print_success "Nix installation and configuration completed!"
print_info "For more information, see the init-nix.md documentation file."
print_info "You may need to restart your terminal for all changes to take effect."
