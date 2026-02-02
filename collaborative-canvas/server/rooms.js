// User Management
const users = new Map(); // socketId -> { id, color, username, cursor: {x,y} }

/**
 * Add a user to the room
 */
function addUser(socketId, user) {
  users.set(socketId, {
    id: socketId,
    itemColor: user.color || '#000000',
    username: user.username || `User ${socketId.substr(0, 4)}`,
    cursor: { x: 0, y: 0 }
  });
  return users.get(socketId);
}

/**
 * Remove a user
 */
function removeUser(socketId) {
  const user = users.get(socketId);
  users.delete(socketId);
  return user;
}

/**
 * Update user cursor
 */
function updateCursor(socketId, x, y) {
  const user = users.get(socketId);
  if (user) {
    user.cursor = { x, y };
  }
  return user;
}

/**
 * Get all users
 */
function getUsers() {
  return Array.from(users.values());
}

module.exports = {
  addUser,
  removeUser,
  updateCursor,
  getUsers
};
