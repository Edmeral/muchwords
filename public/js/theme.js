(function() {
  'use strict';

  var Theme = {
    // Get the effective theme based on preference
    getEffectiveTheme: function(preference) {
      if (preference === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return preference;
    },

    // Apply theme class to body
    apply: function(theme) {
      if (theme === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    },

    // Initialize theme from preference
    init: function(preference) {
      var effectiveTheme = this.getEffectiveTheme(preference || 'system');
      this.apply(effectiveTheme);

      // Listen for system preference changes
      if (preference === 'system') {
        this.listenToSystemChanges();
      }
    },

    // Listen to system preference changes
    listenToSystemChanges: function() {
      var self = this;
      var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Use the correct event listener method
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', function(e) {
          if (window.userThemePreference === 'system') {
            self.apply(e.matches ? 'dark' : 'light');
          }
        });
      } else if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(function(e) {
          if (window.userThemePreference === 'system') {
            self.apply(e.matches ? 'dark' : 'light');
          }
        });
      }
    },

    // Update theme locally (for live preview)
    update: function(newTheme) {
      window.userThemePreference = newTheme;
      var effectiveTheme = this.getEffectiveTheme(newTheme);
      this.apply(effectiveTheme);

      // Listen for system changes if set to system
      if (newTheme === 'system') {
        this.listenToSystemChanges();
      }
    }
  };

  // Expose to global scope
  window.Theme = Theme;
})();
