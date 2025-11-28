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
    onMessageSent?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

function Chatbox({ groupId, groupName, token, currentUserId, onClose, onMessageSent }: ChatboxProps): ReactElement {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ✅ FIXED: Destructure addReaction from useChatConnection
    const { messages, isConnected, sendMessage, joinGroup, setMessages, addReaction, connection } = useChatConnection(token, {
        onChatListUpdate: onMessageSent
    });

    const [hasJoinedGroup, setHasJoinedGroup] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const hasLoadedHistory = useRef(false);
    const [totalGroupMembers] = useState(2); 

    // Load message history ONCE
    useEffect(() => {
        if (!hasLoadedHistory.current) {
            loadMessageHistory();
            hasLoadedHistory.current = true;
        }

        return () => {
            hasLoadedHistory.current = false;
            setHasJoinedGroup(false);
        };
    }, [groupId]);

    useEffect(() => {
        if (connection) {
            (window as any).connection = connection;
            console.log('✅ Connection exposed to window');
        }
    }, [connection]);

    // Join group when connected
    useEffect(() => {
        if (isConnected && !hasJoinedGroup) {
            console.log('✅ Connection ready, joining group', groupId);
            const timer = setTimeout(() => {
                joinGroup(groupId)
                    .then(() => {
                        console.log('✅ Successfully joined group', groupId);
                        setHasJoinedGroup(true);
                    })
                    .catch(err => {
                        console.error('❌ Failed to join group:', err);
                    });
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [isConnected, groupId, hasJoinedGroup, joinGroup]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessageHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await fetch(`${API_URL}/Message/get-messages/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const history = await response.json();
                console.log('✅ Loaded message history:', history.length);
                setMessages(history);
            } else {
                console.error('❌ Failed to load history:', response.status);
            }
        } catch (err) {
            console.error('❌ Failed to load message history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim()) {
            console.log('⚠️ Empty message, not sending');
            return;
        }

        if (!isConnected) {
            console.error('❌ Cannot send: Not connected');
            alert('Not connected to chat. Please wait...');
            return;
        }

        if (!hasJoinedGroup) {
            console.error('❌ Cannot send: Not in group yet');
            alert('Joining chat room, please wait...');
            return;
        }

        console.log('📤 BEFORE sendMessage call');
        console.log('📤 Group ID:', groupId);
        console.log('📤 Message:', messageInput);
        console.log('📤 isConnected:', isConnected);

        try {
            await sendMessage(groupId, messageInput);
            console.log('✅ AFTER sendMessage - SUCCESS');
            setMessageInput('');
            onMessageSent?.();
        } catch (err) {
            console.error('❌ AFTER sendMessage - FAILED');
            console.error('❌ Error:', err);
            console.error('❌ Error message:', (err as Error).message);
            console.error('❌ Error stack:', (err as Error).stack);
            alert('Failed to send message. Please try again.');
        }
    };

    // ✅ FIXED: Reaction handler
    const handleAddReaction = async (messageId: number, emoji: string) => {
       try {
       await addReaction(messageId, emoji);
      console.log('✅ Reaction added:', emoji, 'to message', messageId);
       } catch (err) 
       {
           console.error('❌ Failed to add reaction:', err);
           console.log('Reactions temporarily disabled');
        }
    };

    return (
        <div className="chatbox-container">
            <div className="chatbox-header">
                <h2>{groupName}</h2>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="chatbox-messages">
                {!isConnected && (
                    <div className="connection-status">
                        🔄 Connecting to chat...
                    </div>
                )}

                {isConnected && !hasJoinedGroup && (
                    <div className="connection-status">
                        📥 Joining chat room...
                    </div>
                )}

                {loadingHistory && (
                    <div className="connection-status">
                        📜 Loading messages...
                    </div>
                )}

                {/* ✅ FIXED: Show empty state */}
                {!loadingHistory && messages.length === 0 && (
                    <div className="connection-status">
                        No messages yet. Start the conversation!
                    </div>
                )}

                {/* Messages */}
                {messages.map((msg) => (
                    

                    
                    <ChatMessage
                        key={msg.id}
                        id={msg.id}
                        username={msg.username}
                        messageText={msg.messageText}
                        timestamp={msg.timestamp}
                        isOwnMessage={msg.profileId === currentUserId}
                        readBy={msg.readBy}
                        totalGroupMembers={totalGroupMembers}
                        reactions={msg.reactions}
                        currentUserId={currentUserId}
                        onAddReaction={handleAddReaction}
                    />

                ))}

                <div ref={messagesEndRef} />
            </div>

            <form className="chatbox-input" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                        !isConnected ? 'Connecting...' :
                            !hasJoinedGroup ? 'Joining room...' :
                                'Type a message...'
                    }
                    disabled={!isConnected || !hasJoinedGroup}
                />
                <button
                    type="submit"
                    disabled={!isConnected || !hasJoinedGroup || !messageInput.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default Chatbox;