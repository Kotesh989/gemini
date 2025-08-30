import React, { useContext } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context';
const Main = () => {
    const { 
        onSent, 
        showResult, 
        loading, 
        setInput,
        input,
        currentMessages 
    } = useContext(Context);

    const handleSend = () => {
        if (input.trim() !== "") {
            onSent();
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    const handleCardClick = (promptText) => {
        onSent(promptText);
    };

    const formatResponse = (response) => {
        if (!response) return ""; // Guard against empty content
        let responseArray = response.split("**");
        let newResponse = "";
        for(let i = 0; i < responseArray.length; i++){
            if(i === 0 || i % 2 !== 1){
                newResponse += responseArray[i];
            } else {
                newResponse += "<b>" + responseArray[i] + "</b>";
            }
        }
        return newResponse.split("*").join("<br>");
    };

    return (
        <div className='main'>
            <div className="nav">
                <p>Gemini Clone</p>
                <img src={assets.user_icon} alt="" />
            </div>
            <div className="main-container">
                {!showResult ?
                <>
                    <div className="greet">
                        <p><span>Hello, Kotesh</span></p>
                        <p>How can I help you today?</p>
                    </div>
                    <div className="cards">
                        <div 
                            className="card" 
                            onClick={() => handleCardClick("Suggest beautiful places to see on an upcoming road trip")}
                        >
                            <p>Suggest beautiful places to see on an upcoming road trip</p>
                            <img src={assets.compass_icon} alt="" />
                        </div>
                        <div 
                            className="card"
                            onClick={() => handleCardClick("Briefly summarize this concept: urban planning")}
                        >
                            <p>Briefly summarize this concept: urban planning</p>
                            <img src={assets.bulb_icon} alt="" />
                        </div>
                        <div 
                            className="card"
                            onClick={() => handleCardClick("Suggest team bonding activities for our work retreat")}
                        >
                            <p>Suggest team bonding activities for our work retreat</p>
                            <img src={assets.message_icon} alt="" />
                        </div>
                        <div 
                            className="card"
                            onClick={() => handleCardClick("Improve the readability of the following code")}
                        >
                            <p>Improve the readability of the following code</p>
                            <img src={assets.code_icon} alt="" />
                        </div>
                    </div>
                </> :  
                <div className="result">
                    <div className="conversation">
                        {currentMessages.map((message, index) => (
                            <div key={index} className={`message ${message.role}`}>
                                <div className="message-header">
                                    <img 
                                        src={message.role === 'user' ? assets.user_icon : assets.gemini_icon} 
                                        alt="" 
                                    />
                                    <span>{message.role === 'user' ? 'You' : 'Gemini'}</span>
                                </div>
                                <div className="message-content">
                                    {message.role === 'assistant' ? 
                                        <p dangerouslySetInnerHTML={{__html: formatResponse(message.content)}}></p> :
                                        <p>{message.content}</p>
                                    }
                                </div>
                            </div>
                        ))}
                        
                        {/* Current loading/response */}
                        {loading && (
                            <div className="message assistant">
                                <div className="message-header">
                                    <img src={assets.gemini_icon} alt="" />
                                    <span>Gemini</span>
                                </div>
                                <div className="message-content">
                                    <div className='loader'>
                                        <hr />
                                        <hr />
                                        <hr />
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
                </div>
                }

                <div className="main-bottom">
                    <div className="search-box">
                        <input
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                            type="text"
                            placeholder="Enter a prompt here"
                            onKeyPress={handleKeyPress}
                        />
                        <div>
                            <img src={assets.gallery_icon} alt="" />
                            <img src={assets.menu_icon} alt="" />
                            <img 
                                onClick={handleSend} 
                                src={assets.send_icon} 
                                alt="" 
                                style={{cursor: 'pointer'}}
                            />
                        </div>
                    </div>
                    <p className="bottom-info">
                        Gemini may display inaccurate info, including about people, so double-check its responses.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Main