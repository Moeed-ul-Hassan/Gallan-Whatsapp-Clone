#!/bin/bash

# Start the development server and Electron app
echo "Starting Gallan in development mode..."

# Start the server
NODE_ENV=development tsx server/index.ts &
SERVER_PID=$!

# Wait for the server to start
echo "Waiting for server to start..."
npx wait-on http://localhost:5000

# Start Electron
echo "Starting Electron..."
electron electron/main.js

# Kill the server when Electron exits
kill $SERVER_PID