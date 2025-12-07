#!/bin/bash

echo "🎨 Applying WARM color transformations..."
echo ""

# Fix invalid -mt-22 class in LandingPage
echo "  📝 Fixing LandingPage.tsx..."
sed -i 's/-mt-22/-mt-32/g' src/pages/LandingPage.tsx
sed -i 's/bg-black/bg-warm-charcoal-100/g' src/pages/LandingPage.tsx
sed -i 's/bg-gray-800/bg-warm-charcoal-50/g' src/pages/LandingPage.tsx

# Fix BrowsePage
echo "  📝 Fixing BrowsePage.tsx..."
sed -i 's/bg-black/bg-warm-charcoal-100/g' src/pages/BrowsePage.tsx
sed -i 's/bg-gray-800/bg-warm-charcoal-50/g' src/pages/BrowsePage.tsx

# Fix FeaturedCarousel
echo "  📝 Fixing FeaturedCarousel.tsx..."
sed -i 's/bg-red-600/bg-accent-500/g' src/components/home/FeaturedCarousel.tsx
sed -i 's/text-red-600/text-accent-500/g' src/components/home/FeaturedCarousel.tsx
sed -i 's/bg-green-500/bg-accent-400/g' src/components/home/FeaturedCarousel.tsx

# Fix Navbar
echo "  📝 Fixing Navbar.tsx..."
sed -i 's/text-red-500/text-accent-500/g' src/components/layout/Navbar.tsx
sed -i 's/hover:text-red-500/hover:text-accent-500/g' src/components/layout/Navbar.tsx
sed -i 's/bg-black/bg-warm-charcoal-100/g' src/components/layout/Navbar.tsx

echo ""
echo "✅ Color transformations applied!"
echo ""
echo "Changed:"
echo "  • bg-black → bg-warm-charcoal-100 (warm background)"
echo "  • bg-gray-800 → bg-warm-charcoal-50 (warm surfaces)"
echo "  • bg-red-600 → bg-accent-500 (burnt sienna)"
echo "  • -mt-22 → -mt-32 (fixed invalid class)"
echo ""
