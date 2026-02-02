# Collaborative Drawing App

A real-time multi-user drawing application built with React, Node.js, and WebSockets.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1.  **Install Dependencies**:
    ```bash
    # Root directory (optional if we had a root package.json)
    
    # Server
    cd server
    npm install
    
    # Client
    cd ../client
    npm install
    ```

### Running the Application

1.  **Start the Server**:
    Open a terminal:
    ```bash
    cd server
    npm run dev
    ```
    Server runs on `http://localhost:3001`

2.  **Start the Client**:
    Open another terminal:
    ```bash
    cd client
    npm run dev
    ```
    Client runs on `http://localhost:5173` (or similar)

## How to Test

1.  Open `http://localhost:5173` in Browser Tab A.
2.  Open `http://localhost:5173` in Browser Tab B.
3.  Draw in Tab A -> See it inside Tab B.
4.  User cursors show the position of other users.
5.  Click "Undo" in Tab A -> The last stroke (even if made by B) disappears.

## Known Limitations

- **Network Latency**: Drawing might feel slightly delayed on other clients depending on network speed, though local drawing is instant (optimistic UI).
- **Scale**: The "Redraw everything on Undo" strategy works well for hundreds of strokes but might slow down with thousands.
- **Mobile**: Touch events are mapped to mouse events but multi-touch gestures aren't fully optimized.

## Time Spent

- Planning: 30 mins
- Backend: ~ (Ongoing)
- Frontend: ~ (Ongoing)
