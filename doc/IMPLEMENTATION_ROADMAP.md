# 🚀 MOST REDESIGN - IMPLEMENTATION ROADMAP

## ⚡ QUICK START (Do This NOW)

### 1. Update Tailwind Config

**File:** `apps/web/tailwind.config.js`

Replace the `colors` section in `theme.extend` with:

```javascript
colors: {
  // PRIMARY: Deep Espresso Brown
  primary: {
    '50': '#F4EDE3',
    '100': '#E8D9C9',
    '200': '#D4B89A',
    '300': '#B8956B',
    '400': '#9C7447',
    '500': '#2C1810', // ← MAIN BRAND COLOR
    '600': '#24140D',
    '700': '#1D100A',
    '800': '#160C08',
    '900': '#0F0805',
    '950': '#080403',
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))'
  },
  // ACCENT: Burnt Sienna (CTAs, highlights)
  accent: {
    '50': '#FBF2ED',
    '100': '#F7E5DB',
    '200': '#EFCBB7',
    '300': '#E7B193',
    '400': '#DF976F',
    '500': '#C67D4B', // ← PRIMARY ACCENT
    '600': '#A86739',
    '700': '#7E4D2B',
    '800': '#54331D',
    '900': '#2A1A0E',
    '950': '#150D07',
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))'
  },
  // Keep the rest (background, foreground, card, etc.)
}
```

**Also add these custom colors:**

```javascript
'warm-charcoal': {
  '50': '#2D2826',
  '100': '#1A1614',
  '200': '#141210',
  '300': '#0F0D0C',
  '400': '#0A0908',
  '500': '#050504',
},
'cream': {
  '50': '#F4EDE3',
  '100': '#C4B5A3',
  '200': '#8B7E74',
  '300': '#5A524B',
},
```

**Add custom shadows:**

```javascript
boxShadow: {
  'warm-sm': '0 1px 2px 0 rgba(44, 24, 16, 0.3)',
  'warm-md': '0 4px 6px -1px rgba(44, 24, 16, 0.3), 0 2px 4px -1px rgba(44, 24, 16, 0.15)',
  'warm-lg': '0 10px 15px -3px rgba(44, 24, 16, 0.4), 0 4px 6px -2px rgba(44, 24, 16, 0.2)',
  'warm-xl': '0 20px 25px -5px rgba(44, 24, 16, 0.5), 0 10px 10px -5px rgba(44, 24, 16, 0.25)',
  'coffee-glow': '0 0 20px rgba(198, 125, 75, 0.3)',
}
```

---

### 2. Update CSS Variables

**File:** `apps/web/src/index.css`

Replace the `:root` color variables (lines 10-53) with:

```css
:root {
  /* PRIMARY: Deep Espresso Brown */
  --color-primary-50: #F4EDE3;
  --color-primary-100: #E8D9C9;
  --color-primary-200: #D4B89A;
  --color-primary-300: #B8956B;
  --color-primary-400: #9C7447;
  --color-primary-500: #2C1810;
  --color-primary-600: #24140D;
  --color-primary-700: #1D100A;
  --color-primary-800: #160C08;
  --color-primary-900: #0F0805;
  --color-primary-950: #080403;

  /* BACKGROUND: Warm Charcoal */
  --color-background: #1A1614;
  --color-background-50: #2D2826;
  --color-background-100: #1A1614;
  --color-background-200: #141210;
  --color-background-300: #0F0D0C;
  --color-background-400: #0A0908;
  --color-background-500: #050504;

  /* ACCENT: Burnt Sienna */
  --color-accent-50: #FBF2ED;
  --color-accent-100: #F7E5DB;
  --color-accent-200: #EFCBB7;
  --color-accent-300: #E7B193;
  --color-accent-400: #DF976F;
  --color-accent-500: #C67D4B;
  --color-accent-600: #A86739;
  --color-accent-700: #7E4D2B;
  --color-accent-800: #54331D;
  --color-accent-900: #2A1A0E;
  --color-accent-950: #150D07;

  /* TEXT: Cream Tones */
  --color-text-primary: #F4EDE3;
  --color-text-secondary: #C4B5A3;
  --color-text-tertiary: #8B7E74;
  --color-text-disabled: #5A524B;

  /* BORDERS */
  --color-border: rgba(244, 237, 227, 0.1);
  --color-border-hover: rgba(244, 237, 227, 0.2);

  /* SHADOWS */
  --shadow-sm: 0 1px 2px 0 rgba(44, 24, 16, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(44, 24, 16, 0.3), 0 2px 4px -1px rgba(44, 24, 16, 0.15);
  --shadow-lg: 0 10px 15px -3px rgba(44, 24, 16, 0.4), 0 4px 6px -2px rgba(44, 24, 16, 0.2);
  --shadow-xl: 0 20px 25px -5px rgba(44, 24, 16, 0.5), 0 10px 10px -5px rgba(44, 24, 16, 0.25);
}
```

Update shadcn compatibility layer (around line 166-218):

```css
@layer base {
  :root {
    --background: 26 22 20;      /* #1A1614 in RGB */
    --foreground: 244 237 227;   /* #F4EDE3 in RGB */
    --primary: 44 24 16;         /* #2C1810 in RGB */
    --accent: 198 125 75;        /* #C67D4B in RGB */
    --radius: 0.75rem;
  }

  .dark {
    --background: 26 22 20;
    --foreground: 244 237 227;
    --primary: 44 24 16;
    --accent: 198 125 75;
  }
}
```

---

### 3. Replace Utility Classes

**Find and replace across ALL components:**

```
bg-black        → bg-warm-charcoal-100
bg-gray-800     → bg-warm-charcoal-50
bg-gray-900     → bg-warm-charcoal-200
text-gray-400   → text-cream-100
text-gray-300   → text-cream-50
text-white      → text-cream-50
bg-red-600      → bg-accent-500
text-red-500    → text-accent-500
hover:bg-red-700 → hover:bg-accent-600
```

---

## 📦 PHASE 1: FOUNDATION (Week 1)

### Day 1-2: Color System
- [x] Design system documented
- [ ] Update tailwind.config.js
- [ ] Update index.css
- [ ] Test: Run `npm run dev` and verify no errors

### Day 3-4: Base Components
- [ ] Create `apps/web/src/components/ui/Button.tsx` (new warm design)
- [ ] Create `apps/web/src/components/ui/Card.tsx` (rounded, warm shadows)
- [ ] Update existing UI components to use new colors

### Day 5-7: Test & Refine
- [ ] Replace hardcoded colors in all existing components
- [ ] Test responsive design
- [ ] Fix any visual issues

---

## 🎨 PHASE 2: NAVIGATION (Week 2)

### Navbar Redesign
**File:** `apps/web/src/components/layout/Navbar.tsx`

**Changes:**
1. Replace navigation links:
   ```jsx
   OLD: Home | Browse | Live | My List
   NEW: TONIGHT | UPCOMING | CINEMA | MY SEAT
   ```

2. Update colors:
   ```jsx
   bg-black/95 → bg-warm-charcoal-100/95
   text-red-500 → text-accent-500
   hover:bg-white/10 → hover:bg-warm-charcoal-50
   ```

3. Logo area - use warm aesthetic

### Mobile Nav
- Bottom navigation bar
- Center button: TONIGHT (elevated, accent-500)
- Side icons: CINEMA, UPCOMING, MY SEAT

---

## 🏠 PHASE 3: HOMEPAGE REDESIGN (Week 3-4)

### Priority Hierarchy (NEW)

```
1. 🔴 LIVE NOW (if any event is live)
2. 🎬 TONIGHT'S PREMIERE (above fold)
3. 📅 UPCOMING THIS WEEK
4. 🎞️ CINEMA (VOD library)
```

### LandingPage.tsx Redesign

**File:** `apps/web/src/pages/LandingPage.tsx`

**KILL:**
- ❌ Auto-play carousel with 5 slides
- ❌ Manual/Auto indicator
- ❌ Progress bar at bottom
- ❌ Staggered loading (1s, 2s delays)
- ❌ Multiple metadata pills

**BUILD:**
- ✅ Single immersive hero (if LIVE NOW exists)
- ✅ "Tonight's Premiere" featured card
- ✅ Upcoming events calendar
- ✅ Simplified VOD rows

### New Hero Component

**Create:** `apps/web/src/components/home/LiveNowHero.tsx`

```tsx
// Full-width immersive experience
// Video player (if live) or backdrop image
// Minimal UI: Title + "JOIN SHOW" button
// Live viewer count
// Chat toggle
```

### Tonight's Premiere Component

**Create:** `apps/web/src/components/home/TonightPremiere.tsx`

```tsx
// Large card, prominent placement
// Countdown timer
// Film poster + details
// "RESERVE SEAT" button (accent-500)
// Director/cast info
```

---

## 🎭 PHASE 4: LIVE EXPERIENCE (Week 5)

### Live Streaming Page

**File:** `apps/web/src/pages/LiveStreamingPage.tsx`

**Layout:**
```
┌────────────────────────┬─────────────┐
│                        │             │
│                        │  LIVE CHAT  │
│   VIDEO PLAYER         │             │
│                        │  [Message]  │
│                        │             │
└────────────────────────┴─────────────┘
  👥 viewers   [❤️ 👏 😂 😮]  UP NEXT
```

**Features:**
- Side chat (collapsible)
- Live reactions (emoji overlay)
- Viewer count with pulse animation
- Event segments (Film → Q&A → BTS)

---

## 🔧 QUICK FIXES (Do First)

### Fix Invalid Tailwind Class

**File:** `apps/web/src/pages/LandingPage.tsx` Line 236

```jsx
OLD: className="relative -mt-22 z-10..."
NEW: className="relative -mt-32 z-10..."  // -mt-22 tidak valid!
```

### Remove Unused Auto-Play Logic

**File:** `apps/web/src/components/home/FeaturedCarousel.tsx`

Lines to remove:
- 95-102: Auto-play indicator UI
- 191-201: Auto-play progress bar

Keep simple carousel, remove complexity.

---

## 📊 BEFORE/AFTER COMPARISON

### Color Changes

| Element | OLD (Netflix) | NEW (MOST) |
|---------|---------------|------------|
| Primary CTA | #e50914 (red) | #C67D4B (burnt sienna) |
| Background | #000000 (pure black) | #1A1614 (warm charcoal) |
| Text | #ffffff (cool white) | #F4EDE3 (warm cream) |
| Cards | #141414 (cool gray) | #2D2826 (warm charcoal) |
| Hover | Red tint | Warm brown/sienna |

### Typography Simplification

| OLD | NEW | Usage |
|-----|-----|-------|
| 7 font sizes | 3 font sizes | Cleaner hierarchy |
| text-sm through text-6xl | Display/Title/Body | Simpler, intentional |
| Inconsistent line heights | 1.5 standard | Better readability |

### Component Changes

| Component | OLD Approach | NEW Approach |
|-----------|--------------|--------------|
| Hero Carousel | 5 slides, auto-rotate | Single immersive (LIVE or Featured) |
| Navigation | Home/Browse/Live/My List | TONIGHT/UPCOMING/CINEMA/MY SEAT |
| Content Rows | Infinite genres | Curated sections, events first |
| Buttons | Netflix red, sharp | Warm sienna, rounded |
| Cards | Sharp, flat | Rounded, warm shadows |

---

## ✅ CHECKLIST

### Week 1: Foundation
- [ ] Backup current code (`git commit` or `git branch old-design`)
- [ ] Update `tailwind.config.js` colors
- [ ] Update `index.css` CSS variables
- [ ] Test dev server runs without errors
- [ ] Create new Button component
- [ ] Create new Card component

### Week 2: Navigation
- [ ] Update Navbar component
- [ ] Implement new navigation structure
- [ ] Design/add logo
- [ ] Mobile navigation redesign
- [ ] Test all nav links work

### Week 3-4: Pages
- [ ] Redesign LandingPage
- [ ] Create LiveNowHero component
- [ ] Create TonightPremiere component
- [ ] Update BrowsePage
- [ ] Simplify content discovery

### Week 5: Live Features
- [ ] Live player + chat layout
- [ ] Reaction system
- [ ] Event countdown
- [ ] Test with real/mock live stream

### Week 6: Polish
- [ ] Animation refinements
- [ ] Loading states
- [ ] Error states
- [ ] Accessibility audit
- [ ] Performance optimization

---

## 🚨 COMMON PITFALLS

### DON'T:
❌ Use `bg-black` anywhere (too cold)
❌ Use sharp corners (`rounded-none`, `rounded-sm`)
❌ Use Netflix red anywhere
❌ Over-complicate with animations
❌ Add features "just because"

### DO:
✅ Use `bg-warm-charcoal-*` for backgrounds
✅ Use `rounded-xl` or `rounded-2xl` minimum
✅ Use accent-500 (#C67D4B) for CTAs
✅ Keep animations subtle and meaningful
✅ Remove features that don't serve connection/events

---

## 🎯 SUCCESS METRICS

**You'll know it's working when:**

1. **Visual:** Opens app, immediately feels WARM (not cold tech)
2. **Emotional:** Users say "cozy", "inviting", "homey"
3. **Functional:** LIVE events are impossible to miss
4. **Different:** Someone says "this doesn't look like Netflix"
5. **Indonesian:** Feels local, not American import

**User quote we're aiming for:**
> "Rasanya kayak nonton di bioskop, tapi bareng temen-temen dari seluruh Indonesia."

---

## 💡 TIPS

1. **Start small:** Update colors first, see the impact
2. **Test continuously:** Check in browser after each change
3. **Use design system:** Reference `MOST_DESIGN_SYSTEM.md` constantly
4. **Trust the vision:** Don't second-guess warm colors
5. **Commit often:** Small commits = easy rollback if needed

---

## 📞 NEED HELP?

Refer to:
- `MOST_DESIGN_SYSTEM.md` - Complete design spec
- `DESIGN_COLORS_NEW.js` - Color reference
- This file - Step-by-step roadmap

---

**LET'S BUILD SOMETHING INSANELY GREAT! 🚀**

*"The people who are crazy enough to think they can change the world are the ones who do."* - Steve Jobs
