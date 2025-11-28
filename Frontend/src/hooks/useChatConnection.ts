import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

// ✅ UPDATED: Enhanced Message interface with all new features
interface Message {
    id: number;
    username: string;
    messageText: string;
    timestamp: string;
    profileId: string;
    readBy?: string[]; // Read receipts
    reactions?: Reaction[]; // Message reactions
    fileUrl?: string; // File/image sharing
    fileName?: string; // File name for display
    
}

// ✅ NEW: Reaction interface
interface Reaction {
    emoji: string;
    userIds: string[];
    count: number;
}

interface UseChatConnectionOptions {
    onChatListUpdate?: () => void;
}

export const useChatConnection = (token: string, options?: UseChatConnectionOptions) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]); // ✅ NEW: Online status
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const isConnectingRef = useRef(false);

    useEffect(() => {
        if (!token || connectionRef.current || isConnectingRef.current) {
            return;
        }

        isConnectingRef.current = true;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5023/chathub', {
                accessTokenFactory: () => token,
                skipNegotiation: false,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Existing: Receive messages
        newConnection.on('ReceiveMessage', (message: Message) => {
            console.log('📨 Received message:', message);
            setMessages(prev => [...prev, message]);
        });

        // Existing: Chat list updates
        newConnection.on('UpdateChatList', (groupId: number) => {
            console.log('🔄 Chat list update requested for group:', groupId);
            options?.onChatListUpdate?.();
        });

        // ✅ NEW: Read receipt updates
        newConnection.on('MessageRead', (messageId: number, userId: string) => {
            console.log('✓✓ Message read:', messageId, 'by', userId);
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, readBy: [...(msg.readBy || []), userId] }
                    : msg
            ));
        });

        // ✅ NEW: Reaction updates
        newConnection.on('ReactionAdded', (messageId: number, emoji: string, userId: string) => {
            console.log('😊 Reaction added:', emoji, 'to message', messageId);
            setMessages(prev => prev.map(msg => {
                if (msg.id !== messageId) return msg;

                const reactions = msg.reactions || [];
                const existingReaction = reactions.find(r => r.emoji === emoji);

                if (existingReaction) {
                    // Add user to existing reaction
                    return {
                        ...msg,
                        reactions: reactions.map(r =>
                            r.emoji === emoji
                                ? { ...r, userIds: [...r.userIds, userId], count: r.count + 1 }
                                : r
                        )
                    };
                } else {
                    // Create new reaction
                    return {
                        ...msg,
                        reactions: [...reactions, { emoji, userIds: [userId], count: 1 }]
                    };
                }
            }));
        });

        // ✅ NEW: Online/Offline status
        newConnection.on('UserStatusChanged', (userId: string, isOnline: boolean) => {
            console.log(`🟢 User ${userId} is now ${isOnline ? 'online' : 'offline'}`);
            setOnlineUsers(prev =>
                isOnline
                    ? [...new Set([...prev, userId])] // Add if online
                    : prev.filter(id => id !== userId) // Remove if offline
            );
        });

        // ✅ NEW: Initial online users list
        newConnection.on('OnlineUsersList', (userIds: string[]) => {
            console.log('👥 Online users:', userIds);
            setOnlineUsers(userIds);
        });

        newConnection.onclose(() => {
            console.log('❌ Connection closed');
            setIsConnected(false);
        });

        newConnection.onreconnecting(() => {
            console.log('🔄 Reconnecting...');
            setIsConnected(false);
        });

        newConnection.onreconnected(() => {
            console.log('✅ Reconnected');
            setIsConnected(true);
        });

        newConnection.start()
            .then(() => {
                console.log('✅ SignalR Connected');
                setIsConnected(true);
                connectionRef.current = newConnection;
                setConnection(newConnection);
            })
            .catch(err => {
                console.error('❌ SignalR Connection Error:', err);
                isConnectingRef.current = false;
            });

        return () => {
            if (connectionRef.current) {
                console.log('🔌 Cleaning up connection');
                connectionRef.current.stop();
                connectionRef.current = null;
            }
        };
    }, [token, options?.onChatListUpdate]);

    const joinGroup = useCallback(async (groupId: number) => {
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('Not connected');
        }

        console.log('🚪 Joining group:', groupId);
        await connection.invoke('JoinGroup', groupId);
    }, [connection]);

    const sendMessage = useCallback(async (groupId: number, messageText: string) => {
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('Not connected');
        }

        console.log('📤 Sending message to group:', groupId);
        // ✅ Only send 2 parameters for now
        await connection.invoke('SendMessage', groupId, messageText);
    }, [connection]);

    // ✅ NEW: Mark message as read
    const markMessageAsRead = useCallback(async (messageId: number) => {
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('Not connected');
        }

        console.log('✓ Marking message as read:', messageId);
        await connection.invoke('MarkMessageAsRead', messageId);
    }, [connection]);

    // ✅ NEW: Add reaction to message
    const addReaction = useCallback(async (messageId: number, emoji: string) => {
        if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('Not connected');
        }

        console.log('😊 Adding reaction:', emoji, 'to message', messageId);
        await connection.invoke('AddReaction', messageId, emoji);
    }, [connection]);

    return {
        connection,
        messages,
        isConnected,
        onlineUsers, // ✅ NEW
        sendMessage,
        joinGroup,
        setMessages,
        markMessageAsRead, // ✅ NEW
        addReaction, // ✅ NEW
    };
};

// ✅ EXPORT types for use in other components
export type { Message, Reaction };