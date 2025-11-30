import '../Styles/ChatMessage.css';
import type { ReactElement } from 'react';

interface ChatMessageProps {
    username: string;
    messageText: string;
    timestamp: string;
    isOwnMessage: boolean;
}

function ChatMessage(): ReactElement {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`message ${true ? 'own-message' : 'other-message'}`}>
            <div className="message-content">
                {!true && <div className="message-username">username</div>}
                <div className="message-text">messageText</div>
                <div className="message-time">now</div>
            </div>
        </div>
    );
}

export default ChatMessage;