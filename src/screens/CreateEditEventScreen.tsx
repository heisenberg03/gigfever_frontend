import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { Button, Card, Chip } from 'react-native-paper';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Marker } from 'react-native-maps';
import tw from 'tailwind-react-native-classnames';
import { GET_EVENT_DETAILS } from '../graphql/queries';
import { CREATE_EVENT, UPDATE_EVENT } from '../graphql/mutations';

const CreateEditEventScreen = ({ route, navigation }) => {
  const { eventId } = route.params || {};
  const isEditing = !!eventId;
  const { data, loading } = useQuery(GET_EVENT_DETAILS, { variables: { id: eventId }, skip: !isEditing });

  const [form, setForm] = useState({
    title: '',
    type: '',
    categories: ['Music'],
    subcategories: [],
    date: new Date(),
    time: new Date(),
    location: { lat: 37.7749, lng: -122.4194, address: '' },
    description: '',
    budget: { min: 0, max: 0 },
  });
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [createEvent] = useMutation(CREATE_EVENT);
  const [updateEvent] = useMutation(UPDATE_EVENT);

  useEffect(() => {
    if (isEditing && data) {
      const event = data.event;
      setForm({
        title: event.title,
        type: event.type,
        categories: event.categories,
        subcategories: event.subcategories,
        date: new Date(event.date),
        time: new Date(`1970-01-01T${event.time}`),
        location: event.location,
        description: event.description,
        budget: event.budget,
      });
    }
  }, [data, isEditing]);

  const eventTypes = ['Concert', 'Club', 'Private Party'];
  const subcategoriesOptions = {
    Music: ['Rock', 'Pop', 'Jazz'],
    Club: ['DJ', 'Dance'],
    'Private Party': ['Solo', 'Band'],
  };

  const handleLocationSelect = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const address = `Mock Address for ${latitude}, ${longitude}`; // Mock reverse geocoding
    setForm({ ...form, location: { lat: latitude, lng: longitude, address } });
  };

  const handleSubmit = async () => {
    if (!form.location.address) {
      Alert.alert('Error', 'Please select a location on the map.');
      return;
    }
    const variables = {
      ...form,
      date: form.date.toISOString().split('T')[0],
      time: form.time.toTimeString().split(' ')[0],
      id: eventId,
    };
    if (isEditing) {
      await updateEvent({ variables });
    } else {
      await createEvent({ variables });
    }
    navigation.goBack();
  };

  return (
    <ScrollView style={tw`flex-1 bg-gray-100 p-4`}>
      <TextInput
        style={tw`border p-2 mb-4 rounded`}
        value={form.title}
        onChangeText={(text) => setForm({ ...form, title: text })}
        placeholder="Event Title"
      />

      <Picker
        selectedValue={form.type}
        onValueChange={(value) => setForm({ ...form, type: value, subcategories: [] })}
        style={tw`mb-4`}
      >
        {eventTypes.map((type) => <Picker.Item key={type} label={type} value={type} />)}
      </Picker>

      <Card style={tw`p-2 mb-4`}>
        <Text>Category</Text>
        <Chip selected style={tw`mt-2 bg-teal-200`}>{form.categories[0]}</Chip>
      </Card>

      <Card style={tw`p-2 mb-4`}>
        <Text>Subcategories</Text>
        <View style={tw`flex-row flex-wrap mt-2`}>
          {form.type && subcategoriesOptions[form.type].map((sub) => (
            <Chip
              key={sub}
              selected={form.subcategories.includes(sub)}
              onPress={() => {
                const newSubs = form.subcategories.includes(sub)
                  ? form.subcategories.filter((s) => s !== sub)
                  : [...form.subcategories, sub];
                setForm({ ...form, subcategories: newSubs });
              }}
              style={tw`mr-2 mb-2 ${form.subcategories.includes(sub) ? 'bg-gray-200' : 'bg-gray-100'}`}
            >
              {sub}
            </Chip>
          ))}
        </View>
      </Card>

      <Button onPress={() => setShowDate(true)} style={tw`mb-4`}>Pick Date</Button>
      {showDate && (
        <DateTimePicker
          value={form.date}
          mode="date"
          onChange={(e, date) => { setShowDate(false); if (date) setForm({ ...form, date }); }}
        />
      )}

      <Button onPress={() => setShowTime(true)} style={tw`mb-4`}>Pick Time</Button>
      {showTime && (
        <DateTimePicker
          value={form.time}
          mode="time"
          onChange={(e, time) => { setShowTime(false); if (time) setForm({ ...form, time }); }}
        />
      )}

      <Card style={tw`mb-4`}>
        <Text style={tw`p-2`}>Select Location (Required)</Text>
        <MapView
          style={tw`w-full h-48`}
          initialRegion={{ latitude: form.location.lat, longitude: form.location.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          onPress={handleLocationSelect}
        >
          <Marker coordinate={{ latitude: form.location.lat, longitude: form.location.lng }} />
        </MapView>
        <Text style={tw`p-2 text-gray-700`}>{form.location.address || 'Tap map to select'}</Text>
      </Card>

      <TextInput
        style={tw`border p-2 mb-4 rounded h-24`}
        value={form.description}
        onChangeText={(text) => setForm({ ...form, description: text })}
        placeholder="Event Description"
        multiline
      />

      <TextInput
        style={tw`border p-2 mb-4 rounded`}
        value={form.budget.min.toString()}
        onChangeText={(text) => setForm({ ...form, budget: { ...form.budget, min: parseInt(text) || 0 } })}
        placeholder="Min Budget"
        keyboardType="numeric"
      />
      <TextInput
        style={tw`border p-2 mb-4 rounded`}
        value={form.budget.max.toString()}
        onChangeText={(text) => setForm({ ...form, budget: { ...form.budget, max: parseInt(text) || 0 } })}
        placeholder="Max Budget"
        keyboardType="numeric"
      />

      <Button mode="contained" onPress={handleSubmit} style={tw`mb-4`}>{isEditing ? 'Update Event' : 'Create Event'}</Button>
    </ScrollView>
  );
};

export default CreateEditEventScreen;