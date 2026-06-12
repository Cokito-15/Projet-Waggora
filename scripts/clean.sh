#!/bin/bash

# Clean development environment

echo "🧹 Cleaning up..."

# Remove node_modules
echo "Removing node_modules..."
find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true

# Remove .next
echo "Removing .next directories..."
find . -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true

# Remove dist
echo "Removing dist directories..."
find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true

# Remove .turbo
echo "Removing .turbo..."
rm -rf .turbo 2>/dev/null || true

# Remove lock files
echo "Removing lock files..."
find . -name "package-lock.json" -delete 2>/dev/null || true
find . -name "yarn.lock" -delete 2>/dev/null || true

echo "✅ Clean complete!"
echo "Run 'npm install' to reinstall dependencies"
