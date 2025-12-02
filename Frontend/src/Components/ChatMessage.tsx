import { jwtDecode } from 'jwt-decode';
import type { MessageDTO } from '../pages/Messages-page';
import '../Styles/ChatMessage.css';


export const ChatMessage = ({message} : {message : MessageDTO}) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const token = jwtDecode(localStorage.getItem("jwtToken")!) as Record<string, string>
    const username = token["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]

    return (
        <div className={`message ${message.username === username ? 'own-message' : 'other-message'}`}>
            <div className="message-content">
                {!true && <div className="message-username">{message.username}</div>}
                <div className="message-text">{message.messageText}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
        </div>
    );
}