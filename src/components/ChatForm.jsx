import { useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = "";
    
    // Add user message to chat history
    setChatHistory((history) => [...history, { role: "user", text: userMessage }]);

    // Simulate bot response with a loading message and call generateBotResponse
    setTimeout(() => {
      // Optionally add a "Thinking..." message as a loading indicator
      setChatHistory((history) => [...history, { role: "model", text: "Thinking..." }]);
      
      // Pass the updated history including the new user message to generateBotResponse
      generateBotResponse([...chatHistory, { role: "user", text: userMessage }]);
    }, 600);
  };

  return (
    <form className="chat-form" onSubmit={handleFormSubmit}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Message..."
        className="message-input"
        required
      />
      <button type="submit" className="material-symbols-outlined">
        keyboard_arrow_up
      </button>
    </form>
  );
};

export default ChatForm;