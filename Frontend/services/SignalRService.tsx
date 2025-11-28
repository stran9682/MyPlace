import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import Cookies from 'js-cookie';

class SignalRService {
  private static _instance: SignalRService | undefined;
  private conn: HubConnection | null = null;
  private listeners: Set<string> = new Set();

  constructor() {
    if (SignalRService._instance) {
      return SignalRService._instance;
    }
    SignalRService._instance = this;

    this.conn = new HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_CHATHUB_URL, {
        // Direct use is cleaner
        accessTokenFactory: () => Cookies.get('token') ?? '',
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();
  }

  async StartConnection() {
    await this.conn?.start();
  }

  async Invoke(method: string, ...params: any[]) {
    await this.conn?.invoke(method, ...params);
  }

  CreateEventListener(methodName: string, handler: (...params: any[]) => void) {
    if (this.listeners.has(methodName)) return;
    this.conn?.on(methodName, handler);
    this.listeners.add(methodName);
  }

  RemoveEventListener(methodName: string) {
    if (!this.listeners.has(methodName)) return;
    this.conn?.off(methodName);
    this.listeners.delete(methodName);
  }
}

const signalRService = new SignalRService();
export default signalRService;
