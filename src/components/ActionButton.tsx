import React from 'react';
import { Button } from 'react-native-paper';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onPress }) => {
  const getColor = () => {
    switch (label) {
      case 'Accept': return 'green';
      case 'Decline': return 'red';
      case 'Chat': return 'blue';
      default: return undefined;
    }
  };

  return (
    <Button mode="contained" onPress={onPress} color={getColor()} style={{ margin: 4 }}>
      {label}
    </Button>
  );
};

export default ActionButton;