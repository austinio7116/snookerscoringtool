// Data Model for Snooker Scorer Application

class DataModel {
  static BALL_VALUES = {
    red: 1,
    yellow: 2,
    green: 3,
    brown: 4,
    blue: 5,
    pink: 6,
    black: 7
  };

  static BALL_COLORS = ['red', 'yellow', 'green', 'brown', 'blue', 'pink', 'black'];

  static createMatch(player1, player2, bestOf) {
    return {
      id: this.generateId(),
      version: '1.0',
      players: [player1, player2],
      bestOf: bestOf,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      status: 'in-progress',
      currentFrame: 0,
      frames: [],
      statistics: this.createMatchStatistics()
    };
  }

  static createFrame(frameNumber) {
    return {
      number: frameNumber,
      startTime: new Date().toISOString(),
      endTime: null,
      winner: null,
      scores: [0, 0],
      breaks: [],
      currentBreak: null,
      redsRemaining: 15,
      colorsRemaining: ['yellow', 'green', 'brown', 'blue', 'pink', 'black'],
      activePlayer: 0,
      duration: 0,
      isPaused: false,
      pausedAt: null,
      totalPausedTime: 0
    };
  }

  static createBreak(playerIndex) {
    return {
      player: playerIndex,
      startTime: new Date().toISOString(),
      endTime: null,
      points: 0,
      shots: [],
      balls: [],
      highestBreak: false
    };
  }

  static createShot(ball, potted, attributes = {}) {
    return {
      timestamp: new Date().toISOString(),
      ball: ball,
      potted: potted,
      points: potted ? DataModel.BALL_VALUES[ball] : 0,
      usedRest: attributes.usedRest || false,
      isSafety: attributes.isSafety || false,
      isEscape: attributes.isEscape || false,
      isFoul: attributes.isFoul || false,
      foulPoints: attributes.foulPoints || 0,
      duration: attributes.duration || 0
    };
  }

  static createMatchStatistics() {
    return {
      player1: this.createPlayerStatistics(),
      player2: this.createPlayerStatistics()
    };
  }

  static createPlayerStatistics() {
    return {
      framesWon: 0,
      totalPoints: 0,
      highBreak: 0,
      breaks: {
        total: 0,
        over20: 0,
        over30: 0,
        over40: 0,
        over50: 0,
        over60: 0,
        over70: 0,
        over80: 0,
        over90: 0,
        over100: 0,
        century: 0
      },
      shots: {
        total: 0,
        potted: 0,
        missed: 0
      },
      restShots: {
        attempted: 0,
        successful: 0
      },
      safeties: {
        attempted: 0,
        successful: 0
      },
      escapes: {
        attempted: 0,
        successful: 0
      },
      fouls: 0,
      totalShotTime: 0,
      visits: 0,
      ballStats: {}
    };
  }

  static generateId() {
    return 'match_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  static getNextBall(frame) {
    // Determine which ball should be potted next
    if (frame.redsRemaining > 0) {
      // If reds remain, next ball must be red
      if (frame.currentBreak && frame.currentBreak.shots.length > 0) {
        const lastShot = frame.currentBreak.shots[frame.currentBreak.shots.length - 1];
        if (lastShot.ball === 'red' && lastShot.potted) {
          // After potting red, can pot any color
          return frame.colorsRemaining;
        }
      }
      return ['red'];
    } else {
      // All reds gone - check if we just potted the last red
      if (frame.currentBreak && frame.currentBreak.shots.length > 0) {
        const lastShot = frame.currentBreak.shots[frame.currentBreak.shots.length - 1];
        if (lastShot.ball === 'red' && lastShot.potted) {
          // Just potted the last red, can pot any color
          return frame.colorsRemaining;
        }
      }
      // Otherwise, pot colors in order
      return frame.colorsRemaining.length > 0 ? [frame.colorsRemaining[0]] : [];
    }
  }

  static updateTableState(frame, ball, potted) {
    if (!potted) return;

    if (ball === 'red') {
      frame.redsRemaining = Math.max(0, frame.redsRemaining - 1);
    } else {
      // Only remove colors permanently when all reds are gone AND we're in the clearance phase
      // Check if this was potted after the last red was already cleared
      if (frame.redsRemaining === 0) {
        // Check if the previous shot was also a color (meaning we're in clearance)
        let inClearance = true;
        if (frame.currentBreak && frame.currentBreak.shots.length > 0) {
          const lastShot = frame.currentBreak.shots[frame.currentBreak.shots.length - 1];
          // If last shot was red, this color goes back on the table
          if (lastShot.ball === 'red') {
            inClearance = false;
          }
        }
        
        if (inClearance) {
          // Remove color permanently during clearance phase
          const colorIndex = frame.colorsRemaining.indexOf(ball);
          if (colorIndex !== -1) {
            frame.colorsRemaining.splice(colorIndex, 1);
          }
        }
      }
      // If reds remain, colors return to table (no removal needed)
    }
  }

  static isFrameComplete(frame) {
    return frame.redsRemaining === 0 && frame.colorsRemaining.length === 0;
  }

  static calculateFrameWinner(frame) {
    if (frame.scores[0] > frame.scores[1]) {
      return 0;
    } else if (frame.scores[1] > frame.scores[0]) {
      return 1;
    }
    return null; // Draw (shouldn't happen in snooker)
  }

  static isMatchComplete(match) {
    const framesNeeded = Math.ceil(match.bestOf / 2);
    const player1Frames = match.frames.filter(f => f.winner === 0).length;
    const player2Frames = match.frames.filter(f => f.winner === 1).length;
    return player1Frames >= framesNeeded || player2Frames >= framesNeeded;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataModel;
}