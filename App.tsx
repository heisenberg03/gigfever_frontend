import React, { useEffect } from 'react';
import { PaperProvider, Portal } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/stores/authStore';
import AppContent from './src/navigation/AppNavigator';
import { theme } from './src/theme';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { refreshToken } from './src/utils/refreshToken';

loadDevMessages();
loadErrorMessages();

// Error handling link with token refresh logic
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        return new Promise((resolve, reject) => {
          refreshToken()
            .then((newToken) => {
              useAuthStore.getState().setToken(newToken);
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${newToken}`,
                },
              });
              resolve(forward(operation));
            })
            .catch(() => {
              useAuthStore.getState().logout();
              reject();
            });
        });
      }
    }
    console.log('GraphQL Errors:', graphQLErrors);
  }
  if (networkError) console.log('Network Error:', networkError);
});

// Authentication link to attach token to headers
const authLink = setContext((_, { headers }) => {
  const { accessToken } = useAuthStore.getState();
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

// HTTP link for queries and mutations
const httpLink = new HttpLink({ uri: 'http://192.168.0.102:4000/graphql' });

// WebSocket link for subscriptions
const wsLink = new WebSocketLink({
  uri: 'ws://192.168.0.102:4000/graphql',
  options: {
    reconnect: true,
    reconnectionAttempts: 5,
    timeout: 30000,
    connectionParams: () => {
      const { accessToken } = useAuthStore.getState();
      return {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      };
    },
  },
});

// Split link: WebSocket for subscriptions, HTTP for queries/mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink
);

// Apollo Client setup
export const client = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
    query: { errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
});

export default function App() {
  useEffect(() => {
    const subscriptionClient = (wsLink as any).subscriptionClient;

    return () => {
      if (subscriptionClient) {
        subscriptionClient.close();
      }
    };
  }, []);

  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <Portal.Host>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </Portal.Host>
        </PaperProvider>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}