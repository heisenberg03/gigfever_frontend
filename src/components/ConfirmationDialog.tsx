import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text, useTheme } from 'react-native-paper';

interface ConfirmationDialogProps {
    visible: boolean;
    onDismiss: () => void;
    onConfirm: () => void;
    onEdit?: () => void;
    title: string;
    message: string;
    confirmText: string;
    showEditOption?: boolean;
}

const ConfirmationDialog = ({
    visible,
    onDismiss,
    onConfirm,
    onEdit,
    title,
    message,
    confirmText,
    showEditOption = false,
}: ConfirmationDialogProps) => {
    const theme = useTheme();

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
                <Dialog.Title style={styles.title}>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text style={styles.message}>{message}</Text>
                </Dialog.Content>
                <Dialog.Actions style={styles.actions}>
                    <Button onPress={onDismiss} textColor={theme.colors.secondary}>
                        Cancel
                    </Button>
                    {showEditOption && onEdit && (
                        <Button 
                            onPress={onEdit} 
                            textColor={theme.colors.primary}
                        >
                            Edit Profile
                        </Button>
                    )}
                    <Button 
                        mode="contained" 
                        onPress={onConfirm}
                        buttonColor={theme.colors.primary}
                    >
                        {confirmText}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    dialog: {
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    message: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
    },
    actions: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});

export default ConfirmationDialog;