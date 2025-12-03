import { jwtDecode } from 'jwt-decode';
import type { MessageDTO } from '../pages/Messages-page';
import '../Styles/ChatMessage.css';
import { useEffect, useState } from 'react';

const header = import.meta.env.VITE_API_URL
const bucket = import.meta.env.VITE_BUCKET_URL

export const ChatMessage = ({message} : {message : MessageDTO}) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const [pfp, setPfp] = useState("");

    useEffect(() => {
        const loadPfp = async () => {
            const response =  await fetch(header + `/Profile/get-pfp-url/?userId=${message.id}`)

            if (!response.ok){
                const errorText = await response.text();
                console.error(errorText)
                return;
            }

            const result = await response.text()
            setPfp(`url("${bucket+"/"+result}")`)
        }

        loadPfp()
    }, [])

    const token = jwtDecode(localStorage.getItem("jwtToken")!) as Record<string, string>
    const username = token["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]

    return (
        <div className={`message ${message.username === username ? 'own-message' : 'other-message'}`}>
            {message.username !== username  && <div className={`chat-pfp`} style={{backgroundImage: pfp, backgroundSize: 'cover' }}>
                {message.username.charAt(0).toUpperCase()}
            </div>}


            <div className="message-content">
                {false && <div className="message-username">{message.username}</div>}
                <div className="message-text">{message.messageText}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
        </div>
    );
}