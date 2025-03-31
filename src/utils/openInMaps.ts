// utils/openInMaps.ts
import { Platform, Linking, ActionSheetIOS, Alert } from 'react-native';

export const openInMaps = async (lat: number, lng: number) => {
  if (!lat || !lng) {
    Alert.alert('Location missing', 'No location coordinates provided.');
    return;
  }

  if (Platform.OS === 'ios') {
    const hasGoogleMaps = await Linking.canOpenURL('comgooglemaps://');

    const options = hasGoogleMaps
      ? ['Apple Maps', 'Google Maps', 'Cancel']
      : ['Apple Maps', 'Cancel'];
    const cancelButtonIndex = hasGoogleMaps ? 2 : 1;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // Apple Maps
          Linking.openURL(`http://maps.apple.com/?ll=${lat},${lng}`);
        } else if (buttonIndex === 1 && hasGoogleMaps) {
          // Google Maps
          Linking.openURL(`comgooglemaps://?q=${lat},${lng}`);
        }
      }
    );
  } else {
    // Android: default to Google Maps
    const androidMapUrl = `geo:${lat},${lng}?q=${lat},${lng}`;
    Linking.openURL(androidMapUrl);
  }
};