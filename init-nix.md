# Nix Installation and Setup Guide

## Overview
This document outlines the steps to install and configure Nix package manager on a Linux system, ensuring it works properly across all terminal sessions.

## Installation Steps

### 1. Install Nix (Single-User Mode)
Run the official Nix installer:
```bash
sh <(curl -L https://nixos.org/nix/install)
```

The installer will:
- Create the `/nix` directory
- Install Nix in `/nix/store`
- Modify shell configuration files (`.profile`, `.zshrc`, etc.)

### 2. Verify Installation
After installation, verify Nix is working:
```bash
nix --version
```

Expected output:
```
nix (Nix) 2.28.3
```

### 3. Fix Shell Configuration
Ensure Nix works in all terminal sessions by adding Nix configuration to `.bashrc`:

```bash
echo 'if [ -e $HOME/.nix-profile/etc/profile.d/nix.sh ]; then . $HOME/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer' >> ~/.bashrc
```

### 4. Test in New Terminal Sessions
Verify Nix works in new terminal sessions:
```bash
bash -c "nix --version"
```

## Troubleshooting

### Nix Command Not Found
If `nix` command is not found in new terminal sessions:
1. Check if Nix configuration is in your shell profile files:
   ```bash
   grep -n "nix" ~/.profile
   grep -n "nix" ~/.bashrc
   ```
2. Add the missing configuration to `.bashrc` as shown in step 3 above

### Multi-User Installation Issues
If attempting multi-user installation without systemd:
1. Use single-user installation instead
2. Run installer without `--daemon` flag:
   ```bash
   sh <(curl -L https://nixos.org/nix/install)
   ```

## Basic Nix Commands

- Search for packages: `nix-env -qaP | grep package-name`
- Install a package: `nix-env -iA nixpkgs.package-name`
- List installed packages: `nix-env -q`
- Remove a package: `nix-env -e package-name`
- Create temporary environment: `nix-shell -p package1 package2`
- Update packages: 
  ```bash
  nix-channel --update
  nix-env -u
  ```

## Notes
- The single-user installation is simpler but less secure than multi-user installation
- Multi-user installation requires systemd for managing the Nix daemon
- Shell configuration files may vary depending on your default shell (bash, zsh, fish)
