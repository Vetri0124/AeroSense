# AeroSense Quick Start Guide

## What's New? 🎉

### 1. Expandable Map Legend
The map legend on the Analytics page is now collapsible! Click the legend header to expand or collapse it.

### 2. Cross-Platform Desktop App
AeroSense can now run as a native desktop application on Windows, macOS, and Linux!

## Getting Started

### Web Application (Current)
Your web app is already running! The changes are live:
- Navigate to the Analytics page
- Look for the "Air Legend" panel in the bottom-right
- Click the header to expand/collapse it

### Desktop Application (New!)

#### Quick Test
1. Wait for dependencies to install (npm install is running)
2. Run: `npm run electron:dev`
3. The desktop app will open automatically!

#### Build Desktop App
```bash
# 1. Build web assets
npm run build

# 2. Build for your platform
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux

# 3. Find your app in the release/ folder
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Web development server |
| `npm run electron:dev` | Desktop app (dev mode) |
| `npm run build` | Build web assets |
| `npm run electron:build:win` | Build Windows installer |
| `npm run electron:build:mac` | Build macOS app |
| `npm run electron:build:linux` | Build Linux packages |

## What You Get

### Windows Build
- `AeroSense Setup.exe` - Full installer with shortcuts
- `AeroSense.exe` - Portable version (no install needed)

### macOS Build
- `AeroSense.dmg` - Drag-to-Applications installer
- `AeroSense.zip` - Compressed app bundle

### Linux Build
- `AeroSense.AppImage` - Universal, no install needed
- `aerosense.deb` - For Ubuntu/Debian
- `aerosense.rpm` - For Fedora/RHEL

## Features

✅ **Native Desktop App** - Runs like any other desktop application
✅ **Auto-Start Backend** - Python server starts automatically
✅ **Cross-Platform** - Same code, all platforms
✅ **Offline Ready** - Works without internet (except maps)
✅ **Professional** - Installers, icons, everything included

## Troubleshooting

**Desktop app won't start?**
- Make sure Python is installed and in PATH
- Check that dependencies are installed: `npm install`

**Build fails?**
- Run `npm run build` first
- Ensure icon.png exists in client/public/

**Python backend not working?**
- Install Python dependencies: `pip install -r requirements.txt`
- Check that server/main.py exists

## Need Help?

Check these files:
- `README.md` - Full documentation
- `BUILD.md` - Detailed build instructions
- `.agent/workflows/build-desktop.md` - Step-by-step workflow
- `CROSS_PLATFORM_UPDATE.md` - Technical details

## What's Running?

Currently running:
- ✅ Web dev server (npm run dev) - Port 5173
- ✅ Python backend (python main.py) - Port 8000
- 🔄 Installing Electron dependencies...

Once installation completes, you can run:
```bash
npm run electron:dev
```

Enjoy your cross-platform AeroSense app! 🚀
