// scripts/state_manager.js

class StateManager extends EventTarget {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      currentPage: null,
    };
  }

  getState(key) {
    return this.state[key];
  }

  setState(key, value) {
    if (this.state.hasOwnProperty(key) && this.state[key] !== value) {
      this.state[key] = value;
      // Dispatch a custom event whenever the state changes
      this.dispatchEvent(
        new CustomEvent("state-change", {
          detail: { key, value },
        })
      );
    }
  }
}

export const appState = new StateManager();
