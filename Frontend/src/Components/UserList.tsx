import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/UserList.css';

interface User {
    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
}

const API_URL = import.meta.env.VITE_API_URL;

function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingChat, setCreatingChat] = useState<string | null>(null);
    const navigate = useNavigate();

    const token = localStorage.getItem('jwt_token') || '';
    const currentUserId = localStorage.getItem('user_id') || '';

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/Profile/getprofile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Filter out current user
                const otherUsers = data.filter((user: User) => user.id !== currentUserId);
                setUsers(otherUsers);
            }
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (otherUserId: string, userName: string) => {
        setCreatingChat(otherUserId);

        try {
            const response = await fetch(`${API_URL}/Message/create-group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ otherUserId })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Chat created:', data);

                // Navigate to messages page
                navigate('/messages');
            } else {
                alert('Failed to create chat');
            }
        } catch (err) {
            console.error('Error creating chat:', err);
            alert('Something went wrong');
        } finally {
            setCreatingChat(null);
        }
    };

    if (loading) {
        return <div className="user-list-loading">Loading users...</div>;
    }

    return (
        <div className="user-list-container">
            <h2>All Users</h2>
            <div className="user-grid">
                {users.map(user => (
                    <div key={user.id} className="user-card">
                        <div className="user-avatar">
                            {user.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <h3>{user.firstName} {user.lastName}</h3>
                            <p className="user-username">@{user.userName}</p>
                        </div>
                        <button
                            className="chat-btn"
                            onClick={() => handleStartChat(user.id, user.userName)}
                            disabled={creatingChat === user.id}
                        >
                            {creatingChat === user.id ? '...' : '💬 Chat'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserList;