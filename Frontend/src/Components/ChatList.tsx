import {type ReactElement, useEffect, useState} from "react";
import '../Styles/ChatList.css';
import type { Group, MessageDTO } from "../pages/Messages-page";
import signalRService from '../../services/SignalRService';

const header = import.meta.env.VITE_API_URL


function ChatList({ onSelectChat } : {onSelectChat : (group : Group) => void}): ReactElement {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffInHours < 168) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };


    useEffect(() => {
        const updateItemById = (newMessage : MessageDTO) => {
            console.log(newMessage)

            setGroups(prev => prev.map(item => 
                item.id === newMessage.groupId
                    ? { ...item, lastMessage : newMessage }
                    : item
            )); 
        };

        const loadGroups = async () => {
            const response =  await fetch(header + `/Profile/get-groups`, {  
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                }
            })

            if (!response.ok){
                const errorText = await response.text();
                console.error(errorText)
                setLoading(false)
                return;
            }

            const groups = await response.json()
            setGroups(groups)
            setLoading(false);


            signalRService.CreateEventListener("updatelist", updateItemById)
        }

        loadGroups()        

        return () => {
            signalRService.RemoveEventListener("updatelist")
        }
    }, []);


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

    return (
        <div className="chat-list-container">
            <div className="chat-list-header">
                <h2>Messages</h2>
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
                            onClick={() => onSelectChat(group)}
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
                                        No messages yet! Start the chat!
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