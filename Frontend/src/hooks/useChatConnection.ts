import { useEffect, useState, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

interface Message {
    id: number;
    username: string;
    messageText: string;
    timestamp: string;
    profileId: string;
}

interface UseChatConnectionOptions {
    onChatListUpdate?: () => void; // ✅ NEW: Callback for chat list updates
}

export const useChatConnection = (token: string, options?: UseChatConnectionOptions) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
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

        newConnection.on('ReceiveMessage', (message: Message) => {
            console.log('📨 Received message:', message);
            setMessages(prev => [...prev, message]);
        });

        // ✅ NEW: Listen for chat list updates
        newConnection.on('UpdateChatList', (groupId: number) => {
            console.log('🔄 Chat list update requested for group:', groupId);
            options?.onChatListUpdate?.();
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
        await connection.invoke('SendMessage', groupId, messageText);
    }, [connection]);

    return {
        connection,
        messages,
        isConnected,
        sendMessage,
        joinGroup,
        setMessages
    };
};