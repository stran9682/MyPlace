import {type ReactElement, useEffect, useState} from "react";
import '../Styles/ChatList.css';

type Group = {
    id: number;
    groupName: string;
}

const header = import.meta.env.VITE_API_URL


function ChatList({ onSelectChat } : {onSelectChat : (groupId: number) => void}): ReactElement {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        }

        loadGroups()
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
                            onClick={() => onSelectChat(group.id)}
                        >
                            <div className="chat-item-avatar">
                                {group.groupName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ChatList;