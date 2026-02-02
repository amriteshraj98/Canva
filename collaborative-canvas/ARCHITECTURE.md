# Architecture - Collaborative Drawing App

## Data Flow Diagram

```mermaid
graph TD
    UserA[User A (Client)] -->|Draw Event| Server
    UserB[User B (Client)] -->|Draw Event| Server
    Server -->|Broadcast Draw| UserA
    Server -->|Broadcast Draw| UserB
    
    UserA -->|Undo Event| Server
    Server -->|Update History| DB[(In-Memory State)]
    Server -->|Broadcast Full Sync| UserA
    Server -->|Broadcast Full Sync| UserB
```

1.  **Draw Action**: User interacts with Canvas -> Local Draw (Optimistic) -> Emit `draw_point` -> Server -> Broadcast `draw_point` -> Other Users Render.
2.  **Undo/Redo**: User clicks Undo -> Emit `undo` -> Server Updates History -> Broadcast `sync_state` (History) -> Clients Re-render Canvas.

## WebSocket Protocol

### Client -> Server
- `join_room`: `{ roomId, username }`
- `draw_start`: `{ x, y, color, width }`
- `draw_point`: `{ x, y }` (Sent frequently)
- `draw_end`: `{}`
- `undo`: `{}`
- `redo`: `{}`
- `cursor_move`: `{ x, y }`

### Server -> Client
- `room_joined`: `{ users, history }`
- `user_joined`: `{ userId, username, color }`
- `user_left`: `{ userId }`
- `draw_started`: `{ userId, x, y, color, width }`
- `draw_point`: `{ userId, x, y }`
- `draw_ended`: `{ userId }`
- `history_sync`: `{ history, redoStack }` (Sent on undo/redo/join)
- `cursor_update`: `{ userId, x, y }`

## Undo/Redo Strategy

We implement **Global Undo/Redo**. 
- The Server maintains a central linear `history` array of strokes.
- When any user draws, the stroke is pushed to `history`. The `redoStack` is cleared.
- When *any* user triggers Undo, the server pops the *last* action from `history` into `redoStack`.
- **Conflict Resolution**: The server is the single source of truth. If multiple users try to undo at the exact same moment, the server processes them sequentially. "Last write wins" logic applies naturally to the linear history.

## Performance Decisions

1.  **Canvas Redraws**: We use the native Canvas 2D API. On high-frequency events (like `draw_point`), we simply `lineTo()` and `stroke()` on the existing context without clearing.
2.  **History Replay**: On Undo/Redo, we must clear and redraw the entire canvas. To optimize this, we *could* cache the canvas as an image, but for this prototype, we will re-execute drawing commands from the `history` array.
3.  **Event Batching**: Mouse events fire very rapidly. We send `draw_point` events directly for smoothness, but relying on TCP/WebSocket's inherent buffering. A production version might batch these every 16ms (60fps).

## Conflict Resolution

- **Simultaneous Drawing**: Allowed. The canvas is additive. Two lines drawn at the same time will simply appear together.
- **Race methodology**: We do not use CRDTs (too complex for this scope). We use a central server Authority. The order in which the server receives packets determines the final state.

