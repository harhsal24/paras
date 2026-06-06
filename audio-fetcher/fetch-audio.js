/**
 * Audio Fetcher for Google Drive Files
 * 
 * This script fetches an audio file from Google Drive using its file ID.
 * 
 * Usage:
 *   1. Run with Node.js: node fetch-audio.js
 *   2. Or open index.html in a browser
 */

// Google Drive File ID extracted from the sharing URL
const FILE_ID = '1GmueuNMqU0m_qVmZKQkPq1faoUAh9dXt';

// Direct download URL format for Google Drive
const DOWNLOAD_URL = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

// Alternative streaming URL
const STREAM_URL = `https://docs.google.com/uc?export=open&id=${FILE_ID}`;

/**
 * Fetches the audio file from Google Drive
 * @returns {Promise<Blob>} The audio file as a Blob
 */
async function fetchAudioFromDrive() {
    console.log('Fetching audio from Google Drive...');
    console.log('File ID:', FILE_ID);

    try {
        const response = await fetch(DOWNLOAD_URL, {
            method: 'GET',
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const audioBlob = await response.blob();
        console.log('Audio fetched successfully!');
        console.log('Size:', (audioBlob.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('Type:', audioBlob.type);

        return audioBlob;
    } catch (error) {
        console.error('Error fetching audio:', error.message);
        throw error;
    }
}

/**
 * Creates an audio player element with the fetched audio
 * @param {Blob} audioBlob - The audio blob to play
 * @returns {HTMLAudioElement} The created audio element
 */
function createAudioPlayer(audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return audio;
}

/**
 * Downloads the audio file to the user's device
 * @param {Blob} audioBlob - The audio blob to download
 * @param {string} filename - The name for the downloaded file
 */
function downloadAudio(audioBlob, filename = 'om-namah-shivaya-mantra.mp3') {
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('Download initiated:', filename);
}

// Export functions for use in browser or as module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FILE_ID,
        DOWNLOAD_URL,
        STREAM_URL,
        fetchAudioFromDrive
    };
}

// For Node.js usage - fetch and save the file
if (typeof window === 'undefined') {
    const https = require('https');
    const fs = require('fs');
    const path = require('path');

    function downloadWithNode() {
        const outputPath = path.join(__dirname, 'om-namah-shivaya-mantra.mp3');

        console.log('Downloading audio file...');
        console.log('Source:', DOWNLOAD_URL);
        console.log('Destination:', outputPath);

        // Follow redirects manually for Google Drive
        function followRedirects(url, callback) {
            const protocol = url.startsWith('https') ? https : require('http');

            protocol.get(url, (response) => {
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    console.log('Following redirect to:', response.headers.location);
                    followRedirects(response.headers.location, callback);
                } else {
                    callback(response);
                }
            }).on('error', (err) => {
                console.error('Error:', err.message);
            });
        }

        followRedirects(DOWNLOAD_URL, (response) => {
            if (response.statusCode !== 200) {
                console.error('Failed to download. Status:', response.statusCode);
                console.log('\nNote: If the file is private, you may need to:');
                console.log('1. Make the file publicly accessible, or');
                console.log('2. Use Google Drive API with authentication');
                return;
            }

            const fileStream = fs.createWriteStream(outputPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log('Download complete!');
                console.log('File saved to:', outputPath);
            });
        });
    }

    downloadWithNode();
}
