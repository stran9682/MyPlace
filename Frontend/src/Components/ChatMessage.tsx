import '../Styles/ChatMessage.css';
import type { ReactElement } from 'react';
import MessageReactions from './MessageReactions';
import type { Reaction } from '../hooks/useChatConnection';

interface ChatMessageProps {
    id: number; // ✅ ADD message ID
    username: string;
    messageText: string;
    timestamp: string;
    isOwnMessage: boolean;
    readBy?: string[];
    totalGroupMembers?: number;
    reactions?: Reaction[]; // ✅ ADD reactions
    currentUserId: string; // ✅ ADD current user ID
    onAddReaction: (messageId: number, emoji: string) => void; // ✅ ADD reaction handler
}

function ChatMessage({
id,
username,
messageText,
timestamp,
isOwnMessage,
readBy = [],
totalGroupMembers = 0,
reactions = [],
currentUserId,
onAddReaction
}: ChatMessageProps): ReactElement {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getReadStatus = () => {
        if (!isOwnMessage) return null;

        const readCount = readBy.length;
        if (readCount === 0) return '✓'; // Sent
        if (readCount === totalGroupMembers - 1) return '✓✓'; // Read by all
        return '✓✓'; // Read by some
    };

    return (
        <div className={`chat-message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            <div className="message-bubble">
                {!isOwnMessage && <div className="message-username">{username}</div>}
                <div className="message-text">{messageText}</div>
                <div className="message-time">
                    {formatTime(timestamp)}
                    {isOwnMessage && <span className="read-receipt">{getReadStatus()}</span>}
                </div>

                {/* ✅ ADD REACTIONS */}

                <MessageReactions
                    messageId={id}
                    reactions={reactions}
                    onAddReaction={onAddReaction}
                    currentUserId={currentUserId}
                
                />
            </div>
        </div>
    );
}

export default ChatMessage;