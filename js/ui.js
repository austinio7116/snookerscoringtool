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

    const { frames, players } = window.currentMatchData;
    const completedFrames = frames.filter(f => f.winner !== null);

    // Render appropriate chart
    switch(chartType) {
      case 'scores':
        chartCanvas.innerHTML = this.renderScoresChart(completedFrames, players);
        break;
      case 'breaks':
        chartCanvas.innerHTML = this.renderBreaksChart(completedFrames, players);
        break;
      case 'total-points':
        chartCanvas.innerHTML = this.renderTotalPointsChart(completedFrames, players);
        break;
      case 'diff':
        chartCanvas.innerHTML = this.renderDiffChart(completedFrames, players);
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

    // Store match data globally for chart switching
    window.currentMatchData = {
      frames: match.frames,
      players: match.players
    };

    const player1Stats = stats.player1Stats;
    const player2Stats = stats.player2Stats;

    this.elements.statsContent.innerHTML = `
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
            <div class="stat-card-header">Avg Score / Frame</div>
            <div class="stat-card-values">
              <div class="stat-value-item">
                <div class="stat-value">${this.calculateAvgScorePerFrame(player1Stats, stats.currentScore[0])}</div>
                <div class="stat-player-name player1">${match.players[0]}</div>
              </div>
              <div class="stat-value-item" style="text-align: right;">
                <div class="stat-value">${this.calculateAvgScorePerFrame(player2Stats, stats.currentScore[1])}</div>
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
            <div class="stat-card-header">Avg High Break</div>
            <div class="stat-card-values">
              <div class="stat-value-item">
                <div class="stat-value">${this.calculateAvgHighBreak(player1Stats)}</div>
                <div class="stat-player-name player1">${match.players[0]}</div>
              </div>
              <div class="stat-value-item" style="text-align: right;">
                <div class="stat-value">${this.calculateAvgHighBreak(player2Stats)}</div>
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

  calculateAvgScorePerFrame(playerStats, framesWon) {
    if (framesWon === 0) return '0.0';
    return (playerStats.totalPoints / framesWon).toFixed(1);
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
              <th>#</th>
              <th>Winner</th>
              <th>Score</th>
              <th>Break</th>
            </tr>
          </thead>
          <tbody>
            ${completedFrames.map(frame => {
              const highBreak = Math.max(...frame.breaks.map(b => b.points), 0);
              const player1Break = Math.max(...frame.breaks.filter(b => b.player === 0).map(b => b.points), 0);
              const player2Break = Math.max(...frame.breaks.filter(b => b.player === 1).map(b => b.points), 0);
              
            return `
                    <tr>
                      <td>#${frame.number}</td>
                      <td>
                        <span class="frame-winner-badge ${frame.winner === 0 ? 'player1' : 'player2'}">
                          ${players[frame.winner]}
                        </span>
                      </td>
                      <td>
                        <span class="frame-score">
                          <span class="${frame.winner === 0 ? 'winner-score' : ''}">${frame.scores[0]}</span>
                          -
                          <span class="${frame.winner === 1 ? 'winner-score' : ''}">${frame.scores[1]}</span>
                        </span>
                      </td>
                      <td>
                        <span class="frame-breaks">
                          ${player1Break > 0 ? `<span class="${player1Break === highBreak ? 'high-break' : ''}">${player1Break}</span>` : '0'}
                          /
                          ${player2Break > 0 ? `<span class="${player2Break === highBreak ? 'high-break' : ''}">${player2Break}</span>` : '0'}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } // <--- THIS CLOSING BRACE WAS LIKELY MISSING OR MISPLACED

  renderBreaksChart(frames, players) {
    const maxBreak = Math.max(...frames.flatMap(f =>
      f.breaks.map(b => b.points)
    ), 1);
    const chartHeight = 240;
    const chartWidth = 100;
    const padding = 40;
    
    const divisor = frames.length > 1 ? frames.length - 1 : 1;
    
    const player1Breaks = frames.map(f =>
      Math.max(...f.breaks.filter(b => b.player === 0).map(b => b.points), 0)
    );
    const player2Breaks = frames.map(f =>
      Math.max(...f.breaks.filter(b => b.player === 1).map(b => b.points), 0)
    );
    
    const points1 = player1Breaks.map((val, i) => ({
      x: (i / divisor) * chartWidth,
      y: chartHeight - ((val / maxBreak) * (chartHeight - padding))
    }));
    
    const points2 = player2Breaks.map((val, i) => ({
      x: (i / divisor) * chartWidth,
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
      `<line x1="0" y1="${y * 2.4}" x2="100" y2="${y * 2.4}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" vector-effect="non-scaling-stroke"/>`
    ).join('');
    
    const yLabels = [0, 25, 50, 75, 100].map((val, i) =>
      `<text x="-2" y="${240 - (i * 60) + 4}" fill="#666" font-size="10" text-anchor="end">${Math.round((val / 100) * maxBreak)}</text>`
    ).join('');
    
    const circles1 = points1.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#e6002e" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const circles2 = points2.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#ffcc00" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const xLabels = frames.map((f, i) =>
      `<text x="${(i / divisor) * 100}" y="260" fill="#666" font-size="10" text-anchor="middle">${i + 1}</text>`
    ).join('');

    return `<svg viewBox="-10 -10 120 280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 280px; overflow: visible;">
      ${gridLines}
      ${yLabels}
      <path d="${path2}" fill="none" stroke="#ffcc00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <path d="${path1}" fill="none" stroke="#e6002e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      ${circles1}
      ${circles2}
      ${xLabels}
    </svg>`;
  }

  renderTotalPointsChart(frames, players) {
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
    const chartWidth = 100;
    const padding = 40;
    
    const divisor = frames.length > 1 ? frames.length - 1 : 1;
    
    const points1 = cumulativeScores1.map((val, i) => ({
      x: (i / divisor) * chartWidth,
      y: chartHeight - ((val / maxTotal) * (chartHeight - padding))
    }));
    
    const points2 = cumulativeScores2.map((val, i) => ({
      x: (i / divisor) * chartWidth,
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
      `<line x1="0" y1="${y * 2.4}" x2="100" y2="${y * 2.4}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" vector-effect="non-scaling-stroke"/>`
    ).join('');
    
    const yLabels = [0, 25, 50, 75, 100].map((val, i) =>
      `<text x="-2" y="${240 - (i * 60) + 4}" fill="#666" font-size="10" text-anchor="end">${Math.round((val / 100) * maxTotal)}</text>`
    ).join('');
    
    const circles1 = points1.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#e6002e" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const circles2 = points2.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#ffcc00" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const xLabels = frames.map((f, i) =>
      `<text x="${(i / divisor) * 100}" y="260" fill="#666" font-size="10" text-anchor="middle">${i + 1}</text>`
    ).join('');

    return `<svg viewBox="-10 -10 120 280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 280px; overflow: visible;">
      ${gridLines}
      ${yLabels}
      <path d="${path2}" fill="none" stroke="#ffcc00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <path d="${path1}" fill="none" stroke="#e6002e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      ${circles1}
      ${circles2}
      ${xLabels}
    </svg>`;
  }

  renderDiffChart(frames, players) {
    const diffs = frames.map(f => f.scores[0] - f.scores[1]);
    const maxDiff = Math.max(...diffs.map(Math.abs), 1);
    const chartHeight = 240;
    const chartWidth = 100;
    const barWidth = 80 / frames.length;
    const centerY = chartHeight / 2;
    
    const centerLine = `<line x1="0" y1="${centerY}" x2="100" y2="${centerY}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    
    const gridLines = [-100, -50, 50, 100].map(val => {
      const y = centerY - ((val / 100) * (centerY - 20));
      return `<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>`;
    }).join('');
    
    const yLabels = [-100, -50, 0, 50, 100].map(val => {
      const y = centerY - ((val / 100) * (centerY - 20));
      return `<text x="-2" y="${y + 3}" fill="#666" font-size="10" text-anchor="end">${Math.round((val / 100) * maxDiff)}</text>`;
    }).join('');
    
    const bars = frames.map((f, i) => {
      const diff = f.scores[0] - f.scores[1];
      const barHeight = Math.abs((diff / maxDiff) * (centerY - 20));
      const x = (i / frames.length) * 100 + (barWidth / 2);
      const isPositive = diff >= 0;
      const y = isPositive ? centerY - barHeight : centerY;
      const color = isPositive ? '#e6002e' : '#ffcc00';
      
      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="1"/>`;
    }).join('');
    
    const xLabels = frames.map((f, i) =>
      `<text x="${(i / frames.length) * 100 + barWidth}" y="260" fill="#666" font-size="10" text-anchor="middle">${i + 1}</text>`
    ).join('');

    return `<svg viewBox="-10 -10 120 280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 280px; overflow: visible;">
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
        '<button class="analysis-tab active" data-chart="scores">Scores</button>' +
        '<button class="analysis-tab" data-chart="breaks">Breaks</button>' +
        '<button class="analysis-tab" data-chart="total-points">Total Points</button>' +
        '<button class="analysis-tab" data-chart="diff">Diff</button>' +
      '</div>' +
      '<div class="chart-container">' +
        '<div class="chart-canvas" id="analysis-chart">' +
          this.renderScoresChart(completedFrames, players) +
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

  renderScoresChart(frames, players) {
    const maxScore = Math.max(...frames.flatMap(f => f.scores));
    const chartHeight = 240;
    const chartWidth = 100;
    const padding = 40;
    
    const divisor = frames.length > 1 ? frames.length - 1 : 1;
    
    const points1 = frames.map((f, i) => ({
      x: (i / divisor) * chartWidth,
      y: chartHeight - ((f.scores[0] / maxScore) * (chartHeight - padding))
    }));
    
    const points2 = frames.map((f, i) => ({
      x: (i / divisor) * chartWidth,
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
      `<line x1="0" y1="${y * 2.4}" x2="100" y2="${y * 2.4}" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" vector-effect="non-scaling-stroke"/>`
    ).join('');
    
    const yLabels = [0, 25, 50, 75, 100].map((val, i) =>
      `<text x="-2" y="${240 - (i * 60) + 4}" fill="#666" font-size="10" text-anchor="end">${Math.round((val / 100) * maxScore)}</text>`
    ).join('');
    
    const circles1 = points1.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#e6002e" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const circles2 = points2.map(p =>
      `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#ffcc00" stroke="#121212" stroke-width="1"/>`
    ).join('');
    
    const xLabels = frames.map((f, i) =>
      `<text x="${(i / divisor) * 100}" y="260" fill="#666" font-size="10" text-anchor="middle">${i + 1}</text>`
    ).join('');

    return `<svg viewBox="-10 -10 120 280" preserveAspectRatio="xMidYMid meet" style="width: 100%; height: 280px; overflow: visible;">
      ${gridLines}
      ${yLabels}
      <path d="${path2}" fill="none" stroke="#ffcc00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <path d="${path1}" fill="none" stroke="#e6002e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
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