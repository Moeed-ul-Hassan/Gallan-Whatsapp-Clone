#!/usr/bin/env python3
"""Test script for environment variables"""
import os
import sys
import json

# Print Python version and location
print(f"Python version: {sys.version}")
print(f"Python executable: {sys.executable}")
print(f"Current directory: {os.getcwd()}")

# Print environment variables
print("\nEnvironment variables:")
env_vars = {key: value for key, value in os.environ.items() if not key.startswith("_")}
print(json.dumps(env_vars, indent=2))

# Print installed packages
print("\nInstalled packages:")
import pkg_resources
installed_packages = sorted([f"{pkg.key}=={pkg.version}" for pkg in pkg_resources.working_set])
for pkg in installed_packages:
    print(f"  {pkg}")

print("\nTest completed successfully!")