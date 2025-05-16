import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Box, CssBaseline } from '@mui/material';
import { UserList } from './components/users/UserList';

// Configuración simple del QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline />
      <Box>
        <UserList />
      </Box>
    </QueryClientProvider>
  );
}

export default App;
