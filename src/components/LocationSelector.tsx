import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Text, Searchbar, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, gql } from '@apollo/client';
import { theme } from '../theme';

const GET_CITIES = gql`
  query GetCities {
    cities {
      id
      name
      state
    }
  }
`;

interface LocationSelectorProps {
  currentLocation: string;
  onLocationChange: (location: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  currentLocation,
  onLocationChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data } = useQuery(GET_CITIES);

  const cities = data?.cities || [];
  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (cityName: string) => {
    onLocationChange(cityName);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="location-on" size={20} color={styles.locationIcon.color} />
        <Text style={styles.locationText}>{currentLocation}</Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={styles.locationIcon.color} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>

            <Searchbar
              placeholder="Search cities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleLocationSelect(item.name)}
                >
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Text style={styles.stateName}>{item.state}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  locationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  locationIcon: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBar: {
    margin: 16,
    elevation: 0,
  },
  cityItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '500',
  },
  stateName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});