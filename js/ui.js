// UI Management for Snooker Scorer

class UIManager {
  constructor() {
    this.currentView = 'home';
    this.elements = {};
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
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
      this.elements.loadMatchBtn.addEventListener('click', () => this.handleLoadMatch());
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

  handleLoadMatch() {
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
            alert('Failed to load match. Invalid file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
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

    // Highlight active player
    const player1Container = document.getElementById('player1-container');
    const player2Container = document.getElementById('player2-container');
    if (player1Container && player2Container) {
      player1Container.classList.toggle('active', currentFrame.activePlayer === 0);
      player2Container.classList.toggle('active', currentFrame.activePlayer === 1);
    }
  }

  updateCurrentBreak(breakData) {
    if (!this.elements.currentBreak) return;

    if (!breakData || breakData.points === 0) {
      this.elements.currentBreak.innerHTML = '<div class="break-info">No break in progress</div>';
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

    const ballsHtml = breakData.balls.map(ball =>
      `<span class="break-ball ball-${ball}">${ballValues[ball]}</span>`
    ).join('');

    this.elements.currentBreak.innerHTML = `
      <div class="break-info">
        <div class="break-points">${breakData.points}</div>
        <div class="break-balls">${ballsHtml}</div>
      </div>
    `;
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

    const redsHtml = `<span class="table-reds">Reds: ${frame.redsRemaining}</span>`;
    const colorsHtml = frame.colorsRemaining.map(color =>
      `<span class="table-color ball-${color}">${ballValues[color]}</span>`
    ).join('');

    this.elements.tableState.innerHTML = `
      <div class="table-state-content">
        ${redsHtml}
        <div class="table-colors">${colorsHtml}</div>
      </div>
    `;
  }

  renderStatistics(stats, match) {
    if (!this.elements.statsContent) return;

    const player1Stats = stats.player1Stats;
    const player2Stats = stats.player2Stats;

    this.elements.statsContent.innerHTML = `
      <div class="stats-container">
        <h2>Match Statistics</h2>
        
        <!-- Score Comparison -->
        <div class="chart-container">
          <div class="chart-title">Match Score</div>
          <div class="comparison-chart">
            <div class="comparison-player">
              <div class="comparison-name">${match.players[0]}</div>
              <div class="comparison-value">${stats.currentScore[0]}</div>
              <div class="comparison-label">Frames Won</div>
            </div>
            <div class="comparison-player">
              <div class="comparison-name">${match.players[1]}</div>
              <div class="comparison-value">${stats.currentScore[1]}</div>
              <div class="comparison-label">Frames Won</div>
            </div>
          </div>
        </div>

        <!-- Pot Percentage Comparison -->
        <div class="chart-container">
          <div class="chart-title">Pot Percentage Comparison</div>
          <div class="bar-chart">
            <div class="bar-item">
              <div class="bar-label">${match.players[0]}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${player1Stats.potPercentage}%">
                  <span class="bar-value">${player1Stats.potPercentage}%</span>
                </div>
              </div>
            </div>
            <div class="bar-item">
              <div class="bar-label">${match.players[1]}</div>
              <div class="bar-track">
                <div class="bar-fill" style="width: ${player2Stats.potPercentage}%">
                  <span class="bar-value">${player2Stats.potPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- High Break Comparison -->
        <div class="chart-container">
          <div class="chart-title">High Break</div>
          <div class="comparison-chart">
            <div class="comparison-player">
              <div class="comparison-name">${match.players[0]}</div>
              <div class="comparison-value">${player1Stats.highBreak}</div>
              <div class="comparison-label">Points</div>
            </div>
            <div class="comparison-player">
              <div class="comparison-name">${match.players[1]}</div>
              <div class="comparison-value">${player2Stats.highBreak}</div>
              <div class="comparison-label">Points</div>
            </div>
          </div>
        </div>

        <!-- Detailed Stats Grid -->
        <div class="stats-grid">
          <div class="player-stats">
            <h3>${match.players[0]}</h3>
            ${this.renderPlayerStats(player1Stats)}
          </div>
          
          <div class="player-stats">
            <h3>${match.players[1]}</h3>
            ${this.renderPlayerStats(player2Stats)}
          </div>
        </div>

        <!-- Break Building Comparison Chart -->
        <div class="chart-container">
          <div class="chart-title">Break Building Comparison</div>
          <div class="bar-chart">
            ${this.renderBreakBuildingChart(player1Stats, player2Stats, match.players)}
          </div>
        </div>

        <div class="breaks-section">
          <h3>All Breaks</h3>
          ${this.renderBreaksList(stats.allBreaks, match.players)}
        </div>

        <div class="frames-section">
          <h3>Frame by Frame</h3>
          ${this.renderFramesList(match.frames, match.players)}
        </div>
      </div>
    `;
  }

  renderBreakBuildingChart(player1Stats, player2Stats, players) {
    const categories = [
      { label: '20+', key: 'over20' },
      { label: '30+', key: 'over30' },
      { label: '40+', key: 'over40' },
      { label: '50+', key: 'over50' },
      { label: 'Century', key: 'century' }
    ];

    return categories.map(cat => {
      const p1Value = player1Stats.breaks[cat.key];
      const p2Value = player2Stats.breaks[cat.key];
      const maxValue = Math.max(p1Value, p2Value, 1);

      return `
        <div style="margin-bottom: 20px;">
          <div style="font-weight: 600; color: var(--color-gray-200); margin-bottom: 10px;">${cat.label} Breaks</div>
          <div class="bar-item">
            <div class="bar-label">${players[0]}</div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${(p1Value / maxValue) * 100}%">
                <span class="bar-value">${p1Value}</span>
              </div>
            </div>
          </div>
          <div class="bar-item">
            <div class="bar-label">${players[1]}</div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${(p2Value / maxValue) * 100}%">
                <span class="bar-value">${p2Value}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderPlayerStats(stats) {
    return `
      <div class="stat-item">
        <span class="stat-label">Frames Won:</span>
        <span class="stat-value">${stats.framesWon}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Points:</span>
        <span class="stat-value">${stats.totalPoints}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">High Break:</span>
        <span class="stat-value">${stats.highBreak}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Pot %:</span>
        <span class="stat-value">${stats.potPercentage}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Rest Pot %:</span>
        <span class="stat-value">${stats.restPotPercentage}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Safety Success:</span>
        <span class="stat-value">${stats.safetySuccessRate}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Escape Success:</span>
        <span class="stat-value">${stats.escapeSuccessRate}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Avg Shot Time:</span>
        <span class="stat-value">${stats.averageShotTime}s</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Points/Visit:</span>
        <span class="stat-value">${stats.pointsPerVisit}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Fouls:</span>
        <span class="stat-value">${stats.fouls}</span>
      </div>
      <div class="breaks-distribution">
        <h4>Break Building</h4>
        <div class="stat-item">
          <span class="stat-label">20+:</span>
          <span class="stat-value">${stats.breaks.over20}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">30+:</span>
          <span class="stat-value">${stats.breaks.over30}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">40+:</span>
          <span class="stat-value">${stats.breaks.over40}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">50+:</span>
          <span class="stat-value">${stats.breaks.over50}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Century:</span>
          <span class="stat-value">${stats.breaks.century}</span>
        </div>
      </div>
    `;
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
          const ballsHtml = b.balls.map(ball =>
            `<span class="break-ball ball-${ball}" style="display: inline-block; margin: 0 2px;">${ballValues[ball]}</span>`
          ).join('');
          
          return `
            <div class="break-item">
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

  renderFramesList(frames, players) {
    if (frames.length === 0) {
      return '<p>No frames completed yet.</p>';
    }

    return `
      <div class="frames-list">
        ${frames.map(f => `
          <div class="frame-item">
            <span class="frame-number">Frame ${f.number}</span>
            <span class="frame-score">${f.scores[0]} - ${f.scores[1]}</span>
            <span class="frame-winner">${f.winner !== null ? players[f.winner] : 'In Progress'}</span>
          </div>
        `).join('')}
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

      return `
        <div class="history-item" data-match-id="${match.id}">
          <div class="history-info">
            <h3>${match.players[0]} vs ${match.players[1]}</h3>
            <p>Best of ${match.bestOf} | Score: ${framesWon[0]} - ${framesWon[1]}</p>
            <p class="history-date">${new Date(match.created).toLocaleString()}</p>
            <span class="history-status ${match.status}">${match.status}</span>
          </div>
          <div class="history-actions">
            <button class="btn-resume" data-match-id="${match.id}">Resume</button>
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
    return confirm(message);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}