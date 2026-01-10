---
description: Build cross-platform desktop application
---

# Cross-Platform Build Workflow

This workflow guides you through building AeroSense for Windows, macOS, and Linux.

## Prerequisites Check

1. Verify Node.js installation:
```bash
node --version
```
Should be v18 or higher.

2. Verify Python installation:
```bash
python --version
```
Should be v3.8 or higher.

3. Ensure all dependencies are installed:
```bash
npm install
pip install -r requirements.txt
```

## Development Mode

### Web Development
// turbo
1. Start the web development server:
```bash
npm run dev
```
Access at http://localhost:5173

### Desktop Development
2. Start Electron in development mode:
```bash
npm run electron:dev
```
This will start both the web server and Electron app.

## Production Build

### Step 1: Build Web Assets
3. Build the web application:
```bash
npm run build
```

### Step 2: Build Desktop App

#### For Windows
4. Build Windows installer and portable:
```bash
npm run electron:build:win
```
Output: `release/AeroSense Setup.exe` and `release/AeroSense.exe`

#### For macOS
5. Build macOS DMG (requires macOS):
```bash
npm run electron:build:mac
```
Output: `release/AeroSense.dmg` and `release/AeroSense.zip`

#### For Linux
6. Build Linux packages:
```bash
npm run electron:build:linux
```
Output: `release/AeroSense.AppImage`, `release/aerosense.deb`, `release/aerosense.rpm`

#### All Platforms
7. Build for all platforms (current platform only):
```bash
npm run electron:build
```

## Testing the Build

8. Test the built application:
- **Windows**: Run `release/AeroSense.exe`
- **macOS**: Open `release/AeroSense.dmg` and drag to Applications
- **Linux**: Run `release/AeroSense.AppImage` or install the .deb/.rpm

## Distribution

9. The built files in `release/` folder are ready for distribution:
- Upload to GitHub Releases
- Distribute via your website
- Submit to app stores (macOS App Store, Microsoft Store, Snap Store)

## Troubleshooting

**Build fails:**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear dist folder: `rm -rf dist`
- Rebuild: `npm run build && npm run electron:build`

**Python backend not included:**
- Ensure server/ folder exists
- Check electron-main.js for correct Python path
- Verify build.files in package.json includes server/**/*

**Icon missing:**
- Ensure client/public/icon.png exists
- Icon should be 512x512 PNG with transparency
