import React, { useState, useRef, useEffect } from 'react';

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const LLM_MODEL = 'qwen-2.5-32b';
const API_KEY = process.env.REACT_APP_GROQ_API_KEY;

const Chat = ({ tasks }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      return newMessages;
    });
    setInput('');
    setIsLoading(true);

    try {
      const messagesToSend = [...messages, userMessage];

      const tools = [
        {
          type: 'function',
          function: {
            name: 'get_tasks',
            description: 'Retrieve the list of tasks for the user',
            parameters: { type: 'object', properties: {}, required: [] },
          },
        },
      ];

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: LLM_MODEL,
          messages: messagesToSend,
          tools,
          tool_choice: 'auto',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`API responded with status ${response.status}: ${errorData ? JSON.stringify(errorData) : 'No error details'}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message;

      if (!assistantMessage) {
        throw new Error('No assistant message received in response');
      }

      if (assistantMessage.tool_calls) {
        const toolCall = assistantMessage.tool_calls[0];
        if (toolCall.function.name === 'get_tasks') {
          const tasksContent =
            tasks.length > 0
              ? `The user has the following tasks:\n${tasks.map((task) => `- ${task.title}: ${task.description} (${task.status})`).join('\n')}`
              : 'The user has no tasks currently.';
          const functionResponse = {
            role: 'tool',
            name: 'get_tasks',
            tool_call_id: toolCall.id,
            content: tasksContent,
          };
          const updatedMessages = [...messagesToSend, assistantMessage, functionResponse];
          const followUpResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: LLM_MODEL,
              messages: updatedMessages,
              tools,
              tool_choice: 'auto',
            }),
          });

          if (!followUpResponse.ok) {
            const errorData = await followUpResponse.json().catch(() => null);
            throw new Error(`Follow-up API responded with status ${followUpResponse.status}: ${errorData ? JSON.stringify(errorData) : 'No error details'}`);
          }

          const followUpData = await followUpResponse.json();
          const finalMessage = followUpData.choices[0]?.message;

          if (finalMessage) {
            setMessages((prev) => {
              const newMessages = [...prev, finalMessage];
              return newMessages;
            });
          } else {
            throw new Error('Follow-up response format not as expected: ' + JSON.stringify(followUpData));
          }
        }
      } else {
        if (assistantMessage.content?.trim()) {
          setMessages((prev) => {
            const newMessages = [...prev, assistantMessage];
            return newMessages;
          });
        } else {
          console.warn('Received empty response from API');
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: "I'm sorry, I couldn't generate a response." },
          ]);
        }
      }
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message || 'An unexpected error occurred');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or check the console for details.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-center space-y-3">
              {/* ... empty-chat content ... */}
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 rounded-lg p-4 ${message.role === 'user' ? 'bg-violet-600 text-white rounded-br-none shadow-lg' : 'bg-white shadow-md rounded-bl-none border border-gray-200'}`}>
              <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-md rounded-lg rounded-bl-none p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-300 bg-white shadow-inner">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-200"
            disabled={isLoading}
          />
          <button type="button" onClick={handleClearChat} disabled={isLoading} className="clear-chat-button bg-slate-600 text-white p-3 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition-colors duration-200">
            Clear Chat
          </button>
          <button
            type="submit"
            className="bg-violet-600 text-white p-3 rounded-full hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 transition-colors duration-200"
            disabled={isLoading || !input.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;