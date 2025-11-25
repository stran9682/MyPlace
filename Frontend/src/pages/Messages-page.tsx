import { useState } from 'react';
import Headermain from '../Components/Header-main';
import ChatList from '../Components/ChatList';
import Chatbox from '../Components/Chatbox';
import { useAuth } from '../context/AuthContext';   // 👈 added
import '../Styles/MessagesPage.css';

export const Messagespage = () => {
    const [selectedChat, setSelectedChat] = useState<{
        groupId: number;
        groupName: string;
    } | null>(null);

    // ✅ FIXED — now using Auth Context instead of localStorage
    const { token, userId: currentUserId } = useAuth();

    const handleSelectChat = (groupId: number, groupName: string) => {
        setSelectedChat({ groupId, groupName });
    };

    const handleCloseChat = () => {
        setSelectedChat(null);
    };

    return (
        <div className="messages-page">
            <Headermain />
            <div className="messages-content">
                <ChatList
                    token={token}
                    onSelectChat={handleSelectChat}
                />

                {selectedChat && (
                    <Chatbox
                        groupId={selectedChat.groupId}
                        groupName={selectedChat.groupName}
                        token={token}
                        currentUserId={currentUserId}
                        onClose={handleCloseChat}
                    />
                )}

                {!selectedChat && (
                    <div className="no-chat-selected">
                        <div className="no-chat-content">
                            <h2>Select a conversation</h2>
                            <p>Choose a chat from the list to start messaging</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
