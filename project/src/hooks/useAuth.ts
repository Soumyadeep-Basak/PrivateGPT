import { useState, useCallback } from 'react';
import { api } from '../api/client';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      const address = accounts[0];
      const message = `Sign this message to authenticate with our app: ${Date.now()}`;
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      const authResponse = await api.auth.verifyWallet(address, signature);
      setToken(authResponse.token);
      setIsAuthenticated(true);
      setError(null);
      
      return authResponse;
    } catch (err) {
      setError('The user has invalid details');
      setIsAuthenticated(false);
      setToken(null);
      throw err;
    }
  }, []);

  return {
    isAuthenticated,
    token,
    error,
    connectWallet,
  };
}