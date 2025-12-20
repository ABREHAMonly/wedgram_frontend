#!/bin/bash

echo "Setting up WedGram Frontend..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Create required directories
echo "Creating directories..."
mkdir -p src/components/ui
mkdir -p src/lib/api
mkdir -p src/lib/hooks
mkdir -p src/lib/utils
mkdir -p src/lib/store
mkdir -p src/types
mkdir -p src/styles

# Copy environment file
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    cp .env.example .env.local
    echo "Please update .env.local with your backend URL"
fi

echo "Setup complete! Run 'npm run dev' to start development server."