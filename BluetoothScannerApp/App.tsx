import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Alert} from 'react-native';
import BleManager from 'react-native-ble-manager';

// Import Firebase configuration
import './src/config/firebase';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ShareScreen from './src/screens/ShareScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize Bluetooth
    BleManager.start({showAlert: false}).then(() => {
      console.log('BleManager initialized');
    }).catch((error) => {
      console.error('BleManager initialization failed:', error);
      Alert.alert(
        'Bluetooth Error',
        'Failed to initialize Bluetooth. Please make sure Bluetooth is enabled.'
      );
    });

    return () => {
      // Cleanup
      BleManager.stopScan();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2089dc',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Nearby Users',
          }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'My Profile',
          }}
        />
        <Stack.Screen 
          name="Share" 
          component={ShareScreen}
          options={{
            title: 'Share Details',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
