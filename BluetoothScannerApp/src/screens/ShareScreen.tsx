import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, Platform} from 'react-native';
import {Button, Text} from '@rneui/themed';
import BleManager from 'react-native-ble-manager';
import {PermissionsAndroid} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ShareScreen = ({route, navigation}: any) => {
  const [isSharing, setIsSharing] = useState(false);
  const userId = route.params?.userId;

  useEffect(() => {
    setupBluetooth();
    return () => {
      stopSharing();
    };
  }, []);

  const setupBluetooth = async () => {
    try {
      await BleManager.start({showAlert: false});
      
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
          {
            title: 'Bluetooth Advertising Permission',
            message: 'App needs permission to share your details via Bluetooth',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission required', 'Bluetooth advertising permission is required');
        }
      }
    } catch (error) {
      console.error('Error setting up Bluetooth:', error);
    }
  };

  const startSharing = async () => {
    if (!userId) {
      Alert.alert(
        'Profile Required',
        'Please create your profile first before sharing.',
        [
          {
            text: 'Create Profile',
            onPress: () => navigation.navigate('Profile'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
      );
      return;
    }

    try {
      setIsSharing(true);
      await BleManager.start({showAlert: false});
      console.log('Started sharing userId:', userId);
      Alert.alert('Sharing Active', 'Your profile is now visible to nearby devices');
    } catch (error) {
      console.error('Error starting share:', error);
      Alert.alert('Error', 'Failed to start sharing. Please try again.');
      setIsSharing(false);
    }
  };

  const stopSharing = async () => {
    try {
      setIsSharing(false);
      await BleManager.stopScan();
      console.log('Stopped sharing');
    } catch (error) {
      console.error('Error stopping share:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <Icon 
          name={isSharing ? 'bluetooth' : 'bluetooth-b'} 
          size={40} 
          color={isSharing ? '#2089dc' : '#ccc'} 
        />
        <Text style={[styles.statusText, isSharing && styles.activeText]}>
          {isSharing ? 'Currently Sharing' : 'Not Sharing'}
        </Text>
        <Text style={styles.statusSubText}>
          {isSharing 
            ? 'Your profile is visible to nearby devices' 
            : 'Start sharing to make your profile visible'}
        </Text>
      </View>

      <Button
        title={isSharing ? 'Stop Sharing' : 'Start Sharing'}
        onPress={isSharing ? stopSharing : startSharing}
        icon={
          <Icon
            name={isSharing ? 'stop-circle' : 'play-circle'}
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
        }
        buttonStyle={[
          styles.actionButton,
          isSharing ? styles.stopButton : styles.startButton,
        ]}
        titleStyle={styles.buttonTitle}
        containerStyle={styles.buttonContainer}
        raised
      />

      <Button
        title="Update Profile"
        onPress={() => navigation.navigate('Profile')}
        icon={
          <Icon
            name="edit"
            size={20}
            color="#2089dc"
            style={styles.buttonIcon}
          />
        }
        type="outline"
        buttonStyle={styles.updateButton}
        titleStyle={styles.updateButtonTitle}
        containerStyle={styles.buttonContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  activeText: {
    color: '#2089dc',
  },
  statusSubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  startButton: {
    backgroundColor: '#2089dc',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  updateButton: {
    borderColor: '#2089dc',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    marginVertical: 8,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateButtonTitle: {
    color: '#2089dc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default ShareScreen;
