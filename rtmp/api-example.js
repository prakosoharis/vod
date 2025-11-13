/**
 * Example API endpoints for Deluwang Live Streaming Integration
 * This file shows how to integrate live streaming with your existing backend
 */

const express = require('express');
const router = express.Router();

/**
 * Get stream status and metadata
 * GET /api/live/stream/:streamKey
 */
router.get('/stream/:streamKey', async (req, res) => {
    try {
        const { streamKey } = req.params;

        // Check if HLS manifest exists
        const hlsUrl = `http://live.deluwang.online/hls/${streamKey}.m3u8`;
        const response = await fetch(hlsUrl, { method: 'HEAD' });

        const isLive = response.ok;

        // Get additional data from chat server
        const chatResponse = await fetch('http://localhost:3007/stream-status');
        const chatData = await chatResponse.json();

        res.json({
            streamKey,
            isLive,
            title: 'Live Streaming Deluwang',
            description: 'Saksikan live streaming seru hanya di Deluwang!',
            startTime: chatData.startTime || null,
            viewerCount: chatData.viewerCount || 0,
            thumbnail: `/images/live-thumbnail.jpg`,
            hlsUrl: isLive ? hlsUrl : null,
            rtmpUrl: `rtmp://live.deluwang.online/live/${streamKey}`,
            chatEnabled: true,
            chatUrl: 'http://live.deluwang.online:3007'
        });

    } catch (error) {
        console.error('Error checking stream status:', error);
        res.json({
            streamKey: req.params.streamKey,
            isLive: false,
            error: 'Failed to check stream status'
        });
    }
});

/**
 * Get list of active streams
 * GET /api/live/streams
 */
router.get('/streams', async (req, res) => {
    try {
        const streams = [
            {
                id: 'deluwang-main',
                streamKey: 'deluwang-live',
                title: 'Deluwang Main Stream',
                description: 'Live streaming utama Deluwang',
                category: 'Entertainment',
                isLive: false, // This would be checked dynamically
                viewers: 0,
                thumbnail: '/images/stream-thumbnails/main.jpg'
            }
        ];

        res.json({
            success: true,
            data: streams
        });

    } catch (error) {
        console.error('Error fetching streams:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch streams'
        });
    }
});

/**
 * Start stream (for authenticated streamers)
 * POST /api/live/start
 */
router.post('/start', async (req, res) => {
    try {
        const { streamKey, title, description } = req.body;

        if (!streamKey) {
            return res.status(400).json({
                success: false,
                error: 'Stream key is required'
            });
        }

        // Here you would:
        // 1. Validate user permissions
        // 2. Record stream start in database
        // 3. Notify chat server

        // Notify chat server that stream is starting
        const chatResponse = await fetch('http://localhost:3007/stream-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isLive: true,
                streamKey: streamKey,
                title: title || 'Live Stream',
                startTime: new Date().toISOString()
            })
        });

        res.json({
            success: true,
            data: {
                streamKey,
                rtmpUrl: `rtmp://live.deluwang.online/live/${streamKey}`,
                hlsUrl: `http://live.deluwang.online/hls/${streamKey}.m3u8`,
                startTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error starting stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start stream'
        });
    }
});

/**
 * Stop stream (for authenticated streamers)
 * POST /api/live/stop
 */
router.post('/stop', async (req, res) => {
    try {
        const { streamKey } = req.body;

        if (!streamKey) {
            return res.status(400).json({
                success: false,
                error: 'Stream key is required'
            });
        }

        // Notify chat server that stream is stopping
        await fetch('http://localhost:3007/stream-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isLive: false,
                streamKey: streamKey,
                endTime: new Date().toISOString()
            })
        });

        res.json({
            success: true,
            message: 'Stream stopped successfully'
        });

    } catch (error) {
        console.error('Error stopping stream:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stop stream'
        });
    }
});

/**
 * Get stream statistics
 * GET /api/live/stats/:streamKey
 */
router.get('/stats/:streamKey', async (req, res) => {
    try {
        const { streamKey } = req.params;

        // Get stats from chat server
        const chatResponse = await fetch('http://localhost:3007/health');
        const chatData = await chatResponse.json();

        res.json({
            success: true,
            data: {
                streamKey,
                viewerCount: chatData.connectedUsers || 0,
                messageCount: chatData.messagesCount || 0,
                isLive: chatData.streamStatus?.isLive || false,
                startTime: chatData.streamStatus?.startTime || null,
                uptime: chatData.streamStatus?.startTime ?
                    Date.now() - new Date(chatData.streamStatus.startTime).getTime() : 0
            }
        });

    } catch (error) {
        console.error('Error fetching stream stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stream stats'
        });
    }
});

/**
 * Get chat messages
 * GET /api/live/messages/:streamKey
 */
router.get('/messages/:streamKey', async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const chatResponse = await fetch('http://localhost:3007/messages');
        const messages = await chatResponse.json();

        // Return last N messages
        const recentMessages = messages.slice(-limit);

        res.json({
            success: true,
            data: recentMessages
        });

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch messages'
        });
    }
});

module.exports = router;