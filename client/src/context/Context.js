import { createContext, useState, useEffect } from "react";

export const Context = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [currentMessages, setCurrentMessages] = useState([]);
    // Load chat history on component mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats`);
            const chats = await response.json();
            setChatHistory(chats);
            
            // Set recent prompts from all chats
            const allPrompts = chats.flatMap(chat => 
                chat.messages?.filter(msg => msg.role === 'user').map(msg => msg.content) || []
            );
            setPrevPrompts(allPrompts.slice(-10));
        } catch (error) {
            console.error("Error loading chat history:", error);
        }
    };

    const loadChat = async (chatId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats/${chatId}`);
            const chat = await response.json();
            
            setCurrentChatId(chatId);
            setCurrentMessages(chat.messages || []);
            setShowResult(chat.messages && chat.messages.length > 0);
            
            // Set the recent prompt from the last user message
                setRecentPrompt(chat.messages
                    ?.filter(msg => msg.role === 'user')
                    ?.pop()?.content || "");
        } catch (error) {
            console.error("Error loading chat:", error);
        }
    };

    const onSent = async (prompt) => {
        const actualPrompt = prompt !== undefined ? prompt : input;
        if (!actualPrompt || actualPrompt.trim() === "") {
            return;
        }

        setLoading(true);
        setShowResult(true);
        setRecentPrompt(actualPrompt);

        // Add user's prompt to the conversation
        setCurrentMessages(prev => [...prev, { role: 'user', content: actualPrompt }]);
            setInput("");
        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: actualPrompt,
                    chatId: currentChatId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setCurrentChatId(data.chatId);

                // Update prev prompts if it's a new prompt
                if (prompt === undefined) {
                    setPrevPrompts(prev => [...prev, actualPrompt]);
                }

                // Add a placeholder for the assistant's response to start the animation
                setCurrentMessages(prev => [...prev, { role: 'assistant', content: "" }]);

                const words = data.response.split(" ");
                for (let i = 0; i < words.length; i++) {
                    setTimeout(() => {
                        const currentResponse = words.slice(0, i + 1).join(" ") + " ";
                        setCurrentMessages(prev => {
                            const newMessages = [...prev];
                            if (newMessages.length > 0) {
                                newMessages[newMessages.length - 1].content = currentResponse;
                            }
                            return newMessages;
                        });
                    }, 75 * i); // Typing animation speed
                }

                // After animation, sync with the authoritative server state
                const totalDelay = 75 * words.length;
                setTimeout(() => {
                    setCurrentMessages(data.chat.messages);
                }, totalDelay + 100);
                loadChatHistory();
            } else {
                setCurrentMessages(prev => [...prev, { role: 'assistant', content: "Error: " + (data.error || "Unknown error occurred") }]);
            }
        } catch (error) {
            console.error("Error in onSent:", error);
            setCurrentMessages(prev => [...prev, { role: 'assistant', content: "Error: Unable to get response. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const newChat = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/chats/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();

            if (data.success) {
                setCurrentChatId(data.chatId);
                setCurrentMessages([]);
                setShowResult(false);
                setRecentPrompt("");
                setInput("");
                loadChatHistory();
            }
        } catch (error) {
            console.error("Error creating new chat:", error);
            // Fallback to local new chat
            setCurrentChatId(null);
            setCurrentMessages([]);
            setShowResult(false);
            setRecentPrompt("");
            setInput("");
        }
    };

    const deleteChat = async (chatId) => {
        try {
            await fetch(`${API_BASE_URL}/chats/${chatId}`, {
                method: 'DELETE'
            });

            // If we're deleting the current chat, start a new one
            if (chatId === currentChatId) {
                newChat();
            } else {
                loadChatHistory();
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        input,
        setInput,
        newChat,
        chatHistory,
        loadChat,
        deleteChat,
        currentChatId,
        currentMessages
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;