import React from 'react';
import { ChatBox } from './components/ChatBox';
import { ModelUpload } from './components/ModelUpload';
import WalletConnect  from './components/WalletConnect';
import { DocumentUpload } from './components/DocumentUpload';

declare global {
  interface Window {
    ethereum: any;
  }
}

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI Chat Assistant</h1>
          <WalletConnect />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChatBox />
          </div>
          <div className="space-y-8">
            <ModelUpload />
            <DocumentUpload />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;