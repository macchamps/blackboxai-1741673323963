import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, Platform} from 'react-native';
import {Button, Text} from '@rneui/themed';
import BleManager from 'react-native-ble-manager';
import {PermissionsAndroid} from 'react-native';

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
      Alert.alert('Error', 'Please create a profile first');
      navigation.navigate('Profile');
      return;
    }

    try {
      setIsSharing(true);
      // Note: This is a simplified implementation. In a real app,
      // you would need to implement platform-specific peripheral mode
      // using native modules or a specialized BLE advertising library
      await BleManager.start({showAlert: false});
      console.log('Started sharing userId:', userId);
      Alert.alert('Sharing', 'Your profile is now visible to nearby devices');
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
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isSharing ? 'Sharing' : 'Not Sharing'}
        </Text>
        {userId && (
          <Text style={styles.idText}>ID: {userId}</Text>
        )}
      </View>
      
      <Button
        title={isSharing ? 'Stop Sharing' : 'Start Sharing'}
        onPress={isSharing ? stopSharing : startSharing}
        buttonStyle={[
          styles.button,
          isSharing ? styles.stopButton : styles.startButton,
        ]}
      />
      
      <Button
        title="Update Profile"
        onPress={() => navigation.navigate('Profile')}
        buttonStyle={[styles.button, styles.updateButton]}
        type="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  statusContainer: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statusText: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  idText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
    height: 50,
    borderRadius: 25,
  },
  startButton: {
    backgroundColor: '#2089dc',
  },
  stopButton: {
    backgroundColor: '#dc3545',
  },
  updateButton: {
    borderColor: '#2089dc',
    marginTop: 16,
  },
});

export default ShareScreen;
