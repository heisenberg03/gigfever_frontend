// src/screens/PortfolioScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { Button, Menu, IconButton, useTheme } from 'react-native-paper';
import { useQuery, useMutation } from '@apollo/client';
import { useAuthStore, UserProfile } from '../../stores/authStore';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { GET_PORTFOLIO, ADD_PORTFOLIO_ITEM, REMOVE_PORTFOLIO_ITEM } from '../../graphql/queries';

// YouTube OAuth configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

interface MediaItem {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnail: string;
  source: 'youtube' | 'instagram' | 'facebook' | 'x';
}

export const PortfolioScreen = ({navigation}: any) => {
  const { currentUser } = useAuthStore();
  const theme = useTheme();
  const [portfolio, setPortfolio] = useState<MediaItem[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialMediaItems, setSocialMediaItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);

  // Fetch portfolio data
  const { data, loading: queryLoading } = useQuery(GET_PORTFOLIO, {
    variables: { userId: currentUser?.id },
    skip: !currentUser,
  });

  useEffect(() => {
    if (data?.portfolio) setPortfolio(data.portfolio);
  }, [data]);

  // Mutations for backend sync
  const [addPortfolioItem] = useMutation(ADD_PORTFOLIO_ITEM, {
    onError: (error) => Alert.alert('Error', error.message),
  });
  const [removePortfolioItem] = useMutation(REMOVE_PORTFOLIO_ITEM, {
    onError: (error) => Alert.alert('Error', error.message),
  });

  // YouTube Authentication
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: 'YOUR_YOUTUBE_CLIENT_ID',
      scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
      redirectUri: makeRedirectUri({ scheme: 'your.app' }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      fetchYoutubeMedia(code);
    }
  }, [response]);

  const fetchYoutubeMedia = async (code: string, nextPageToken?: string) => {
    setLoading(true);
    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: 'YOUR_YOUTUBE_CLIENT_ID',
          client_secret: 'YOUR_YOUTUBE_CLIENT_SECRET',
          redirect_uri: makeRedirectUri({ scheme: 'your.app' }),
          grant_type: 'authorization_code',
        }),
      });
      const { access_token } = await tokenResponse.json();

      const mediaResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&mine=true&maxResults=10&pageToken=${nextPageToken || ''}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const mediaData = await mediaResponse.json();
      const items = mediaData.items.map((item: any) => ({
        id: item.id,
        mediaType: 'VIDEO' as const,
        mediaUrl: `https://www.youtube.com/watch?v=${item.id}`,
        thumbnail: item.snippet.thumbnails.high.url,
        source: 'youtube' as const,
      }));
      setSocialMediaItems((prev) => [...prev, ...items]);
      if (mediaData.nextPageToken) setPage((prev) => prev + 1);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch YouTube media');
    } finally {
      setLoading(false);
    }
  };

  // Menu handlers
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const selectPlatform = (platform: string) => {
    // setSelectedPlatform(platform);
    // setSocialMediaItems([]);
    // setLoading(true);
    // const platformAuthMap: Record<string, keyof UserProfile> = {
    //   youtube: 'youtubeId',
    //   instagram: 'instagramUsername',
    //   facebook: 'facebookId',
    //   x: 'xUsername',
    // };
    // const authField = platformAuthMap[platform];
    // if (currentUser && currentUser[authField]) {
    //   if (platform === 'youtube') fetchYoutubeMedia('mock-code'); // Replace with real token
    //   else {
    //     Alert.alert('Info', `${platform} integration not implemented yet`);
    //     setLoading(false);
    //   }
    // } else {
    //   if (platform === 'youtube') promptAsync();
    //   else Alert.alert('Authentication Required', `Please authenticate with ${platform}`);
    //   setLoading(false);
    // }
    closeMenu();
  };

  // Portfolio management with optimistic updates
  const handleAddMedia = async (media: MediaItem) => {
    if (portfolio.length >= 9) {
      Alert.alert('Limit Reached', 'You can only add up to 9 items.');
      return;
    }
    const newMedia = { ...media, id: `p${Date.now()}`, userId: currentUser?.id };
    setPortfolio((prev) => [...prev, newMedia]); // Optimistic add
    try {
      await addPortfolioItem({
        variables: {
          userId: currentUser?.id,
          input: {
            mediaType: media.mediaType,
            mediaUrl: media.mediaUrl,
            thumbnail: media.thumbnail,
            source: media.source,
          },
        },
      });
    } catch (error) {
      setPortfolio((prev) => prev.filter((item) => item.id !== newMedia.id)); // Rollback
    }
  };

  const handleRemoveMedia = async (id: string) => {
    Alert.alert(
      'Remove Media',
      'Are you sure you want to remove this item from your portfolio?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const itemToRemove = portfolio.find((item) => item.id === id);
            setPortfolio((prev) => prev.filter((item) => item.id !== id)); // Optimistic remove
            try {
              await removePortfolioItem({ variables: { id } });
            } catch (error) {
              if (itemToRemove) {
                setPortfolio((prev) => [...prev, itemToRemove]); // Rollback
                Alert.alert('Error', 'Failed to remove item');
              }
            }
          }
        }
      ]
    );
  };

  // Render functions
  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity style={styles.mediaItem} onPress={() => handleAddMedia(item)}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        {item.mediaType === 'VIDEO' && (
          <View style={styles.videoOverlay}>
            <MaterialIcons name="play-circle-filled" size={24} color="white" />
          </View>
        )}
      </View>
      <Text style={styles.mediaType}>{item.mediaType}</Text>
    </TouchableOpacity>
  );

  const renderPortfolioItem = ({ item }: { item: MediaItem | null }) =>
    item ? (
      <View style={styles.portfolioItem}>
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          {item.mediaType === 'VIDEO' && (
            <View style={styles.videoOverlay}>
              <MaterialIcons name="play-circle-filled" size={24} color="white" />
            </View>
          )}
          <IconButton
            icon="close-circle"
            size={20}
            onPress={() => handleRemoveMedia(item.id)}
            style={styles.removeButton}
            iconColor={theme.colors.error}
          />
        </View>
      </View>
    ) : (
      <View style={styles.placeholder}>
        <MaterialIcons name="add-a-photo" size={24} color="#999" />
      </View>
    );

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to manage your portfolio.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <Text style={styles.title}>Manage Portfolio</Text>
        </View>

        {/* Enhanced Social Media Selection Menu with Icons */}
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Button mode="contained" onPress={openMenu} style={styles.addButton}>
              Import from Social Media
            </Button>
          }
        >
          <Menu.Item
            onPress={() => selectPlatform('youtube')}
            title="YouTube"
            leadingIcon={() => <FontAwesome5 name="youtube" size={20} color="#FF0000" />}
          />
          <Menu.Item
            onPress={() => selectPlatform('instagram')}
            title="Instagram"
            leadingIcon={() => <FontAwesome5 name="instagram" size={20} color="#E1306C" />}
          />
          <Menu.Item
            onPress={() => selectPlatform('facebook')}
            title="Facebook"
            leadingIcon={() => <FontAwesome5 name="facebook" size={20} color="#1877F2" />}
          />
          <Menu.Item
            onPress={() => selectPlatform('x')}
            title="X"
            leadingIcon={() => <FontAwesome5 name="twitter" size={20} color="#1DA1F2" />}
          />
        </Menu>

        {/* Improved Media Selector */}
        {selectedPlatform && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Select from {selectedPlatform}</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#6B48FF" />
            ) : (
              <FlatList
                data={socialMediaItems}
                renderItem={renderMediaItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                onEndReached={() => {
                  if (selectedPlatform === 'youtube' && currentUser?.youtubeId) {
                    fetchYoutubeMedia('mock-code', 'nextPageToken'); // Replace with real token
                  }
                }}
                onEndReachedThreshold={0.5}
              />
            )}
          </View>
        )}

        {/* 3x3 Grid with Placeholders */}
        <View style={styles.section}>
          <Text style={styles.subtitle}>Your Portfolio ({portfolio.length}/9)</Text>
          {queryLoading ? (
            <ActivityIndicator size="large" color="#6B48FF" />
          ) : (
            <FlatList
              data={[...portfolio, ...Array(9 - portfolio.length).fill(null)]}
              renderItem={renderPortfolioItem}
              keyExtractor={(item, index) => item?.id || `placeholder-${index}`}
              numColumns={3}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    flex: 1 
  },
  subtitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  section: { marginBottom: 16 },
  addButton: { backgroundColor: '#6B48FF', marginBottom: 16 },
  mediaItem: { marginRight: 8, alignItems: 'center' },
  portfolioItem: { flex: 1, padding: 4},
  thumbnail: { width: 100, height: 100, borderRadius: 8 },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    margin: 0,
    padding: 0,
    backgroundColor: 'white',
  },
  placeholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  mediaType: { fontSize: 12, color: '#666' },
  errorText: { fontSize: 16, color: '#FF0000', textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PortfolioScreen;