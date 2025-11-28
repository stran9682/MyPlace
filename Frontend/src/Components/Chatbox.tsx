import '../Styles/Chatbox.css';
import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import ChatMessage from './ChatMessage';
import { useChatConnection } from '../hooks/useChatConnection';

interface ChatboxProps {
  groupId: number;
  groupName: string;
  token: string;
  currentUserId: string;
  onClose: () => void;
  onMessageSent?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

function Chatbox({
  groupId,
  groupName,
  token,
  currentUserId,
  onClose,
  onMessageSent,
}: ChatboxProps): ReactElement {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isConnected, sendMessage, joinGroup, setMessages } = useChatConnection(token, {
    onChatListUpdate: onMessageSent,
  });
  const [hasJoinedGroup, setHasJoinedGroup] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load message history
  useEffect(() => {
    loadMessageHistory();
  }, [groupId]);

  // Join group when connected
  useEffect(() => {
    if (isConnected && !hasJoinedGroup) {
      console.log('✅ Connection ready, joining group', groupId);
      // Add a small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        joinGroup(groupId)
          .then(() => {
            console.log('✅ Successfully joined group', groupId);
            setHasJoinedGroup(true);
          })
          .catch((err) => {
            console.error('❌ Failed to join group:', err);
          });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isConnected, groupId, hasJoinedGroup]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessageHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_URL}/Message/get-messages/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const history = await response.json();
        console.log('✅ Loaded message history:', history.length);
        setMessages(history);
      } else {
        console.error('❌ Failed to load history:', response.status);
      }
    } catch (err) {
      console.error('❌ Failed to load message history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      console.log('⚠️ Empty message, not sending');
      return;
    }

    if (!isConnected) {
      console.error('❌ Cannot send: Not connected');
      alert('Not connected to chat. Please wait...');
      return;
    }

    if (!hasJoinedGroup) {
      console.error('❌ Cannot send: Not in group yet');
      alert('Joining chat room, please wait...');
      return;
    }

    console.log('📤 Sending message:', messageInput);

    try {
      await sendMessage(groupId, messageInput);
      setMessageInput('');
      console.log('✅ Message sent successfully');

      // ✅ NEW: Notify parent that message was sent
      onMessageSent?.();
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        <h2>{groupName}</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="chatbox-messages">
        {/* Connection Status */}
        {!isConnected && <div className="connection-status">🔄 Connecting to chat...</div>}

        {isConnected && !hasJoinedGroup && (
          <div className="connection-status">📥 Joining chat room...</div>
        )}

        {/* Loading History */}
        {loadingHistory && <div className="connection-status">📜 Loading messages...</div>}

        {/* Messages */}
        {messages.map((msg) => {
          // 🔍 Debug logging
          console.log('Message comparison:', {
            messageId: msg.id,
            profileId: msg.profileId,
            profileIdType: typeof msg.profileId,
            currentUserId: currentUserId,
            currentUserIdType: typeof currentUserId,
            isMatch: msg.profileId === currentUserId,
            strictMatch: msg.profileId === currentUserId,
            username: msg.username,
          });

          return (
            <ChatMessage
              key={msg.id}
              username={msg.username}
              messageText={msg.messageText}
              timestamp={msg.timestamp}
              isOwnMessage={msg.profileId === currentUserId}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <form className="chatbox-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={
            !isConnected
              ? 'Connecting...'
              : !hasJoinedGroup
                ? 'Joining room...'
                : 'Type a message...'
          }
          disabled={!isConnected || !hasJoinedGroup}
        />
        <button type="submit" disabled={!isConnected || !hasJoinedGroup || !messageInput.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chatbox;
