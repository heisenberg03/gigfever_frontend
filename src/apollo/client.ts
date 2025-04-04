import { ApolloClient, InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
  typePolicies: {
    Location: {
      merge(existing, incoming) {
        return {
          ...existing,
          ...incoming,
          // Ensure we keep all fields from both objects
          lat: incoming.lat ?? existing?.lat,
          lng: incoming.lng ?? existing?.lng,
        };
      },
    },
  },
});

export const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache,
}); 