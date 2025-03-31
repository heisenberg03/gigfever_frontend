import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, HelperText, Chip, Appbar } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { useAuthStore } from '../../stores/authStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { gql, useMutation } from '@apollo/client';
import { validateEmail } from '../../utils/validators';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Add email verification mutation
const VERIFY_EMAIL = gql`
  mutation VerifyEmail($email: String!) {
    verifyEmail(email: $email)
  }
`;

const VERIFY_EMAIL_OTP = gql`
  mutation VerifyEmailOTP($email: String!, $otp: String!) {
    verifyEmailOTP(email: $email, otp: $otp)
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      id
      fullName
      bio
      budget
      email
      categoryIDs
      subCategoryIDs
    }
  }
`;

// Add this component for artist-specific field labels


const EditProfileScreen = ({ navigation }: any) => {
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

  // Calculate initial word count
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

  const [verifyEmail] = useMutation(VERIFY_EMAIL,{variables: {email: formData.email}});
  const [verifyEmailOTP] = useMutation(VERIFY_EMAIL_OTP,{variables: {email: formData.email, otp: otp}});

  const handleBioChange = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= 200) {
      setFormData(prev => ({ ...prev, bio: text }));
      setWordCount(words.length);
    }
  };

  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    setEmailError('');
    setEmailVerified(false);
    setShowOtpInput(false);
    setOtp('');
    setOtpError('');
  };

  const handleVerifyEmail = async () => {
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
        variables: { 
          email: formData.email,
          otp 
        } 
      });
      setEmailVerified(true);
      setShowOtpInput(false);
      setOtp('');
      setOtpError('');
      // Update local state immediately
      updateProfile({ email: formData.email });
    } catch (error) {
      setOtpError('Invalid verification code. Please try again.');
    }
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
          },
        },
      });

      // Update local state immediately
      updateProfile(data.updateUser);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  const handleSubCategoryChange = (selectedIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      subCategoryIds: selectedIds,
    }));
  };

  const removeSubCategory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subCategoryIds: prev.subCategoryIds.filter(subId => subId !== id),
    }));
  };

  const ArtistFieldLabel = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.artistFieldContainer}>
    <Text style={styles.label}>{children}</Text>
    <Text style={[styles.artistLabel,{ color: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}20`,}]}>Artist Mode Only</Text>
  </View>
);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.headerContainer}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Edit Profile" titleStyle={styles.headerTitle} />
        </Appbar.Header>
      </View>
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={formData.fullName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
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
              <Button 
                mode="contained" 
                onPress={handleVerifyEmail}
                style={styles.verifyButton}
              >
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
              <Button 
                mode="contained" 
                onPress={handleVerifyOTP}
                style={styles.verifyButton}
              >
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
                  onChange={item => {
                    setFormData(prev => ({
                      ...prev,
                      categoryId: item.id,
                      subCategoryIds: [], // Reset subcategories when category changes
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
                    data={selectedCategory.subCategories.filter(
                      sub => !formData.subCategoryIds.includes(sub.id)
                    )}
                    labelField="name"
                    valueField="id"
                    onChange={item => {
                      handleSubCategoryChange([...formData.subCategoryIds, item.id]);
                    }}
                    placeholder="Select Subcategories"
                    placeholderStyle={styles.dropdownPlaceholder}
                    search
                    searchPlaceholder="Search subcategories..."
                  />
                  
                  {formData.subCategoryIds.length > 0 && (
                    <View style={styles.chipContainer}>
                      {formData.subCategoryIds.map(subId => {
                        const subCategory = selectedCategory.subCategories.find(
                          sub => sub.id === subId
                        );
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
                  onChangeText={(text) => setFormData(prev => ({ ...prev, budget: text }))}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </>
          )}

          <Button 
            mode="contained" 
            onPress={handleSave}
            style={styles.saveButton}
          >
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
    height: 100, // Extra space at bottom for keyboard
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
    marginRight: 8,
  },
});

export default EditProfileScreen;