# ♔ Chess Clock

A modern, high-precision digital chess clock built with vanilla HTML, CSS, and JavaScript.

## Features

- ⚡ **Multiple Presets** - Bullet (1 min), Blitz (5+3), Rapid (15+10), Classical (30+30)
- ⏱️ **Custom Time Controls** - Set your own time and increment
- 🎯 **High-Precision Timing** - Uses `requestAnimationFrame` for accurate timing
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark/Light Theme** - Toggle between themes
- 🔊 **Sound Effects** - Audio feedback for moves and timeout
- 📳 **Haptic Feedback** - Vibration support on mobile devices
- ⌨️ **Keyboard Controls** - Space/Enter to switch, P to pause, R to reset

## Time Increment Types

- **Fischer** - Time added after each move
- **Bronstein** - Delay before time starts counting down
- **None** - No increment

## How to Use

1. Open `index.html` in your browser
2. Select a time preset or configure custom settings
3. Tap a player panel or press Space to start
4. Tap your panel after making a move to switch clocks
5. Use the control buttons to pause, reset, or adjust settings


## Technologies

- HTML5
- CSS3 (Custom Properties, Flexbox, Grid)
- Vanilla JavaScript (ES6 Classes)
- Web Audio API (Sound effects)
- localStorage (Settings persistence)

