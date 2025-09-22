# Poppler Installation Guide

The PDF to JPG conversion now uses **Poppler utilities** for the best quality and reliability. You need to install Poppler on your system.

## Windows Installation

### Option 1: Using Chocolatey (Recommended)
```bash
# Install Chocolatey if you haven't already
# Then install poppler
choco install poppler
```

### Option 2: Manual Installation
1. Download Poppler for Windows from: https://github.com/oschwartz10612/poppler-windows/releases
2. Extract to a folder (e.g., `C:\poppler`)
3. Add the `bin` folder to your system PATH: `C:\poppler\bin`
4. Restart your terminal/IDE

### Option 3: Using Scoop
```bash
scoop install poppler
```

## Linux Installation

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install poppler-utils
```

### CentOS/RHEL/Fedora
```bash
# CentOS/RHEL
sudo yum install poppler-utils

# Fedora
sudo dnf install poppler-utils
```

### Arch Linux
```bash
sudo pacman -S poppler
```

## macOS Installation

### Using Homebrew (Recommended)
```bash
brew install poppler
```

### Using MacPorts
```bash
sudo port install poppler
```

## Verify Installation

After installation, verify that Poppler is working:

```bash
pdftoppm -h
```

You should see the help output for the `pdftoppm` command.

## How It Works

The new PDF to JPG conversion pipeline:

1. **Poppler (pdftoppm)** extracts PDF pages as high-quality images
2. **Sharp** processes the images to guarantee valid JPEG output
3. **Result**: Perfect, non-corrupted JPG files every time

This pipeline is used by professional PDF processing services and guarantees the highest quality output.

