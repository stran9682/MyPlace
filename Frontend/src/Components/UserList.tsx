import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

  const { token, userId: currentUserId } = useAuth();

  // Fallback to localStorage
  const activeToken = token || localStorage.getItem('jwt_token') || '';
  const activeUserId = currentUserId || localStorage.getItem('user_id') || '';

  useEffect(() => {
    console.log('UserList - Token exists:', !!activeToken);
    console.log('UserList - Current user ID:', activeUserId);

    if (activeToken) {
      loadUsers();
    }
  }, [activeToken]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/Profile/getprofile`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded users:', data.length);
        console.log('🔍 Current user ID:', activeUserId);
        console.log(
          '🔍 All user IDs:',
          data.map((u: User) => u.id)
        );

        // Filter out current user
        const otherUsers = data.filter((user: User) => {
          console.log(
            `Comparing: "${user.id}" !== "${activeUserId}" = ${user.id !== activeUserId}`
          );
          return user.id !== activeUserId;
        });

        console.log('✅ Filtered users:', otherUsers.length);
        setUsers(otherUsers);
      } else {
        console.error('❌ Failed to load users:', response.status);
      }
    } catch (err) {
      console.error('❌ Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (otherUserId: string, userName: string) => {
    console.log('💬 Starting chat with:', userName);
    setCreatingChat(otherUserId);

    try {
      const response = await fetch(`${API_URL}/Message/create-group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ otherUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Chat created:', data);

        // Navigate to messages page
        navigate('/messages');
      } else {
        console.error('❌ Failed to create chat:', response.status);
        alert('Failed to create chat');
      }
    } catch (err) {
      console.error('❌ Error creating chat:', err);
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
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-avatar">{user.firstName.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <h3>
                {user.firstName} {user.lastName}
              </h3>
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
