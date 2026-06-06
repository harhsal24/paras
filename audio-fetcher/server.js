/**
 * Proxy Server for Google Drive Audio Streaming
 * Bypasses CORS restrictions by fetching audio server-side
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const FILE_ID = '1GmueuNMqU0m_qVmZKQkPq1faoUAh9dXt';

// MIME types for static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg'
};

/**
 * Follow redirects and fetch from URL
 */
function fetchWithRedirects(url, callback, maxRedirects = 5) {
    if (maxRedirects <= 0) {
        callback(new Error('Too many redirects'));
        return;
    }

    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    }, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            console.log(`Redirecting to: ${response.headers.location}`);
            fetchWithRedirects(response.headers.location, callback, maxRedirects - 1);
            return;
        }

        if (response.statusCode !== 200) {
            callback(new Error(`HTTP ${response.statusCode}`));
            return;
        }

        callback(null, response);
    }).on('error', callback);
}

/**
 * Serve static files
 */
function serveStaticFile(filePath, res) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
    });
}

/**
 * Proxy Google Drive audio
 */
function proxyGoogleDriveAudio(req, res) {
    const driveUrl = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

    console.log('Proxying audio from Google Drive...');

    fetchWithRedirects(driveUrl, (err, response) => {
        if (err) {
            console.error('Proxy error:', err.message);
            res.writeHead(500);
            res.end('Error fetching audio');
            return;
        }

        // Set headers for audio streaming
        res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=3600'
        });

        // Pipe the audio stream to response
        response.pipe(res);

        response.on('end', () => {
            console.log('Audio streaming complete');
        });

        response.on('error', (err) => {
            console.error('Stream error:', err);
            res.end();
        });
    });
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const url = req.url;

    console.log(`${req.method} ${url}`);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Range'
        });
        res.end();
        return;
    }

    // Route: Proxy audio from Google Drive
    if (url === '/audio' || url === '/audio/stream') {
        proxyGoogleDriveAudio(req, res);
        return;
    }

    // Route: Serve index.html for root
    if (url === '/' || url === '/index.html') {
        serveStaticFile(path.join(__dirname, 'index.html'), res);
        return;
    }

    // Route: Serve other static files
    const filePath = path.join(__dirname, url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        serveStaticFile(filePath, res);
        return;
    }

    // 404 for everything else
    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log('\n🎵 Audio Proxy Server Running!');
    console.log(`\n   Open in browser: http://localhost:${PORT}`);
    console.log(`   Audio endpoint:  http://localhost:${PORT}/audio`);
    console.log('\n   Press Ctrl+C to stop.\n');
});
