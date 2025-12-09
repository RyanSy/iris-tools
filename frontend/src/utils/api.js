import { useAuth0 } from "@auth0/auth0-react";

// Custom hook for authenticated API calls
export const useApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  const apiFetch = async (endpoint, options = {}) => {
    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  return { apiFetch };
};