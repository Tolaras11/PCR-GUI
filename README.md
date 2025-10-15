# EasyPCR Web Application

A modern web-based PCR (Polymerase Chain Reaction) control interface built with React, TypeScript, Material-UI, and Web Serial API.

## Features

- **Serial Communication**: Connect to PCR devices via Web Serial API
- **Firmware Upgrade**: Upload firmware files (.hex/.bin) using YMODEM protocol
- **PCR Protocol Configuration**: Design and save 5-stage PCR protocols
- **Real-time Temperature Monitoring**: Dual temperature tracking (Peltier + Lid)
- **Data Logging**: Comprehensive logging with color-coded messages
- **File Export**: Save PCR protocols as CSV files

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Zustand** - State management
- **Recharts** - Temperature plotting
- **Vite** - Build tool
- **Web Serial API** - Device communication

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Compatible Browser**: Chrome, Edge, or Opera (Web Serial API support required)
  - Firefox and Safari do NOT support Web Serial API

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PCR-GUI
```

2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

### 1. Serial Connection

1. Click **"Connect"** button in the Serial Communication Settings panel
2. Browser will prompt you to select a serial port
3. Choose your PCR device from the list
4. Select appropriate baud rate (default: 9600)
5. Click **"Connect"** to establish connection

### 2. Firmware Upgrade

1. Ensure you're connected to the device
2. Click **"Browse"** to select a firmware file (.hex or .bin)
3. Click **"Start Upgrade"** to begin the transfer
4. Monitor progress in the progress bar
5. Wait for "Firmware uploaded OK" message

**Supported Formats:**
- Intel HEX (.hex) - Automatically converted to binary
- Binary (.bin) - Direct upload

### 3. PCR Protocol Configuration

1. Enter a **Protocol Name**
2. Fill in the PCR stages table:
   - **Intro Denaturing**: Initial denaturation step
   - **Denaturing**: Cycling denaturation
   - **Annealing**: Primer annealing
   - **Extension**: DNA synthesis
   - **Final Extension**: Final synthesis step

3. For each stage, enter:
   - **Temperature** (°C)
   - **Cycles** (number of repetitions)
   - **Seconds** (duration per cycle)

4. Click **"Save to File"** to export protocol
5. Use **"Clear"** to reset all fields

### 4. Temperature Monitoring

- Temperature plot displays real-time data when connected
- **Blue line**: Peltier temperature
- **Red line**: Lid temperature
- Automatically scales axes based on data range

### 5. Log Display

- View all system messages with timestamps
- Color-coded by severity:
  - **Black**: Info
  - **Green**: Success
  - **Red**: Error
  - **Orange**: Warning
- Click **"Clear Log"** to remove all messages

## Protocol Data Format

PCR protocols are exported as CSV files:

```csv
Stage,Temperature,TimeSec,Cycles
Intro Denaturing,95,30,1
Denaturing,95,10,30
Annealing,60,30,30
Extension,72,30,30
Final Extension,72,120,1
```

## Serial Communication Protocol

### Expected Data Format

The application expects serial data in the following format:

```
Peltier> T:95.5*C; Lid> T:102.3*C;
```

**Parsing:**
- Peltier temperature: `Peltier> T:([+-]?\d+(?:\.\d+)?)\*C;`
- Lid temperature: `Lid> T:([+-]?\d+(?:\.\d+)?)\*C;`

### YMODEM Protocol

Firmware transfers use YMODEM protocol with:
- 128-byte blocks
- CRC-16 error checking
- Progress callbacks
- Automatic retry on failure

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome  | ✅ Yes  | Recommended |
| Edge    | ✅ Yes  | Recommended |
| Opera   | ✅ Yes  | Full support |
| Firefox | ❌ No   | Web Serial API not supported |
| Safari  | ❌ No   | Web Serial API not supported |

## Security Requirements

- **HTTPS required** in production environments
- **localhost** allowed for development
- User must manually grant serial port permissions


## License

MIT License

Copyright (c) 2025 EasyPCR B.V.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


## Acknowledgments

Based on the original EasyPCR Python application.
