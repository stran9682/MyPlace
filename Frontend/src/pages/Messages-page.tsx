import { useState, useEffect, useRef } from 'react';
import Headermain from '../Components/Header-main';
import ChatList from '../Components/ChatList';
import Chatbox from '../Components/Chatbox';
import { useAuth } from '../context/AuthContext';
import '../Styles/MessagesPage.css';
import { useNavigate } from 'react-router-dom';

// Helper functions
function decodeJWT(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Failed to decode JWT:', e);
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    try {
        const decoded = decodeJWT(token);
        if (!decoded || !decoded.exp) return true;

        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch {
        return true;
    }
}

export const Messagespage = () => {
    const navigate = useNavigate();
    const { token, userId: currentUserId } = useAuth();
    const [isReady, setIsReady] = useState(false);
    const [selectedChat, setSelectedChat] = useState<{
        groupId: number;
        groupName: string;
    } | null>(null);
    const chatListRef = useRef<{ refreshGroups: () => void }>(null);

    // ✅ SINGLE useEffect for auth check
    useEffect(() => {
        console.log('Messages page - checking auth...');
        console.log('Token exists:', !!token);
        console.log('User ID:', currentUserId);

        if (token && currentUserId) {
            // Check if token is expired
            if (isTokenExpired(token)) {
                console.log('❌ Token expired, redirecting to login');
                navigate('/login');
                return;
            }

            console.log('✅ Auth ready');
            setIsReady(true);
        } else {
            console.log('⏳ Waiting for auth...');
            const timer = setTimeout(() => {
                const storedToken = localStorage.getItem('token');
                const storedUserId = localStorage.getItem('user_id');

                console.log('Checking localStorage directly:');
                console.log('  Token:', !!storedToken);
                console.log('  User ID:', storedUserId);

                if (storedToken && storedUserId) {
                    // Check if stored token is expired
                    if (isTokenExpired(storedToken)) {
                        console.log('❌ Stored token expired, redirecting to login');
                        navigate('/login');
                        return;
                    }

                    console.log('✅ Found in localStorage, marking ready');
                    setIsReady(true);
                } else {
                    console.log('❌ No auth found - redirecting to login');
                    navigate('/login');
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [token, currentUserId, navigate]);

    const handleSelectChat = (groupId: number, groupName: string) => {
        console.log('📱 Selected chat:', groupName, 'ID:', groupId);
        setSelectedChat({ groupId, groupName });
    };

    const handleCloseChat = () => {
        setSelectedChat(null);
    };

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

    const activeToken = token || localStorage.getItem('token') || '';
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