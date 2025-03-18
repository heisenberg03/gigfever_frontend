import React, { useState } from 'react';
import { View, ScrollView, TextInput, Switch, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useSubCategoryStore } from '../stores/subCategoryStore';
import MultiSelectDropdown from '../components/MultiSelectDropdown';

const EditProfileScreen = () => {
  const { user, updateUser } = useAuthStore();
  const { categories } = useCategoryStore();
  const { subCategories } = useSubCategoryStore();
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isArtist, setIsArtist] = useState(user?.isArtist || false);
  const [portfolio, setPortfolio] = useState<{ type: string; url: string }[]>(user?.portfolio || []);
  const [socialLinks, setSocialLinks] = useState(user?.socialLinks || { instagram: '', twitter: '' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(user?.categories || []);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>(user?.subCategories || []);

  const addPortfolioItem = () => setPortfolio([...portfolio, { type: '', url: '' }]);
  const removePortfolioItem = (index: number) => setPortfolio(portfolio.filter((_, i) => i !== index));
  const updatePortfolioItem = (index: number, field: 'type' | 'url', value: string) => {
    const newPortfolio = [...portfolio];
    newPortfolio[index][field] = value;
    setPortfolio(newPortfolio);
  };

  const handleSave = () => {
    updateUser({
      displayName,
      bio,
      isArtist,
      portfolio,
      socialLinks,
      categories: selectedCategories,
      subCategories: selectedSubCategories,
    });
    navigation.goBack();
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display Name" style={{ marginBottom: 16 }} />
      <TextInput value={bio} onChangeText={setBio} placeholder="Bio" multiline style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Text>List as Artist: </Text>
        <Switch value={isArtist} onValueChange={setIsArtist} />
      </View>
      <Text style={{ fontWeight: 'bold' }}>Portfolio</Text>
      {portfolio.map((item, index) => (
        <View key={index} style={{ marginBottom: 8 }}>
          <TextInput
            value={item.type}
            onChangeText={(text) => updatePortfolioItem(index, 'type', text)}
            placeholder="Type (e.g., video)"
          />
          <TextInput
            value={item.url}
            onChangeText={(text) => updatePortfolioItem(index, 'url', text)}
            placeholder="URL"
          />
          <Button onPress={() => removePortfolioItem(index)}>Remove</Button>
        </View>
      ))}
      <Button mode="outlined" onPress={addPortfolioItem}>Add Portfolio Item</Button>
      <Text style={{ fontWeight: 'bold', marginTop: 16 }}>Social Links</Text>
      <TextInput
        value={socialLinks.instagram}
        onChangeText={(text) => setSocialLinks({ ...socialLinks, instagram: text })}
        placeholder="Instagram URL"
        style={{ marginBottom: 8 }}
      />
      <TextInput
        value={socialLinks.twitter}
        onChangeText={(text) => setSocialLinks({ ...socialLinks, twitter: text })}
        placeholder="Twitter URL"
        style={{ marginBottom: 8 }}
      />
      <MultiSelectDropdown options={categories} selected={selectedCategories} onSelect={setSelectedCategories} label="Categories" />
      <MultiSelectDropdown options={subCategories} selected={selectedSubCategories} onSelect={setSelectedSubCategories} label="Sub-Categories" />
      <Button mode="contained" onPress={handleSave} style={{ marginTop: 16 }}>Save</Button>
    </ScrollView>
  );
};

export default EditProfileScreen;