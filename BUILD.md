# Cross-Platform Build Instructions

## Prerequisites by Platform

### Windows
- Node.js 18+
- Python 3.8+
- Windows Build Tools (optional, for native modules)

### macOS
- Node.js 18+
- Python 3.8+
- Xcode Command Line Tools

### Linux
- Node.js 18+
- Python 3.8+
- Build essentials: `sudo apt-get install build-essential`

## Building

### 1. Install Dependencies
```bash
npm install
pip install -r requirements.txt
```

### 2. Build Web Assets
```bash
npm run build
```

### 3. Build Desktop App

**For Windows:**
```bash
npm run electron:build:win
```

**For macOS:**
```bash
npm run electron:build:mac
```

**For Linux:**
```bash
npm run electron:build:linux
```

## Distribution

Built applications will be in the `release/` folder:

- **Windows**: `AeroSense Setup.exe` (installer) and `AeroSense.exe` (portable)
- **macOS**: `AeroSense.dmg` and `AeroSense.zip`
- **Linux**: `AeroSense.AppImage`, `aerosense.deb`, `aerosense.rpm`

## Code Signing (Optional)

### Windows
Set environment variables:
```bash
set CSC_LINK=path/to/certificate.pfx
set CSC_KEY_PASSWORD=your_password
```

### macOS
```bash
export CSC_LINK=path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-specific-password
```

## Auto-Updates (Optional)

Configure in `package.json` under `build.publish`:
```json
"publish": {
  "provider": "github",
  "owner": "Vetri0124",
  "repo": "AeroSense"
}
```

## Platform-Specific Notes

### Windows
- NSIS installer includes uninstaller
- Portable version requires no installation
- Both x64 and x86 builds available

### macOS
- Requires macOS to build
- DMG includes background image and app positioning
- Notarization recommended for distribution

### Linux
- AppImage is universal and requires no installation
- DEB for Debian/Ubuntu-based systems
- RPM for Fedora/RHEL-based systems

## Troubleshooting

**Build fails with "Cannot find module":**
- Run `npm install` again
- Clear node_modules and reinstall

**Python not found:**
- Ensure Python is in PATH
- On Windows, reinstall Python with "Add to PATH" checked

**Icon not found:**
- Ensure icon.png exists in client/public/
- Use 512x512 PNG with transparency
