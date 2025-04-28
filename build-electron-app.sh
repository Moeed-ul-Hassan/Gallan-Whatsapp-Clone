#!/bin/bash

# Exit on error
set -e

echo "Building Gallan Desktop Application..."

# 1. Build the React app
echo "Building React frontend..."
npm run build

# 2. Compile the server code for Electron
echo "Compiling server code for Electron..."
npx tsc -p tsconfig.electron.json

# 3. Create necessary directories
mkdir -p dist-electron/electron

# 4. Copy Electron files
echo "Copying Electron files..."
cp -r electron/* dist-electron/electron/

# 5. Create resources directory for icons
mkdir -p resources

# 6. Build the Electron app for the current platform
echo "Building Electron app..."
npx electron-builder --config electron-builder.json

echo "Build completed! Check the 'releases' directory for the executable."