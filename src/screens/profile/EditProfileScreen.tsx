// src/screens/EditProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText, Chip, Appbar, Switch } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { useAuthStore } from '../../stores/authStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { gql, useMutation } from '@apollo/client';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authorize } from 'react-native-app-auth';
import { VERIFY_EMAIL, VERIFY_EMAIL_OTP, UNLINK_SOCIAL_MEDIA } from '../../graphql/mutations';
import { UPDATE_USER, LINK_SOCIAL_MEDIA } from '../../graphql/queries';


const oauthConfigs = {
  youtube: {
    clientId: 'YOUR_YOUTUBE_CLIENT_ID',
    clientSecret: 'YOUR_YOUTUBE_CLIENT_SECRET',
    redirectUrl: 'com.yourapp:/oauth2callback',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    },
  },
  instagram: {
    clientId: 'YOUR_INSTAGRAM_CLIENT_ID',
    clientSecret: 'YOUR_INSTAGRAM_CLIENT_SECRET',
    redirectUrl: 'com.yourapp:/oauth2callback',
    scopes: ['user_profile', 'user_media'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
      tokenEndpoint: 'https://api.instagram.com/oauth/access_token',
    },
  },
  facebook: {
    clientId: 'YOUR_FACEBOOK_CLIENT_ID',
    clientSecret: 'YOUR_FACEBOOK_CLIENT_SECRET',
    redirectUrl: 'com.yourapp:/oauth2callback',
    scopes: ['public_profile'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenEndpoint: 'https://graph.facebook.com/v18.0/oauth/access_token',
    },
  },
  x: {
    clientId: 'YOUR_X_CLIENT_ID',
    clientSecret: 'YOUR_X_CLIENT_SECRET',
    redirectUrl: 'com.yourapp:/oauth2callback',
    scopes: ['tweet.read', 'users.read'],
    serviceConfiguration: {
      authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
      tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
    },
  },
};

export const EditProfileScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const { currentUser, updateProfile } = useAuthStore();
  const { categories } = useCategoryStore();

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    bio: currentUser?.bio || '',
    budget: currentUser?.budget?.toString() || '',
    artistType: currentUser?.artistType || '',
    categoryId: currentUser?.categoryIDs[0] || '',
    subCategoryIds: currentUser?.subCategoryIDs || [],
    email: currentUser?.email || '',
  });

  const [emailVerified, setEmailVerified] = useState(!!currentUser?.email);
  const [wordCount, setWordCount] = useState(0);
  const [emailError, setEmailError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [socialMediaSettings, setSocialMediaSettings] = useState({
    youtube: { display: currentUser?.youtubeDisplay || false },
    instagram: { display: currentUser?.instagramDisplay || false },
    facebook: { display: currentUser?.facebookDisplay || false },
    x: { display: currentUser?.xDisplay || false },
  });

  useEffect(() => {
    setWordCount(formData.bio.trim().split(/\s+/).length);
  }, []);

  const [updateUser] = useMutation(UPDATE_USER, {
    update(cache, { data: { updateUser } }) {
      cache.modify({
        fields: {
          user(existingUser = {}) {
            return { ...existingUser, ...updateUser };
          },
        },
      });
    },
  });

  const [verifyEmail] = useMutation(VERIFY_EMAIL);
  const [verifyEmailOTP] = useMutation(VERIFY_EMAIL_OTP);
  const [linkSocialMedia] = useMutation(LINK_SOCIAL_MEDIA, {
    onCompleted: (data) => {
      const { platform, identifier } = data.linkSocialMedia;
      updateProfile({
        [`${platform}Id`]: platform === 'youtube' ? identifier : undefined,
        [`${platform}Username`]: platform !== 'youtube' ? identifier : undefined,
      });
      setSocialMediaSettings((prev) => ({
        ...prev,
        [platform]: { ...prev[platform], display: false }, // Default to not displayed
      }));
    },
  });
  const [unlinkSocialMedia] = useMutation(UNLINK_SOCIAL_MEDIA, {
    onCompleted: (data) => {
      const platform = data.unlinkSocialMedia;
      updateProfile({
        [`${platform}Id`]: undefined,
        [`${platform}Username`]: undefined,
        [`${platform}Display`]: false,
      });
      setSocialMediaSettings((prev) => ({
        ...prev,
        [platform]: { display: false },
      }));
    },
  });

  const handleBioChange = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= 200) {
      setFormData((prev) => ({ ...prev, bio: text }));
      setWordCount(words.length);
    }
  };

  const handleEmailChange = (email: string) => {
    setFormData((prev) => ({ ...prev, email }));
    setEmailError('');
    setEmailVerified(false);
    setShowOtpInput(false);
    setOtp('');
    setOtpError('');
  };

  const handleVerifyEmail = async () => {
    const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      await verifyEmail({ variables: { email: formData.email } });
      setShowOtpInput(true);
      setEmailError('');
    } catch (error) {
      setEmailError('Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setOtpError('Please enter the verification code');
      return;
    }

    try {
      await verifyEmailOTP({
        variables: { email: formData.email, otp },
      });
      setEmailVerified(true);
      setShowOtpInput(false);
      setOtp('');
      setOtpError('');
      updateProfile({ email: formData.email });
    } catch (error) {
      setOtpError('Invalid verification code. Please try again.');
    }
  };

  const handleLinkSocialMedia = async (platform: string) => {
    try {
      const result = await authorize(oauthConfigs[platform]);
      const { accessToken } = result;

      let identifier: string;
      switch (platform) {
        case 'youtube':
          const youtubeResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const youtubeData = await youtubeResponse.json();
          identifier = youtubeData.items[0].id;
          break;
        case 'instagram':
          const instagramResponse = await fetch('https://graph.instagram.com/me?fields=username', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const instagramData = await instagramResponse.json();
          identifier = instagramData.username;
          break;
        case 'facebook':
          const facebookResponse = await fetch('https://graph.facebook.com/me?fields=id', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const facebookData = await facebookResponse.json();
          identifier = facebookData.id;
          break;
        case 'x':
          const xResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const xData = await xResponse.json();
          identifier = xData.data.username;
          break;
        default:
          throw new Error('Unsupported platform');
      }

      await linkSocialMedia({ variables: { platform, authCode: result.authorizationCode || 'mock-auth-code' } });
    } catch (error) {
      console.error(`Error linking ${platform}:`, error);
    }
  };

  const handleUnlinkSocialMedia = async (platform: string) => {
    await unlinkSocialMedia({ variables: { platform } });
  };

  const handleToggleDisplay = (platform: string, value: boolean) => {
    setSocialMediaSettings((prev) => ({
      ...prev,
      [platform]: { display: value },
    }));
    updateProfile({ [`${platform}Display`]: value });
  };

  const handleSave = async () => {
    if (!emailVerified && formData.email) {
      alert('Please verify your email before saving');
      return;
    }

    try {
      const { data } = await updateUser({
        variables: {
          id: currentUser?.id,
          input: {
            fullName: formData.fullName,
            bio: formData.bio,
            budget: parseInt(formData.budget),
            email: formData.email,
            categories: [formData.categoryId],
            subCategories: formData.subCategoryIds,
            youtubeDisplay: socialMediaSettings.youtube.display,
            instagramDisplay: socialMediaSettings.instagram.display,
            facebookDisplay: socialMediaSettings.facebook.display,
            xDisplay: socialMediaSettings.x.display,
          },
        },
      });

      updateProfile(data.updateUser);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const selectedCategory = categories.find((cat) => cat.id === formData.categoryId);

  const handleSubCategoryChange = (selectedIds: string[]) => {
    setFormData((prev) => ({
      ...prev,
      subCategoryIds: selectedIds,
    }));
  };

  const removeSubCategory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      subCategoryIds: prev.subCategoryIds.filter((subId) => subId !== id),
    }));
  };

  const ArtistFieldLabel = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.artistFieldContainer}>
      <Text style={styles.label}>{children}</Text>
      <Text style={[styles.artistLabel, { color: theme.colors.primary, backgroundColor: `${theme.colors.primary}20` }]}>
        Artist Mode Only
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.headerContainer}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Edit Profile" titleStyle={styles.headerTitle} />
        </Appbar.Header>
      </View>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={formData.fullName}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, fullName: text }))}
            mode="outlined"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <View style={styles.emailContainer}>
            <TextInput
              value={formData.email}
              onChangeText={handleEmailChange}
              mode="outlined"
              style={[styles.input, styles.emailInput]}
              keyboardType="email-address"
              autoCapitalize="none"
              error={!!emailError}
            />
            {!emailVerified && formData.email && !showOtpInput && (
              <Button mode="contained" onPress={handleVerifyEmail} style={styles.verifyButton}>
                Verify
              </Button>
            )}
          </View>
          {emailError && (
            <HelperText type="error" visible={!!emailError}>
              {emailError}
            </HelperText>
          )}

          {showOtpInput && !emailVerified && (
            <View style={styles.otpContainer}>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                mode="outlined"
                style={[styles.input, styles.otpInput]}
                placeholder="Enter verification code"
                keyboardType="numeric"
                maxLength={6}
                error={!!otpError}
              />
              <Button mode="contained" onPress={handleVerifyOTP} style={styles.verifyButton}>
                Submit
              </Button>
              {otpError && (
                <HelperText type="error" visible={!!otpError}>
                  {otpError}
                </HelperText>
              )}
            </View>
          )}

          {emailVerified && (
            <HelperText type="info" visible={true}>
              ✓ Email verified
            </HelperText>
          )}

          {currentUser?.isArtist && (
            <>
              <View style={styles.section}>
                <ArtistFieldLabel>Category</ArtistFieldLabel>
                <Dropdown
                  style={styles.dropdown}
                  data={categories}
                  labelField="name"
                  valueField="id"
                  value={formData.categoryId}
                  onChange={(item) => {
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: item.id,
                      subCategoryIds: [],
                    }));
                  }}
                  placeholder="Select Category"
                  search
                  searchPlaceholder="Search Categories..."
                  placeholderStyle={styles.dropdownPlaceholder}
                />
              </View>

              {selectedCategory && (
                <View style={styles.section}>
                  <ArtistFieldLabel>Subcategories</ArtistFieldLabel>
                  <Dropdown
                    style={styles.dropdown}
                    data={selectedCategory.subCategories.filter((sub) => !formData.subCategoryIds.includes(sub.id))}
                    labelField="name"
                    valueField="id"
                    onChange={(item) => {
                      handleSubCategoryChange([...formData.subCategoryIds, item.id]);
                    }}
                    placeholder="Select Subcategories"
                    placeholderStyle={styles.dropdownPlaceholder}
                    search
                    searchPlaceholder="Search subcategories..."
                  />
                  {formData.subCategoryIds.length > 0 && (
                    <View style={styles.chipContainer}>
                      {formData.subCategoryIds.map((subId) => {
                        const subCategory = selectedCategory.subCategories.find((sub) => sub.id === subId);
                        return (
                          <Chip
                            key={subId}
                            style={styles.chip}
                            onClose={() => removeSubCategory(subId)}
                            mode="outlined"
                          >
                            {subCategory?.name}
                          </Chip>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              <View style={styles.section}>
                <ArtistFieldLabel>Bio</ArtistFieldLabel>
                <TextInput
                  value={formData.bio}
                  onChangeText={handleBioChange}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  style={styles.bioInput}
                  placeholder="Tell us about yourself..."
                />
                <HelperText type="info" visible={true}>
                  {wordCount}/200 words
                </HelperText>
              </View>

              <View style={styles.section}>
                <ArtistFieldLabel>Budget (Rs/hr)</ArtistFieldLabel>
                <TextInput
                  value={formData.budget}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, budget: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.section}>
                <ArtistFieldLabel>Social Media</ArtistFieldLabel>
                <Text style={styles.socialPrompt}>
                  Link your accounts to boost credibility and add portfolio items! (Optional display on profile)
                </Text>
                {['youtube', 'instagram', 'facebook', 'x'].map((platform) => (
                  <View key={platform} style={styles.socialItem}>
                    <Text style={styles.socialLabel}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Text>
                    <View style={styles.socialControls}>
                      <Button
                        mode={currentUser?.[`${platform}Id`] || currentUser?.[`${platform}Username`] ? 'outlined' : 'contained'}
                        onPress={() =>
                          currentUser?.[`${platform}Id`] || currentUser?.[`${platform}Username`]
                            ? handleUnlinkSocialMedia(platform)
                            : handleLinkSocialMedia(platform)
                        }
                        style={styles.socialButton}
                      >
                        {(currentUser?.[`${platform}Id`] || currentUser?.[`${platform}Username`]) ? 'Unlink' : 'Link'}
                      </Button>
                      {(currentUser?.[`${platform}Id`] || currentUser?.[`${platform}Username`]) && (
                        <View style={styles.displayToggle}>
                          <Text>Show on Profile</Text>
                          <Switch
                            value={socialMediaSettings[platform].display}
                            onValueChange={(value) => handleToggleDisplay(platform, value)}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <Button mode="contained" onPress={handleSave} style={styles.saveButton}>
            Save Changes
          </Button>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  header: {
    backgroundColor: '#FFF',
    elevation: 0,
    height: 56,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  bioInput: {
    marginBottom: 8,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  dropdown: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  chip: {
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
  },
  bottomSpace: {
    height: 100,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emailInput: {
    flex: 1,
  },
  verifyButton: {
    marginBottom: 0,
  },
  otpContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    margin: 16,
  },
  artistFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  artistLabel: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  otpInput: {
    flex: 1,
  },
  socialPrompt: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  socialItem: {
    marginBottom: 16,
  },
  socialLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  socialControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  socialButton: {
    flex: 1,
  },
  displayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default EditProfileScreen;