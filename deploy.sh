#!/bin/bash
set -e

echo "Building project..."
npm run build

echo "Preparing gh-pages branch..."
git checkout --orphan gh-pages-new

# Remove all tracked files from staging
git rm -rf .

# Copy dist contents to root
cp dist/index.html index.html

# Add .nojekyll to prevent Jekyll processing
touch .nojekyll

# Stage files
git add index.html .nojekyll

# Commit
git commit -m "Deploy to GitHub Pages"

# Force push to gh-pages
git push origin gh-pages-new:gh-pages --force

# Return to main branch
git checkout main

# Clean up temporary branch
git branch -D gh-pages-new

echo "Deployment complete!"
