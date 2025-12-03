import '../Styles/Chatbox.css';
import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { ChatMessage } from './ChatMessage';
import type { Group, MessageDTO } from '../pages/Messages-page';
import signalRService from '../../services/SignalRService';
import { jwtDecode } from 'jwt-decode';
import { AddFriendsMenu } from './AddFriendsMenu';


const API_URL = import.meta.env.VITE_API_URL;

function Chatbox({group} : {group: Group}): ReactElement {
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [openAddMenu, setOpenAddMenu] = useState(false)


    const loadMessageHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/Profile/get-messages/?groupId=${group.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            });

            if (!response.ok) {
                throw new Error(`Something went wrong... ${response.status}`)
            }

            const history = await response.json();
            setMessages(history);

        } catch (err) {
            console.error('Failed to load message history:', err);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth',  block: 'nearest', inline: 'start' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const token = jwtDecode(localStorage.getItem("jwtToken")!) as Record<string, string>

        if (messageInput.trim()) {
            const dto : MessageDTO = {
                username: token["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                id: token["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
                messageText: messageInput,
                timestamp: new Date().toISOString(),
                groupId : group.id,
            }

            await signalRService.Invoke("SendMessage", dto)
            setMessageInput('');
        }
    };

    useEffect(() => {

        const handleReceiveMessage = (message : MessageDTO) => {
            setMessages(prev => [...prev, message])
        }

        signalRService.CreateEventListener("receivemessage", handleReceiveMessage)

        loadMessageHistory()

        return () => {
            signalRService.RemoveEventListener("receivemessage")
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="chatbox-container">
            <div className="chatbox-header">
                <h2>{group.groupName}</h2>
                <button onClick={() => setOpenAddMenu(true)} disabled={openAddMenu}>+</button>
            </div>

            {openAddMenu && <AddFriendsMenu setOpenAddMenu={setOpenAddMenu} group={group}/>}

            <div className="chatbox-messages">
                { 
                    messages.length === 0 ? <div className="connection-status">Start The Chat!...</div> 
                : 
                    messages.map((msg, index) => (
                        <ChatMessage message={msg} key={index}/>
                    ))
                }
                <div ref={messagesEndRef}/>
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