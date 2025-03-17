import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface SingleSelectDropdownProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
}

const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({ options, selected, onSelect, label }) => (
  <View style={{ margin: 8 }}>
    <Text>{label}</Text>
    <Picker selectedValue={selected} onValueChange={onSelect}>
      <Picker.Item label={`Select ${label}`} value="" />
      {options.map((option) => (
        <Picker.Item key={option} label={option} value={option} />
      ))}
    </Picker>
  </View>
);

export default SingleSelectDropdown;