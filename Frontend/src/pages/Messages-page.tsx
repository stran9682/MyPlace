import { useState, useEffect, useRef } from 'react';
import Headermain from '../Components/Header-main';
import ChatList from '../Components/ChatList';
import Chatbox from '../Components/Chatbox';
import { useAuth } from '../context/AuthContext';
import '../Styles/MessagesPage.css';

export const Messagespage = () => {
    const [selectedChat, setSelectedChat] = useState<{
        groupId: number;
        groupName: string;
    } | null>(null);

    const { token, userId: currentUserId } = useAuth();
    const [isReady, setIsReady] = useState(false);
    const chatListRef = useRef<{ refreshGroups: () => void }>(null);

    // Wait for auth to be ready
    useEffect(() => {
        console.log('Messages page - checking auth...');
        console.log('Token exists:', !!token);
        console.log('User ID:', currentUserId);

        if (token && currentUserId) {
            console.log('✅ Auth ready');
            setIsReady(true);
        } else {
            console.log('⏳ Waiting for auth...');
            const timer = setTimeout(() => {
                const storedToken = localStorage.getItem('jwt_token');
                const storedUserId = localStorage.getItem('user_id');

                console.log('Checking localStorage directly:');
                console.log('  Token:', !!storedToken);
                console.log('  User ID:', storedUserId);

                if (storedToken && storedUserId) {
                    console.log('✅ Found in localStorage, marking ready');
                    setIsReady(true);
                } else {
                    console.log('❌ No auth found - redirecting to login');
                    window.location.href = '/login';
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [token, currentUserId]);

    const handleSelectChat = (groupId: number, groupName: string) => {
        console.log('📱 Selected chat:', groupName, 'ID:', groupId);
        setSelectedChat({ groupId, groupName });
    };

    const handleCloseChat = () => {
        setSelectedChat(null);
    };

    // ✅ NEW: Callback when a message is sent
    const handleMessageSent = () => {
        console.log('📨 Message sent, refreshing chat list...');
        chatListRef.current?.refreshGroups();
    };

    // Show loading state while auth initializes
    if (!isReady) {
        return (
            <div className="messages-page">
                <Headermain />
                <div className="messages-content">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px',
                        fontSize: '18px',
                        color: '#666'
                    }}>
                        Loading...
                    </div>
                </div>
            </div>
        );
    }

    const activeToken = token || localStorage.getItem('jwt_token') || '';
    const activeUserId = currentUserId || localStorage.getItem('user_id') || '';

    console.log('Rendering with:', {
        token: !!activeToken,
        userId: activeUserId,
        selectedChat: selectedChat?.groupName
    });

    return (
        <div className="messages-page">
            <Headermain />
            <div className="messages-content">
                <ChatList
                    ref={chatListRef}
                    token={activeToken}
                    onSelectChat={handleSelectChat}
                />

                {selectedChat && (
                    <Chatbox
                        groupId={selectedChat.groupId}
                        groupName={selectedChat.groupName}
                        token={activeToken}
                        currentUserId={activeUserId}
                        onClose={handleCloseChat}
                        onMessageSent={handleMessageSent}
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