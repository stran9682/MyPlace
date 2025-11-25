import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const CHAT_HUB_URL = import.meta.env.VITE_CHAT_HUB_URL + '/chathub';

export interface Message {
    id: number;
    username: string;
    messageText: string;
    timestamp: string;
    profileId: string;
}

export const useChatConnection = (token: string | null) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        if (!token) return;

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(CHAT_HUB_URL, {
                accessTokenFactory: () => token,
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = newConnection;
        setConnection(newConnection);

        newConnection.on('ReceiveMessage', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        newConnection.start()
            .then(() => {
                console.log('Connected to ChatHub');
                setIsConnected(true);
            })
            .catch(err => console.error('Connection failed: ', err));

        return () => {
            newConnection.stop();
        };
    }, [token]);

    const sendMessage = async (groupId: number, messageText: string) => {
        if (connection && isConnected) {
            try {
                await connection.invoke('SendMessage', groupId, messageText);
            } catch (err) {
                console.error('Error sending message:', err);
            }
        }
    };

    const joinGroup = async (groupId: number) => {
        if (connection && isConnected) {
            try {
                await connection.invoke('JoinGroup', groupId);
            } catch (err) {
                console.error('Error joining group:', err);
            }
        }
    };

    const leaveGroup = async (groupId: number) => {
        if (connection && isConnected) {
            try {
                await connection.invoke('LeaveGroup', groupId);
            } catch (err) {
                console.error('Error leaving group:', err);
            }
        }
    };

    return {
        connection,
        messages,
        isConnected,
        sendMessage,
        joinGroup,
        leaveGroup,
        setMessages
    };
};