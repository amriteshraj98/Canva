import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { User } from '../types/index';

export const CursorOverlay: React.FC = () => {
    const [cursors, setCursors] = useState<{ [userId: string]: { x: number, y: number } }>({});
    const [users, setUsers] = useState<{ [userId: string]: User }>({});

    useEffect(() => {
        socket.on('cursor_update', ({ userId, x, y }) => {
            setCursors(prev => ({ ...prev, [userId]: { x, y } }));
        });

        socket.on('room_joined', ({ users: roomUsers }) => {
            const usersMap: any = {};
            roomUsers.forEach((u: User) => usersMap[u.id] = u);
            setUsers(usersMap);
        });

        socket.on('user_joined', (user) => {
            setUsers(prev => ({ ...prev, [user.id]: user }));
        });

        socket.on('user_left', ({ userId }) => {
            setUsers(prev => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
            setCursors(prev => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
        });

        return () => {
            socket.off('cursor_update');
            socket.off('room_joined');
            socket.off('user_joined');
            socket.off('user_left');
        };
    }, []);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%', overflow: 'hidden' }}>
            {Object.entries(cursors).map(([userId, pos]) => (
                <div
                    key={userId}
                    style={{
                        position: 'absolute',
                        left: pos.x,
                        top: pos.y,
                        transform: 'translate(-50%, -50%)',
                        transition: 'top 0.1s linear, left 0.1s linear' // Smooth movement
                    }}
                >
                    <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: users[userId]?.itemColor || 'red'
                    }} />
                    <span style={{ fontSize: 12, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: 4 }}>
                        {users[userId]?.username || userId.substr(0, 4)}
                    </span>
                </div>
            ))}
        </div>
    );
};
