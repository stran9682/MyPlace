import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

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

        try {
            const header = import.meta.env.VITE_CHATHUB_URL

            this.conn = new HubConnectionBuilder()
                .withUrl(header
                //     , {
                //     accessTokenFactory: () => {
                //         return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiN2Q4M2JjYjItNWMwZi00NDU4LTk0NjQtMjM1YTRkYWM0ODFkIiwiZXhwIjoxNzYxNTAyMTQ4LCJpc3MiOiJJc3N1ZXIiLCJhdWQiOiJBdWRpZW5jZSJ9.nqk0wz5JzoT4Y_Hy1nJKd0FgPxrxI4JeoDXhECBIIJY"
                //     }
                // }
                )
                .configureLogging(LogLevel.Information)
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .build();
        }
        catch (e){
            console.log(e)
        }
    }

    async StartConnection () {
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