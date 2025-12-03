<<<<<<< HEAD
# 🎱 Snooker Scorer

A comprehensive static HTML/JavaScript application for tracking snooker matches in detail. Record every shot, break, and statistic with a professional interface designed for serious snooker enthusiasts.

## Features

### Match Management
- **Best-of Format**: Configure matches as best of 3, 5, 7, 9, 11, 13, 15, 17, or 19 frames
- **Player Tracking**: Record detailed statistics for both players
- **Match History**: View and resume previous matches
- **Data Persistence**: All data stored in browser localStorage
- **Export/Import**: Save matches as JSON files for backup or sharing

### Shot Recording
- **Visual Ball Selection**: Click to select which ball to pot
- **Pot/Miss Tracking**: Record successful pots and misses
- **Shot Attributes**: Mark shots as:
  - Long Pot
  - Rest Used
  - Safety
  - Escape
  - Foul

### Break Tracking
- **Automatic Scoring**: Points calculated automatically based on balls potted
- **Ball Sequences**: Complete record of every ball in each break
- **High Breaks**: Identify highest breaks per frame and match
- **Break Distribution**: Count breaks of 20+, 30+, 40+, 50+, etc.

### Timing
- **Frame Timer**: Track duration of each frame
- **Shot Timer**: Record time taken for each shot
- **Pause/Resume**: Pause timer during breaks without losing time
- **Average Shot Time**: Calculate average time per shot for each player

### Statistics Tracked

#### Per Player:
- **Pot Percentage**: Overall and per ball color
- **Long Pot Success Rate**: Percentage of successful long pots
- **Rest Pot Success Rate**: Success rate when using the rest
- **Safety Success Rate**: Effectiveness of safety play
- **Escape Success Rate**: Success rate of escape attempts
- **Average Shot Time**: Mean time per shot in seconds
- **Points Per Visit**: Scoring efficiency (total points / visits)
- **Fouls**: Total foul count
- **Break Building**: Count of breaks in various ranges (20+, 30+, 40+, 50+, 60+, 70+, 80+, 90+, 100+, centuries)

#### Match Statistics:
- Frame-by-frame breakdown
- All breaks with ball sequences
- High break identification
- Cumulative statistics across all frames

## Usage

### Starting a New Match

1. Open `index.html` in a web browser
2. Click "New Match"
3. Enter player names
4. Select best-of format
5. Click "Start Match"

### Recording Shots

1. **Select Ball**: Click on the ball being attempted (red, yellow, green, brown, blue, pink, black)
2. **Pot/Miss**: Check "Potted" if successful, uncheck if missed
3. **Add Attributes** (optional):
   - Check "Long Pot" for long-distance shots
   - Check "Rest Used" if the rest was used
   - Check "Safety" for safety shots
   - Check "Escape" for escape attempts
   - Check "Foul" if a foul occurred
4. **Submit Shot**: Click "Submit Shot" to record

### Managing Breaks

- **Automatic Break Tracking**: Breaks start automatically when a player begins scoring
- **End Break**: Click "End Break" to manually end a break and switch players
- **Current Break Display**: See points and balls potted in the current break

### Frame Management

- **End Frame**: Click "End Frame" when all balls are potted
- **Automatic Completion**: Frame ends automatically when all balls are cleared
- **Frame Summary**: View winner and scores before starting next frame

### Viewing Statistics

- Click "View Stats" during a match to see detailed statistics
- Statistics include:
  - Per-player metrics
  - Break distribution
  - All breaks with ball sequences
  - Frame-by-frame results

### Saving and Loading

- **Auto-Save**: Match automatically saves after each shot
- **Manual Save**: Click "Save Match" to force a save
- **Export**: Click "Export Match" to download as JSON file
- **Import**: Click "Continue Current Match" or use "Match History" to resume
- **Match History**: View all previous matches and resume or delete them

### Timer Controls

- **Automatic Start**: Timer starts when frame begins
- **Pause/Resume**: Click pause button to pause timer (e.g., during breaks)
- **Shot Timing**: Each shot is automatically timed
- **Frame Duration**: Total frame time displayed at completion

## Technical Details

### File Structure
```
snookerscorer/
├── index.html          # Main application file
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application controller
│   ├── dataModel.js    # Data structures and schema
│   ├── storage.js      # localStorage management
│   ├── statistics.js   # Statistics calculation engine
│   ├── timer.js        # Timer and time tracking
│   └── ui.js           # UI rendering and interactions
└── README.md           # This file
```

### Data Storage

All data is stored in browser localStorage under these keys:
- `snooker_current_match`: Active match in progress
- `snooker_match_history`: Array of completed and saved matches
- `snooker_settings`: User preferences

### Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- localStorage API
- CSS Grid and Flexbox

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Data Export Format

Matches are exported as JSON with this structure:
```json
{
  "version": "1.0",
  "id": "match_timestamp_id",
  "players": ["Player 1", "Player 2"],
  "bestOf": 7,
  "created": "ISO timestamp",
  "status": "in-progress|completed",
  "frames": [...],
  "statistics": {...}
}
```

## Tips for Best Results

1. **Record Every Shot**: For accurate statistics, record all shots including misses
2. **Use Attributes**: Mark long pots, rest usage, etc. for detailed analysis
3. **Pause Timer**: Use pause during actual breaks to get accurate playing time
4. **Regular Exports**: Export important matches as backup
5. **Clear History**: Periodically delete old matches to free up storage

## Keyboard Shortcuts

Currently, the application is optimized for mouse/touch input. Keyboard shortcuts may be added in future versions.

## Limitations

- No shot heatmap (position tracking) - would require more complex input
- Safety success is simplified (marked successful if shot is missed)
- Maximum 50 matches in history (older matches automatically removed)
- Browser localStorage limit (~5-10MB depending on browser)

## Future Enhancements

Possible additions for future versions:
- Keyboard shortcuts for faster input
- Shot position tracking with visual table
- Advanced safety success calculation
- Match comparison tools
- Statistical charts and graphs
- PDF report generation
- Multi-device sync
- Undo/redo functionality

## License

This is a free, open-source application. Use and modify as needed.

## Support

For issues or questions, please refer to the code comments or create an issue in the repository.

---

**Enjoy tracking your snooker matches! 🎱**
=======
# snookerscores
>>>>>>> 15634bed5aeba560e7299c7dccabb916c1b6299f
