import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from './Button';
import { api } from '../api/client';
import { useDocumentStatus } from '../hooks/useDocumentStatus';

interface Message {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export const ChatBox: React.FC = () => {
  const { documents } = useDocumentStatus();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<string | null>('none');
  const [isLoading, setIsLoading] = useState(false);

  const completedDocuments = Object.entries(documents).filter(
    ([_, doc]) => doc.status === 'completed'
  );

  const sendMessage = async () => {
    if (!input.trim()) return; // Prevent empty messages
  
    setMessages(prev => [...prev, { content: input, sender: 'user', timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
  
    console.log('Here 1');
  
    try {
      console.log('Here 2');
  
      // Ensure the selected document is properly set or empty
      const documentId = selectedDocument && selectedDocument !== 'none' ? selectedDocument : '';
  
      // Fetch the answer
      const answer = await api.documents.query(documentId, input, "your_token_here");
  
      console.log("Received Answer:", answer); // Debugging step
  
      if (answer) {
        setMessages(prev => [...prev, { content: answer.toString().trim(), sender: 'ai', timestamp: new Date() }]);
      } else {
        setMessages(prev => [...prev, { content: 'No response received.', sender: 'ai', timestamp: new Date() }]);
      }
  
    } catch (error) {
      console.error("Error processing request:", error);
      setMessages(prev => [...prev, { content: 'Error processing request.', sender: 'ai', timestamp: new Date() }]);
    } finally {
      setIsLoading(false); // Ensure loading state is cleared
    }
  };
  

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg">
      <div className="p-4 border-b">
        <select
          value={selectedDocument || 'none'}
          onChange={(e) => setSelectedDocument(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="none">None</option>
          {completedDocuments.map(([id, doc]) => (
            <option key={id} value={id}>
              {doc.summary || 'Processed Document'}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            <Send className="w-5 h-5" />
          </Button>
          <Button variant="secondary" disabled={isLoading}>
            <Paperclip className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
