const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { runChat } = require('../services/geminiService');

// Get all chats
router.get('/chats', async (req, res) => {
    try {
        const chats = await Chat.find()
            .sort({ updatedAt: -1 })
            .select('_id title createdAt updatedAt');
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific chat with messages
router.get('/chats/:chatId', async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        res.json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message and get response
router.post('/chat', async (req, res) => {
    try {
        const { message, chatId } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message is required' });
        }

        let chat;
        
        // If chatId is provided, find existing chat
        if (chatId) {
            chat = await Chat.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
        } else {
            // Create new chat
            chat = new Chat({
                messages: []
            });
        }

        // Add user message
        chat.messages.push({
            role: 'user',
            content: message
        });

        // Get response from Gemini. Pass history *without* the last user message.
        const geminiResponse = await runChat(message, chat.messages.slice(0, -1));

        // Add assistant response
        chat.messages.push({
            role: 'assistant',
            content: geminiResponse
        });

        // Generate title if it's the first message
        if (chat.messages.filter(msg => msg.role === 'user').length === 1) {
            chat.generateTitle();
        }

        // Save to database
        await chat.save();

        res.json({
            success: true,
            chatId: chat._id,
            response: geminiResponse,
            chat: chat.toObject() // Convert to plain object to prevent JSON errors
        });

    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Create new chat
router.post('/chats/new', async (req, res) => {
    try {
        const newChat = new Chat({
            title: 'New Chat',
            messages: []
        });
        
        await newChat.save();
        res.json({ success: true, chatId: newChat._id, chat: newChat });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete chat
router.delete('/chats/:chatId', async (req, res) => {
    try {
        await Chat.findByIdAndDelete(req.params.chatId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;