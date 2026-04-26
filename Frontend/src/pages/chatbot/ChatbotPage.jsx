import { useState, useRef, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I am your HR Policy Assistant. Ask me anything about leave policy, attendance, payroll, appraisals, or any other HR related questions!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/ask', { message: userMessage });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response
      }]);
    } catch (err) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Sorry, I could not process your request. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How many sick leaves do I get per year?",
    "What is the notice period for resignation?",
    "When is salary credited every month?",
    "What are the office working hours?",
  ];

  return (
    <div className="p-6 flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          🤖 HR Policy Chatbot
        </h1>
        <p className="text-gray-500 text-sm">
          Powered by Groq AI + RAG — Ask anything about HR policies
        </p>
      </div>

      {/* Chat container */}
      <div className="flex-1 bg-white rounded-2xl shadow flex flex-col overflow-hidden">

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-2xl ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>

                {/* Message bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>

              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}>
                    </div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested questions — only show at start */}
        {messages.length === 1 && (
          <div className="px-6 pb-3">
            <p className="text-xs text-gray-400 mb-2">
              💡 Suggested questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4 flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about leave policy, payroll, attendance... (Enter to send)"
            rows={1}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? '...' : 'Send ➤'}
          </button>
        </div>

      </div>
    </div>
  );
}