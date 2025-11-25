import '../Styles/Chatbox.css';
import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import ChatMessage from './ChatMessage';
import { useChatConnection } from '../hooks/useChatConnection';

interface ChatboxProps {
    groupId: number;
    groupName: string;
    token: string;
    currentUserId: string;
    onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

function Chatbox({ groupId, groupName, token, currentUserId, onClose }: ChatboxProps): ReactElement {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages, isConnected, sendMessage, joinGroup, setMessages } = useChatConnection(token);

    useEffect(() => {
        if (isConnected) {
            joinGroup(groupId);
            loadMessageHistory();
        }
    }, [isConnected, groupId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessageHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/api/Message/get-messages/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const history = await response.json();
                setMessages(history);
            }
        } catch (err) {
            console.error('Failed to load message history:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim() && isConnected) {
            await sendMessage(groupId, messageInput);
            setMessageInput('');
        }
    };

    return (
        <div className="chatbox-container">
            <div className="chatbox-header">
                <h2>{groupName}</h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="chatbox-messages">
                {!isConnected && <div className="connection-status">Connecting...</div>}
                {messages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        username={msg.username}
                        messageText={msg.messageText}
                        timestamp={msg.timestamp}
                        isOwnMessage={msg.profileId === currentUserId}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className="chatbox-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!isConnected}
                />
                <button type="submit" disabled={!isConnected || !messageInput.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chatbox;