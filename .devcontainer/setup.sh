#!/bin/bash

# Setup script for GitHub Codespaces

echo "🚀 Starting environment setup..."

# 1. Install dependencies
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# 2. Import Database
echo "🗄️ Importing database data..."
# Wait for MySQL to be ready
until mysqladmin ping -h localhost --silent; do
    echo "Waiting for MySQL..."
    sleep 2
done

mysql -u root -e "CREATE DATABASE IF NOT EXISTS database_benhvien;"
mysql -u root database_benhvien < medisched_full_data.sql

echo "✅ Environment setup complete!"
echo "💡 To start the app, run: ./run_local.sh"
