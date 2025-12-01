import { useState } from 'react';
import ChatList from '../Components/ChatList';
import Chatbox from '../Components/Chatbox';
import '../Styles/MessagesPage.css';

export type Group = {
    id: number;
    groupName: string;
    lastMessage: MessageDTO | null;
}

export type MessageDTO = {
    username : string | null;
    messageText : string;
    timestamp : string;
}

export const Messagespage = () => {
    const [selectedChat, setSelectedChat] = useState<number | null>(null);

    return (
        <div className="messages-page">
            <div className="messages-content">
                <ChatList onSelectChat={setSelectedChat}/>

                { selectedChat != null ? 
                    <Chatbox key={selectedChat} groupId={selectedChat}/> 
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
