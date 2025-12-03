import { useEffect, useState } from 'react';
import ChatList from '../Components/ChatList';
import Chatbox from '../Components/Chatbox';
import '../Styles/MessagesPage.css';
import signalRService from '../../services/SignalRService';


export type Group = {
    id: number;
    groupName: string;
    lastMessage: MessageDTO | null;
    profileIds: string[]
}

export type MessageDTO = {
    username : string;
    messageText : string;
    timestamp : string;
    groupId : number;
    id: string
}

export const Messagespage = () => {
    const [selectedChat, setSelectedChat] = useState<Group | null>(null);


    useEffect(() => {
        const handleSetup = async () => {
            const token = localStorage.getItem("jwtToken")

            if (token === null){                
                return
            } 

            await signalRService.StartConnection(token);
        }

        handleSetup()
    }, [])

    return (
        <div className="messages-page">
            <div className="messages-content">
                <ChatList onSelectChat={setSelectedChat}/>

                { selectedChat != null ? 
                    <Chatbox key={selectedChat.id} group={selectedChat}/> 
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
