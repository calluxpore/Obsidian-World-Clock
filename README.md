# World Clock

Display multiple world clocks in a dockable view. Supports digital and analog clocks with full IANA timezone support.

## Features

- **Multiple Clocks**: Add and manage multiple world clocks simultaneously
- **Digital & Analog**: Choose between digital or analog clock displays
- **Full Timezone Support**: Uses IANA timezone identifiers for accurate time conversion
- **Dockable View**: Access your clocks from a dedicated side panel
- **Customizable**: Configure labels, 12/24-hour format, and seconds display
- **Responsive Layout**: Clocks automatically wrap and arrange based on available space

## Installation via BRAT

BRAT (Beta Reviewers Auto-update Tool) allows you to install and automatically update beta plugins directly from GitHub repositories.

### Prerequisites

1. Install the **BRAT** plugin first:
   - Go to **Settings → Community plugins**
   - Disable Safe Mode if enabled
   - Click **Browse** and search for "BRAT"
   - Install and enable the BRAT plugin

### Installation Steps

1. Open **Settings → Community plugins**
2. Scroll down to find **BRAT** in the installed plugins list
3. Click on **BRAT** to open its settings
4. Click **Add Beta Plugin**
5. Enter the repository URL:
   ```
   https://github.com/YOUR_USERNAME/Obsidian-World-Clock
   ```
   *(Replace `YOUR_USERNAME` with the actual GitHub username or organization)*
6. Click **Add Plugin**
7. Wait for BRAT to fetch the plugin
8. Go back to **Settings → Community plugins**
9. Find **World Clock** in the list and toggle it **ON**

### Updating

BRAT will automatically check for updates. To manually update:
1. Go to **Settings → Community plugins**
2. Open **BRAT** settings
3. Click **Check for updates** or wait for automatic updates

## Usage

### Opening the World Clock View

1. Use the command palette (`Ctrl/Cmd + P`)
2. Type "Open World Clock" and select it
3. The World Clock view will open in a side panel

Alternatively, you can:
- Use the ribbon icon (if enabled)
- Right-click on the side panel and select "World Clock"

### Adding Clocks

1. Go to **Settings → World Clock**
2. Click **Add Clock**
3. Configure your clock:
   - **Label**: Optional friendly name (e.g., "New York")
   - **Timezone**: Select from the dropdown or enter an IANA timezone (e.g., "America/New_York")
   - **Type**: Choose Digital or Analog
   - **24-hour format**: Toggle for digital clocks
   - **Show seconds**: Toggle to display seconds
4. Click **Save**

### Managing Clocks

- **Reorder**: Use the ↑ and ↓ buttons in settings to change the display order
- **Remove**: Click the **Remove** button to delete a clock
- **Edit**: Modify any setting and save to update

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Obsidian-World-Clock.git
   cd Obsidian-World-Clock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. For development with watch mode:
   ```bash
   npm run dev
   ```

### Manual Installation (Development)

1. Build the plugin: `npm run build`
2. Copy `main.js`, `manifest.json`, and `styles.css` to:
   ```
   <Vault>/.obsidian/plugins/world-clock/
   ```
3. Reload Obsidian
4. Enable the plugin in **Settings → Community plugins**

## Project Structure

```
src/
  main.ts              # Plugin entry point
  settings.ts          # Settings tab and configuration
  types.ts             # TypeScript interfaces
  view/
    WorldClockView.ts  # Main dockable view
  components/
    DigitalClock.ts    # Digital clock component
    AnalogClock.ts     # Analog clock component
  utils/
    timezones.ts       # Timezone utilities
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues, feature requests, or questions, please open an issue on the [GitHub repository](https://github.com/YOUR_USERNAME/Obsidian-World-Clock).
