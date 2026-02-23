import express from 'express';
import cors from 'cors';
import matchRouter from './src/router/matches.js';
import http from 'http';
import { attachWebSocketServer } from './src/ws/server.js';
import { securityMiddleware } from './src/arcjet.js';

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);
app.use(cors());

app.use(express.json());

app.use(securityMiddleware());
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});
app.use('/matches', matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running at ${baseUrl}`);
  console.log(`WebSocket is running at ${baseUrl.replace('http', 'ws')}/ws`);
});
