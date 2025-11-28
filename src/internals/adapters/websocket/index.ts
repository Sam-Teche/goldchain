import {ChatWebsocketRepository, DefaultWebsocketRepository} from "../../domain/websocket/repository";
import WebSocket from 'ws';
import {BroadcastParameters} from "../../domain/websocket/websocket";

export class ChatWebSocketClass implements ChatWebsocketRepository {
    private clients: Map<string, Map<WebSocket, boolean>> = new Map();

    // Register adds a new WebSocket connection to the hub
    public Register(conn: WebSocket, conversationId: string): void {
        if (!this.clients.has(conversationId)) {
            this.clients.set(conversationId, new Map());
        }

        const conversationClients = this.clients.get(conversationId)!;
        conversationClients.set(conn, true);
    }

    // Unregister removes a WebSocket connection from the hub
    public Unregister(conn: WebSocket, conversationId: string): void {
        const conversationClients = this.clients.get(conversationId);
        if (conversationClients && conversationClients.has(conn)) {
            conversationClients.delete(conn);
            conn.close();
        }
    }

    // Broadcast sends a message to all active WebSocket clients
    public Broadcast(message: BroadcastParameters, conversationId: string): void {
        const messageBytes = JSON.stringify(message);
        const conversationClients = this.clients.get(conversationId.toString());
        console.log({conversationClients, conversationId, clients: this.clients})
        if (conversationClients) {
            const clientsToRemove: WebSocket[] = [];

            for (const [client] of conversationClients) {
                console.log({client})
                try {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(messageBytes);
                    } else {
                        clientsToRemove.push(client);
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                    clientsToRemove.push(client);
                }
            }

            // Clean up disconnected clients
            clientsToRemove.forEach(client => {
                conversationClients.delete(client);
                client.close();
            });
        }
    }
}

export class DefaultWebsocketClass implements DefaultWebsocketRepository {
    private clients: Map<WebSocket, boolean> = new Map();

    constructor() {
        // Initialize empty clients map
    }

    // Register adds a new WebSocket connection to the hub
    public Register(conn: WebSocket): void {
        this.clients.set(conn, true);
    }

    // Unregister removes a WebSocket connection from the hub
    public Unregister(conn: WebSocket): void {
        if (this.clients.has(conn)) {
            this.clients.delete(conn);
            conn.close();
        }
    }

    // Broadcast sends a message to all active WebSocket clients
    public Broadcast(message: BroadcastParameters): void {
        const messageBytes = JSON.stringify(message);
        const clientsToRemove: WebSocket[] = [];

        for (const [client] of this.clients) {
            try {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(messageBytes);
                } else {
                    clientsToRemove.push(client);
                }
            } catch (error) {
                console.error('Error sending message:', error);
                clientsToRemove.push(client);
            }
        }

        // Clean up disconnected clients
        clientsToRemove.forEach(client => {
            this.clients.delete(client);
            client.close();
        });
    }

    // Get the number of connected clients
    public getClientCount(): number {
        return this.clients.size;
    }
}