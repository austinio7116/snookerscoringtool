// UI Management for Snooker Scorer

class UIManager {
  constructor() {
    this.currentView = 'home';
    this.elements = {};
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.currentChartType = 'scores';
  }

  cacheElements() {
    // Views
    this.elements.homeView = document.getElementById('home-view');
    this.elements.setupView = document.getElementById('setup-view');
    this.elements.matchView = document.getElementById('match-view');
    this.elements.statsView = document.getElementById('stats-view');
    this.elements.historyView = document.getElementById('history-view');

    // Home screen
    this.elements.newMatchBtn = document.getElementById('new-match-btn');
    this.elements.loadMatchBtn = document.getElementById('load-match-btn');
    this.elements.viewHistoryBtn = document.getElementById('view-history-btn');

    // Setup screen
    this.elements.player1Input = document.getElementById('player1-name');
    this.elements.player2Input = document.getElementById('player2-name');
    this.elements.bestOfSelect = document.getElementById('best-of');
    this.elements.startMatchBtn = document.getElementById('start-match-btn');
    this.elements.cancelSetupBtn = document.getElementById('cancel-setup-btn');

    // Match screen
    this.elements.matchHeader = document.getElementById('match-header');
    this.elements.frameInfo = document.getElementById('frame-info');
    this.elements.player1Score = document.getElementById('player1-score');
    this.elements.player2Score = document.getElementById('player2-score');
    this.elements.player1Name = document.getElementById('player1-name-display');
    this.elements.player2Name = document.getElementById('player2-name-display');
    this.elements.currentBreak = document.getElementById('current-break');
    this.elements.timerDisplay = document.getElementById('timer-display');
    this.elements.pauseBtn = document.getElementById('pause-btn');
    this.elements.ballSelector = document.getElementById('ball-selector');
    this.elements.shotAttributes = document.getElementById('shot-attributes');
    this.elements.submitShotBtn = document.getElementById('submit-shot-btn');
    this.elements.endBreakBtn = document.getElementById('end-break-btn');
    this.elements.endFrameBtn = document.getElementById('end-frame-btn');
    this.elements.viewStatsBtn = document.getElementById('view-stats-btn');
    this.elements.saveMatchBtn = document.getElementById('save-match-btn');
    this.elements.tableState = document.getElementById('table-state');

    // Stats screen
    this.elements.statsContent = document.getElementById('stats-content');
    this.elements.backToMatchBtn = document.getElementById('back-to-match-btn');
    this.elements.exportMatchBtn = document.getElementById('export-match-btn');

    // History screen
    this.elements.historyList = document.getElementById('history-list');
    this.elements.backToHomeBtn = document.getElementById('back-to-home-btn');
  }

  attachEventListeners() {
    // Home screen
    if (this.elements.newMatchBtn) {
      this.elements.newMatchBtn.addEventListener('click', () => this.showView('setup'));
    }
    if (this.elements.loadMatchBtn) {
      this.elements.loadMatchBtn.addEventListener('click', () => {
        // Resume current match from localStorage
        const existingMatch = StorageManager.loadCurrentMatch();
        if (existingMatch && window.app) {
          window.app.loadMatch(existingMatch);
        }
      });
    }
    
    // Import match button
    const importMatchBtn = document.getElementById('import-match-btn');
    if (importMatchBtn) {
      importMatchBtn.addEventListener('click', () => this.handleImportMatch());
    }
    
    if (this.elements.viewHistoryBtn) {
      this.elements.viewHistoryBtn.addEventListener('click', () => this.showView('history'));
    }

    // Setup screen
    if (this.elements.cancelSetupBtn) {
      this.elements.cancelSetupBtn.addEventListener('click', () => this.showView('home'));
    }

    // Stats screen
    if (this.elements.backToMatchBtn) {
      this.elements.backToMatchBtn.addEventListener('click', () => this.showView('match'));
    }

    // History screen
    if (this.elements.backToHomeBtn) {
      this.elements.backToHomeBtn.addEventListener('click', () => this.showView('home'));
    }

    // Chart tab switching (delegated event listener)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('analysis-tab')) {
        this.handleChartTabSwitch(e.target);
      }
    });
  }

  handleChartTabSwitch(tab) {
    const chartType = tab.dataset.chart;
    if (!chartType) return;

    // Update active tab
    document.querySelectorAll('.analysis-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Get chart container
    const chartCanvas = document.getElementById('analysis-chart');
    if (!chartCanvas) return;

    // Store current match data from the stats view
    const statsContent = this.elements.statsContent;
    if (!statsContent || !window.currentMatchData) return;

    const { frames, players, bestOf } = window.currentMatchData;
    const completedFrames = frames.filter(f => f.winner !== null);

    // Render appropriate chart
    switch(chartType) {
      case 'scores':
        chartCanvas.innerHTML = this.renderScoresChart(completedFrames, players, bestOf);
        break;
      case 'breaks':
        chartCanvas.innerHTML = this.renderBreaksChart(completedFrames, players, bestOf);
        break;
      case 'total-points':
        chartCanvas.innerHTML = this.renderTotalPointsChart(completedFrames, players, bestOf);
        break;
      case 'diff':
        chartCanvas.innerHTML = this.renderDiffChart(completedFrames, players, bestOf);
        break;
    }
  }

  showView(viewName) {
    // Hide all views
    const views = ['home', 'setup', 'match', 'stats', 'history'];
    views.forEach(view => {
      const element = this.elements[`${view}View`];
      if (element) {
        element.classList.remove('active');
      }
    });

    // Show requested view
    const targetView = this.elements[`${viewName}View`];
    if (targetView) {
      targetView.classList.add('active');
      this.currentView = viewName;
    }
  }

  handleImportMatch() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const match = StorageManager.importMatch(event.target.result);
          if (match) {
            // Trigger app to load this match
            if (window.app) {
              window.app.loadMatch(match);
            }
          } else {
            alert('Failed to import match. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  async showAlert(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'confirm-overlay';
      overlay.innerHTML = `
        <div class="confirm-dialog">
          <div class="confirm-message">${message.replace(/\n/g, '<br>')}</div>
          <div class="confirm-buttons">
            <button class="btn btn-primary" id="alert-ok-btn">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      const okBtn = overlay.querySelector('#alert-ok-btn');
      okBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        resolve();
      });

      // Focus the OK button
      setTimeout(() => okBtn.focus(), 100);
    });
  }

  renderBallSelector(availableBalls, onBallSelect) {
    if (!this.elements.ballSelector) return;

    this.elements.ballSelector.innerHTML = '';

    const ballValues = {
      red: 1,
      yellow: 2,
      green: 3,
      brown: 4,
      blue: 5,
      pink: 6,
      black: 7
    };

    availableBalls.forEach(ball => {
      const button = document.createElement('button');
      button.className = `ball-btn ball-${ball}`;
      button.textContent = ballValues[ball];
      button.dataset.ball = ball;
      button.onclick = () => onBallSelect(ball);
      this.elements.ballSelector.appendChild(button);
    });
  }

  updateMatchDisplay(match, currentFrame) {
    // Update player names
    if (this.elements.player1Name) {
      this.elements.player1Name.textContent = match.players[0];
    }
    if (this.elements.player2Name) {
      this.elements.player2Name.textContent = match.players[1];
    }

    // Update frame info
    if (this.elements.frameInfo) {
      const framesWon = [
        match.frames.filter(f => f.winner === 0).length,
        match.frames.filter(f => f.winner === 1).length
      ];
      this.elements.frameInfo.textContent =
        `Frame ${currentFrame.number} | Match: ${framesWon[0]} - ${framesWon[1]} (Best of ${match.bestOf})`;
    }

    // Update scores
    if (this.elements.player1Score) {
      this.elements.player1Score.textContent = currentFrame.scores[0];
    }
    if (this.elements.player2Score) {
      this.elements.player2Score.textContent = currentFrame.scores[1];
    }

    // Update lead indicators
    const player1Lead = document.getElementById('player1-lead');
    const player2Lead = document.getElementById('player2-lead');
    
    // Calculate and display lead
    const scoreDiff = Math.abs(currentFrame.scores[0] - currentFrame.scores[1]);
    
    if (scoreDiff > 0) {
      const leadingPlayer = currentFrame.scores[0] > currentFrame.scores[1] ? 0 : 1;
      
      if (leadingPlayer === 0 && player1Lead) {
        player1Lead.textContent = `Leads by ${scoreDiff}`;
        if (player2Lead) player2Lead.innerHTML = '&nbsp;';
      } else if (leadingPlayer === 1 && player2Lead) {
        player2Lead.textContent = `Leads by ${scoreDiff}`;
        if (player1Lead) player1Lead.innerHTML = '&nbsp;';
      }
    } else {
      // Scores are tied - show non-breaking space to maintain layout
      if (player1Lead) player1Lead.innerHTML = '&nbsp;';
      if (player2Lead) player2Lead.innerHTML = '&nbsp;';
    }
    
    // Highlight active player
    const player1Container = document.getElementById('player1-container');
    const player2Container = document.getElementById('player2-container');

    // Highlight active player
    if (player1Container && player2Container) {
      player1Container.classList.toggle('active', currentFrame.activePlayer === 0);
      player2Container.classList.toggle('active', currentFrame.activePlayer === 1);
    }
  }

  updateCurrentBreak(breakData) {
    if (!this.elements.currentBreak) return;

    const breakHeaderEl = this.elements.currentBreak.querySelector('.break-header');
    const breakPointsEl = this.elements.currentBreak.querySelector('.break-points');
    const breakBallsEl = this.elements.currentBreak.querySelector('.break-balls');
    
    if (!breakPointsEl || !breakBallsEl) return;

    // Always show the break points, even if 0
    const points = (breakData && breakData.points) ? breakData.points : 0;
    breakPointsEl.textContent = points;
    
    // Update header to include break total
    if (breakHeaderEl) {
      breakHeaderEl.textContent = `Current Break: ${points}`;
    }

    // Update balls if there's a break in progress
    if (!breakData || breakData.points === 0) {
      breakBallsEl.innerHTML = '';
      return;
    }

    const ballValues = {
      red: 1,
      yellow: 2,
      green: 3,
      brown: 4,
      blue: 5,
      pink: 6,
      black: 7
    };

    // Build balls HTML, checking each shot to see if it was a free ball
    const ballsHtml = breakData.shots
      .filter(shot => shot.potted)
      .map(shot => {
        // If it was a free ball, display as 1 point regardless of actual ball color
        const displayValue = shot.isFreeBall ? 1 : ballValues[shot.ball];
        return `<span class="break-ball ball-${shot.ball}">${displayValue}</span>`;
      })
      .join('');

    breakBallsEl.innerHTML = ballsHtml;
  }

  updateTimer(duration, isPaused) {
    if (!this.elements.timerDisplay) return;

    const timer = new TimerManager();
    const formatted = timer.formatTime(duration);
    this.elements.timerDisplay.textContent = formatted;
    
    if (this.elements.pauseBtn) {
      this.elements.pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
    }
  }

  updateTableState(frame) {
    if (!this.elements.tableState) return;

    const ballValues = {
      yellow: 2,
      green: 3,
      brown: 4,
      blue: 5,
      pink: 6,
      black: 7
    };

    // Calculate points remaining on the table
    const redsPoints = frame.redsRemaining * 8; // Each red can be followed by black (1+7)
    const colorsPoints = frame.colorsRemaining.reduce((sum, color) => sum + ballValues[color], 0);
    const totalPointsRemaining = redsPoints + colorsPoints;

    const redsHtml = `<span class="table-reds">Reds: ${frame.redsRemaining}</span>`;
    const colorsHtml = frame.colorsRemaining.map(color =>
      `<span class="table-color ball-${color}">${ballValues[color]}</span>`
    ).join('');
    const pointsHtml = `<span class="table-points">Points Remaining: ${totalPointsRemaining}</span>`;

    this.elements.tableState.innerHTML = `
      <div class="table-state-content">
        ${redsHtml}
        ${pointsHtml}
        <div class="table-colors">${colorsHtml}</div>
      </div>
    `;
  }

  renderStatistics(stats, match) {
    if (!this.elements.statsContent) return;

    // Store match data globally for chart switching
    window.currentMatchData = {
      frames: match.frames,
      players: match.players,
      bestOf: match.bestOf
    };

    // Hide/show back to match button based on match status
    const backToMatchBtn = document.getElementById('back-to-match-btn');
    if (backToMatchBtn) {
      if (match.status === 'completed') {
        backToMatchBtn.style.display = 'none';
      } else {
        backToMatchBtn.style.display = 'inline-block';
      }
    }

    const player1Stats = stats.player1Stats;
    const player2Stats = stats.player2Stats;

    // Get current frame info if one is in progress
    const currentFrame = match.frames[match.frames.length - 1];
    const isFrameActive = currentFrame && currentFrame.winner === null;
    const currentFrameScores = isFrameActive ? ` (${currentFrame.scores[0]} - ${currentFrame.scores[1]})` : '';
    
    // Check if match is completed and determine winner
    const isMatchComplete = match.status === 'completed';
    const matchWinner = match.matchWinner !== undefined ? match.matchWinner : null;
    const winnerClass1 = isMatchComplete && matchWinner === 0 ? 'match-winner' : '';
    const winnerClass2 = isMatchComplete && matchWinner === 1 ? 'match-winner' : '';
    const winnerName = matchWinner !== null ? match.players[matchWinner] : '';
    const winnerColorClass = matchWinner !== null ? (matchWinner === 0 ? 'player1-color' : 'player2-color') : '';

    this.elements.statsContent.innerHTML = `
      <!-- Overall Match Score -->
      <div class="overall-match-score">
        ${isMatchComplete && winnerName ? `<div class="match-complete-banner ${winnerColorClass}">🏆 ${winnerName} WINS!</div>` : ''}
        <div class="match-score-container">
          <div class="match-score-player ${winnerClass1}">
            <div class="match-score-name player1-color">${match.players[0]}</div>
            <div class="match-score-frames">${stats.currentScore[0]}</div>
          </div>
          <div class="match-score-divider">
            <div class="match-score-label">SCORE</div>
            ${isFrameActive ? `<div class="current-frame-score">${currentFrameScores}</div>` : ''}
          </div>
          <div class="match-score-player ${winnerClass2}">
            <div class="match-score-name player2-color">${match.players[1]}</div>
            <div class="match-score-frames">${stats.currentScore[1]}</div>
          </div>
        </div>
      </div>

      <div class="stats-dashboard">
        <!-- Dashboard Stats Cards -->
        <div class="dashboard-stats">
          <div class="stat-card border-green">
            <div class="stat-card-header">Total Points</div>
            <div class="stat-card-values">
              <div class="stat-value-item">
                <div class="stat-value">${player1Stats.totalPoints}</div>
                <div class="stat-player-name player1">${match.players[0]}</div>
              </div>
              <div class="stat-value-item" style="text-align: right;">
                <div class="stat-value">${player2Stats.totalPoints}</div>
                <div class="stat-player-name player2">${match.players[1]}</div>
              </div>
            </div>
          </div>
          
          <div class="stat-card border-blue">
            <div class="stat-card-header">Pot Success</div>
            <div class="stat-card-values">
              <div class="stat-value-item">
                <div class="stat-value">${player1Stats.potPercentage}%</div>
                <div class="stat-player-name player1">${match.players[0]}</div>
              </div>
              <div class="stat-value-item" style="text-align: right;">
                <div class="stat-value">${player2Stats.potPercentage}%</div>
                <div class="stat-player-name player2">${match.players[1]}</div>
              </div>
            </div>
          </div>
          
          <div class="stat-card border-purple">
            <div class="stat-card-header">Highest Break</div>
            <div class="stat-card-values">
              <div class="stat-value-item">
                <div class="stat-value">${player1Stats.highBreak}</div>
                <div class="stat-player-name player1">${match.players[0]}</div>
              </div>
              <div class="stat-value-item" style="text-align: right;">
                <div class="stat-value">${player2Stats.highBreak}</div>
                <div class="stat-player-name player2">${match.players[1]}</div>
              </div>
            </div>
          </div>
          
          <div class="stat-card border-red">
            <div class="stat-card-header">Avg Shot Time</div>
            <div class="stat-card-values">
              <div class="stat-value-item">
                <div class="stat-value">${player1Stats.averageShotTime}s</div>
                <div class="stat-player-name player1">${match.players[0]}</div>
              </div>
              <div class="stat-value-item" style="text-align: right;">
                <div class="stat-value">${player2Stats.averageShotTime}s</div>
                <div class="stat-player-name player2">${match.players[1]}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Frame History Table -->
        ${this.renderFrameHistoryTable(match.frames, match.players)}

        <!-- Match Analysis Charts -->
        ${this.renderMatchAnalysis(match.frames, match.players)}

        <!-- Unified Statistics Table -->
        <div class="unified-stats-table">
          <h3>Match Statistics Comparison</h3>
          <table class="stats-comparison-table">
            <thead>
              <tr>
                <th class="stat-category">Statistic</th>
                <th class="stat-player">${match.players[0]}</th>
                <th class="stat-player">${match.players[1]}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="stat-label">Frames Won</td>
                <td class="stat-value ${stats.currentScore[0] > stats.currentScore[1] ? 'stat-leader' : ''}">${stats.currentScore[0]}</td>
                <td class="stat-value ${stats.currentScore[1] > stats.currentScore[0] ? 'stat-leader' : ''}">${stats.currentScore[1]}</td>
              </tr>
              <tr>
                <td class="stat-label">Total Points</td>
                <td class="stat-value ${player1Stats.totalPoints > player2Stats.totalPoints ? 'stat-leader' : ''}">${player1Stats.totalPoints}</td>
                <td class="stat-value ${player2Stats.totalPoints > player1Stats.totalPoints ? 'stat-leader' : ''}">${player2Stats.totalPoints}</td>
              </tr>
              <tr>
                <td class="stat-label">High Break</td>
                <td class="stat-value ${player1Stats.highBreak > player2Stats.highBreak ? 'stat-leader' : ''}">${player1Stats.highBreak}</td>
                <td class="stat-value ${player2Stats.highBreak > player1Stats.highBreak ? 'stat-leader' : ''}">${player2Stats.highBreak}</td>
              </tr>
              <tr>
                <td class="stat-label">Pot Success</td>
                <td class="stat-value ${parseFloat(player1Stats.potPercentage) > parseFloat(player2Stats.potPercentage) ? 'stat-leader' : ''}">${player1Stats.potPercentage}%</td>
                <td class="stat-value ${parseFloat(player2Stats.potPercentage) > parseFloat(player1Stats.potPercentage) ? 'stat-leader' : ''}">${player2Stats.potPercentage}%</td>
              </tr>
              <tr>
                <td class="stat-label">Average Shot Time</td>
                <td class="stat-value ${parseFloat(player1Stats.averageShotTime) < parseFloat(player2Stats.averageShotTime) ? 'stat-leader' : ''}">${player1Stats.averageShotTime}s</td>
                <td class="stat-value ${parseFloat(player2Stats.averageShotTime) < parseFloat(player1Stats.averageShotTime) ? 'stat-leader' : ''}">${player2Stats.averageShotTime}s</td>
              </tr>
              <tr>
                <td class="stat-label">Points per Visit</td>
                <td class="stat-value ${parseFloat(player1Stats.pointsPerVisit) > parseFloat(player2Stats.pointsPerVisit) ? 'stat-leader' : ''}">${player1Stats.pointsPerVisit}</td>
                <td class="stat-value ${parseFloat(player2Stats.pointsPerVisit) > parseFloat(player1Stats.pointsPerVisit) ? 'stat-leader' : ''}">${player2Stats.pointsPerVisit}</td>
              </tr>
              <tr>
                <td class="stat-label">Breaks 10+</td>
                <td class="stat-value ${player1Stats.breaks.over10 > player2Stats.breaks.over10 ? 'stat-leader' : ''}">${player1Stats.breaks.over10}</td>
                <td class="stat-value ${player2Stats.breaks.over10 > player1Stats.breaks.over10 ? 'stat-leader' : ''}">${player2Stats.breaks.over10}</td>
              </tr>
              <tr>
                <td class="stat-label">Breaks 20+</td>
                <td class="stat-value ${player1Stats.breaks.over20 > player2Stats.breaks.over20 ? 'stat-leader' : ''}">${player1Stats.breaks.over20}</td>
                <td class="stat-value ${player2Stats.breaks.over20 > player1Stats.breaks.over20 ? 'stat-leader' : ''}">${player2Stats.breaks.over20}</td>
              </tr>
              <tr>
                <td class="stat-label">Breaks 30+</td>
                <td class="stat-value ${player1Stats.breaks.over30 > player2Stats.breaks.over30 ? 'stat-leader' : ''}">${player1Stats.breaks.over30}</td>
                <td class="stat-value ${player2Stats.breaks.over30 > player1Stats.breaks.over30 ? 'stat-leader' : ''}">${player2Stats.breaks.over30}</td>
              </tr>
              <tr>
                <td class="stat-label">Breaks 40+</td>
                <td class="stat-value ${player1Stats.breaks.over40 > player2Stats.breaks.over40 ? 'stat-leader' : ''}">${player1Stats.breaks.over40}</td>
                <td class="stat-value ${player2Stats.breaks.over40 > player1Stats.breaks.over40 ? 'stat-leader' : ''}">${player2Stats.breaks.over40}</td>
              </tr>
              <tr>
                <td class="stat-label">Breaks 50+</td>
                <td class="stat-value ${player1Stats.breaks.over50 > player2Stats.breaks.over50 ? 'stat-leader' : ''}">${player1Stats.breaks.over50}</td>
                <td class="stat-value ${player2Stats.breaks.over50 > player1Stats.breaks.over50 ? 'stat-leader' : ''}">${player2Stats.breaks.over50}</td>
              </tr>
              <tr>
                <td class="stat-label">Century Breaks</td>
                <td class="stat-value ${player1Stats.breaks.century > player2Stats.breaks.century ? 'stat-leader' : ''}">${player1Stats.breaks.century}</td>
                <td class="stat-value ${player2Stats.breaks.century > player1Stats.breaks.century ? 'stat-leader' : ''}">${player2Stats.breaks.century}</td>
              </tr>
              <tr>
                <td class="stat-label">Fouls</td>
                <td class="stat-value ${player1Stats.fouls < player2Stats.fouls ? 'stat-leader' : ''}">${player1Stats.fouls}</td>
                <td class="stat-value ${player2Stats.fouls < player1Stats.fouls ? 'stat-leader' : ''}">${player2Stats.fouls}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Top Breaks List -->
        <div class="breaks-section">
          <h3>Top Breaks</h3>
          ${this.renderBreaksList(stats.allBreaks, match.players)}
        </div>
      </div>
    `;
  }

  calculateAvgScorePerFrame(playerStats, framesPlayed) {
    if (framesPlayed === 0) return '0.0';
    return (playerStats.totalPoints / framesPlayed).toFixed(1);
  }

  calculateAvgHighBreak(playerStats) {
    const significantBreaks = [
      playerStats.breaks.over20,
      playerStats.breaks.over30,
      playerStats.breaks.over40,
      playerStats.breaks.over50,
      playerStats.breaks.over60,
      playerStats.breaks.over70,
      playerStats.breaks.over80,
      playerStats.breaks.over90,
      playerStats.breaks.century
    ];
    const totalBreaks = significantBreaks.reduce((a, b) => a + b, 0);
    if (totalBreaks === 0) return '0.0';
    
    // Estimate average based on break distribution
    const weightedSum =
      playerStats.breaks.over20 * 25 +
      playerStats.breaks.over30 * 35 +
      playerStats.breaks.over40 * 45 +
      playerStats.breaks.over50 * 55 +
      playerStats.breaks.over60 * 65 +
      playerStats.breaks.over70 * 75 +
      playerStats.breaks.over80 * 85 +
      playerStats.breaks.over90 * 95 +
      playerStats.breaks.century * 110;
    
    return (weightedSum / totalBreaks).toFixed(1);
  }

  renderFrameHistoryTable(frames, players) {
    if (frames.length === 0) {
      return '<div class="frame-history-empty"><p>No frames completed yet.</p></div>';
    }

    const completedFrames = frames.filter(f => f.winner !== null);
    if (completedFrames.length === 0) {
      return '<div class="frame-history-empty"><p>No frames completed yet.</p></div>';
    }

    return `
      <div class="frame-history-section">
        <div class="frame-history-header">
          <div class="frame-history-title">Frame History</div>
          <div class="frame-history-count">${completedFrames.length} Frames Played</div>
        </div>
        <table class="frame-history-table">
          <thead>
            <tr>
              <th class="col-high-break">High Break</th>
              <th class="col-points"><span class="player1-color">${players[0]}</span><br>Points</th>
              <th class="col-frame">Frame</th>
              <th class="col-points"><span class="player2-color">${players[1]}</span><br>Points</th>
              <th class="col-high-break">High Break</th>
            </tr>
          </thead>
          <tbody>
            ${completedFrames.map(frame => {
              const player1Break = Math.max(...frame.breaks.filter(b => b.player === 0).map(b => b.points), 0);
              const player2Break = Math.max(...frame.breaks.filter(b => b.player === 1).map(b => b.points), 0);
              
              return `
                <tr>
                  <td class="col-high-break">${player1Break > 0 ? player1Break : '-'}</td>
                  <td class="col-points">
                    <span class="score-box ${frame.winner === 0 ? 'winner-player1' : ''}">${frame.scores[0]}</span>
                  </td>
                  <td class="col-frame">${frame.number}</td>
                  <td class="col-points">
                    <span class="score-box ${frame.winner === 1 ? 'winner-player2' : ''}">${frame.scores[1]}</span>
                  </td>
                  <td class="col-high-break">${player2Break > 0 ? player2Break : '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } // <--- THIS CLOSING BRACE WAS LIKELY MISSING OR MISPLACED

  renderBreaksChart(frames, players, bestOf) {
    const maxBreak = Math.max(...frames.flatMap(f =>
      f.breaks.map(b => b.points)
    ), 1);
    const chartHeight = 240;
    const chartWidth = 500;  // Increased from 100 to fill more width
    const padding = 40;
    
    // Use bestOf to determine total frames for x-axis scaling
    const totalFrames = bestOf;
    const divisor = totalFrames > 1 ? totalFrames - 1 : 1;
    
    const player1Breaks = frames.map(f =>
      Math.max(...f.breaks.filter(b => b.player === 0).map(b => b.points), 0)
    );
    const player2Breaks = frames.map(f =>
      Math.max(...f.breaks.filter(b => b.player === 1).map(b => b.points), 0)
    );
    
    const points1 = player1Breaks.map((val, i) => ({
      x: 50 + (i / divisor) * chartWidth,  // Add left padding
      y: chartHeight - ((val / maxBreak) * (chartHeight - padding))
    }));
    
    const points2 = player2Breaks.map((val, i) => ({
      x: 50 + (i / divisor) * chartWidth,  // Add left padding
      y: chartHeight - ((val / maxBreak) * (chartHeight - padding))
    }));

    const createPath = (points) => {
      return points.map((p, i) => {
        const command = i === 0 ? 'M' : 'L';
        return `${command} ${p.x} ${p.y}`;
      }).join(' ');
    };

    const path1 = createPath(points1);
    const path2 = createPath(points2);

    const gridLines = [0, 25, 50, 75, 100].map(y =>
      `<line x1="50" y1="${y * 2.4}" x2="${50 + chartWidth}" y2="${y * 2.4}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" vector-effect="non-scaling-stroke"/>`
    ).join('');
    
    const yLabels = [0, 25, 50, 75, 100].map((val, i) =>
      `<text x="45" y="${240 - (i * 60) + 4}" fill="#666" font-size="10" text-anchor="end">${Math.round((val / 100) * maxBreak)}</text>`
    ).join('');
    
    const circles1 = points1.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#d32f2f" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const circles2 = points2.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#fbc02d" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    // Generate x-axis labels for all frames (1 to totalFrames)
    const xLabels = Array.from({ length: totalFrames }, (_, i) => {
      const frameNum = i + 1;
      return `<text x="${50 + (i / divisor) * chartWidth}" y="260" fill="#666" font-size="10" text-anchor="middle">${frameNum}</text>`;
    }).join('');

    return `<svg viewBox="0 -10 600 280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 280px; overflow: visible;">
      ${gridLines}
      ${yLabels}
      <path d="${path2}" fill="none" stroke="#fbc02d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <path d="${path1}" fill="none" stroke="#d32f2f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      ${circles1}
      ${circles2}
      ${xLabels}
    </svg>`;
  }

  renderTotalPointsChart(frames, players, bestOf) {
    let cumulative1 = 0;
    let cumulative2 = 0;
    
    const cumulativeScores1 = frames.map(f => {
      cumulative1 += f.scores[0];
      return cumulative1;
    });
    
    const cumulativeScores2 = frames.map(f => {
      cumulative2 += f.scores[1];
      return cumulative2;
    });
    
    const maxTotal = Math.max(...cumulativeScores1, ...cumulativeScores2);
    const chartHeight = 240;
    const chartWidth = 500;  // Increased from 100 to fill more width
    const padding = 40;
    
    // Use bestOf to determine total frames for x-axis scaling
    const totalFrames = bestOf;
    const divisor = totalFrames > 1 ? totalFrames - 1 : 1;
    
    const points1 = cumulativeScores1.map((val, i) => ({
      x: 50 + (i / divisor) * chartWidth,  // Add left padding
      y: chartHeight - ((val / maxTotal) * (chartHeight - padding))
    }));
    
    const points2 = cumulativeScores2.map((val, i) => ({
      x: 50 + (i / divisor) * chartWidth,  // Add left padding
      y: chartHeight - ((val / maxTotal) * (chartHeight - padding))
    }));

    const createPath = (points) => {
      return points.map((p, i) => {
        const command = i === 0 ? 'M' : 'L';
        return `${command} ${p.x} ${p.y}`;
      }).join(' ');
    };

    const path1 = createPath(points1);
    const path2 = createPath(points2);

    const gridLines = [0, 25, 50, 75, 100].map(y =>
      `<line x1="50" y1="${y * 2.4}" x2="${50 + chartWidth}" y2="${y * 2.4}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" vector-effect="non-scaling-stroke"/>`
    ).join('');
    
    const yLabels = [0, 25, 50, 75, 100].map((val, i) =>
      `<text x="45" y="${240 - (i * 60) + 4}" fill="#666" font-size="10" text-anchor="end">${Math.round((val / 100) * maxTotal)}</text>`
    ).join('');
    
    const circles1 = points1.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#d32f2f" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const circles2 = points2.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#fbc02d" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    // Generate x-axis labels for all frames (1 to totalFrames)
    const xLabels = Array.from({ length: totalFrames }, (_, i) => {
      const frameNum = i + 1;
      return `<text x="${50 + (i / divisor) * chartWidth}" y="260" fill="#666" font-size="10" text-anchor="middle">${frameNum}</text>`;
    }).join('');

    return `<svg viewBox="0 -10 600 280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 280px; overflow: visible;">
      ${gridLines}
      ${yLabels}
      <path d="${path2}" fill="none" stroke="#fbc02d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <path d="${path1}" fill="none" stroke="#d32f2f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      ${circles1}
      ${circles2}
      ${xLabels}
    </svg>`;
  }

  renderDiffChart(frames, players, bestOf) {
    const diffs = frames.map(f => f.scores[0] - f.scores[1]);
    const maxDiff = Math.max(...diffs.map(Math.abs), 1);
    const chartHeight = 240;
    const chartWidth = 500;  // Increased from 100 to fill more width
    // Use bestOf to determine total frames for bar width calculation
    const totalFrames = bestOf;
    const barWidth = (chartWidth * 0.8) / totalFrames;  // Use 80% of chart width for bars
    const centerY = chartHeight / 2;
    
    const centerLine = `<line x1="50" y1="${centerY}" x2="${50 + chartWidth}" y2="${centerY}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    
    const gridLines = [-100, -50, 50, 100].map(val => {
      const y = centerY - ((val / 100) * (centerY - 20));
      return `<line x1="50" y1="${y}" x2="${50 + chartWidth}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>`;
    }).join('');
    
    const yLabels = [-100, -50, 0, 50, 100].map(val => {
      const y = centerY - ((val / 100) * (centerY - 20));
      return `<text x="45" y="${y + 3}" fill="#666" font-size="10" text-anchor="end">${Math.round((val / 100) * maxDiff)}</text>`;
    }).join('');
    
    const bars = frames.map((f, i) => {
      const diff = f.scores[0] - f.scores[1];
      const barHeight = Math.abs((diff / maxDiff) * (centerY - 20));
      const x = 50 + (i / totalFrames) * chartWidth + (barWidth / 2);
      const isPositive = diff >= 0;
      const y = isPositive ? centerY - barHeight : centerY;
      const color = isPositive ? '#d32f2f' : '#fbc02d';
      
      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="1"/>`;
    }).join('');
    
    // Generate x-axis labels for all frames (1 to totalFrames)
    const xLabels = Array.from({ length: totalFrames }, (_, i) => {
      const frameNum = i + 1;
      return `<text x="${50 + (i / totalFrames) * chartWidth + barWidth}" y="260" fill="#666" font-size="10" text-anchor="middle">${frameNum}</text>`;
    }).join('');

    return `<svg viewBox="0 -10 600 280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 280px; overflow: visible;">
      ${centerLine}
      ${gridLines}
      ${yLabels}
      ${bars}
      ${xLabels}
    </svg>`;
  }

  renderMatchAnalysis(frames, players) {
    if (frames.length === 0) {
      return '<div class="frame-history-empty"><p>No frames completed yet.</p></div>';
    }

    const completedFrames = frames.filter(f => f.winner !== null);
    if (completedFrames.length === 0) {
      return '<div class="frame-history-empty"><p>No frames completed yet.</p></div>';
    }

    return '<div class="match-analysis-section">' +
      '<div class="analysis-header">' +
        '<div class="analysis-title">Match Analysis</div>' +
      '</div>' +
      '<div class="analysis-tabs">' +
        '<button class="analysis-tab active" data-chart="diff">Diff</button>' +
        '<button class="analysis-tab" data-chart="scores">Scores</button>' +
        '<button class="analysis-tab" data-chart="breaks">Breaks</button>' +
        '<button class="analysis-tab" data-chart="total-points">Total Points</button>' +
      '</div>' +
      '<div class="chart-container">' +
        '<div class="chart-canvas" id="analysis-chart">' +
          this.renderDiffChart(completedFrames, players, frames.length > 0 ? window.currentMatchData.bestOf : 1) +
        '</div>' +
        '<div class="chart-legend">' +
          '<div class="legend-item">' +
            '<div class="legend-color player1"></div>' +
            '<span>' + players[0] + '</span>' +
          '</div>' +
          '<div class="legend-item">' +
            '<div class="legend-color player2"></div>' +
            '<span>' + players[1] + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  renderScoresChart(frames, players, bestOf) {
    const maxScore = Math.max(...frames.flatMap(f => f.scores));
    const chartHeight = 240;
    const chartWidth = 500;  // Increased from 100 to fill more width
    const padding = 40;
    
    // Use bestOf to determine total frames for x-axis scaling
    const totalFrames = bestOf;
    const divisor = totalFrames > 1 ? totalFrames - 1 : 1;
    
    const points1 = frames.map((f, i) => ({
      x: 50 + (i / divisor) * chartWidth,  // Add left padding
      y: chartHeight - ((f.scores[0] / maxScore) * (chartHeight - padding))
    }));
    
    const points2 = frames.map((f, i) => ({
      x: 50 + (i / divisor) * chartWidth,  // Add left padding
      y: chartHeight - ((f.scores[1] / maxScore) * (chartHeight - padding))
    }));

    const createPath = (points) => {
      return points.map((p, i) => {
        const command = i === 0 ? 'M' : 'L';
        return `${command} ${p.x} ${p.y}`;
      }).join(' ');
    };

    const path1 = createPath(points1);
    const path2 = createPath(points2);

    const gridLines = [0, 25, 50, 75, 100].map(y =>
      `<line x1="50" y1="${y * 2.4}" x2="${50 + chartWidth}" y2="${y * 2.4}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" vector-effect="non-scaling-stroke"/>`
    ).join('');
    
    const yLabels = [0, 25, 50, 75, 100].map((val, i) =>
      `<text x="45" y="${240 - (i * 60) + 4}" fill="#666" font-size="10" text-anchor="end">${Math.round((val / 100) * maxScore)}</text>`
    ).join('');
    
    const circles1 = points1.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#d32f2f" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const circles2 = points2.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#fbc02d" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    // Generate x-axis labels for all frames (1 to totalFrames)
    const xLabels = Array.from({ length: totalFrames }, (_, i) => {
      const frameNum = i + 1;
      return `<text x="${50 + (i / divisor) * chartWidth}" y="260" fill="#666" font-size="10" text-anchor="middle">${frameNum}</text>`;
    }).join('');

    return `<svg viewBox="0 -10 600 280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 280px; overflow: visible;">
      ${gridLines}
      ${yLabels}
      <path d="${path2}" fill="none" stroke="#fbc02d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <path d="${path1}" fill="none" stroke="#d32f2f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      ${circles1}
      ${circles2}
      ${xLabels}
    </svg>`;
  }


  renderBreaksList(breaks, players) {
    // Filter to only show breaks of 10 or more
    const filteredBreaks = breaks.filter(b => b.points >= 10);
    
    if (filteredBreaks.length === 0) {
      return '<p>No breaks of 10+ recorded yet.</p>';
    }

    const ballValues = {
      red: 1,
      yellow: 2,
      green: 3,
      brown: 4,
      blue: 5,
      pink: 6,
      black: 7
    };

    return `
      <div class="breaks-list">
        ${filteredBreaks.slice(0, 20).map(b => {
          // Use shots data to check for free balls
          const ballsHtml = b.shots
            .filter(shot => shot.potted)
            .map(shot => {
              // If it was a free ball, display as 1 point regardless of actual ball color
              const displayValue = shot.isFreeBall ? 1 : ballValues[shot.ball];
              return `<span class="break-ball ball-${shot.ball}" style="display: inline-block; margin: 0 2px;">${displayValue}</span>`;
            })
            .join('');
          
          const playerClass = b.player === 0 ? 'player1' : 'player2';
          
          return `
            <div class="break-item ${playerClass}">
              <span class="break-player">${players[b.player]}</span>
              <span class="break-points">${b.points}</span>
              <span class="break-frame">Frame ${b.frameNumber}</span>
              <span class="break-balls">${ballsHtml}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }


  renderHistory(history) {
    if (!this.elements.historyList) return;

    if (history.length === 0) {
      this.elements.historyList.innerHTML = '<p>No match history found.</p>';
      return;
    }

    this.elements.historyList.innerHTML = history.map(match => {
      const framesWon = [
        match.frames.filter(f => f.winner === 0).length,
        match.frames.filter(f => f.winner === 1).length
      ];
      
      const isCompleted = match.status === 'completed';
      const buttonText = isCompleted ? 'View Stats' : 'Resume';
      const buttonClass = isCompleted ? 'btn-resume btn-view-stats' : 'btn-resume';

      return `
        <div class="history-item" data-match-id="${match.id}">
          <div class="history-info">
            <h3>${match.players[0]} vs ${match.players[1]}</h3>
            <p>Best of ${match.bestOf} | Score: ${framesWon[0]} - ${framesWon[1]}</p>
            <p class="history-date">${new Date(match.created).toLocaleString()}</p>
            <span class="history-status ${match.status}">${match.status}</span>
          </div>
          <div class="history-actions">
            <button class="${buttonClass}" data-match-id="${match.id}">${buttonText}</button>
            <button class="btn-delete" data-match-id="${match.id}">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  confirmAction(message) {
    return new Promise((resolve) => {
      this.showConfirmDialog(message, resolve);
    });
  }

  showConfirmDialog(message, callback) {
    const dialog = document.createElement('div');
    dialog.className = 'custom-dialog';
    dialog.innerHTML = `
      <div class="custom-dialog-content">
        <div class="custom-dialog-header">
          <h3>Confirm Action</h3>
        </div>
        <div class="custom-dialog-body">
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="custom-dialog-footer">
          <button class="btn btn-secondary dialog-cancel">Cancel</button>
          <button class="btn btn-primary dialog-confirm">Confirm</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Trigger animation
    setTimeout(() => dialog.classList.add('show'), 10);
    
    const handleResponse = (result) => {
      dialog.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(dialog);
        callback(result);
      }, 300);
    };
    
    dialog.querySelector('.dialog-cancel').addEventListener('click', () => handleResponse(false));
    dialog.querySelector('.dialog-confirm').addEventListener('click', () => handleResponse(true));
    
    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        handleResponse(false);
      }
    });
  }

  showAlertDialog(message) {
    const dialog = document.createElement('div');
    dialog.className = 'custom-dialog';
    dialog.innerHTML = `
      <div class="custom-dialog-content">
        <div class="custom-dialog-header">
          <h3>Notice</h3>
        </div>
        <div class="custom-dialog-body">
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="custom-dialog-footer">
          <button class="btn btn-primary dialog-ok">OK</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Trigger animation
    setTimeout(() => dialog.classList.add('show'), 10);
    
    const handleClose = () => {
      dialog.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(dialog);
      }, 300);
    };
    
    dialog.querySelector('.dialog-ok').addEventListener('click', handleClose);
    
    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        handleClose();
      }
    });
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}