import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Alert} from 'react-native';
import BleManager from 'react-native-ble-manager';
import Icon from 'react-native-vector-icons/FontAwesome';

// Import Firebase configuration
import './src/config/firebase';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ShareScreen from './src/screens/ShareScreen';

const Tab = createBottomTabNavigator();

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
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName = 'circle'; // Default icon

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Profile') {
              iconName = 'user';
            } else if (route.name === 'Share') {
              iconName = 'share-alt';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2089dc',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#2089dc',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Nearby Users',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{
            title: 'My Profile',
          }}
        />
        <Tab.Screen 
          name="Share" 
          component={ShareScreen}
          options={{
            title: 'Share Details',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
