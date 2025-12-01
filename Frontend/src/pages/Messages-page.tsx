import { useEffect, useState } from 'react';
import ChatList from '../Components/ChatList';
import Chatbox from '../Components/Chatbox';
import '../Styles/MessagesPage.css';
import signalRService from '../../services/SignalRService';

const header = import.meta.env.VITE_API_URL

export type Group = {
    id: number;
    groupName: string;
    lastMessage: MessageDTO | null;
}

export type MessageDTO = {
    username : string | null;
    messageText : string;
    timestamp : string;
    groupId : number
}

export const Messagespage = () => {
    const [selectedChat, setSelectedChat] = useState<number | null>(null);
    const [username, setUsername] = useState("")
    const [chatname, setChatname] = useState("")

    const handleSelectChat = (groupId: number, groupName : string) => {
        setSelectedChat(groupId)
        setChatname(groupName)
    }

    useEffect(() => {
        const handleSetup = async () => {
            const token = localStorage.getItem("jwtToken")

            if (token === null){                
                return
            } 

            await signalRService.StartConnection(token);


            try {
                const response = await fetch(`${header}/Profile/get-username`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Something went wrong... ${response.status}`)
                }

                const result = await response.text();

                setUsername(result)

            } catch (err) {
                console.error('Failed to load message history:', err);
            }
        }

        handleSetup()
    }, [])

    return (
        <div className="messages-page">
            <div className="messages-content">
                <ChatList onSelectChat={handleSelectChat}/>

                { selectedChat != null && username !== "" ? 
                    <Chatbox key={selectedChat} groupId={selectedChat} username={username}  chatname={chatname}/> 
                :
                    <div className="no-chat-selected">
                        <div className="no-chat-content">
                            <h2>Select a conversation</h2>
                            <p>Choose a chat from the list to start messaging</p>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};
