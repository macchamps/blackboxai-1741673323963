import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {Input, Button} from '@rneui/themed';
import {getDatabase, ref, set} from 'firebase/database';
import BleManager from 'react-native-ble-manager';

const ProfileScreen = ({navigation}: any) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName || !mobile || !email) {
      Alert.alert('Required Fields', 'Please fill in all required fields (Name, Mobile, Email)');
      return;
    }

    try {
      setLoading(true);
      const userId = `user_${Date.now()}`; // Generate a unique ID using timestamp
      const userData = {
        fullName,
        mobile,
        email,
        address,
        website,
        createdAt: Date.now(),
      };

      const db = getDatabase();
      await set(ref(db, `users/${userId}`), userData);

      Alert.alert(
        'Success',
        'Profile created successfully! Go to Share screen to start sharing your details.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Share', { userId }),
          },
        ],
      );
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        placeholder="Full Name *"
        value={fullName}
        onChangeText={setFullName}
        leftIcon={{type: 'font-awesome', name: 'user'}}
        renderErrorMessage={!fullName}
        errorMessage={!fullName ? 'Required' : ''}
      />
      <Input
        placeholder="Mobile Number *"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        leftIcon={{type: 'font-awesome', name: 'phone'}}
        renderErrorMessage={!mobile}
        errorMessage={!mobile ? 'Required' : ''}
      />
      <Input
        placeholder="Email *"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        leftIcon={{type: 'font-awesome', name: 'envelope'}}
        renderErrorMessage={!email}
        errorMessage={!email ? 'Required' : ''}
      />
      <Input
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        leftIcon={{type: 'font-awesome', name: 'map-marker'}}
        multiline
      />
      <Input
        placeholder="Website"
        value={website}
        onChangeText={setWebsite}
        keyboardType="url"
        leftIcon={{type: 'font-awesome', name: 'globe'}}
      />
      <Button
        title="Save Profile"
        onPress={handleSubmit}
        loading={loading}
        buttonStyle={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#2089dc',
  },
});

export default ProfileScreen;
