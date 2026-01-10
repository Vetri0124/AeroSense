# AeroSense - Cross-Platform Air Quality Monitoring

AeroSense is a cross-platform desktop application for air quality monitoring and analytics, built with Electron, React, and Python.

## Features

- 🌍 **Cross-Platform**: Runs on Windows, macOS, and Linux
- 📊 **Real-time Analytics**: Live air quality data visualization
- 🗺️ **Interactive Maps**: Expandable legend controls with smooth animations
- 🎨 **Modern UI**: Beautiful, responsive interface with glassmorphism design
- 🔒 **Secure**: Isolated Python backend with Electron security best practices

## Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Vetri0124/AeroSense.git
cd AeroSense
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Development

### Web Development Mode
Run the web application in development mode:
```bash
npm run dev
```
This starts the Vite dev server at `http://localhost:5173`

### Desktop Development Mode
Run the Electron desktop application in development mode:
```bash
npm run electron:dev
```
This starts both the Vite dev server and Electron app with hot-reload enabled.

### Backend Only
Run only the Python backend server:
```bash
npm run dev:server
# or
python server/main.py
```

## Building for Production

### Web Build
Build the web application:
```bash
npm run build
```

### Desktop Builds

#### Windows
```bash
npm run electron:build:win
```
Creates:
- NSIS installer (`.exe`)
- Portable executable

#### macOS
```bash
npm run electron:build:mac
```
Creates:
- DMG installer (`.dmg`)
- ZIP archive

#### Linux
```bash
npm run electron:build:linux
```
Creates:
- AppImage (`.AppImage`)
- Debian package (`.deb`)
- RPM package (`.rpm`)

#### All Platforms
```bash
npm run electron:build
```

Build outputs are located in the `release/` directory.

## Project Structure

```
AeroSense/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and helpers
│   └── public/            # Static assets
├── server/                # Python FastAPI backend
│   ├── main.py           # Server entry point
│   ├── schemas.py        # Data models
│   └── aerosense_db.sqlite
├── electron-main.js      # Electron main process
├── preload.js           # Electron preload script
└── package.json         # Node.js dependencies

```

## Features

### Expandable Map Legend
The map legend in the Analytics page is now collapsible:
- Click the legend header to expand/collapse
- Smooth animations powered by Framer Motion
- Saves screen space while maintaining accessibility

### Cross-Platform Support
- **Windows**: NSIS installer with desktop shortcuts
- **macOS**: DMG with drag-to-Applications
- **Linux**: AppImage, DEB, and RPM packages
- Auto-updates support (configurable)

## Configuration

### Electron Settings
Edit `electron-main.js` to customize:
- Window size and appearance
- Backend server configuration
- IPC handlers

### Build Settings
Edit the `build` section in `package.json` to customize:
- App icons
- Installer options
- File inclusions/exclusions
- Platform-specific settings

## Technologies Used

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Desktop**: Electron 28
- **Backend**: Python, FastAPI
- **Maps**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **Animations**: Framer Motion
- **UI Components**: Radix UI

## Troubleshooting

### Python Backend Not Starting
- Ensure Python is in your PATH
- Check that all dependencies are installed: `pip install -r requirements.txt`
- On macOS/Linux, you may need to use `python3` instead of `python`

### Electron Build Fails
- Ensure you have built the web app first: `npm run build`
- Check that all icon files exist in `client/public/`
- For macOS builds, you need to be on macOS
- For Windows builds, install Windows Build Tools if needed

### Map Not Loading
- Check your internet connection (maps require external tiles)
- Ensure the backend server is running
- Check browser console for errors

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
