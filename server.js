const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const app = express();

app.use(cors());
app.use(express.json());

// WebSocket Server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('✓ Client kết nối WebSocket');
    ws.send(JSON.stringify({ type: 'connected', message: 'Kết nối thành công' }));
    
    ws.on('close', () => {
        console.log('✗ Client ngắt kết nối');
    });
});

// Webhook endpoint cho Sepay
app.post('/webhook', (req, res) => {
    console.log('✓ Nhận webhook từ Sepay:', req.body);
    
    // Gửi đến tất cả clients đang kết nối
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'transaction',
                data: req.body
            }));
        }
    });
    
    res.json({ status: 'success', received: true });
});

app.get('/', (req, res) => {
    res.send(`
        <h1>Sepay Server đang chạy! ✓</h1>
        <p>Webhook URL: <code>http://localhost:3000/webhook</code></p>
        <p>WebSocket: <code>ws://localhost:8080</code></p>
    `);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('╔════════════════════════════════╗');
    console.log('║   SEPAY VOICE NOTIFIER SERVER  ║');
    console.log('╠════════════════════════════════╣');
    console.log(`║ HTTP:      http://localhost:${PORT}   ║`);
    console.log('║ WebSocket: ws://localhost:8080 ║');
    console.log(`║ Webhook:   /webhook            ║`);
    console.log('╚════════════════════════════════╝');
});