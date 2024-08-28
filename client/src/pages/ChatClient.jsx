import React, { useState } from 'react';
import './chatclient.css';
import chatboxIcon from "../assets/chatbox-icon.svg";

function ChatClient() {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState([]);

    const toggleChatbox = () => {
        setIsOpen(prevIsOpen => !prevIsOpen);
    };

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const handleSendMessage = async () => {
        if (inputText.trim() === '') return;
    
        const currentDate = new Date(); // Current date
        const newMessage = { name: 'User', message: inputText, date: currentDate }; // Add current date
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setInputText('');
    
        try {
            const response = await fetch('http://127.0.0.1:5000/chat', {
                method: 'POST',
                body: JSON.stringify({ message: inputText }),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const responseData = await response.json();
            const botMessage = { name: 'Sam', message: responseData.message, date: currentDate }; // Add current date
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="containerChatBox">
            <div className={`chatbox__support ${isOpen ? 'chatbox--active' : ''}`}>
                <div className="chatbox__header">
                    <div className="chatbox__image--header">
                        <img src="https://img.icons8.com/color/48/000000/circled-user-female-skin-type-5--v1.png" alt="image" />
                    </div>
                    <div className="chatbox__content--header">
                        <h4 className="chatbox__heading--header">Chat support</h4>
                        <p className="chatbox__description--header">Hi. My name is Sam. How can I help you?</p>
                    </div>
                </div>
                <div className="chatbox__messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`messages__item ${msg.name === 'Sam' ? 'messages__item--visitor' : 'messages__item--operator'}`}>
                            <div>{msg.message}</div>
                            <div className="message__date">{msg.date.toLocaleString()}</div> {/* Display date */}
                        </div>
                    ))}
                </div>
                <div className="chatbox__footer">
                    <input type="text" placeholder="Write a message..." value={inputText} onChange={handleInputChange} onKeyPress={handleKeyPress} />
                    <button className="chatbox__send--footer send__button" onClick={handleSendMessage}>Send</button>
                </div>
            </div>
            <div className="chatbox__button">
                <button onClick={toggleChatbox}><img src={chatboxIcon} alt="chatbox icon" /></button>
            </div>
        </div>
    );
}

export default ChatClient;