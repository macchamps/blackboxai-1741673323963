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
import Icon from 'react-native-vector-icons/FontAwesome';

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
      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="bluetooth-b" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No devices found</Text>
            <Text style={styles.emptySubText}>Tap the scan button to search for nearby devices</Text>
          </View>
        )}
      />
      <Button
        title={scanning ? '' : ''}
        onPress={startScan}
        loading={scanning}
        icon={<Icon name="bluetooth-b" size={24} color="white" />}
        buttonStyle={styles.fabButton}
        containerStyle={styles.fabContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Space for FAB
  },
  deviceItem: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2089dc',
  },
  deviceRssi: {
    fontSize: 14,
    color: '#666',
  },
  userDetails: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2089dc',
    padding: 0,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;
