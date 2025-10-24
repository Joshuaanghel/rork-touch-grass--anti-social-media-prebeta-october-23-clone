import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers: () => ({
        'Content-Type': 'application/json',
      }),
      fetch: async (url, options) => {
        try {
          console.log('[tRPC] Making request to:', url);
          console.log('[tRPC] Base URL:', getBaseUrl());
          
          const response = await fetch(url, options);
          
          if (!response.ok) {
            console.error('[tRPC] HTTP error:', response.status, response.statusText);
            const text = await response.text();
            console.error('[tRPC] Response body:', text.substring(0, 500));
            
            if (response.status === 404) {
              throw new Error('Backend API not found. Make sure the server is running and the URL is correct.');
            }
            
            throw new Error(`HTTP ${response.status}: ${text}`);
          }
          
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
          console.log('[tRPC] Raw response:', text.substring(0, 200));
          
          return response;
        } catch (error) {
          console.error('[tRPC] Fetch error:', error);
          if (error instanceof TypeError && error.message.includes('Network request failed')) {
            console.error('[tRPC] Network error - check that the backend server is running and accessible');
            console.error('[tRPC] Current base URL:', getBaseUrl());
          }
          throw error;
        }
      },
    }),
  ],
});
