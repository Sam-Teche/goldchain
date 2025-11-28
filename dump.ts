// const express = require('express');
// const {createServer} = require('http');
// const {WebSocketServer} = require('ws');
//
//
// // Types
// interface FinnHubTradeData {
//     c: string[];  // conditions
//     p: number;    // price
//     s: string;    // symbol
//     t: number;    // timestamp
//     v: number;    // volume
// }
//
// interface FinnHubMessage {
//     type: string;
//     data?: FinnHubTradeData[];
// }
//
// interface FinnHubSubscription {
//     type: 'subscribe' | 'unsubscribe';
//     symbol: string;
// }
//
// interface GoldPriceMessage {
//     type: 'gold_price';
//     price: number;
//     timestamp?: number;
// }
//
// // Configuration
// const PORT: number = parseInt(process.env.PORT || '4000', 10);
// const RECONNECT_DELAY: number = 3000;
// const MAX_RECONNECT_ATTEMPTS: number = 5;
//
// // Global state
// const app = express();
// const server = createServer(app);
// const clients = new Set<WebSocket>();
// let finnSocket: WebSocket | null = null;
// let retryTimeout: NodeJS.Timeout | null = null;
// let reconnectAttempts: number = 0;
//
// // Create WebSocket server for frontend
// const wss = new WebSocketServer({
//     server,
//     clientTracking: true,
//     perMessageDeflate: false
// });
//
// // Broadcast price to all connected frontend clients
// function broadcastToClients(data: GoldPriceMessage): void {
//     const message = JSON.stringify(data);
//     const deadClients: WebSocket[] = [];
//
//     clients.forEach((client) => {
//         if (client.readyState === WebSocket.OPEN) {
//             try {
//                 client.send(message);
//             } catch (error) {
//                 console.error('Error sending message to client:', error);
//                 deadClients.push(client);
//             }
//         } else {
//             deadClients.push(client);
//         }
//     });
//
//     // Clean up dead connections
//     deadClients.forEach(client => clients.delete(client));
// }
//
// // Connect to FinnHub with retry logic
// function connectToFinnHub(): void {
//     if (finnSocket?.readyState === WebSocket.OPEN) {
//         console.log('🔌 Already connected to FinnHub');
//         return;
//     }
//
//     console.log(`🔌 Connecting to FinnHub... (Attempt ${reconnectAttempts + 1})`);
//
//     try {
//         finnSocket = new WebSocket(FinnHub_URL);
//     } catch (error) {
//         console.error('❌ Failed to create WebSocket connection:', error);
//         scheduleReconnect();
//         return;
//     }
//
//     finnSocket.on('open', () => {
//         console.log('✅ Connected to FinnHub');
//         reconnectAttempts = 0; // Reset counter on successful connection
//
//         // Subscribe to gold prices
//         const subscription: FinnHubSubscription = {
//             type: 'subscribe',
//             symbol: 'OANDA:XAU_USD'
//         };
//
//         try {
//             finnSocket?.send(JSON.stringify(subscription));
//             console.log('📊 Subscribed to XAU/USD prices');
//         } catch (error) {
//             console.error('❌ Failed to subscribe:', error);
//         }
//     });
//
//     finnSocket.on('message', (data: WebSocket.Data) => {
//         try {
//             const msg: FinnHubMessage = JSON.parse(data.toString());
//
//             if (msg.type === 'trade' && msg.data && msg.data.length > 0) {
//                 const tradeData = msg.data[0];
//                 const priceMessage: GoldPriceMessage = {
//                     type: 'gold_price',
//                     price: tradeData.p,
//                     timestamp: tradeData.t
//                 };
//
//                 broadcastToClients(priceMessage);
//                 console.log(`💰 Gold price: $${tradeData.p.toFixed(2)}`);
//             }
//         } catch (error) {
//             console.error('❌ Error parsing FinnHub message:', error);
//         }
//     });
//
//     finnSocket.on('close', (code: number, reason: Buffer) => {
//         console.log(`🔁 FinnHub connection closed (Code: ${code}, Reason: ${reason.toString()})`);
//         finnSocket = null;
//         scheduleReconnect();
//     });
//
//     finnSocket.on('error', (error: Error) => {
//         console.error('❌ FinnHub WebSocket error:', error.message);
//         if (finnSocket) {
//             finnSocket.close();
//         }
//     });
// }
//
// // Schedule reconnection with exponential backoff
// function scheduleReconnect(): void {
//     if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
//         console.error(`❌ Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection.`);
//         return;
//     }
//
//     if (retryTimeout) {
//         clearTimeout(retryTimeout);
//     }
//
//     const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts);
//     console.log(`⏱️ Reconnecting in ${delay}ms...`);
//
//     retryTimeout = setTimeout(() => {
//         reconnectAttempts++;
//         connectToFinnHub();
//     }, delay);
// }
//
// // Handle frontend WebSocket connections
// wss.on('connection', (client: WebSocket, request) => {
//     const clientIp = request.socket.remoteAddress;
//     console.log(`🧑 Frontend connected from ${clientIp}`);
//     clients.add(client);
//
//     // Send connection confirmation
//     try {
//         client.send(JSON.stringify({
//             type: 'connection_status',
//             status: 'connected',
//             timestamp: Date.now()
//         }));
//     } catch (error) {
//         console.error('Error sending connection confirmation:', error);
//     }
//
//     client.on('message', (data: WebSocket.Data) => {
//         try {
//             const message = JSON.parse(data.toString());
//             console.log('📨 Received message from client:', message);
//
//             // Handle client messages if needed
//             if (message.type === 'ping') {
//                 client.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
//             }
//         } catch (error) {
//             console.error('Error parsing client message:', error);
//         }
//     });
//
//     client.on('close', (code: number, reason: Buffer) => {
//         console.log(`👋 Frontend disconnected (Code: ${code}, Reason: ${reason.toString()})`);
//         clients.delete(client);
//     });
//
//     client.on('error', (error: Error) => {
//         console.error('❌ Client WebSocket error:', error.message);
//         clients.delete(client);
//     });
// });
//
// // Graceful shutdown
// process.on('SIGINT', () => {
//     console.log('\n🛑 Shutting down server...');
//
//     if (retryTimeout) {
//         clearTimeout(retryTimeout);
//     }
//
//     if (finnSocket) {
//         finnSocket.close();
//     }
//
//     wss.close(() => {
//         console.log('✅ WebSocket server closed');
//     });
//
//     server.close(() => {
//         console.log('✅ HTTP server closed');
//         process.exit(0);
//     });
// });
//
// process.on('SIGTERM', () => {
//     console.log('🛑 Received SIGTERM, shutting down gracefully...');
//     process.kill(process.pid, 'SIGINT');
// });
//
// // Health check endpoint
// app.get('/health', (req, res) => {
//     const status = {
//         server: 'running',
//         FinnHub: finnSocket?.readyState === WebSocket.OPEN ? 'connected' : 'disconnected',
//         clients: clients.size,
//         uptime: process.uptime(),
//         timestamp: new Date().toISOString()
//     };
//
//     res.json(status);
// });
//
// // Start the server
// server.listen(PORT, () => {
//     console.log(`🚀 Server listening on http://localhost:${PORT}`);
//     console.log(`📊 Health check available at http://localhost:${PORT}/health`);
//
//     // Start FinnHub connection
//     connectToFinnHub();
// });
//
// // Handle uncaught exceptions
// process.on('uncaughtException', (error: Error) => {
//     console.error('❌ Uncaught Exception:', error);
//     process.exit(1);
// });
//
// process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
//     console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
//     process.exit(1);
// });

import {Environment} from "./src/package/configs/environment";
import {BlockchainClass} from "./src/internals/adapters/blockchain";

let env = new Environment()
let blockchain = new BlockchainClass(env)
blockchain.AddLedger("demo_tracking_id_1", "demo_lot_id_1").then(r => {
    console.log("complete")
})