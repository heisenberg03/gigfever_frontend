import React from 'react';
import { View, Text } from 'react-native';
import { Checkbox } from 'react-native-paper';

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  label: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selected, onSelect, label }) => (
  <View style={{ margin: 8 }}>
    <Text>{label}</Text>
    {options.map((option) => (
      <Checkbox.Item
        key={option}
        label={option}
        status={selected.includes(option) ? 'checked' : 'unchecked'}
        onPress={() => {
          const newSelected = selected.includes(option)
            ? selected.filter((item) => item !== option)
            : [...selected, option];
          onSelect(newSelected);
        }}
      />
    ))}
  </View>
);

export default MultiSelectDropdown;