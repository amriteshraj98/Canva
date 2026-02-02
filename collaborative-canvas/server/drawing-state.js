const { v4: uuidv4 } = require('uuid');

// Global State
// In a real production app, this would be in Redis or a DB.
const history = []; // Array of stroke objects
const redoStack = []; // Array of strokes for redo

/**
 * Add a new stroke to history
 * @param {Object} stroke 
 */
function addStroke(stroke) {
  history.push(stroke);
  // Clear redo stack on new action
  redoStack.length = 0;
  return history;
}

/**
 * Undo the last action
 */
function undo() {
  if (history.length === 0) return null;
  const stroke = history.pop();
  redoStack.push(stroke);
  return history;
}

/**
 * Redo the last undone action
 */
function redo() {
  if (redoStack.length === 0) return null;
  const stroke = redoStack.pop();
  history.push(stroke);
  return history;
}

/**
 * Get current state
 */
function getState() {
  return { history, redoStack };
}

module.exports = {
  addStroke,
  undo,
  redo,
  getState
};
