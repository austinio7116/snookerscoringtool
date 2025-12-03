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
      <div class="stats-dashboard">
        <!-- Match Overview Header -->
        <div class="stats-header">
          <div class="stats-score-card">
            <div class="score-card-player">
              <div class="score-card-name">${match.players[0]}</div>
              <div class="score-card-frames">${stats.currentScore[0]}</div>
            </div>
            <div class="score-card-divider">
              <div class="score-card-vs">VS</div>
              <div class="score-card-format">Best of ${match.bestOf}</div>
            </div>
            <div class="score-card-player">
              <div class="score-card-name">${match.players[1]}</div>
              <div class="score-card-frames">${stats.currentScore[1]}</div>
            </div>
          </div>
        </div>

        <!-- Frame History Graph -->
        ${this.renderFrameHistoryGraph(match.frames, match.players)}

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
                <td class="stat-label">Pot Success %</td>
                <td class="stat-value ${parseFloat(player1Stats.potPercentage) > parseFloat(player2Stats.potPercentage) ? 'stat-leader' : ''}">${player1Stats.potPercentage}%</td>
                <td class="stat-value ${parseFloat(player2Stats.potPercentage) > parseFloat(player1Stats.potPercentage) ? 'stat-leader' : ''}">${player2Stats.potPercentage}%</td>
              </tr>
              <tr>
                <td class="stat-label">Points per Visit</td>
                <td class="stat-value ${parseFloat(player1Stats.pointsPerVisit) > parseFloat(player2Stats.pointsPerVisit) ? 'stat-leader' : ''}">${player1Stats.pointsPerVisit}</td>
                <td class="stat-value ${parseFloat(player2Stats.pointsPerVisit) > parseFloat(player1Stats.pointsPerVisit) ? 'stat-leader' : ''}">${player2Stats.pointsPerVisit}</td>
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
                <td class="stat-label">Safety Success %</td>
                <td class="stat-value ${parseFloat(player1Stats.safetySuccessRate) > parseFloat(player2Stats.safetySuccessRate) ? 'stat-leader' : ''}">${player1Stats.safetySuccessRate}%</td>
                <td class="stat-value ${parseFloat(player2Stats.safetySuccessRate) > parseFloat(player1Stats.safetySuccessRate) ? 'stat-leader' : ''}">${player2Stats.safetySuccessRate}%</td>
              </tr>
              <tr>
                <td class="stat-label">Rest Pot %</td>
                <td class="stat-value ${parseFloat(player1Stats.restPotPercentage) > parseFloat(player2Stats.restPotPercentage) ? 'stat-leader' : ''}">${player1Stats.restPotPercentage}%</td>
                <td class="stat-value ${parseFloat(player2Stats.restPotPercentage) > parseFloat(player1Stats.restPotPercentage) ? 'stat-leader' : ''}">${player2Stats.restPotPercentage}%</td>
              </tr>
              <tr>
                <td class="stat-label">Fouls</td>
                <td class="stat-value ${player1Stats.fouls < player2Stats.fouls ? 'stat-leader' : ''}">${player1Stats.fouls}</td>
                <td class="stat-value ${player2Stats.fouls < player1Stats.fouls ? 'stat-leader' : ''}">${player2Stats.fouls}</td>
              </tr>
              <tr>
                <td class="stat-label">Avg Shot Time</td>
                <td class="stat-value">${player1Stats.averageShotTime}s</td>
                <td class="stat-value">${player2Stats.averageShotTime}s</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Break Building Details -->
        <div class="break-building-section">
          <h3>Break Building Distribution</h3>
          <table class="stats-comparison-table">
            <thead>
              <tr>
                <th class="stat-category">Break Range</th>
                <th class="stat-player">${match.players[0]}</th>
                <th class="stat-player">${match.players[1]}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="stat-label">20+</td>
                <td class="stat-value">${player1Stats.breaks.over20}</td>
                <td class="stat-value">${player2Stats.breaks.over20}</td>
              </tr>
              <tr>
                <td class="stat-label">30+</td>
                <td class="stat-value">${player1Stats.breaks.over30}</td>
                <td class="stat-value">${player2Stats.breaks.over30}</td>
              </tr>
              <tr>
                <td class="stat-label">40+</td>
                <td class="stat-value">${player1Stats.breaks.over40}</td>
                <td class="stat-value">${player2Stats.breaks.over40}</td>
              </tr>
              <tr>
                <td class="stat-label">50+</td>
                <td class="stat-value">${player1Stats.breaks.over50}</td>
                <td class="stat-value">${player2Stats.breaks.over50}</td>
              </tr>
              <tr>
                <td class="stat-label">60+</td>
                <td class="stat-value">${player1Stats.breaks.over60}</td>
                <td class="stat-value">${player2Stats.breaks.over60}</td>
              </tr>
              <tr>
                <td class="stat-label">70+</td>
                <td class="stat-value">${player1Stats.breaks.over70}</td>
                <td class="stat-value">${player2Stats.breaks.over70}</td>
              </tr>
              <tr>
                <td class="stat-label">80+</td>
                <td class="stat-value">${player1Stats.breaks.over80}</td>
                <td class="stat-value">${player2Stats.breaks.over80}</td>
              </tr>
              <tr>
                <td class="stat-label">90+</td>
                <td class="stat-value">${player1Stats.breaks.over90}</td>
                <td class="stat-value">${player2Stats.breaks.over90}</td>
              </tr>
              <tr>
                <td class="stat-label">Century (100+)</td>
                <td class="stat-value stat-highlight">${player1Stats.breaks.century}</td>
                <td class="stat-value stat-highlight">${player2Stats.breaks.century}</td>
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

  renderFrameHistoryGraph(frames, players) {
    if (frames.length === 0) {
      return '<div class="frame-history-empty"><p>No frames completed yet.</p></div>';
    }

    const completedFrames = frames.filter(f => f.winner !== null);
    if (completedFrames.length === 0) {
      return '<div class="frame-history-empty"><p>No frames completed yet.</p></div>';
    }

    const maxMargin = Math.max(...completedFrames.map(f => Math.abs(f.scores[0] - f.scores[1])), 1);

    return `
      <div class="frame-history-section">
        <h3>Frame History - Winning Margins</h3>
        <div class="frame-history-graph">
          <div class="frame-history-axis">
            <div class="axis-label axis-label-left">${players[0]}</div>
            <div class="axis-center"></div>
            <div class="axis-label axis-label-right">${players[1]}</div>
          </div>
          ${completedFrames.map(frame => {
            const margin = frame.scores[frame.winner] - frame.scores[frame.winner === 0 ? 1 : 0];
            const percentage = (margin / maxMargin) * 100;
            const isPlayer1Winner = frame.winner === 0;
            
            return `
              <div class="frame-history-row">
                <div class="frame-number">Frame ${frame.number}</div>
                <div class="frame-bar-container">
                  <div class="frame-bar-track">
                    <div class="frame-bar ${isPlayer1Winner ? 'player1-bar' : 'player2-bar'}"
                         style="${isPlayer1Winner ? 'left' : 'right'}: 50%; width: ${percentage / 2}%;">
                      <span class="frame-bar-label">${frame.scores[0]} - ${frame.scores[1]}</span>
                    </div>
                  </div>
                </div>
                <div class="frame-winner">${players[frame.winner]}</div>
              </div>
            `;
          }).join('')}
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