import React, { useContext, useState } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets.js'
import { Context } from '../../context/Context.js';
const Sidebar = () => {
    const [extended, setExtended] = useState(false);
    const { 
        newChat, 
        chatHistory, 
        loadChat, 
        deleteChat,
        currentChatId 
    } = useContext(Context);

    const handleChatClick = (chatId) => {
        loadChat(chatId);
    };

    const handleDeleteChat = (e, chatId) => {
        e.stopPropagation(); // Prevent triggering loadChat
        if (window.confirm('Are you sure you want to delete this chat?')) {
            deleteChat(chatId);
        }
    };

    return (
        <div className="sidebar">
            <div className="top">
                <img onClick={() => {
                    setExtended(prev => !prev)
                }} className='menu' src={assets.menu_icon} alt="" />
                
                <div onClick={newChat} className="new-chat">
                    <img src={assets.plus_icon} alt="" />
                    {extended ? <p>New chat</p> : null}
                </div>

                {extended ?
                    <div className="recent">
                        <p className="recent-title">Recent Chats</p>
                        {chatHistory.map((chat) => {
                            return (
                                <div 
                                    key={chat._id} 
                                    onClick={() => handleChatClick(chat._id)} 
                                    className={`recent-entry ${currentChatId === chat._id ? 'active' : ''}`}
                                >
                                    <img src={assets.message_icon} alt="" />
                                    <p>{chat.title}</p>
                                    <button 
                                        className="delete-btn"
                                        onClick={(e) => handleDeleteChat(e, chat._id)}
                                        title="Delete chat"
                                    >
                                        ×
                                    </button>
                                </div>
                            )
                        })}
                    </div> : null
                }
            </div>
            <div className="bottom">
                <div className="bottom-item recent-entry">
                    <img src={assets.question_icon} alt="" />
                    {extended ? <p>Help</p> : null}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt="" />
                    {extended ? <p>Activity</p> : null}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.setting_icon} alt="" />
                    {extended ? <p>Settings</p> : null}
                </div>
            </div>
        </div>
    )
}

export default Sidebar