#!/usr/bin/env python3
import os
from app import app, socketio

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.environ.get("PORT", 5000))
    
    # Use 0.0.0.0 to make the server accessible from outside
    socketio.run(app, host="0.0.0.0", port=port, debug=True)