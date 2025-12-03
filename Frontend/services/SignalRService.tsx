import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

 const header = import.meta.env.VITE_CHATHUB_URL


class SignalRService {

    private static _instance: SignalRService | undefined;

    private conn: HubConnection | null = null;

    constructor() {
        console.log("registering singleton")
        if (SignalRService._instance) {
            console.log("service previously registered...")
            return SignalRService._instance
        }

        SignalRService._instance = this;
    }

    async StartConnection (token : string) {
        try {
            this.conn = new HubConnectionBuilder()
                .withUrl(header, {
                    accessTokenFactory: () => {
                        return token
                    }
            })
                .configureLogging(LogLevel.Information)
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .build();
        }
        catch (e){
            console.log(e)
        }

        await this.conn?.start();
    }
    
    async Invoke (method : string, ...params : any[]) {
        try {
            await this.conn?.invoke(method, ...params)
        }
        catch (e){
            console.log(e)
        }
    }

    private listeners : Set<string> = new Set();

    CreateEventListener (method_name: string, anonymous_function: (... params : any []) => void) {
        if (this.listeners.has(method_name)) return;

        this.conn?.on(method_name, anonymous_function)
        this.listeners.add(method_name);
    }

    RemoveEventListener (method_name : string){
        if (!this.listeners.has(method_name)) return;

        this.conn?.off(method_name)
        this.listeners.delete(method_name)
    }
}

const signalRService = new SignalRService();
export default signalRService;