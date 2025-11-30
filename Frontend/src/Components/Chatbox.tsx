import '../Styles/Chatbox.css';
import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import ChatMessage from './ChatMessage';

interface ChatboxProps {
    groupId: number;
    groupName: string;
    token: string;
    currentUserId: string;
    onClose: () => void;
    onMessageSent?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

function Chatbox({groupId} : {groupId : number}): ReactElement {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    //const { messages, isConnected, sendMessage, joinGroup, setMessages } = useChatConnection(token);


    const loadMessageHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/api/Message/get-messages/${groupId}`, {
                headers: {
                     'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });
            if (response.ok) {
                const history = await response.json();
                // setMessages(history);
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
        if (messageInput.trim()) {
            // await sendMessage(groupId, messageInput);
            setMessageInput('');
        }
    };

    return (
        <div className="chatbox-container">
            <div className="chatbox-header">
                <h2>placeholder</h2>
                <button className="close-btn" onClick={() => null}>×</button>
            </div>

            <div className="chatbox-messages">
                {!true && <div className="connection-status">Connecting...</div>}
                {/* {messages.map((msg) => (
                    <ChatMessage/>
                ))} */}
                <div ref={messagesEndRef} />
            </div>

            <form className="chatbox-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={false}
                />
                <button type="submit" disabled={false}>
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chatbox;