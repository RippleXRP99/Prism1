// Shared UI components and utilities
// This module will provide common UI components for frontend applications

const ui = {
  // Component templates (can be used with any frontend framework)
  components: {
    // Loading spinner
    spinner: {
      html: `
        <div class="prism-spinner">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      `,
      css: `
        .prism-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
        }
        .spinner-border {
          width: 2rem;
          height: 2rem;
          border: 0.25em solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: prism-spin 0.75s linear infinite;
        }
        @keyframes prism-spin {
          to { transform: rotate(360deg); }
        }
      `
    },

    // Button styles
    button: {
      primary: 'btn btn-primary',
      secondary: 'btn btn-secondary',
      success: 'btn btn-success',
      danger: 'btn btn-danger',
      css: `
        .btn {
          display: inline-block;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }
        .btn-primary { background: #007bff; color: white; }
        .btn-primary:hover { background: #0056b3; }
        .btn-secondary { background: #6c757d; color: white; }
        .btn-secondary:hover { background: #545b62; }
        .btn-success { background: #28a745; color: white; }
        .btn-success:hover { background: #1e7e34; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-danger:hover { background: #c82333; }
      `
    },

    // Card component
    card: {
      template: (title, content, footer = '') => `
        <div class="prism-card">
          <div class="card-header">
            <h3>${title}</h3>
          </div>
          <div class="card-body">
            ${content}
          </div>
          ${footer ? `<div class="card-footer">${footer}</div>` : ''}
        </div>
      `,
      css: `
        .prism-card {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .card-header {
          padding: 1rem;
          background: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
        }
        .card-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }
        .card-body {
          padding: 1rem;
        }
        .card-footer {
          padding: 1rem;
          background: #f8f9fa;
          border-top: 1px solid #dee2e6;
        }
      `
    }
  },

  // Common CSS utilities
  styles: {
    // Base styles
    base: `
      * {
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -0.5rem;
      }
      .col {
        flex: 1;
        padding: 0 0.5rem;
      }
    `,

    // Utility classes
    utilities: `
      .text-center { text-align: center; }
      .text-left { text-align: left; }
      .text-right { text-align: right; }
      .d-none { display: none; }
      .d-block { display: block; }
      .d-flex { display: flex; }
      .justify-center { justify-content: center; }
      .align-center { align-items: center; }
      .mt-1 { margin-top: 0.5rem; }
      .mt-2 { margin-top: 1rem; }
      .mt-3 { margin-top: 1.5rem; }
      .mb-1 { margin-bottom: 0.5rem; }
      .mb-2 { margin-bottom: 1rem; }
      .mb-3 { margin-bottom: 1.5rem; }
      .p-1 { padding: 0.5rem; }
      .p-2 { padding: 1rem; }
      .p-3 { padding: 1.5rem; }
    `,

    // Theme colors
    theme: {
      primary: '#007bff',
      secondary: '#6c757d',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
      light: '#f8f9fa',
      dark: '#343a40'
    }
  },

  // JavaScript utilities for frontend
  scripts: {
    // Simple state management
    createStore: (initialState = {}) => {
      let state = { ...initialState };
      const listeners = [];

      return {
        getState: () => ({ ...state }),
        setState: (newState) => {
          state = { ...state, ...newState };
          listeners.forEach(listener => listener(state));
        },
        subscribe: (listener) => {
          listeners.push(listener);
          return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
          };
        }
      };
    },

    // Simple HTTP client
    http: {
      get: async (url, options = {}) => {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        return response.json();
      },

      post: async (url, data, options = {}) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: JSON.stringify(data)
        });
        return response.json();
      },

      put: async (url, data, options = {}) => {
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          body: JSON.stringify(data)
        });
        return response.json();
      },

      delete: async (url, options = {}) => {
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          }
        });
        return response.json();
      }
    }
  }
};

module.exports = ui;
