import type { MessageDTO } from '../pages/Messages-page';
import '../Styles/ChatMessage.css';


export const ChatMessage = ({message, isOwnMessage} : {message : MessageDTO, isOwnMessage : boolean}) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}>
            <div className="message-content">
                {!true && <div className="message-username">{message.username}</div>}
                <div className="message-text">{message.messageText}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
        </div>
    );
}