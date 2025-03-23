import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, TextInput, Menu, Button } from 'react-native-paper';

interface SingleSelectDropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  style?: object;
}

const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({
  label,
  value,
  onValueChange,
  items,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    closeMenu();
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu}>
            <TextInput
              mode="outlined"
              value={items.find((item) => item.value === value)?.label || ''}
              placeholder={`Select ${label}`}
              editable={false}
              style={styles.input}
            />
          </TouchableOpacity>
        }
      >
        <TextInput
          mode="flat"
          placeholder="Search..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelect(item.value)}>
              <Text style={styles.menuItem}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'white',
  },
  searchInput: {
    marginHorizontal: 8,
    marginBottom: 8,
  },
  menuItem: {
    padding: 12,
    fontSize: 16,
  },
});

export default SingleSelectDropdown;