import React from 'react';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';

interface ArtistCardProps {
  artist: { id: string; displayName: string; rating: number; reviewCount: number; subCategories: string[] };
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const navigation = useNavigation();
  return (
    <Card style={{ margin: 8 }} onPress={() => navigation.navigate('ArtistProfile', { artistId: artist.id })}>
      <Card.Content>
        <Title>{artist.displayName}</Title>
        <Paragraph>Rating: {artist.rating} ★ ({artist.reviewCount} reviews)</Paragraph>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {artist.subCategories.map((sub) => (
            <Chip key={sub} style={{ margin: 2 }}>{sub}</Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

export default ArtistCard;