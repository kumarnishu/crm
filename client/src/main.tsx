import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryClientProvider, QueryClient } from "react-query";

import './index.css'
import { UserProvider } from "./contexts/userContext";
import { BrowserRouter } from "react-router-dom";
import { LoadingProvider } from './contexts/loaderContext.tsx';
import { AlertProvider } from './contexts/alertContext.tsx';
import { PartyProvider } from './contexts/partyContext.tsx';


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: false
    }
  }
});
ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <UserProvider>
        <LoadingProvider>
          <AlertProvider>
            <PartyProvider>
              <App />
            </PartyProvider>
          </AlertProvider>
        </LoadingProvider>
      </UserProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

