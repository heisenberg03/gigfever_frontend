import { gql } from '@apollo/client';
import { client } from '../../App'; // Import Apollo client
import { useAuthStore } from '../stores/authStore';

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
    }
  }
`;

export const refreshToken = async () => {
  const { refreshToken: currentRefreshToken, logout } = useAuthStore.getState();
  if (!currentRefreshToken) {
    logout();
    throw new Error('No refresh token available');
  }
  try {
    const { data } = await client.mutate({
      mutation: REFRESH_TOKEN,
      variables: { refreshToken: currentRefreshToken },
    });
    const newAccessToken = data?.refreshToken?.accessToken;
    if (!newAccessToken) throw new Error('Invalid refresh token');
    useAuthStore.getState().setToken(newAccessToken);
    return newAccessToken;
  } catch (error) {
    logout();
    throw error;
  }
};