// Statistics Calculation Engine for Snooker Scorer

class StatisticsEngine {
  static calculateMatchStatistics(match) {
    const stats = {
      player1: DataModel.createPlayerStatistics(),
      player2: DataModel.createPlayerStatistics()
    };

    match.frames.forEach(frame => {
      this.processFrameStatistics(frame, stats);
    });

    return stats;
  }

  static processFrameStatistics(frame, stats) {
    // Update frame wins
    if (frame.winner !== null) {
      const winnerKey = frame.winner === 0 ? 'player1' : 'player2';
      stats[winnerKey].framesWon++;
    }

    // Add frame scores to total points (includes foul points awarded)
    stats.player1.totalPoints += frame.scores[0];
    stats.player2.totalPoints += frame.scores[1];

    // Process all breaks in the frame
    frame.breaks.forEach(breakData => {
      const playerKey = breakData.player === 0 ? 'player1' : 'player2';
      const playerStats = stats[playerKey];

      // Update break statistics
      if (breakData.points > 0) {
        playerStats.breaks.total++;
        
        if (breakData.points > playerStats.highBreak) {
          playerStats.highBreak = breakData.points;
        }

        // Break building counts
        if (breakData.points >= 10) playerStats.breaks.over10++;
        if (breakData.points >= 20) playerStats.breaks.over20++;
        if (breakData.points >= 30) playerStats.breaks.over30++;
        if (breakData.points >= 40) playerStats.breaks.over40++;
        if (breakData.points >= 50) playerStats.breaks.over50++;
        if (breakData.points >= 60) playerStats.breaks.over60++;
        if (breakData.points >= 70) playerStats.breaks.over70++;
        if (breakData.points >= 80) playerStats.breaks.over80++;
        if (breakData.points >= 90) playerStats.breaks.over90++;
        if (breakData.points >= 100) {
          playerStats.breaks.over100++;
          playerStats.breaks.century++;
        }
      }

      // Count visits (breaks with at least one shot)
      if (breakData.shots.length > 0) {
        playerStats.visits++;
      }

      // Process individual shots
      breakData.shots.forEach(shot => {
        this.processShotStatistics(shot, playerStats);
      });
    });
  }

  static processShotStatistics(shot, playerStats) {
    // Only count pot attempts (not safeties) in pot percentage statistics
    if (!shot.isSafety) {
      playerStats.shots.total++;
      
      if (shot.potted) {
        playerStats.shots.potted++;
      } else {
        playerStats.shots.missed++;
      }
    }

    // Rest shot statistics
    if (shot.usedRest) {
      playerStats.restShots.attempted++;
      if (shot.potted) {
        playerStats.restShots.successful++;
      }
    }

    // Safety statistics
    if (shot.isSafety) {
      playerStats.safeties.attempted++;
      // Safety is successful if opponent doesn't score on next visit
      // This would need to be calculated in context of the next break
      // For now, we'll mark it as successful if the shot was missed (intended)
      if (!shot.potted) {
        playerStats.safeties.successful++;
      }
    }

    // Escape statistics
    if (shot.isEscape) {
      playerStats.escapes.attempted++;
      if (shot.potted) {
        playerStats.escapes.successful++;
      }
    }

    // Foul statistics
    if (shot.isFoul) {
      playerStats.fouls++;
    }

    // Shot time
    if (shot.duration > 0) {
      playerStats.totalShotTime += shot.duration;
    }

    // Ball-specific statistics
    if (!playerStats.ballStats[shot.ball]) {
      playerStats.ballStats[shot.ball] = {
        attempted: 0,
        potted: 0
      };
    }
    playerStats.ballStats[shot.ball].attempted++;
    if (shot.potted) {
      playerStats.ballStats[shot.ball].potted++;
    }
  }

  static calculatePotPercentage(stats) {
    if (stats.shots.total === 0) return 0;
    return ((stats.shots.potted / stats.shots.total) * 100).toFixed(1);
  }

  static calculateBallPotPercentage(ballStats) {
    if (!ballStats || ballStats.attempted === 0) return 0;
    return ((ballStats.potted / ballStats.attempted) * 100).toFixed(1);
  }

  static calculateRestPotPercentage(stats) {
    if (stats.restShots.attempted === 0) return 0;
    return ((stats.restShots.successful / stats.restShots.attempted) * 100).toFixed(1);
  }

  static calculateSafetySuccessRate(stats) {
    if (stats.safeties.attempted === 0) return 0;
    return ((stats.safeties.successful / stats.safeties.attempted) * 100).toFixed(1);
  }

  static calculateEscapeSuccessRate(stats) {
    if (stats.escapes.attempted === 0) return 0;
    return ((stats.escapes.successful / stats.escapes.attempted) * 100).toFixed(1);
  }

  static calculateAverageShotTime(stats) {
    if (stats.shots.total === 0) return 0;
    return (stats.totalShotTime / stats.shots.total / 1000).toFixed(1); // Convert to seconds
  }

  static calculatePointsPerVisit(stats) {
    if (stats.visits === 0) return 0;
    return (stats.totalPoints / stats.visits).toFixed(1);
  }

  static getFrameStatistics(frame) {
    const frameStats = {
      player1: DataModel.createPlayerStatistics(),
      player2: DataModel.createPlayerStatistics()
    };

    this.processFrameStatistics(frame, frameStats);

    return {
      player1: this.formatPlayerStatistics(frameStats.player1),
      player2: this.formatPlayerStatistics(frameStats.player2)
    };
  }

  static formatPlayerStatistics(stats) {
    return {
      framesWon: stats.framesWon,
      totalPoints: stats.totalPoints,
      highBreak: stats.highBreak,
      breaks: stats.breaks,
      potPercentage: this.calculatePotPercentage(stats),
      restPotPercentage: this.calculateRestPotPercentage(stats),
      safetySuccessRate: this.calculateSafetySuccessRate(stats),
      escapeSuccessRate: this.calculateEscapeSuccessRate(stats),
      averageShotTime: this.calculateAverageShotTime(stats),
      pointsPerVisit: this.calculatePointsPerVisit(stats),
      fouls: stats.fouls,
      shots: stats.shots,
      ballStats: this.formatBallStats(stats.ballStats)
    };
  }

  static formatBallStats(ballStats) {
    const formatted = {};
    for (const ball in ballStats) {
      formatted[ball] = {
        attempted: ballStats[ball].attempted,
        potted: ballStats[ball].potted,
        percentage: this.calculateBallPotPercentage(ballStats[ball])
      };
    }
    return formatted;
  }

  static getAllBreaks(match) {
    const allBreaks = [];
    
    match.frames.forEach((frame, frameIndex) => {
      frame.breaks.forEach(breakData => {
        if (breakData.points > 0) {
          allBreaks.push({
            frameNumber: frameIndex + 1,
            player: breakData.player,
            points: breakData.points,
            balls: breakData.balls,
            shots: breakData.shots,  // Include shots array for free ball detection
            timestamp: breakData.startTime
          });
        }
      });
    });

    // Sort by points descending
    allBreaks.sort((a, b) => b.points - a.points);
    
    return allBreaks;
  }

  static getHighBreak(match, playerIndex = null) {
    const breaks = this.getAllBreaks(match);
    
    if (playerIndex !== null) {
      const playerBreaks = breaks.filter(b => b.player === playerIndex);
      return playerBreaks.length > 0 ? playerBreaks[0] : null;
    }
    
    return breaks.length > 0 ? breaks[0] : null;
  }

  static getFrameSummary(frame) {
    return {
      number: frame.number,
      winner: frame.winner,
      scores: frame.scores,
      duration: frame.duration,
      breakCount: frame.breaks.length,
      highBreak: Math.max(...frame.breaks.map(b => b.points), 0)
    };
  }

  static getMatchSummary(match) {
    const stats = this.calculateMatchStatistics(match);
    
    return {
      players: match.players,
      bestOf: match.bestOf,
      framesPlayed: match.frames.length,
      currentScore: [
        match.frames.filter(f => f.winner === 0).length,
        match.frames.filter(f => f.winner === 1).length
      ],
      player1Stats: this.formatPlayerStatistics(stats.player1),
      player2Stats: this.formatPlayerStatistics(stats.player2),
      allBreaks: this.getAllBreaks(match),
      status: match.status
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StatisticsEngine;
}