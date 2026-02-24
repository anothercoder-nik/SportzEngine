import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";

function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}
function broadcastToAll(wss, payload) {
    for (const client of wss.clients) {
        if (client.readyState !== WebSocket.OPEN) continue;

        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024 * 1024,
    })


    wss.on('connection', async (ws, req) => {

        if (wsArcjet) {
            try {
                const decision = await wsArcjet.protect(req);
                if (decision.isDenied()) {
                    const code = decision.reason.isRateLimit() ? 1013 : 1008;
                    const reason = decision.reason.isRateLimit() ? 'Rate limit exceeded' : 'Forbidden';
                    ws.close(code, reason);
                    return;
                }
            } catch (e) {
                console.error("WS connection error", e);
                ws.close(1011, 'Internal Server Error');
                return;
            }
        }

        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
        })
        sendJson(ws, { type: 'welcome', payload: { message: 'Welcome to the WebSocket Server' } });
        ws.on("close", (code, reason) => {
            console.log("Closed:", code, reason.toString());
        });

        ws.on("error", (err) => {
            console.log("Socket error:", err);
        });
    })

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    })

    function broadcastMatchCreated(match) {
        broadcastToAll(wss, { type: 'match.created', data: match });
    }

    return { broadcastMatchCreated };
}






