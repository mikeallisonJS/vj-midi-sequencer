# VJ MIDI Sequencer

A MIDI sequencer for VJ software, migrated from Angular to React Native.

## Overview

VJ MIDI Sequencer is a tool designed for VJs (Visual Jockeys) to control their visual software using MIDI signals. It provides a sequencer interface that allows for triggering scenes and effects in sync with music.

## Features

- MIDI sequencing with adjustable BPM and bar length
- Scene selection and triggering
- Effects control across multiple MIDI channels
- Configurable MIDI input and output ports
- Transport controls (play, stop, reset)

## Getting Started

### Prerequisites

- Node.js
- For iOS: Xcode
- For Android: Android Studio

### Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/vj-midi-sequencer.git
cd vj-midi-sequencer
```

2. Install dependencies:

```
npm install
```

3. Start the development server:

```
npm start
```

4. Run on your preferred platform:

```
npm run ios
# or
npm run android
# or
npm run web
```

## MIDI Implementation

The MIDI implementation in React Native differs from the original Angular/Electron version. This version uses the `react-native-midi` library for MIDI functionality.

### Limitations

- Mobile MIDI support may require additional hardware or adapters
- Not all MIDI features may be available on all platforms
- Web implementation may have limited MIDI support depending on the browser

## Migration Notes

This project was migrated from an Angular/Electron application to React Native. The key changes include:

- Replaced Angular services with React context and hooks
- Converted Angular components to React Native components
- Adapted MIDI implementation for cross-platform support
- Redesigned UI for mobile-first experience

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Angular version by Mike Allison
- MIDI implementation based on the WebMIDI API and react-native-midi
