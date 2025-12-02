// LocalStorage Management for Snooker Scorer

class StorageManager {
  static KEYS = {
    CURRENT_MATCH: 'snooker_current_match',
    MATCH_HISTORY: 'snooker_match_history',
    SETTINGS: 'snooker_settings'
  };

  static saveCurrentMatch(match) {
    try {
      match.updated = new Date().toISOString();
      localStorage.setItem(this.KEYS.CURRENT_MATCH, JSON.stringify(match));
      return true;
    } catch (error) {
      console.error('Error saving current match:', error);
      return false;
    }
  }

  static loadCurrentMatch() {
    try {
      const data = localStorage.getItem(this.KEYS.CURRENT_MATCH);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading current match:', error);
      return null;
    }
  }

  static clearCurrentMatch() {
    try {
      localStorage.removeItem(this.KEYS.CURRENT_MATCH);
      return true;
    } catch (error) {
      console.error('Error clearing current match:', error);
      return false;
    }
  }

  static saveToHistory(match) {
    try {
      const history = this.loadMatchHistory();
      
      // Check if match already exists in history
      const existingIndex = history.findIndex(m => m.id === match.id);
      
      if (existingIndex !== -1) {
        // Update existing match
        history[existingIndex] = match;
      } else {
        // Add new match to history
        history.unshift(match);
      }

      // Keep only last 50 matches
      if (history.length > 50) {
        history.splice(50);
      }

      localStorage.setItem(this.KEYS.MATCH_HISTORY, JSON.stringify(history));
      return true;
    } catch (error) {
      console.error('Error saving to match history:', error);
      return false;
    }
  }

  static loadMatchHistory() {
    try {
      const data = localStorage.getItem(this.KEYS.MATCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading match history:', error);
      return [];
    }
  }

  static deleteFromHistory(matchId) {
    try {
      const history = this.loadMatchHistory();
      const filtered = history.filter(m => m.id !== matchId);
      localStorage.setItem(this.KEYS.MATCH_HISTORY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting from history:', error);
      return false;
    }
  }

  static loadMatchById(matchId) {
    try {
      const history = this.loadMatchHistory();
      return history.find(m => m.id === matchId) || null;
    } catch (error) {
      console.error('Error loading match by ID:', error);
      return null;
    }
  }

  static exportMatch(match) {
    try {
      const dataStr = JSON.stringify(match, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `snooker_match_${match.id}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting match:', error);
      return false;
    }
  }

  static importMatch(fileContent) {
    try {
      const match = JSON.parse(fileContent);
      
      // Validate match structure
      if (!match.id || !match.players || !match.frames) {
        throw new Error('Invalid match data structure');
      }

      return match;
    } catch (error) {
      console.error('Error importing match:', error);
      return null;
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  }

  static loadSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : this.getDefaultSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  static getDefaultSettings() {
    return {
      autoSave: true,
      confirmActions: true,
      theme: 'default'
    };
  }

  static clearAllData() {
    try {
      Object.values(this.KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  static getStorageSize() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('snooker_')) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}