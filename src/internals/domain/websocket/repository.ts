import WebSocket from 'ws';
import {BroadcastParameters} from "./websocket";

export interface ChatWebsocketRepository {
    Register(conn: WebSocket, conversationId: string): void;
    Unregister(conn: WebSocket, conversationId: string): void;
    Broadcast(message: BroadcastParameters, conversationId: string): void;
}

export interface DefaultWebsocketRepository {
    Register(conn: WebSocket): void;
    Unregister(conn: WebSocket): void;
    Broadcast(message: BroadcastParameters): void;
}
