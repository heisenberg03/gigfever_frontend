// src/screens/profile/PortfolioSection.tsx
import React from 'react';
import { View, Image } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { useQuery, gql } from '@apollo/client';
import { FlashList } from '@shopify/flash-list';
import { useAuthStore } from '../../store/authStore';

const MY_PORTFOLIO = gql`
  query MyPortfolio {
    portfolio {
      id
      bannerUrl
      type
      source
    }
  }
`;

export const PortfolioSection = () => {
  const theme = useTheme();
  const { data, loading } = useQuery(MY_PORTFOLIO);

  if (loading || !data?.portfolio) return null;
  if (data.portfolio.length === 0) {
    return (
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.colors.outline }}>No portfolio media added yet.</Text>
        </View>
      );
    }
  
    return (
      <View style={{ padding: 16 }}>
        <Text variant="titleMedium" style={{ marginBottom: 8 }}>Portfolio</Text>
        <Divider style={{ marginBottom: 12 }} />
        <FlashList
          data={data.portfolio}
          numColumns={2}
          estimatedItemSize={200}
          renderItem={({ item }: { item: { id: string; url: string; type: string; source: string } }) => (
            <View key={item.id} style={{ width: '50%', padding: 4 }}>
              <View style={{ 
                aspectRatio: 1, 
                borderRadius: 8,
                backgroundColor: theme.colors.surfaceVariant,
                overflow: 'hidden'
              }}>
                <Image 
                  source={{ uri: item.url }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
              <Text 
                variant="labelSmall" 
                style={{ 
                  textAlign: 'center', 
                  color: theme.colors.outline,
                  marginTop: 4 
                }}
              >
                {item.source.toUpperCase()}
              </Text>
            </View>
          )}
        />
      </View>
    );
  };