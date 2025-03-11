import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import {Button} from '@rneui/themed';
import {getDatabase, ref, get} from 'firebase/database';

interface ScannedDevice {
  id: string;
  name?: string;
  rssi?: number;
  userDetails?: any;
}

const HomeScreen = ({navigation}: any) => {
  const [devices, setDevices] = useState<ScannedDevice[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    BleManager.start();
    checkPermissions();
    return () => {
      BleManager.stopScan();
    };
  }, []);

  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Bluetooth Permission',
          message: 'This app needs access to Bluetooth to scan for nearby devices.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission required', 'Location permission is required for BLE');
      }
    }
  };

  const startScan = () => {
    setDevices([]);
    setScanning(true);
    
    BleManager.scan([], 5)
      .then(() => {
        console.log('Scanning...');
        setTimeout(async () => {
          try {
            const discoveredDevices = await BleManager.getDiscoveredPeripherals();
            const newDevices: ScannedDevice[] = [];
            
            for (const device of discoveredDevices) {
              if (device.advertising?.manufacturerData) {
                try {
                  const manufacturerData = device.advertising.manufacturerData;
                  const userId = manufacturerData.toString();
                  const userDetails = await fetchUserDetails(userId);
                  
                  newDevices.push({
                    id: device.id,
                    name: device.name || 'Unknown',
                    rssi: device.rssi,
                    userDetails,
                  });
                } catch (error) {
                  console.log('Error processing device:', error);
                }
              }
            }
            
            setDevices(newDevices);
          } catch (error) {
            console.log('Error getting peripherals:', error);
          }
          setScanning(false);
        }, 5000);
      })
      .catch((error) => {
        console.log('Scan error:', error);
        setScanning(false);
      });
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      return snapshot.val();
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const renderDevice = ({item}: {item: ScannedDevice}) => (
    <View style={styles.deviceItem}>
      <Text style={styles.deviceName}>{item.name}</Text>
      {item.userDetails && (
        <View style={styles.userDetails}>
          <Text>Name: {item.userDetails.fullName}</Text>
          <Text>Email: {item.userDetails.email}</Text>
        </View>
      )}
      <Text style={styles.deviceRssi}>Signal Strength: {item.rssi}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title={scanning ? 'Scanning...' : 'Scan Nearby Devices'}
        onPress={startScan}
        loading={scanning}
        buttonStyle={styles.scanButton}
      />
      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scanButton: {
    backgroundColor: '#2089dc',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  deviceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deviceRssi: {
    fontSize: 14,
    color: '#666',
  },
  userDetails: {
    marginVertical: 8,
  },
});

export default HomeScreen;
