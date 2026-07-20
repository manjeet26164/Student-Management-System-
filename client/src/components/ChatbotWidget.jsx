import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { askChatbot } from "../services/chatbotService";

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I am university assistant. You can ask me anything about fees, deadlines, rules, and other university-related information.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (!user) return null;

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const data = await askChatbot(text);
      setMessages((prev) => [...prev, { role: "bot", text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: err.response?.data?.message || "Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-widget">
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>University Assistant</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              ×
            </button>
          </div>

          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-bubble ${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="chatbot-bubble bot typing">Typing...</div>}
          </div>

          <form className="chatbot-input-row" onSubmit={send}>
            <input
              type="text"
              placeholder="Give me your query..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle assistant chat"
      >
        {open ? (
          <span className="chatbot-toggle-close">×</span>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
            <path
              d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.1-3.3A7.96 7.96 0 0 1 4 12Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="12" r="1.1" fill="currentColor" />
            <circle cx="12.5" cy="12" r="1.1" fill="currentColor" />
            <circle cx="16" cy="12" r="1.1" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;