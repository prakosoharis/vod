# 🎬 MOST DESIGN SYSTEM
## Warm Coffee House Cinema

---

## 🎯 DESIGN PHILOSOPHY

**"Rasanya kayak nonton di bioskop, tapi bareng temen-temen dari seluruh Indonesia."**

MOST bukan Netflix clone. MOST adalah digital warung kopi untuk film - tempat hangat untuk berkumpul, menonton bersama, dan merasakan cerita sebagai komunitas.

---

## 🎨 COLOR PALETTE

### PRIMARY: Deep Espresso Brown
**The warmth of coffee, the depth of cinema**

```
50:  #F4EDE3  (Cream - lightest)
100: #E8D9C9  (Latte foam)
200: #D4B89A  (Cappuccino)
300: #B8956B  (Light roast)
400: #9C7447  (Medium roast)
500: #2C1810  (Deep Espresso) ← MAIN BRAND COLOR
600: #24140D  (Dark roast)
700: #1D100A  (Almost black coffee)
800: #160C08
900: #0F0805
950: #080403  (Coffee grounds)
```

**Usage:**
- Buttons, CTAs in dark contexts
- Headings, emphasis
- Logo primary color
- Borders, dividers

---

### ACCENT: Burnt Sienna
**Roasted coffee beans, sunset glow, warmth**

```
50:  #FBF2ED  (Light cream)
100: #F7E5DB
200: #EFCBB7
300: #E7B193
400: #DF976F
500: #C67D4B  ← PRIMARY ACCENT (CTAs, hover states)
600: #A86739
700: #7E4D2B
800: #54331D
900: #2A1A0E
950: #150D07
```

**Usage:**
- Primary buttons (JOIN SHOW, RESERVE SEAT)
- Hover states
- Active states
- Highlights, badges
- LIVE indicators

---

### BACKGROUND: Warm Charcoal
**Cinema darkness with warmth, not cold black**

```
Main BG: #1A1614  (Warm charcoal)
50:      #2D2826  (Lightest surface)
100:     #1A1614  (Cards, elevated surfaces)
200:     #141210
300:     #0F0D0C
400:     #0A0908
500:     #050504  (Deepest black)
```

**Usage:**
- Body background: `#1A1614`
- Cards, modals: `#2D2826`
- Deep backgrounds: `#141210`

---

### TEXT: Cream Tones
**Warm, readable, inviting**

```
Primary:   #F4EDE3  (Cream white - main text)
Secondary: #C4B5A3  (Warm gray - descriptions)
Tertiary:  #8B7E74  (Muted - metadata)
Disabled:  #5A524B  (Very muted)
```

---

## 📐 TYPOGRAPHY

### Scale (Simplified - Steve Jobs approved)

```
DISPLAY:  48px / 3rem     - Hero moments only (film titles on hero)
TITLE:    24px / 1.5rem   - Section headings (TONIGHT, UPCOMING)
BODY:     16px / 1rem     - Everything else (descriptions, UI)
SMALL:    14px / 0.875rem - Metadata, captions
```

**Font Stack:**
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

**Future consideration:** Custom serif for DISPLAY to add warmth

---

## 🔲 SPACING

**8pt Grid System**

```
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
4xl: 96px  (6rem)
```

**GENEROUS SPACING = PREMIUM FEEL**

Section gaps: `3xl` (64px)
Card gaps: `lg` (24px)
Internal padding: `lg` to `xl`

---

## 🎭 COMPONENTS

### Buttons

**PRIMARY (Accent)**
```
Background: #C67D4B (accent-500)
Text: #F4EDE3 (cream)
Padding: 12px 32px
Border Radius: 12px (rounded-xl)
Hover: #A86739 (accent-600)
Shadow: warm-md
```

**SECONDARY (Outline)**
```
Border: 2px solid #C67D4B
Background: transparent
Text: #C67D4B
Hover: bg-accent-500/10
```

**GHOST**
```
Background: transparent
Text: #F4EDE3
Hover: bg-warm-charcoal-50
```

---

### Cards

**Content Cards**
```
Background: #2D2826 (warm-charcoal-50)
Border Radius: 16px (2xl)
Padding: 20px
Shadow: warm-lg
Hover: translateY(-6px) + warm-xl shadow
Transition: 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

**Aspect Ratios:**
- Poster: 2:3 (portrait)
- Backdrop: 16:9 (landscape)
- Square: 1:1 (profile, etc)

---

### Shadows

```
warm-sm: 0 1px 2px rgba(44, 24, 16, 0.3)
warm-md: 0 4px 6px rgba(44, 24, 16, 0.3)
warm-lg: 0 10px 15px rgba(44, 24, 16, 0.4)
warm-xl: 0 20px 25px rgba(44, 24, 16, 0.5)
coffee-glow: 0 0 20px rgba(198, 125, 75, 0.3)
```

---

## 🎬 PAGE LAYOUTS

### HOMEPAGE HIERARCHY

```
1. LIVE NOW (if active)
   - Full-width hero
   - Video player + chat
   - Massive "JOIN SHOW" button (accent-500)

2. TONIGHT'S PREMIERE
   - Prominent card, above fold
   - Time countdown
   - "RESERVE SEAT" button

3. UPCOMING THIS WEEK
   - Horizontal scroll
   - Event cards (date, title, type)

4. CINEMA (VOD Library)
   - Secondary placement
   - Grouped by genre/mood
```

---

## 🎨 VISUAL EFFECTS

### Glass Morphism (Minimal usage)
```css
.warm-glass {
  background: rgba(45, 40, 38, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(244, 237, 227, 0.1);
}
```

### Gradients
```css
/* Warm vignette */
.warm-gradient {
  background: linear-gradient(
    180deg,
    rgba(26, 22, 20, 0.9) 0%,
    transparent 100%
  );
}

/* Coffee glow (for special elements) */
.coffee-glow {
  background: radial-gradient(
    circle at center,
    rgba(198, 125, 75, 0.15) 0%,
    transparent 70%
  );
}
```

---

## 🎯 NAVIGATION

### Desktop

```
[LOGO]              [SEARCH] [USER AVATAR]

TONIGHT | UPCOMING | CINEMA | MY SEAT
```

**TONIGHT** - What's live/premiering today
**UPCOMING** - Event calendar
**CINEMA** - VOD library
**MY SEAT** - Watchlist + history

### Mobile

Bottom navigation:
```
[CINEMA] [UPCOMING] [🔴 TONIGHT] [MY SEAT]
         (Center button elevated)
```

---

## ⚡ INTERACTIONS

### Hover States
```
Cards: Lift 6px, add warm-xl shadow
Buttons: Darken 10%, scale 98%
Links: Accent-500 color, underline
```

### Active States
```
Buttons: Scale 95%, darken 15%
Nav items: Accent-500 underline
```

### Loading States
```
Skeleton: warm-charcoal-50 with shimmer
Spinner: Accent-500 rotating
```

---

## 🔴 LIVE EVENT INDICATORS

```
• Color: #FF4444 (bright red - only place we use red!)
• Pulse animation
• "LIVE" text in accent-500 background
• Viewer count in cream-100
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
sm: 640px   (Mobile landscape)
md: 768px   (Tablet)
lg: 1024px  (Desktop)
xl: 1280px  (Large desktop)
2xl: 1536px (Ultra wide)
```

**Mobile-first approach, but optimized for desktop viewing**

---

## ✅ DO'S

✅ Use warm browns everywhere
✅ Generous spacing (breathe!)
✅ Rounded corners (12px minimum)
✅ Warm shadows
✅ Accent-500 for CTAs
✅ Events FIRST, VOD second
✅ Community features visible

---

## ❌ DON'TS

❌ NO Netflix red (#e50914)
❌ NO cool grays
❌ NO sharp corners
❌ NO cluttered UI
❌ NO infinite scroll without purpose
❌ NO glassmorphism everywhere
❌ NO auto-play indicators

---

## 🎬 TAGLINES & COPY

**Hero:**
> "Nonton bareng, meski sendiri"

**Subheadline:**
> "Gala premiere, standup comedy, dan film pilihan - streaming dengan ribuan penonton se-Indonesia"

**CTA:**
> "GABUNG SEKARANG" (not "Sign Up")
> "TONTON SEKARANG" (not "Watch Now")
> "PESAN KURSI" (not "Reserve Seat")

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Foundation
- [ ] Update tailwind.config.js colors
- [ ] Update index.css variables
- [ ] Create button components (Primary, Secondary, Ghost)
- [ ] Create card component (rounded, warm shadow)

### Phase 2: Navigation
- [ ] Redesign Navbar (TONIGHT, UPCOMING, CINEMA, MY SEAT)
- [ ] Mobile bottom nav
- [ ] Logo update/design

### Phase 3: Homepage
- [ ] LIVE NOW hero component
- [ ] Tonight's Premiere section
- [ ] Upcoming events row
- [ ] Cinema library (simplified)

### Phase 4: Live Experience
- [ ] Live player + chat layout
- [ ] Reaction system
- [ ] Viewer count
- [ ] Event countdown

---

## 🎨 BRAND PERSONALITY

**MOST is:**
- Warm (not cold tech)
- Communal (not solo)
- Inviting (not exclusive)
- Indonesian (not trying to be Western)
- Cinematic (not casual scroll)
- Event-driven (not endless library)

**MOST feels like:**
- Masuk warung kopi favorit at 7 PM
- Lampu redup, suasana hangat
- Ada temen-temen yang udah nunggu
- Film mau mulai, excitement in the air
- Everyone's welcome, no judgment

---

**END OF DESIGN SYSTEM**

*"Simplicity is the ultimate sophistication."* - Leonardo da Vinci
*"That's MOST."* - Steve Jobs (probably)
