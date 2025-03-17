// App.tsx
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useFetchCategories } from './src/stores/categoryStore';
import { useFetchSubCategories } from './src/stores/subCategoryStore';
import { useFetchNotifications } from './src/stores/notificationStore';

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000/graphql' }), // Replace with your IP
  cache: new InMemoryCache(),
});

const theme = {
  colors: {
    primary: '#6B48FF',
    secondary: '#26A69A',
    background: '#F5F5F5',
  },
};

const AppContent: React.FC = () => {
  useFetchCategories();
  useFetchSubCategories();
  useFetchNotifications();
  return <AppNavigator />;
};

export default function App() {
  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}