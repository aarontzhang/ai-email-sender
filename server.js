import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import handler from './api/send-email.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API endpoint - wrap the Vercel handler
app.post('/api/send-email', async (req, res) => {
    // Create mock request/response objects that match Vercel's format
    const mockReq = {
        method: 'POST',
        body: req.body
    };

    const mockRes = {
        status: (code) => {
            res.status(code);
            return mockRes;
        },
        json: (data) => {
            res.json(data);
        },
        end: () => {
            res.end();
        },
        setHeader: (key, value) => {
            res.setHeader(key, value);
        }
    };

    await handler(mockReq, mockRes);
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📧 API endpoint: http://localhost:${PORT}/api/send-email`);
});
