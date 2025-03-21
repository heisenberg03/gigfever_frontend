// src/screens/profile/InvitesSection.tsx
import React from 'react';
import { View } from 'react-native';
import { Text, Divider, useTheme, Card, Button } from 'react-native-paper';
import { gql, useQuery } from '@apollo/client';

const MY_INVITES = gql`
  query MyInvites {
    invites {
      id
      event {
        title
        dateTime
        location
      }
      status
    }
  }
`;

export const InvitesSection = () => {
  const { data, loading, error } = useQuery(MY_INVITES);
  const theme = useTheme();

  if (loading || !data?.invites) return null;

  return (
    <View className="p-4">
      <Text variant="titleMedium" className="mb-2">My Invites</Text>
      <Divider className="mb-3" />

      {data.invites.length === 0 ? (
        <Text className="text-gray-500">You have no invites yet.</Text>
      ) : (
        data.invites.map((invite: any) => (
          <Card key={invite.id} className="mb-4">
            <Card.Title title={invite.event.title} subtitle={invite.event.dateTime + ' • ' + invite.event.location} />
            <Card.Content>
              <Text>Status: {invite.status}</Text>
            </Card.Content>
            <Card.Actions>
              <Button>Respond</Button>
            </Card.Actions>
          </Card>
        ))
      )}
    </View>
  );
};
