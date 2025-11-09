Rebrand entire application from "StreamKita" to "Alkamus" - replace all occurrences in UI, text, descriptions, and logos.

PROJECT CONTEXT:
- Current brand: StreamKita
- New brand: Alkamus
- Need to replace in: Navbar, Footer, Landing Page, Auth Pages, All descriptions, Meta tags, etc.

FILES TO UPDATE:

========================================
FILE 1: src/components/layout/Navbar.tsx
========================================

FIND AND REPLACE:

Old:
```typescript
<Link to="/" className="text-2xl font-bold text-red-600">
  StreamKita
</Link>
```

New:
```typescript
<Link to="/" className="text-2xl font-bold text-red-600">
  Alkamus
</Link>
```

========================================
FILE 2: src/components/layout/Footer.tsx
========================================

FIND AND REPLACE:

Old:
```typescript
{/* Column 1: Brand */}
<div>
  <h3 className="text-2xl font-bold text-red-600 mb-4">StreamKita</h3>
  <p className="text-sm text-gray-400 leading-relaxed">
    Platform streaming favorit Anda untuk film dan acara TV terbaik dari Indonesia dan seluruh dunia.
  </p>
</div>

{/* Copyright */}
<p className="text-sm text-gray-500">
  © 2025 StreamKita. All rights reserved.
</p>
```

New:
```typescript
{/* Column 1: Brand */}
<div>
  <h3 className="text-2xl font-bold text-red-600 mb-4">Alkamus</h3>
  <p className="text-sm text-gray-400 leading-relaxed">
    Platform streaming pilihan untuk konten hiburan berkualitas dari dalam dan luar negeri.
  </p>
</div>

{/* Copyright */}
<p className="text-sm text-gray-500">
  © 2025 Alkamus. All rights reserved.
</p>
```

========================================
FILE 3: src/pages/LandingPage.tsx
========================================

FIND AND REPLACE ALL:

1. Hero Section - Main Heading:
Old: "Tonton Konten Unlimited Indonesia & Internasional"
New: "Nikmati Hiburan Tanpa Batas Bersama Alkamus"

2. Hero Section - Subheading:
Old: "Streaming ribuan film, series & lebih banyak lagi. Batalkan kapan saja."
New: "Ribuan film dan series berkualitas dalam satu platform. Bebas batalkan kapan saja."

3. Section Heading:
Old: "Mengapa Memilih StreamKita?"
New: "Mengapa Memilih Alkamus?"

4. Meta Description (if any):
Old references to "StreamKita"
New: "Alkamus"

========================================
FILE 4: src/pages/LoginPage.tsx
========================================

FIND AND REPLACE:

Old:
```typescript
<div className="text-center mb-8">
  <h1 className="text-3xl font-bold text-red-600 mb-2">StreamKita</h1>
  <p className="text-gray-400">Masuk ke akun Anda</p>
</div>
```

New:
```typescript
<div className="text-center mb-8">
  <h1 className="text-3xl font-bold text-red-600 mb-2">Alkamus</h1>
  <p className="text-gray-400">Masuk ke akun Anda</p>
</div>
```

========================================
FILE 5: src/pages/RegisterPage.tsx
========================================

FIND AND REPLACE:

Old:
```typescript
<div className="text-center mb-8">
  <h1 className="text-3xl font-bold text-red-600 mb-2">StreamKita</h1>
  <p className="text-gray-400">Daftar akun baru</p>
</div>
```

New:
```typescript
<div className="text-center mb-8">
  <h1 className="text-3xl font-bold text-red-600 mb-2">Alkamus</h1>
  <p className="text-gray-400">Daftar akun baru</p>
</div>
```

========================================
FILE 6: src/pages/NotFoundPage.tsx
========================================

No brand name in this file usually, but check if any reference exists.

========================================
FILE 7: public/index.html (or index.html in root)
========================================

FIND AND REPLACE:

Old:
```html
<title>StreamKita - Platform Streaming Indonesia</title>
<meta name="description" content="StreamKita - Platform streaming untuk film dan series Indonesia dan internasional">
```

New:
```html
<title>Alkamus - Platform Streaming Berkualitas</title>
<meta name="description" content="Alkamus - Platform streaming terbaik untuk hiburan berkualitas dari dalam dan luar negeri">
```

========================================
FILE 8: package.json (BOTH apps/web and apps/api)
========================================

FIND AND REPLACE:

apps/web/package.json:
Old: `"name": "streamkita-web"`
New: `"name": "alkamus-web"`

apps/api/package.json:
Old: `"name": "streamkita-api"`
New: `"name": "alkamus-api"`

========================================
FILE 9: docker-compose.yml (if exists)
========================================

FIND AND REPLACE:

Old:
```yaml
container_name: streamkita-postgres
POSTGRES_DB: streamkita_dev
```

New:
```yaml
container_name: alkamus-postgres
POSTGRES_DB: alkamus_dev
```

Also update volume name:
Old: `postgres_data` or `streamkita_data`
New: `alkamus_data`

========================================
FILE 10: apps/api/.env
========================================

FIND AND REPLACE DATABASE_URL:

Old:
DATABASE_URL="postgresql://streamkita:streamkita123@localhost:5432/streamkita_dev"

New:
DATABASE_URL="postgresql://alkamus:alkamus123@localhost:5432/alkamus_dev"

========================================
FILE 11: README.md (if exists)
========================================

Replace all mentions of "StreamKita" with "Alkamus"

========================================
ADDITIONAL CHECKS:
========================================

Search entire project for case-insensitive occurrences:
- "StreamKita" → "Alkamus"
- "streamkita" → "alkamus"
- "STREAMKITA" → "ALKAMUS"

Use VSCode Find & Replace (Ctrl+Shift+H):
1. Find: StreamKita (case insensitive)
2. Replace: Alkamus
3. Replace All in all files

Exclude folders:
- node_modules
- dist
- build
- .git

========================================
LOGO/FAVICON (Optional - if you want actual logo)
========================================

If you have Alkamus logo image:
1. Replace public/logo.png or public/favicon.ico
2. Update logo reference in Navbar:
```typescript
<Link to="/" className="flex items-center gap-2">
  <img src="/logo.png" alt="Alkamus" className="h-8 w-8" />
  <span className="text-2xl font-bold text-red-600">Alkamus</span>
</Link>
```

For now (without logo image), text-only brand is fine.

========================================
VERIFICATION CHECKLIST:
========================================

After replacement, verify these pages show "Alkamus":
[ ] Landing page (/, hero section)
[ ] Landing page (footer)
[ ] Navbar (all pages)
[ ] Login page (heading)
[ ] Register page (heading)
[ ] Browse page (navbar)
[ ] Video player page (back button destination name)
[ ] Footer on all pages
[ ] Browser tab title
[ ] Meta description

Test search in code:
[ ] Search "StreamKita" → should find 0 results (except in git history)
[ ] Search "streamkita" → should find 0 results (except package names)

========================================
FINAL STEPS:
========================================

1. After all replacements, run:
```bash
cd apps/web
npm run dev

cd apps/api
pnpm dev
```

2. Check browser:
- Open http://localhost:5173
- Verify all "StreamKita" changed to "Alkamus"
- Check Navbar, Footer, Landing page

3. Test database:
- If using Docker, recreate container:
```bash
docker-compose down -v
docker-compose up -d
cd apps/api
pnpm prisma migrate dev --name init
pnpm seed
```

4. Commit changes:
```bash
git add .
git commit -m "Rebrand: StreamKita → Alkamus"
git push
```

========================================
OUTPUT REQUIRED:
========================================

Provide:
1. List of all files that were updated
2. Count of replacements made per file
3. Any files that might need manual review
4. Verification that app runs without errors after rebrand

Make sure NO references to "StreamKita" remain except in:
- Git history (OK)
- node_modules (ignore)
- This conversation (OK)