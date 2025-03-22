// src/screens/PortfolioScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert, ActivityIndicator, Linking, TouchableOpacity } from 'react-native';
import { Button, Menu, IconButton } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client';
import { useAuthStore } from '../../stores/authStore';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { GET_PORTFOLIO, ADD_PORTFOLIO_ITEM, REMOVE_PORTFOLIO_ITEM } from '../../graphql/queries';

// Simulated social media media (with mediaType, mediaUrl, and thumbnail)
const SOCIAL_MEDIA_MEDIA = {
  instagram: [
    {
      id: 'ig1',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&h=100&fit=crop',
    },
    {
      id: 'ig2',
      mediaType: 'IMAGE',
      mediaUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206',
      thumbnail: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=100&h=100&fit=crop',
    },
  ],
  youtube: [
    {
      id: 'yt1',
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    },
    {
      id: 'yt2',
      mediaType: 'VIDEO',
      mediaUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/mqdefault.jpg',
    },
  ],
};

export const PortfolioScreen = () => {
  const { currentUser:user } = useAuthStore();
  const { portfolio, setPortfolio, addMedia, removeMedia } = usePortfolioStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [loadingThumbnails, setLoadingThumbnails] = useState(false);

  const { data, loading, error } = useQuery(GET_PORTFOLIO, {
    variables: { userId: user?.id },
    skip: !user,
  });

  useEffect(() => {
    if (data?.portfolio) {
      setPortfolio(data.portfolio);
    }
  }, [data, setPortfolio]);

  const [addPortfolioItem] = useMutation(ADD_PORTFOLIO_ITEM, {
    update: (cache, { data: { addPortfolioItem } }) => {
      cache.modify({
        fields: {
          portfolio(existingPortfolio = []) {
            return [...existingPortfolio, addPortfolioItem];
          },
        },
      });
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
      removeMedia(addPortfolioItem.id); // Rollback on failure
    },
  });

  const [removePortfolioItem] = useMutation(REMOVE_PORTFOLIO_ITEM, {
    update: (cache, { data: { removePortfolioItem } }, { variables }) => {
      if (removePortfolioItem) {
        cache.modify({
          fields: {
            portfolio(existingPortfolio = []) {
              return existingPortfolio.filter((item) => item.id !== variables.id);
            },
          },
        });
      }
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
      addMedia({ id: variables.id, userId: user.id, mediaType: 'IMAGE', mediaUrl: 'restored', thumbnail: 'restored' }); // Rollback on failure
    },
  });

  if (loading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const selectPlatform = (platform) => {
    setSelectedPlatform(platform);
    closeMenu();
  };

  const handleAddMedia = async (media) => {
    setLoadingThumbnails(true);
    try {
      const newMedia = {
        id: `p${Date.now()}`,
        userId: user?.id,
        mediaType: media.mediaType,
        mediaUrl: media.mediaUrl,
        thumbnail: media.thumbnail,
      };
      addMedia(newMedia); // Optimistic update
      await addPortfolioItem({
        variables: {
          userId: user.id,
          input: {
            mediaType: media.mediaType,
            mediaUrl: media.mediaUrl,
            thumbnail: media.thumbnail,
          },
        },
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to add media');
      removeMedia(media.id); // Rollback on failure
    } finally {
      setLoadingThumbnails(false);
    }
  };

  const handleRemoveMedia = (mediaId) => {
    removeMedia(mediaId); // Optimistic update
    removePortfolioItem({ variables: { id: mediaId } });
  };

  const handleViewMedia = (mediaUrl, mediaType) => {
    if (mediaType === 'VIDEO') {
      Linking.openURL(mediaUrl).catch(() => Alert.alert('Error', 'Unable to open video'));
    } else {
      // For images, you could navigate to a full-screen image viewer
      Alert.alert('View Image', 'Full-screen image viewer not implemented yet');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio</Text>
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <Button mode="contained" onPress={openMenu} style={styles.addButton}>
            Add Media from Social Media
          </Button>
        }
      >
        <Menu.Item onPress={() => selectPlatform('instagram')} title="Instagram" />
        <Menu.Item onPress={() => selectPlatform('youtube')} title="YouTube" />
      </Menu>

      {selectedPlatform && (
        <View style={styles.mediaSelection}>
          <Text style={styles.subtitle}>Select Media from {selectedPlatform}</Text>
          {loadingThumbnails ? (
            <ActivityIndicator size="large" color="#6B48FF" />
          ) : (
            <FlatList
              data={SOCIAL_MEDIA_MEDIA[selectedPlatform]}
              renderItem={({ item }) => (
                <View style={styles.mediaItem}>
                  <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                  <Text style={styles.mediaType}>{item.mediaType}</Text>
                  <Button
                    mode="contained"
                    onPress={() => handleAddMedia(item)}
                    style={styles.selectButton}
                  >
                    Add to Portfolio
                  </Button>
                </View>
              )}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      )}

      <Text style={styles.subtitle}>Your Portfolio</Text>
      <FlatList
        data={portfolio}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <TouchableOpacity onPress={() => handleViewMedia(item.mediaUrl, item.mediaType)}>
              <Image
                source={{ uri: item.thumbnail }}
                style={styles.thumbnail}
                onError={() => Alert.alert('Error', 'Failed to load thumbnail')}
              />
              {item.mediaType === 'VIDEO' && (
                <IconButton
                  icon="play-circle"
                  color="#fff"
                  size={30}
                  style={styles.playIcon}
                />
              )}
            </TouchableOpacity>
            <Text style={styles.mediaType}>{item.mediaType}</Text>
            <Button
              mode="outlined"
              onPress={() => handleRemoveMedia(item.id)}
              style={styles.removeButton}
            >
              Remove
            </Button>
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListEmptyComponent={<Text style={styles.noData}>No media available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  addButton: { marginBottom: 16, backgroundColor: '#6B48FF' },
  mediaSelection: { marginBottom: 16 },
  mediaItem: { marginRight: 8, alignItems: 'center' },
  gridItem: { flex: 1, margin: 4, alignItems: 'center' },
  thumbnail: { width: 100, height: 100, borderRadius: 8 },
  playIcon: { position: 'absolute', top: 35, left: 35, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  mediaType: { fontSize: 12, color: '#666', marginTop: 4 },
  selectButton: { marginTop: 4, backgroundColor: '#6B48FF' },
  removeButton: { marginTop: 4 },
  noData: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 16 },
});

export default PortfolioScreen;