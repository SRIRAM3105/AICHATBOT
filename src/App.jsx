import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]); // Initialize as empty array
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef(null);

  const generateBotResponse = async (history) => {
    const updateHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text },
      ]);
    };

    // Map history to API-expected format
    const formattedHistory = history.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: formattedHistory }),
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not defined. Please set VITE_API_URL in .env");
      }
      console.log("Fetching from:", apiUrl);
      const response = await fetch(apiUrl, requestOptions);
      const data = await response.json();
      console.log("API Response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error?.message || "API request failed");
      }

      let apiResponseText = null;
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        apiResponseText = data.candidates[0].content.parts[0].text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .trim();
      } else if (data?.response?.text) {
        apiResponseText = data.response.text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      } else if (data?.choices?.[0]?.message?.content) {
        apiResponseText = data.choices[0].message.content.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      } else {
        throw new Error("Unexpected API response structure");
      }

      updateHistory(apiResponseText);
    } catch (error) {
      console.error("Error:", error.message);
      updateHistory(`Sorry, something went wrong: ${error.message}`);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button
        onClick={() => setShowChatbot((prev) => !prev)}
        id="chatbot-toggler"
      >
        <span className="material-symbols-outlined">mode_comment</span>
        <span className="material-symbols-outlined">close</span>
      </button>
      <div className="chatbot-popup">
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button
            className="material-symbols-outlined"
            onClick={() => setShowChatbot(false)}
          >
            keyboard_arrow_down
          </button>
        </div>
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there <br /> How can I help you today?
            </p>
          </div>
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App;