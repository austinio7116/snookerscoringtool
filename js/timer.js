// Timer Management for Snooker Scorer

class TimerManager {
  constructor() {
    this.frameStartTime = null;
    this.shotStartTime = null;
    this.pausedTime = 0;
    this.isPaused = false;
    this.pauseStartTime = null;
    this.intervalId = null;
    this.callbacks = {
      onTick: null,
      onShotComplete: null
    };
  }

  startFrame() {
    this.frameStartTime = Date.now();
    this.pausedTime = 0;
    this.isPaused = false;
    this.pauseStartTime = null;
    this.startTicking();
  }

  startShot() {
    if (!this.isPaused) {
      this.shotStartTime = Date.now();
    }
  }

  endShot() {
    if (this.shotStartTime && !this.isPaused) {
      const duration = Date.now() - this.shotStartTime;
      this.shotStartTime = null;
      
      if (this.callbacks.onShotComplete) {
        this.callbacks.onShotComplete(duration);
      }
      
      return duration;
    }
    return 0;
  }

  pauseFrame() {
    if (!this.isPaused && this.frameStartTime) {
      this.isPaused = true;
      this.pauseStartTime = Date.now();
      this.stopTicking();
    }
  }

  resumeFrame() {
    if (this.isPaused) {
      // Add paused time if we have a pause start time
      if (this.pauseStartTime) {
        this.pausedTime += Date.now() - this.pauseStartTime;
      }
      
      this.isPaused = false;
      this.pauseStartTime = null;
      
      // Restart shot timer if there was one
      if (this.shotStartTime) {
        this.shotStartTime = Date.now();
      }
      
      this.startTicking();
    }
  }

  getFrameDuration() {
    if (!this.frameStartTime) return 0;
    
    let elapsed = Date.now() - this.frameStartTime - this.pausedTime;
    
    if (this.isPaused && this.pauseStartTime) {
      elapsed -= (Date.now() - this.pauseStartTime);
    }
    
    return Math.max(0, elapsed);
  }

  getShotDuration() {
    if (!this.shotStartTime || this.isPaused) return 0;
    return Date.now() - this.shotStartTime;
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  startTicking() {
    this.stopTicking();
    this.intervalId = setInterval(() => {
      if (this.callbacks.onTick && !this.isPaused) {
        this.callbacks.onTick(this.getFrameDuration());
      }
    }, 100); // Update every 100ms for smooth display
  }

  stopTicking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  endFrame() {
    const duration = this.getFrameDuration();
    this.stopTicking();
    this.frameStartTime = null;
    this.shotStartTime = null;
    this.pausedTime = 0;
    this.isPaused = false;
    this.pauseStartTime = null;
    return duration;
  }

  reset() {
    this.stopTicking();
    this.frameStartTime = null;
    this.shotStartTime = null;
    this.pausedTime = 0;
    this.isPaused = false;
    this.pauseStartTime = null;
  }

  onTick(callback) {
    this.callbacks.onTick = callback;
  }

  onShotComplete(callback) {
    this.callbacks.onShotComplete = callback;
  }

  getState() {
    return {
      frameStartTime: this.frameStartTime,
      shotStartTime: this.shotStartTime,
      pausedTime: this.pausedTime,
      isPaused: this.isPaused,
      pauseStartTime: this.pauseStartTime,
      frameDuration: this.getFrameDuration(),
      shotDuration: this.getShotDuration()
    };
  }

  restoreState(state) {
    this.frameStartTime = state.frameStartTime;
    this.shotStartTime = state.shotStartTime;
    this.pausedTime = state.pausedTime;
    this.isPaused = state.isPaused;
    this.pauseStartTime = state.pauseStartTime;
    
    if (this.frameStartTime && !this.isPaused) {
      this.startTicking();
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimerManager;
}