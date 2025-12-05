// Main Application Controller for Snooker Scorer

class SnookerApp {
  constructor() {
    this.match = null;
    this.currentFrame = null;
    this.timer = new TimerManager();
    this.ui = new UIManager();
    this.selectedBall = null;
    this.selectedBallCount = 1;
    this.shotStartTime = null;
    this.shotAction = 'pot'; // Default action: pot, miss, safety, foul
    this.shotHistory = []; // Track shots for undo functionality
    this.playStarted = false; // Track if play has started
    this.freeBallActive = false; // Track if free ball is active
  }

  init() {
    this.ui.init();
    this.setupEventListeners();
    this.checkForExistingMatch();
    this.ui.showView('home');
  }

  setupEventListeners() {
    // Setup screen
    const startMatchBtn = document.getElementById('start-match-btn');
    if (startMatchBtn) {
      startMatchBtn.addEventListener('click', () => this.handleStartMatch());
    }

    // Match screen
    const startPlayBtn = document.getElementById('start-play-btn');
    if (startPlayBtn) {
      startPlayBtn.addEventListener('click', () => this.handleStartPlay());
    }

    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.handlePauseToggle());
    }

    // Action buttons
    const missBtn = document.getElementById('action-miss-btn');
    if (missBtn) {
      missBtn.addEventListener('click', () => this.handleMiss());
    }

    const safetyBtn = document.getElementById('action-safety-btn');
    if (safetyBtn) {
      safetyBtn.addEventListener('click', () => this.handleSafety());
    }

    const foulBtn = document.getElementById('action-foul-btn');
    if (foulBtn) {
      foulBtn.addEventListener('click', () => this.showFoulDialog());
    }

    // Foul dialog
    const cancelFoulBtn = document.getElementById('cancel-foul-btn');
    if (cancelFoulBtn) {
      cancelFoulBtn.addEventListener('click', () => this.hideFoulDialog());
    }

    // Foul points buttons
    document.querySelectorAll('.btn-foul-points').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const points = parseInt(e.target.dataset.points);
        this.handleFoul(points);
      });
    });

    const endBreakBtn = document.getElementById('end-break-btn');
    if (endBreakBtn) {
      endBreakBtn.addEventListener('click', () => this.handleEndBreak());
    }

    const endFrameBtn = document.getElementById('end-frame-btn');
    if (endFrameBtn) {
      endFrameBtn.addEventListener('click', () => this.handleEndFrame());
    }

    const viewStatsBtn = document.getElementById('view-stats-btn');
    if (viewStatsBtn) {
      viewStatsBtn.addEventListener('click', () => this.handleViewStats());
    }

    const undoShotBtn = document.getElementById('undo-shot-btn');
    if (undoShotBtn) {
      undoShotBtn.addEventListener('click', () => this.handleUndoShot());
    }

    // Export match buttons (there are two - one in match view, one in stats view)
    const exportMatchBtns = document.querySelectorAll('#export-match-btn');
    exportMatchBtns.forEach(btn => {
      btn.addEventListener('click', () => this.handleExportMatch());
    });

    // Timer callbacks
    this.timer.onTick((duration) => {
      this.ui.updateTimer(duration, this.timer.isPaused);
    });

    // History screen - use event delegation
    const historyList = document.getElementById('history-list');
    if (historyList) {
      historyList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-resume')) {
          const matchId = e.target.dataset.matchId;
          this.handleResumeMatch(matchId);
        } else if (e.target.classList.contains('btn-delete')) {
          const matchId = e.target.dataset.matchId;
          this.handleDeleteMatch(matchId);
        }
      });
    }
  }

  checkForExistingMatch() {
    const existingMatch = StorageManager.loadCurrentMatch();
    if (existingMatch) {
      const loadBtn = document.getElementById('load-match-btn');
      if (loadBtn) {
        loadBtn.style.display = 'block';
      }
    }
  }

  handleStartMatch() {
    const player1 = document.getElementById('player1-name').value.trim();
    const player2 = document.getElementById('player2-name').value.trim();
    const bestOf = parseInt(document.getElementById('best-of').value);
    const numberOfReds = parseInt(document.getElementById('number-of-reds').value);

    if (!player1 || !player2) {
      this.ui.showNotification('Please enter both player names', 'error');
      return;
    }

    // Auto-save current match to history before starting a new one
    const existingMatch = StorageManager.loadCurrentMatch();
    if (existingMatch && existingMatch.status !== 'completed') {
      StorageManager.saveToHistory(existingMatch);
      this.ui.showNotification('Previous match saved to history', 'info');
    }

    this.match = DataModel.createMatch(player1, player2, bestOf);
    this.match.numberOfReds = numberOfReds;
    this.startNewFrame();
    this.ui.showView('match');
    this.saveMatch();
    this.ui.showNotification('Match started!', 'success');
  }

  startNewFrame() {
    const frameNumber = this.match.frames.length + 1;
    const numberOfReds = this.match.numberOfReds || 15;
    this.currentFrame = DataModel.createFrame(frameNumber, numberOfReds);
    this.match.frames.push(this.currentFrame);
    this.match.currentFrame = this.match.frames.length - 1;

    // Clear shot history for new frame
    this.shotHistory = [];

    // Reset play started flag
    this.playStarted = false;

    // Start new break for first player
    this.startNewBreak();

    // Start timer but immediately pause it
    this.timer.startFrame();
    this.timer.pauseFrame();

    this.updateDisplay();
    this.disableShotInputs();
    this.showStartPlayButton();
    this.hidePauseButton();
  }

  startNewBreak() {
    if (this.currentFrame.currentBreak) {
      this.endCurrentBreak();
    }

    this.currentFrame.currentBreak = DataModel.createBreak(this.currentFrame.activePlayer);
    this.currentFrame.breaks.push(this.currentFrame.currentBreak);
    this.timer.startShot();
    this.updateDisplay();
  }

  endCurrentBreak() {
    if (this.currentFrame.currentBreak) {
      this.currentFrame.currentBreak.endTime = new Date().toISOString();
      this.currentFrame.currentBreak = null;
    }
  }

  handleMiss() {
    // Don't allow actions if play hasn't started or timer is paused
    if (!this.playStarted || this.timer.isPaused) {
      return;
    }

    // Use selected ball or default to red
    const ball = this.selectedBall || 'red';

    const attributes = {
      isSafety: false,
      isFoul: false,
      foulPoints: 0,
      duration: this.timer.endShot()
    };

    const shot = DataModel.createShot(ball, false, attributes);
    this.processShot(shot, false);
  }

  handleSafety() {
    // Don't allow actions if play hasn't started or timer is paused
    if (!this.playStarted || this.timer.isPaused) {
      return;
    }

    // Use selected ball or default to red
    const ball = this.selectedBall || 'red';

    const attributes = {
      isSafety: true,
      isFoul: false,
      foulPoints: 0,
      duration: this.timer.endShot()
    };

    const shot = DataModel.createShot(ball, false, attributes);
    this.processShot(shot, false);
  }

  showFoulDialog() {
    // Don't allow actions if play hasn't started or timer is paused
    if (!this.playStarted || this.timer.isPaused) {
      return;
    }

    const dialog = document.getElementById('foul-dialog');
    if (dialog) {
      dialog.style.display = 'flex';
    }
  }

  hideFoulDialog() {
    const dialog = document.getElementById('foul-dialog');
    if (dialog) {
      dialog.style.display = 'none';
    }
  }

  handleFoul(foulPoints) {
    const playAgain = document.getElementById('foul-play-again').checked;
    const freeBall = document.getElementById('foul-free-ball').checked;
    const redsPotted = parseInt(document.getElementById('foul-reds-potted').value) || 0;
    this.hideFoulDialog();

    if (!this.selectedBall) {
      this.selectedBall = 'red'; // Default ball for foul
    }

    const attributes = {
      isSafety: false,
      isFoul: true,
      foulPoints: foulPoints,
      duration: this.timer.endShot(),
      redsPottedDuringFoul: redsPotted
    };

    const shot = DataModel.createShot(this.selectedBall, false, attributes);
    
    // Process shot but handle player switching based on "play again" option
    // Pass the foul points and reds potted to be handled in processFoulShot
    this.processFoulShot(shot, playAgain, true, foulPoints, redsPotted);
    
    // Set free ball state if checkbox was checked
    this.freeBallActive = freeBall;
    
    // Reset the checkboxes and input for next time
    document.getElementById('foul-play-again').checked = false;
    document.getElementById('foul-free-ball').checked = false;
    document.getElementById('foul-reds-potted').value = '0';
    
    // Update display to show free ball options if active
    this.updateDisplay();
  }

  processFoulShot(shot, playAgain, saveState = true, foulPoints = 0, redsPotted = 0) {
    // Save state for undo BEFORE awarding foul points
    if (saveState) {
      this.saveStateForUndo();
    }
    
    // Award foul points to opponent AFTER saving state
    if (foulPoints > 0) {
      const opponent = this.currentFrame.activePlayer === 0 ? 1 : 0;
      this.currentFrame.scores[opponent] += foulPoints;
    }
    
    // Add shot to current break
    if (!this.currentFrame.currentBreak) {
      this.startNewBreak();
    }

    this.currentFrame.currentBreak.shots.push(shot);

    // Update table state - remove reds if any were potted during foul
    if (redsPotted > 0) {
      this.currentFrame.redsRemaining = Math.max(0, this.currentFrame.redsRemaining - redsPotted);
    }

    // Handle player switching
    if (playAgain) {
      // Player stays at the table (don't switch)
      this.endCurrentBreak();
      this.startNewBreak();
    } else {
      // Normal foul - switch players
      this.switchPlayer();
    }

    // Reset shot input
    this.resetShotInput();
    this.updateDisplay();
    this.saveMatch();

    // Check if frame is complete
    if (DataModel.isFrameComplete(this.currentFrame)) {
      this.completeFrame();
    }
  }

  processShot(shot, potted) {
    // Save state for undo
    this.saveStateForUndo();
    
    // Add shot to current break
    if (!this.currentFrame.currentBreak) {
      this.startNewBreak();
    }

    // Handle free ball scoring - free ball counts as 1 point regardless of color
    let pointsToAdd = shot.points;
    if (shot.isFreeBall && potted) {
      pointsToAdd = 1; // Free ball always counts as 1 point (like a red)
      // Update the shot object to reflect 1 point for logging
      shot.points = 1;
    }

    this.currentFrame.currentBreak.shots.push(shot);
    this.currentFrame.currentBreak.points += pointsToAdd;

    if (potted) {
      this.currentFrame.currentBreak.balls.push(this.selectedBall);
    }

    // Update frame score for potted balls
    if (pointsToAdd > 0 && potted) {
      this.currentFrame.scores[this.currentFrame.activePlayer] += pointsToAdd;
    }

    // Update table state
    // Free ball doesn't remove the color from table and doesn't decrease red count
    // It's only treated as a red for sequencing purposes
    if (shot.isFreeBall && potted) {
      // Reset free ball state - no table state changes needed
      this.freeBallActive = false;
    } else if (!shot.isFreeBall) {
      // Normal ball - update table state as usual
      DataModel.updateTableState(this.currentFrame, this.selectedBall, potted);
    }

    // Check if break should end
    if (!potted || shot.isFoul || shot.isSafety) {
      this.switchPlayer();
    } else {
      // Continue break, start new shot timer
      this.timer.startShot();
    }

    // Reset shot input
    this.resetShotInput();
    this.updateDisplay();
    this.saveMatch();

    // Check if frame is complete
    if (DataModel.isFrameComplete(this.currentFrame)) {
      this.completeFrame();
    }
  }

  async handleEndBreak() {
    const confirmed = await this.ui.confirmAction('End current break and switch players?');
    if (confirmed) {
      this.switchPlayer();
      this.updateDisplay();
      this.saveMatch();
    }
  }

  switchPlayer() {
    this.endCurrentBreak();
    this.currentFrame.activePlayer = this.currentFrame.activePlayer === 0 ? 1 : 0;
    this.startNewBreak();
  }

  async handleEndFrame() {
    const confirmed = await this.ui.confirmAction('End current frame?');
    if (!confirmed) {
      return;
    }

    this.completeFrame();
  }

  completeFrame() {
    this.endCurrentBreak();
    
    // Set frame end time and duration
    this.currentFrame.endTime = new Date().toISOString();
    this.currentFrame.duration = this.timer.endFrame();
    
    // Determine winner
    this.currentFrame.winner = DataModel.calculateFrameWinner(this.currentFrame);

    // Update match statistics
    this.match.statistics = StatisticsEngine.calculateMatchStatistics(this.match);

    this.saveMatch();

    // Check if match is complete
    if (DataModel.isMatchComplete(this.match)) {
      this.completeMatch();
    } else {
      // Show frame summary and start next frame
      this.showFrameSummary();
    }
  }

  async showFrameSummary() {
    const winner = this.currentFrame.winner !== null ?
      this.match.players[this.currentFrame.winner] : 'Draw';
    
    const framesWon = [
      this.match.frames.filter(f => f.winner === 0).length,
      this.match.frames.filter(f => f.winner === 1).length
    ];
    
    const message = `Frame ${this.currentFrame.number} complete!\n` +
      `Winner: ${winner}\n` +
      `Score: ${this.currentFrame.scores[0]} - ${this.currentFrame.scores[1]}\n` +
      `Match Score: ${framesWon[0]} - ${framesWon[1]}\n\n` +
      `Start next frame?`;

    const confirmed = await this.ui.confirmAction(message);
    if (confirmed) {
      this.startNewFrame();
    }
  }

  async completeMatch() {
    this.match.status = 'completed';
    this.match.updated = new Date().toISOString();
    
    const framesWon = [
      this.match.frames.filter(f => f.winner === 0).length,
      this.match.frames.filter(f => f.winner === 1).length
    ];

    const matchWinner = framesWon[0] > framesWon[1] ? 0 : 1;
    const winnerName = this.match.players[matchWinner];
    
    // Set match winner BEFORE saving to history
    this.match.matchWinner = matchWinner;
    
    StorageManager.saveToHistory(this.match);
    StorageManager.clearCurrentMatch();
    
    // Show final frame score, then match winner
    const finalFrameWinner = this.currentFrame.winner !== null ?
      this.match.players[this.currentFrame.winner] : 'Draw';
    
    const message = `Frame ${this.currentFrame.number} complete!\n` +
      `Final Score: ${this.currentFrame.scores[0]} - ${this.currentFrame.scores[1]}\n` +
      `Winner: ${finalFrameWinner}\n\n` +
      `MATCH COMPLETE!\n` +
      `Final Match Score: ${framesWon[0]} - ${framesWon[1]}\n` +
      `Match Winner: ${winnerName}`;

    await this.ui.showAlert(message);
    
    // Navigate to stats page with winner highlighted
    this.handleViewStats();
  }

  handleStartPlay() {
    // Mark play as started if not already
    if (!this.playStarted) {
      this.playStarted = true;
    }
    
    // Resume the timer
    this.timer.resumeFrame();
    this.timer.startShot();
    
    // Enable inputs and update UI
    this.enableShotInputs();
    this.hideStartPlayButton();
    this.showPauseButton();
    
    // Show notification
    const message = this.playStarted ? 'Play resumed' : 'Play started!';
    this.ui.showNotification(message, 'success');
    
    this.updateDisplay();
  }

  handlePauseToggle() {
    if (this.timer.isPaused) {
      this.timer.resumeFrame();
      this.timer.startShot();
      this.enableShotInputs();
      this.ui.showNotification('Timer resumed', 'info');
    } else {
      this.timer.pauseFrame();
      this.disableShotInputs();
      this.ui.showNotification('Timer paused', 'info');
    }
    this.updateDisplay();
  }

  handleViewStats() {
    const stats = StatisticsEngine.getMatchSummary(this.match);
    this.ui.renderStatistics(stats, this.match);
    this.ui.showView('stats');
  }

  async handleUndoShot() {
    if (this.shotHistory.length === 0) {
      this.ui.showNotification('No shots to undo', 'info');
      return;
    }

    const confirmed = await this.ui.confirmAction('Undo the last shot?');
    if (!confirmed) {
      return;
    }

    // Get the last state from history
    const lastState = this.shotHistory.pop();
    
    // Check if player switched (shot ended the break)
    const playerSwitched = lastState.activePlayer !== this.currentFrame.activePlayer;
    
    let removedShot = null;
    
    if (playerSwitched) {
      // Player switched - the shot is in the previous break, not current
      // Remove the current (new) break first
      if (this.currentFrame.breaks.length > 0) {
        this.currentFrame.breaks.pop();
      }
      
      // Now get the previous break which contains the shot to undo
      if (this.currentFrame.breaks.length > 0) {
        this.currentFrame.currentBreak = this.currentFrame.breaks[this.currentFrame.breaks.length - 1];
        
        if (this.currentFrame.currentBreak.shots.length > 0) {
          removedShot = this.currentFrame.currentBreak.shots.pop();
          
          // Only subtract points if not a foul (foul points went to opponent)
          if (!removedShot.isFoul) {
            this.currentFrame.currentBreak.points -= removedShot.points;
          }
          
          // Remove ball from break if it was potted
          if (removedShot.potted && this.currentFrame.currentBreak.balls.length > 0) {
            this.currentFrame.currentBreak.balls.pop();
          }
        }
      } else {
        this.currentFrame.currentBreak = null;
      }
    } else {
      // No player switch - shot is in current break
      if (this.currentFrame.currentBreak && this.currentFrame.currentBreak.shots.length > 0) {
        removedShot = this.currentFrame.currentBreak.shots.pop();
        
        // Subtract points from break
        this.currentFrame.currentBreak.points -= removedShot.points;
        
        // Remove ball from break if it was potted
        if (removedShot.potted && this.currentFrame.currentBreak.balls.length > 0) {
          this.currentFrame.currentBreak.balls.pop();
        }
      }
      
      // If current break is now empty, remove it
      if (this.currentFrame.currentBreak && this.currentFrame.currentBreak.shots.length === 0) {
        this.currentFrame.breaks.pop();
        this.currentFrame.currentBreak = lastState.currentBreak ?
          this.currentFrame.breaks[this.currentFrame.breaks.length - 1] : null;
      }
    }
    
    // Restore the frame state (scores, table state, active player)
    this.currentFrame.scores = [...lastState.scores];
    this.currentFrame.redsRemaining = lastState.redsRemaining;
    this.currentFrame.colorsRemaining = [...lastState.colorsRemaining];
    this.currentFrame.activePlayer = lastState.activePlayer;
    
    // Restore break to the saved state
    if (this.currentFrame.currentBreak && lastState.currentBreak) {
      this.currentFrame.currentBreak.points = lastState.currentBreak.points;
      this.currentFrame.currentBreak.balls = [...lastState.currentBreak.balls];
    }
    
    // Don't recalculate match statistics - this would reset totalPoints for completed frames
    // Statistics will be recalculated when the frame is completed
    
    this.updateDisplay();
    this.saveMatch();
    this.ui.showNotification('Shot undone', 'success');
  }

  handleExportMatch() {
    if (StorageManager.exportMatch(this.match)) {
      this.ui.showNotification('Match exported successfully', 'success');
    } else {
      this.ui.showNotification('Failed to export match', 'error');
    }
  }

  handleResumeMatch(matchId) {
    const match = StorageManager.loadMatchById(matchId);
    if (match) {
      // Auto-save current match to history before resuming another one
      const existingMatch = StorageManager.loadCurrentMatch();
      if (existingMatch && existingMatch.status !== 'completed' && existingMatch.id !== matchId) {
        StorageManager.saveToHistory(existingMatch);
        this.ui.showNotification('Previous match saved to history', 'info');
      }
      
      // Check if match is completed
      if (match.status === 'completed') {
        // Load in read-only mode for viewing stats
        this.match = match;
        this.ui.showNotification('Viewing completed match', 'info');
        this.handleViewStats();
      } else {
        this.loadMatch(match);
      }
    } else {
      this.ui.showNotification('Failed to load match', 'error');
    }
  }

  async handleDeleteMatch(matchId) {
    const confirmed = await this.ui.confirmAction('Delete this match from history?');
    if (confirmed) {
      if (StorageManager.deleteFromHistory(matchId)) {
        this.ui.showNotification('Match deleted', 'success');
        this.refreshHistory();
      } else {
        this.ui.showNotification('Failed to delete match', 'error');
      }
    }
  }

  loadMatch(match) {
    this.match = match;
    
    // If importing a completed match, save it to history immediately
    if (match.status === 'completed') {
      StorageManager.saveToHistory(match);
    }
    
    // Load current frame
    if (this.match.currentFrame < this.match.frames.length) {
      this.currentFrame = this.match.frames[this.match.currentFrame];
    } else {
      this.startNewFrame();
      return;
    }

    // Check if current frame has ended - if so, check if we can start a new frame
    if (this.currentFrame.endTime) {
      // Check if match is already complete (shouldn't start new frame)
      if (DataModel.isMatchComplete(this.match)) {
        this.ui.showNotification('Match is already complete. Viewing stats.', 'info');
        this.handleViewStats();
        return;
      }
      
      this.startNewFrame();
      StorageManager.saveCurrentMatch(this.match);
      this.ui.showView('match');
      this.updateDisplay();
      this.ui.showNotification('Match loaded - new frame started', 'success');
      return;
    }

    // Check if play was already started (if there are any shots recorded)
    const hasShots = this.currentFrame.breaks.some(b => b.shots.length > 0);
    this.playStarted = hasShots;

    // Start timer and pause it - user must explicitly resume
    this.timer.startFrame();
    this.timer.pauseFrame();

    // Update UI based on play state
    if (this.playStarted) {
      // Match was in progress - show start button to resume and pause button hidden
      this.showStartPlayButton();
      this.hidePauseButton();
      this.disableShotInputs();
    } else {
      // Play hasn't started yet - show start button
      this.showStartPlayButton();
      this.hidePauseButton();
      this.disableShotInputs();
    }

    StorageManager.saveCurrentMatch(this.match);
    this.ui.showView('match');
    this.updateDisplay();
    this.ui.showNotification('Match loaded', 'success');
  }

  refreshHistory() {
    const history = StorageManager.loadMatchHistory();
    this.ui.renderHistory(history);
  }

  saveStateForUndo() {
    if (!this.currentFrame) return;
    
    // Save current state (deep copy to avoid reference issues)
    const state = {
      scores: [...this.currentFrame.scores],
      redsRemaining: this.currentFrame.redsRemaining,
      colorsRemaining: [...this.currentFrame.colorsRemaining],
      activePlayer: this.currentFrame.activePlayer,
      currentBreak: this.currentFrame.currentBreak ? {
        player: this.currentFrame.currentBreak.player,
        points: this.currentFrame.currentBreak.points,
        balls: [...this.currentFrame.currentBreak.balls],
        shots: this.currentFrame.currentBreak.shots.length
      } : null
    };
    
    this.shotHistory.push(state);
    
    // Keep only last 10 shots for undo
    if (this.shotHistory.length > 10) {
      this.shotHistory.shift();
    }
  }

  saveMatch() {
    if (this.match) {
      return StorageManager.saveCurrentMatch(this.match);
    }
    return false;
  }

  updateDisplay() {
    if (!this.match || !this.currentFrame) return;

    this.ui.updateMatchDisplay(this.match, this.currentFrame);
    this.ui.updateCurrentBreak(this.currentFrame.currentBreak);
    this.ui.updateTableState(this.currentFrame);
    this.ui.updateTimer(this.timer.getFrameDuration(), this.timer.isPaused);

    // Update available balls - if free ball is active, show all colors
    let availableBalls;
    if (this.freeBallActive) {
      // Free ball: show all available colors (not red)
      availableBalls = this.currentFrame.colorsRemaining;
    } else {
      availableBalls = DataModel.getNextBall(this.currentFrame);
    }
    this.ui.renderBallSelector(availableBalls, (ball, count) => this.selectBall(ball, count), this.currentFrame.redsRemaining);
  }

  selectBall(ball, count = 1) {
    // Don't allow ball selection if play hasn't started or timer is paused
    if (!this.playStarted || this.timer.isPaused) {
      return;
    }

    this.selectedBall = ball;
    this.selectedBallCount = count;
    
    // Highlight selected ball
    document.querySelectorAll('.ball-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    const selectedBtn = document.querySelector(`[data-ball="${ball}"]${count > 1 ? `[data-count="${count}"]` : ':not([data-count])'}`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
    }
    
    // Auto-pot the ball(s) after selection (one-click mode)
    setTimeout(() => {
      if (this.selectedBall === ball && this.selectedBallCount === count) {
        // Handle multiple reds
        if (ball === 'red' && count > 1) {
          this.potMultipleReds(count);
        } else {
          const attributes = {
            isSafety: false,
            isFoul: false,
            foulPoints: 0,
            duration: this.timer.endShot(),
            isFreeBall: this.freeBallActive
          };
          
          const shot = DataModel.createShot(ball, true, attributes);
          this.processShot(shot, true);
        }
      }
    }, 300); // Short delay to allow UI update
  }

  potMultipleReds(count) {
    // Save state for undo
    this.saveStateForUndo();
    
    // Calculate points (count reds)
    const points = count * 1;
    
    // Add shot to current break
    if (!this.currentFrame.currentBreak) {
      this.startNewBreak();
    }

    const duration = this.timer.endShot();

    // Create a single shot with multipleReds attribute
    const attributes = {
      isSafety: false,
      isFoul: false,
      foulPoints: 0,
      duration: duration,
      isFreeBall: false,
      multipleReds: count
    };

    const shot = DataModel.createShot('red', true, attributes);
    shot.points = points; // Override points for multiple reds
    
    this.currentFrame.currentBreak.shots.push(shot);
    this.currentFrame.currentBreak.points += points;

    // Add a single entry to balls array with the count
    // This will be displayed as "2R", "3R", etc. in the UI
    this.currentFrame.currentBreak.balls.push('red');

    // Update frame score
    this.currentFrame.scores[this.currentFrame.activePlayer] += points;

    // Update table state - remove multiple reds
    this.currentFrame.redsRemaining = Math.max(0, this.currentFrame.redsRemaining - count);

    // Continue break, start new shot timer
    this.timer.startShot();

    // Reset shot input
    this.resetShotInput();
    this.updateDisplay();
    this.saveMatch();

    // Check if frame is complete
    if (DataModel.isFrameComplete(this.currentFrame)) {
      this.completeFrame();
    }
  }

  resetShotInput() {
    this.selectedBall = null;
    this.selectedBallCount = 1;

    // Clear ball selection
    document.querySelectorAll('.ball-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
  }

  disableShotInputs() {
    // Disable ball selector buttons
    document.querySelectorAll('.ball-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    });

    // Disable action buttons
    const actionButtons = [
      document.getElementById('action-miss-btn'),
      document.getElementById('action-safety-btn'),
      document.getElementById('action-foul-btn'),
      document.getElementById('end-break-btn'),
      document.getElementById('end-frame-btn'),
      document.getElementById('undo-shot-btn')
    ];

    actionButtons.forEach(btn => {
      if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      }
    });
  }

  enableShotInputs() {
    // Enable ball selector buttons
    document.querySelectorAll('.ball-btn').forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    });

    // Enable action buttons
    const actionButtons = [
      document.getElementById('action-miss-btn'),
      document.getElementById('action-safety-btn'),
      document.getElementById('action-foul-btn'),
      document.getElementById('end-break-btn'),
      document.getElementById('end-frame-btn'),
      document.getElementById('undo-shot-btn')
    ];

    actionButtons.forEach(btn => {
      if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
  }

  showStartPlayButton() {
    const startPlayBtn = document.getElementById('start-play-btn');
    if (startPlayBtn) {
      startPlayBtn.style.display = 'block';
    }
  }

  hideStartPlayButton() {
    const startPlayBtn = document.getElementById('start-play-btn');
    if (startPlayBtn) {
      startPlayBtn.style.display = 'none';
    }
  }

  showPauseButton() {
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.style.display = 'block';
    }
  }

  hidePauseButton() {
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) {
      pauseBtn.style.display = 'none';
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SnookerApp();
  window.app.init();

  // Load history if on history view
  const viewHistoryBtn = document.getElementById('view-history-btn');
  if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener('click', () => {
      const history = StorageManager.loadMatchHistory();
      window.app.ui.renderHistory(history);
    });
  }
});