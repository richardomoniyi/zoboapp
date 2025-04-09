import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, MessageCircle, Send } from "lucide-react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

interface ChatbotProps {
  isOpen?: boolean; // Optional prop
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen: initialIsOpen = false }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(initialIsOpen); // Use the prop value as the initial state
  const apiUrl = "https://your-api-endpoint.com/chatbot"; // Replace with your API URL

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: "bot", text: "Welcome! How can I assist you today?" }]);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await axios.post(apiUrl, { message: input });
      const botMessage: Message = { sender: "bot", text: response.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error connecting to server." }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-0 right-0 m-4">
      <button 
        className="bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={24} />
      </button>
      {isOpen && (
        <div className="w-80 h-96 border border-gray-300 rounded-lg flex flex-col p-2 bg-white shadow-lg fixed bottom-16 right-4">
          <div className="flex justify-between items-center p-2 border-b">
            <span className="font-semibold">Chat Support</span>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex items-center ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`p-2 rounded-lg max-w-[80%] flex items-center gap-2 ${msg.sender === "user" ? "bg-blue-500 text-white self-end ml-auto" : "bg-gray-200 text-black self-start mr-auto"}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex p-2 border-t">
            <input
              className="flex-1 p-2 border rounded-l-lg"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
            />
            <button className="bg-blue-500 text-white px-4 rounded-r-lg flex items-center justify-center" onClick={sendMessage}>
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;