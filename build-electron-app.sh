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
mkdir -p dist-electron/server
mkdir -p dist-electron/shared

# 4. Copy Electron files
echo "Copying Electron files..."
cp -r electron/* dist-electron/electron/

# 5. Copy server and shared files
echo "Copying server and shared files..."
cp -r server/*.js dist-electron/server/
cp -r shared/*.js dist-electron/shared/

# 6. Create a package.json for the Electron app
echo "Creating package.json for Electron..."
cat > dist-electron/package.json << EOL
{
  "name": "gallan-desktop",
  "version": "1.0.0",
  "main": "electron/main.js",
  "private": true
}
EOL

# 7. Create resources directory for icons
mkdir -p resources
cp public/icon.svg resources/icon.svg

# Additional icons for platforms that may need them
cp public/icon.svg resources/icon.icns  # For macOS
cp public/icon.svg resources/icon.ico   # For Windows
cp public/icon.svg resources/icon.png   # For Linux

# 8. Convert SVG to PNG (using electron-builder's default icon)
echo "Using default app icon..."

# 9. Build the Electron app for the current platform
echo "Building Electron app..."
npx electron-builder --config electron-builder.json

echo "Build completed! Check the 'releases' directory for the executable."