# Deployment Guide - Vercel

## Quick Deploy

### Option 1: Drag & Drop (Fastest)
1. Extract `home-designer-pro.zip`
2. Go to [vercel.com](https://vercel.com) and login
3. Click "Add New Project"
4. Drag the `home-designer-pro` folder to the deploy area
5. Vercel auto-detects Vite framework
6. Click "Deploy"
7. Done! Your app is live in ~30 seconds

### Option 2: Git Repository (Recommended for updates)
1. Push the `home-designer-pro` folder to a GitHub/GitLab repo
2. Go to [vercel.com](https://vercel.com) → "Add New Project"
3. Import your repository
4. Vercel auto-detects settings from `vercel.json`:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click "Deploy"
6. Every `git push` will auto-deploy

### Option 3: Vercel CLI
```bash
npm i -g vercel
cd home-designer-pro
vercel
# Follow prompts, then:
vercel --prod
```

## Configuration

The `vercel.json` file is pre-configured with:
- **SPA Routing**: All routes serve `index.html` (React Router compatible)
- **Cache Headers**: 
  - `/assets/*` → 1 year immutable cache
  - `/index.html` → no-cache (always fresh)
- **Security Headers**:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(self) (for AR mode)

## Environment

No environment variables needed. The app runs entirely client-side.

## Production Checklist ✅

- [x] **Security Audit**: No XSS, no injection, no eval
- [x] **Dependencies**: 0 production vulnerabilities (npm audit --production)
- [x] **Error Boundary**: Catches runtime errors gracefully
- [x] **Input Validation**: Import data sanitized (type, length, format)
- [x] **SVG Export**: XML-escaped to prevent XSS
- [x] **WebGL Context Loss**: Handled for 3D view stability
- [x] **Memory Leaks**: All event listeners cleaned up
- [x] **structuredClone Fallback**: JSON fallback for older browsers
- [x] **Null Safety**: Guards on activeFloor, columns, walls, items
- [x] **Division by Zero**: Protected in structural analysis
- [x] **NaN Prevention**: All sqrt/division guarded
- [x] **Responsive**: Mobile (375px+), Tablet (768px+), Desktop (1024px+)
- [x] **Touch Support**: Pinch-to-zoom, drag, double-tap
- [x] **iOS Safe Areas**: Notch support via env(safe-area-inset-*)
- [x] **PWA Meta Tags**: apple-mobile-web-app-capable, theme-color
- [x] **SEO Meta**: description, og:title, og:description
- [x] **Vercel Config**: vercel.json with SPA routing + security headers

## Build Output

```
dist/
├── index.html              (1.7 KB)
├── assets/
│   ├── index-*.js          (1.17 MB, 299 KB gzipped)
│   ├── index-*.css         (43 KB, 7.9 KB gzipped)
│   ├── GLTFExporter-*.js   (35 KB, lazy-loaded)
│   ├── OBJExporter-*.js    (2 KB, lazy-loaded)
│   └── STLExporter-*.js    (2 KB, lazy-loaded)
```

Total: ~312 KB gzipped (loads in ~1 second on 4G)

## Post-Deploy Verification

After deployment, test these features:
1. ✅ Load app (no white screen)
2. ✅ Add items from sidebar
3. ✅ Switch 2D ↔ 3D
4. ✅ Draw walls
5. ✅ Open SNI Analysis
6. ✅ Export JSON/PNG
7. ✅ Toggle dark mode
8. ✅ Open on mobile (responsive)
