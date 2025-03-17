import React from 'react';
import { Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface EventCardProps {
  event: { id: string; title: string; category: string; date: string; location: string };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigation = useNavigation();
  return (
    <Card style={{ margin: 8 }} onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}>
      <Card.Content>
        <Title>{event.title}</Title>
        <Paragraph>Category: {event.category}</Paragraph>
        <Paragraph>Date: {new Date(event.date).toLocaleDateString()}</Paragraph>
        <Paragraph>Location: {event.location}</Paragraph>
      </Card.Content>
    </Card>
  );
};

export default EventCard;