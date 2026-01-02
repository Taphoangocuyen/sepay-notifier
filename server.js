const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// WebSocket Server - Chạy trên cùng port với HTTP
const wss = new WebSocket.Server({ server });

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
        <p>Webhook URL: <code>${req.protocol}://${req.get('host')}/webhook</code></p>
        <p>WebSocket: <code>wss://${req.get('host')}</code></p>
        <p>Clients đang kết nối: ${wss.clients.size}</p>
    `);
});

// Sử dụng PORT từ environment variable (Render yêu cầu)
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('╔════════════════════════════════╗');
    console.log('║   SEPAY VOICE NOTIFIER SERVER  ║');
    console.log('╠════════════════════════════════╣');
    console.log(`║ PORT:      ${PORT}                 ║`);
    console.log('║ WebSocket: Same port as HTTP   ║');
    console.log('║ Webhook:   /webhook            ║');
    console.log('╚════════════════════════════════╝');
});