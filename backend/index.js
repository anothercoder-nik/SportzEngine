import AgentApi from 'apminsight';
AgentApi.config();

import express from 'express';
import cors from 'cors';
import { matchRouter } from './src/router/matches.js';
import http from 'http';
import { attachWebSocketServer } from './src/ws/server.js';
import { securityMiddleware } from './src/arcjet.js';
import { commentaryRouter } from './src/router/commentary.js';

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);
app.use(cors());


// app.use(securityMiddleware());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});
app.use('/matches', matchRouter);
app.use('/matches/:id/commentary', commentaryRouter);
const { broadcastMatchCreated, broadcastCommentary } = attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running at ${baseUrl}`);
  console.log(`WebSocket is running at ${baseUrl.replace('http', 'ws')}/ws`);
});
