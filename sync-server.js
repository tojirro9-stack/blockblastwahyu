// ==================== BLOCK BLAST PRO - SYNC SERVER ====================
// WebSocket server for cross-device leaderboard synchronization.
// Run this on your laptop: node sync-server.js
// Then connect from any device on the same network.

import { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';

const PORT = 3001;

// In-memory leaderboard store
let leaderboard = [];
let clients = new Set();
let playerNames = new Map(); // ws -> username

// Try to load saved leaderboard
try {
  if (fs.existsSync('./sync-data.json')) {
    const data = fs.readFileSync('./sync-data.json', 'utf8');
    leaderboard = JSON.parse(data);
    console.log(`📂 Loaded ${leaderboard.length} saved scores`);
  }
} catch (e) {
  // ignore
}

function saveLeaderboard() {
  try {
    fs.writeFileSync('./sync-data.json', JSON.stringify(leaderboard), 'utf8');
  } catch (e) {
    // ignore
  }
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const ws of clients) {
    try {
      ws.send(msg);
    } catch (e) {
      clients.delete(ws);
    }
  }
}

function getPlayerList() {
  return Array.from(clients).map(ws => ({
    username: playerNames.get(ws) || 'Anonymous',
    connected: true,
  }));
}

const server = http.createServer((req, res) => {
  // Simple health check / CORS for direct HTTP access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/leaderboard') {
    res.end(JSON.stringify(leaderboard));
    return;
  }
  if (req.url === '/api/players') {
    res.end(JSON.stringify(getPlayerList()));
    return;
  }
  res.end(JSON.stringify({ status: 'ok', clients: clients.size, scores: leaderboard.length }));
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const clientAddr = req.socket.remoteAddress;
  console.log(`🔗 Client connected: ${clientAddr}`);
  clients.add(ws);

  // Send current leaderboard immediately
  ws.send(JSON.stringify({
    type: 'leaderboard_full',
    data: leaderboard,
  }));

  // Send player list
  ws.send(JSON.stringify({
    type: 'players',
    data: getPlayerList(),
  }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      switch (msg.type) {
        case 'identify':
          playerNames.set(ws, msg.username || 'Anonymous');
          // Broadcast updated player list
          broadcast({ type: 'players', data: getPlayerList() });
          break;

        case 'new_score': {
          const entry = {
            id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            username: msg.username || 'Anonymous',
            avatar: msg.avatar || '',
            score: msg.score,
            date: new Date().toISOString().split('T')[0],
            linesCleared: msg.linesCleared || 0,
            combo: msg.combo || 0,
            gameMode: msg.gameMode || 'classic',
          };

          leaderboard.push(entry);
          leaderboard.sort((a, b) => b.score - a.score);
          leaderboard = leaderboard.slice(0, 200); // Keep top 200

          saveLeaderboard();

          // Broadcast the new score to ALL clients
          broadcast({
            type: 'new_score',
            data: entry,
            leaderboard: leaderboard,
          });

          console.log(`🏆 ${entry.username} scored ${entry.score}`);
          break;
        }

        case 'get_leaderboard':
          ws.send(JSON.stringify({
            type: 'leaderboard_full',
            data: leaderboard,
          }));
          break;

        case 'get_players':
          ws.send(JSON.stringify({
            type: 'players',
            data: getPlayerList(),
          }));
          break;
      }
    } catch (e) {
      console.error('⚠️ Invalid message:', e.message);
    }
  });

  ws.on('close', () => {
    console.log(`🔌 Client disconnected: ${playerNames.get(ws) || clientAddr}`);
    clients.delete(ws);
    playerNames.delete(ws);
    broadcast({ type: 'players', data: getPlayerList() });
  });

  ws.on('error', () => {
    clients.delete(ws);
    playerNames.delete(ws);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   BLOCK BLAST PRO - SYNC SERVER      ║');
  console.log('╠═══════════════════════════════════════╣');
  console.log(`║  Port:       ${PORT}                       ║`);
  console.log(`║  WebSocket:  ws://YOUR_IP:${PORT}        ║`);
  console.log(`║  HTTP:       http://YOUR_IP:${PORT}/api/leaderboard`);
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
  console.log('📡 Waiting for connections...');
  console.log('   Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)');
  console.log('   Then in the game, enter: ws://YOUR_IP:3001');
  console.log('');
});
