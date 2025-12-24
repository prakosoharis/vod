#!/bin/bash

# ================================================================
# Quick Fix Script - Run this on server if deployment fails
# ================================================================

set -e

echo "=========================================="
echo "HLS Transcoder - Quick Fix"
echo "=========================================="
echo ""

# Check git status
echo "Checking git status..."
git fetch origin

BEHIND=$(git rev-list HEAD..origin/main --count)
if [ "$BEHIND" -gt 0 ]; then
    echo "⚠ You are $BEHIND commits behind origin/main"
    echo ""
    echo "Pulling latest changes..."
    git pull origin main
    echo "✓ Git updated"
else
    echo "✓ Git is up to date"
fi

echo ""

# Verify package-lock.json exists
if [ ! -f backend/package-lock.json ]; then
    echo "⚠ package-lock.json not found in backend/"
    echo ""
    echo "This should have been pulled from git."
    echo "Checking git..."

    if git ls-files backend/package-lock.json | grep -q "package-lock.json"; then
        echo "✓ File exists in git, forcing checkout..."
        git checkout HEAD -- backend/package-lock.json
    else
        echo "❌ File not in git repository!"
        echo ""
        echo "Temporary workaround: Using npm install instead..."
        echo "This will work but builds may not be reproducible."
    fi
else
    echo "✓ package-lock.json exists"
fi

echo ""

# Check Dockerfile version
if grep -q "COPY package.json package-lock.json" backend/Dockerfile; then
    echo "⚠ Dockerfile is outdated (old COPY command)"
    echo "Forcing git checkout..."
    git checkout HEAD -- backend/Dockerfile
    echo "✓ Dockerfile updated"
else
    echo "✓ Dockerfile is up to date"
fi

echo ""

# Show file status
echo "Current backend files:"
ls -lh backend/package* 2>/dev/null || echo "  (listing failed)"

echo ""
echo "=========================================="
echo "✓ Quick fix completed"
echo "=========================================="
echo ""
echo "Now run: ./deploy-prod.sh"
echo ""
