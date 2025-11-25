import {type ReactElement, useEffect, useState} from "react";
import '../Styles/ChatList.css';

interface ChatListProps {
    token: string;
    onSelectChat: (groupId: number, groupName: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

interface LastMessage {
    timestamp: string;   // ISO date
    username: string;    // who sent the last message
    messageText: string; // text content
}

interface GroupInfo {
    id: number;
    groupName: string;
    lastMessage?: LastMessage | null;
}



function ChatList({ token, onSelectChat }: ChatListProps): ReactElement {
    const [groups, setGroups] = useState<GroupInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadGroups();
    }, [token]);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/Message/get-user-groups`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGroups(data);
            } else {
                setError('Failed to load conversations');
            }
        } catch (err) {
            setError('Error loading conversations');
            console.error('Error loading groups:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 168) { // Less than a week
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    if (loading) {
        return (
            <div className="chat-list-container">
                <div className="chat-list-header">
                    <h2>Messages</h2>
                </div>
                <div className="chat-list-loading">Loading conversations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="chat-list-container">
                <div className="chat-list-header">
                    <h2>Messages</h2>
                </div>
                <div className="chat-list-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="chat-list-container">
            <div className="chat-list-header">
                <h2>Messages</h2>
                <button className="refresh-btn" onClick={loadGroups}>
                    ↻
                </button>
            </div>

            {groups.length === 0 ? (
                <div className="chat-list-empty">
                    <p>No conversations yet</p>
                    <p className="empty-subtitle">Start matching to begin chatting!</p>
                </div>
            ) : (
                <div className="chat-list-items">
                    {groups.map((group) => (
                        <div
                            key={group.id}
                            className="chat-list-item"
                            onClick={() => onSelectChat(group.id, group.groupName)}
                        >
                            <div className="chat-item-avatar">
                                {group.groupName.charAt(0).toUpperCase()}
                            </div>
                            <div className="chat-item-content">
                                <div className="chat-item-header">
                                    <h3>{group.groupName}</h3>
                                    {group.lastMessage && (
                                        <span className="chat-item-time">
                                            {formatTime(group.lastMessage.timestamp)}
                                        </span>
                                    )}
                                </div>
                                {group.lastMessage ? (
                                    <p className="chat-item-preview">
                                        <span className="preview-username">
                                            {group.lastMessage.username}:
                                        </span>
                                        {' '}
                                        {group.lastMessage.messageText}
                                    </p>
                                ) : (
                                    <p className="chat-item-preview no-messages">
                                        No messages yet
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ChatList;