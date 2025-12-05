# 🎱 Snooker Scorer

A comprehensive static HTML/JavaScript application for tracking snooker matches in detail. Record every shot, break, and statistic with a professional interface designed for serious snooker enthusiasts.

## Features

### Match Management
- **Best-of Format**: Configure matches from best of 3 up to best of 35 frames
- **Flexible Red Count**: Choose between 6, 9, 10, or 15 reds per frame for different game formats
- **Player Tracking**: Record detailed statistics for both players
- **Match History**: View and resume previous matches
- **Data Persistence**: All data stored in browser localStorage with auto-save
- **Export/Import**: Save matches as JSON files for backup or sharing

### Shot Recording
- **Visual Ball Selection**: Click to select which ball to pot (red or any color)
- **Quick Action Buttons**: One-click recording for:
  - **Pot**: Click on a ball to pot it (default action)
  - **Miss**: Record a missed shot
  - **Safety**: Record a safety shot
  - **Foul**: Record a foul with customizable points (4-7)
- **Advanced Foul Options**:
  - Award foul points to opponent (4, 5, 6, or 7 points)
  - "Player to play again" option for when fouling player must continue
  - Free ball award tracking
  - Record reds potted during foul

### Break Tracking
- **Automatic Scoring**: Points calculated automatically based on balls potted
- **Ball Sequences**: Complete record of every ball in each break
- **Current Break Display**: Real-time display of points and balls in current break
- **High Breaks**: Identify highest breaks per frame and match
- **Break Distribution**: Count breaks of 10+, 20+, 30+, 40+, 50+, and centuries

### Timing
- **Frame Timer**: Track duration of each frame with pause/resume functionality
- **Shot Timer**: Record time taken for each shot
- **Pause/Resume**: Pause timer during breaks without losing time
- **Average Shot Time**: Calculate average time per shot for each player

### Undo Functionality
- **Undo Last Shot**: Revert the last shot recorded, restoring:
  - Frame scores
  - Break points
  - Table state (reds and colors remaining)
  - Player turn
  - Timer state
- **State History**: Maintains complete state history for accurate undo operations

### Statistics Tracked

#### Per Player:
- **Pot Percentage**: Overall and per ball color
- **Safety Success Rate**: Effectiveness of safety play
- **Average Shot Time**: Mean time per shot in seconds
- **Points Per Visit**: Scoring efficiency (total points / visits)
- **Fouls**: Total foul count
- **Break Building**: Count of breaks in various ranges (10+, 20+, 30+, 40+, 50+, centuries)

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
4. Select best-of format (3-35 frames)
5. Choose number of reds (6, 9, 10, or 15)
6. Click "Start Match"

### Recording Shots

The app uses a streamlined one-click system for recording shots:

1. **Click "Start Play"** to begin the frame timer
2. **Select Ball**: Click on the ball being attempted (red or any color)
3. **Record Action**:
   - **Pot**: Simply click the ball - it's potted by default
   - **Miss**: Click the "Miss" button after selecting the ball
   - **Safety**: Click the "Safety" button for safety shots
   - **Foul**: Click the "Foul" button to open the foul dialog

### Recording Fouls

When you click the "Foul" button, a dialog appears with options:

1. **Select Foul Points**: Choose 4, 5, 6, or 7 points awarded to opponent
2. **Optional Settings**:
   - Check "Player to play again" if the fouling player must continue
   - Check "Free ball awarded" if a free ball is given
   - Enter number of reds potted during the foul (if any)
3. Click the foul points button to confirm

### Managing Breaks

- **Automatic Break Tracking**: Breaks start automatically when a player begins scoring
- **End Break**: Click "End Break" to manually end a break and switch players
- **Current Break Display**: See points and balls potted in the current break in real-time

### Undo Functionality

- **Undo Last Shot**: Click "Undo Last Shot" to revert the most recent shot
- The undo feature restores all game state including scores, table state, and player turn
- Use this to correct mistakes without restarting the frame

### Frame Management

- **End Frame**: Click "End Frame" when all balls are potted
- **Automatic Completion**: Frame ends automatically when all balls are cleared
- **Frame Summary**: View winner and scores before starting next frame
- **Pause Timer**: Use the pause button during breaks to maintain accurate playing time

### Viewing Statistics

Click "View Stats" during a match to access comprehensive match analysis with multiple visualization options:

#### Dashboard Overview
- **Overall Match Score**: Large display showing current frame score with match winner banner (when completed)
- **Quick Stats Cards**: Four key metrics displayed prominently:
  - Total Points scored by each player
  - Pot Success percentage
  - Highest Break achieved
  - Average Shot Time

#### Frame History Table
- Complete frame-by-frame breakdown showing:
  - Frame number
  - Final scores for both players (winner highlighted)
  - High break for each player in that frame
  - Visual indicators for frame winners

#### Match Analysis Charts
Interactive chart system with 6 different visualization types (switch using tabs):

1. **Diff Chart** (Default)
   - Bar chart showing score difference per frame
   - Red bars = Player 1 ahead, Yellow bars = Player 2 ahead
   - Visualizes momentum swings throughout the match

2. **Scores Chart**
   - Line graph tracking individual frame scores
   - Shows scoring patterns and consistency
   - Separate lines for each player

3. **Breaks Chart**
   - Line graph of highest break per frame
   - Identifies break-building trends
   - Highlights century breaks and scoring peaks

4. **Total Points Chart**
   - Cumulative points progression across frames
   - Shows overall scoring accumulation
   - Useful for identifying dominant periods

5. **Frame Progress Chart**
   - Detailed shot-by-shot progression within a single frame
   - Time-based x-axis showing when points were scored
   - Frame selector buttons to view any completed frame
   - Displays frame duration and final scores
   - Interactive tooltips on data points

6. **Turn Log**
   - Complete turn-by-turn breakdown of a selected frame
   - Shows every shot with:
     - Shot number and timestamp
     - Player name
     - Ball potted/missed with visual indicators
     - Running score after each shot
     - Special indicators (Rest used, Escape, Free ball, etc.)
   - Color-coded events (pots, misses, safeties, fouls)
   - Frame selector to view any completed frame

#### Statistics Comparison Table
Comprehensive side-by-side comparison with:
- **Frame Filter**: View stats for full match or individual frames
- **Highlighted Leaders**: Best performer in each category highlighted
- **Statistics Tracked**:
  - Frames Won
  - Total Points
  - High Break
  - Pot Success %
  - Average Shot Time
  - Points per Visit
  - Break counts (10+, 20+, 30+, 40+, 50+, Century Breaks)
  - Safety Success Rate
  - Fouls committed

#### Top Breaks List
- Shows all breaks of 10+ points (up to top 20)
- Displays:
  - Break value and player name
  - Frame number where break occurred
  - Complete ball sequence with color-coded balls
  - Special indicators for free balls and multiple reds
  - Sorted by highest breaks first

All charts feature:
- Color-coded player identification (Red for Player 1, Yellow for Player 2)
- Responsive SVG graphics that scale to screen size
- Grid lines and axis labels for easy reading
- Interactive elements where applicable

Click "Back to Match" to return to the game (hidden for completed matches)

### Saving and Loading

- **Auto-Save**: Match automatically saves after each shot
- **Export**: Click "Export Match" to download as JSON file
- **Resume**: Click "Resume Current Match" from home screen to continue
- **Match History**: View all previous matches and resume or delete them
- **Import**: Use "Import Match" to load a previously exported JSON file

### Timer Controls

- **Start Play**: Click "Start Play" to begin the frame timer
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
  "updated": "ISO timestamp",
  "status": "in-progress|completed",
  "currentFrame": 0,
  "frames": [
    {
      "number": 1,
      "startTime": "ISO timestamp",
      "endTime": "ISO timestamp",
      "winner": 0,
      "scores": [50, 42],
      "breaks": [...],
      "redsRemaining": 0,
      "colorsRemaining": [],
      "duration": 1234
    }
  ],
  "statistics": {...}
}
```

## Tips for Best Results

1. **Record Every Shot**: For accurate statistics, record all shots including misses
2. **Use Pause**: Pause the timer during actual breaks to get accurate playing time
3. **Regular Exports**: Export important matches as backup
4. **Undo Mistakes**: Use the undo button to correct recording errors
5. **Clear History**: Periodically delete old matches to free up storage
6. **Foul Details**: Use the foul dialog options for accurate foul tracking

## Key Features Implemented

✅ **Undo Functionality**: Revert last shot with full state restoration  
✅ **Free Ball Support**: Track free balls awarded after fouls  
✅ **Flexible Red Count**: Support for 6, 9, 10, or 15 red formats  
✅ **Advanced Foul Tracking**: Record foul points, play again, and reds potted  
✅ **One-Click Shot Recording**: Streamlined interface for fast input  
✅ **Auto-Save**: Never lose your match data  
✅ **Match History**: Resume any previous match  
✅ **Export/Import**: Share matches via JSON files  

## Limitations

- No shot position tracking (heatmap) - would require more complex input
- Safety success is simplified (marked successful if shot is missed)
- Maximum 50 matches in history (older matches automatically removed)
- Browser localStorage limit (~5-10MB depending on browser)
- Undo only supports one level (last shot only)

## Future Enhancements

Possible additions for future versions:
- Keyboard shortcuts for faster input
- Shot position tracking with visual table
- Advanced safety success calculation
- Match comparison tools
- Statistical charts and graphs
- PDF report generation
- Multi-device sync
- Multi-level undo/redo
- Shot notes and annotations

## License

This is a free, open-source application. Use and modify as needed.

## Support

For issues or questions, please refer to the code comments or create an issue in the repository.

---

**Enjoy tracking your snooker matches! 🎱**