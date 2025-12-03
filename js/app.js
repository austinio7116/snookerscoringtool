// Main Application Controller for Snooker Scorer

class SnookerApp {
  constructor() {
    this.match = null;
    this.currentFrame = null;
    this.timer = new TimerManager();
    this.ui = new UIManager();
    this.selectedBall = null;
    this.shotStartTime = null;
    this.shotAction = 'pot'; // Default action: pot, miss, safety, foul
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

    const saveMatchBtn = document.getElementById('save-match-btn');
    if (saveMatchBtn) {
      saveMatchBtn.addEventListener('click', () => this.handleSaveMatch());
    }

    const exportMatchBtn = document.getElementById('export-match-btn');
    if (exportMatchBtn) {
      exportMatchBtn.addEventListener('click', () => this.handleExportMatch());
    }

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
        loadBtn.textContent = 'Continue Current Match';
        loadBtn.onclick = () => this.loadMatch(existingMatch);
      }
    }
  }

  handleStartMatch() {
    const player1 = document.getElementById('player1-name').value.trim();
    const player2 = document.getElementById('player2-name').value.trim();
    const bestOf = parseInt(document.getElementById('best-of').value);

    if (!player1 || !player2) {
      this.ui.showNotification('Please enter both player names', 'error');
      return;
    }

    this.match = DataModel.createMatch(player1, player2, bestOf);
    this.startNewFrame();
    this.ui.showView('match');
    this.saveMatch();
    this.ui.showNotification('Match started!', 'success');
  }

  startNewFrame() {
    const frameNumber = this.match.frames.length + 1;
    this.currentFrame = DataModel.createFrame(frameNumber);
    this.match.frames.push(this.currentFrame);
    this.match.currentFrame = this.match.frames.length - 1;

    // Start new break for first player
    this.startNewBreak();

    // Start timer
    this.timer.startFrame();
    this.timer.startShot();

    this.updateDisplay();
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
    this.hideFoulDialog();

    if (!this.selectedBall) {
      this.selectedBall = 'red'; // Default ball for foul
    }

    const attributes = {
      isSafety: false,
      isFoul: true,
      foulPoints: foulPoints,
      duration: this.timer.endShot()
    };

    const shot = DataModel.createShot(this.selectedBall, false, attributes);
    
    // Award foul points to opponent
    const opponent = this.currentFrame.activePlayer === 0 ? 1 : 0;
    this.currentFrame.scores[opponent] += foulPoints;

    // Process shot but handle player switching based on "play again" option
    this.processFoulShot(shot, playAgain);
    
    // Reset the checkbox for next time
    document.getElementById('foul-play-again').checked = false;
  }

  processFoulShot(shot, playAgain) {
    // Add shot to current break
    if (!this.currentFrame.currentBreak) {
      this.startNewBreak();
    }

    this.currentFrame.currentBreak.shots.push(shot);

    // Update table state (fouls don't pot balls)
    DataModel.updateTableState(this.currentFrame, this.selectedBall, false);

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
    // Add shot to current break
    if (!this.currentFrame.currentBreak) {
      this.startNewBreak();
    }

    this.currentFrame.currentBreak.shots.push(shot);
    this.currentFrame.currentBreak.points += shot.points;

    if (potted) {
      this.currentFrame.currentBreak.balls.push(this.selectedBall);
    }

    // Update frame score for potted balls
    if (shot.points > 0 && potted) {
      this.currentFrame.scores[this.currentFrame.activePlayer] += shot.points;
    }

    // Update table state
    DataModel.updateTableState(this.currentFrame, this.selectedBall, potted);

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

  handleEndBreak() {
    if (this.ui.confirmAction('End current break and switch players?')) {
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

  handleEndFrame() {
    if (!this.ui.confirmAction('End current frame?')) {
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

  showFrameSummary() {
    const winner = this.currentFrame.winner !== null ? 
      this.match.players[this.currentFrame.winner] : 'Draw';
    
    const message = `Frame ${this.currentFrame.number} complete!\n` +
      `Winner: ${winner}\n` +
      `Score: ${this.currentFrame.scores[0]} - ${this.currentFrame.scores[1]}\n\n` +
      `Start next frame?`;

    if (this.ui.confirmAction(message)) {
      this.startNewFrame();
    }
  }

  completeMatch() {
    this.match.status = 'completed';
    this.match.updated = new Date().toISOString();
    
    StorageManager.saveToHistory(this.match);
    StorageManager.clearCurrentMatch();

    const framesWon = [
      this.match.frames.filter(f => f.winner === 0).length,
      this.match.frames.filter(f => f.winner === 1).length
    ];

    const winner = framesWon[0] > framesWon[1] ? 
      this.match.players[0] : this.match.players[1];

    this.ui.showNotification(`Match complete! Winner: ${winner}`, 'success');
    this.handleViewStats();
  }

  handlePauseToggle() {
    if (this.timer.isPaused) {
      this.timer.resumeFrame();
      this.timer.startShot();
      this.ui.showNotification('Timer resumed', 'info');
    } else {
      this.timer.pauseFrame();
      this.ui.showNotification('Timer paused', 'info');
    }
    this.updateDisplay();
  }

  handleViewStats() {
    const stats = StatisticsEngine.getMatchSummary(this.match);
    this.ui.renderStatistics(stats, this.match);
    this.ui.showView('stats');
  }

  handleSaveMatch() {
    if (this.saveMatch()) {
      this.ui.showNotification('Match saved successfully', 'success');
    } else {
      this.ui.showNotification('Failed to save match', 'error');
    }
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
      this.loadMatch(match);
    } else {
      this.ui.showNotification('Failed to load match', 'error');
    }
  }

  handleDeleteMatch(matchId) {
    if (this.ui.confirmAction('Delete this match from history?')) {
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
    
    // Load current frame
    if (this.match.currentFrame < this.match.frames.length) {
      this.currentFrame = this.match.frames[this.match.currentFrame];
    } else {
      this.startNewFrame();
      return;
    }

    // Restore timer state if frame is in progress
    if (!this.currentFrame.endTime) {
      this.timer.startFrame();
      if (this.currentFrame.isPaused) {
        this.timer.pauseFrame();
      }
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

    // Update available balls
    const availableBalls = DataModel.getNextBall(this.currentFrame);
    this.ui.renderBallSelector(availableBalls, (ball) => this.selectBall(ball));
  }

  selectBall(ball) {
    this.selectedBall = ball;
    
    // Highlight selected ball
    document.querySelectorAll('.ball-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    const selectedBtn = document.querySelector(`[data-ball="${ball}"]`);
    if (selectedBtn) {
      selectedBtn.classList.add('selected');
    }
    
    // Auto-pot the ball after selection (one-click mode)
    setTimeout(() => {
      if (this.selectedBall === ball) {
        const attributes = {
          isSafety: false,
          isFoul: false,
          foulPoints: 0,
          duration: this.timer.endShot()
        };
        
        const shot = DataModel.createShot(ball, true, attributes);
        this.processShot(shot, true);
      }
    }, 300); // Short delay to allow UI update
  }

  resetShotInput() {
    this.selectedBall = null;

    // Clear ball selection
    document.querySelectorAll('.ball-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
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