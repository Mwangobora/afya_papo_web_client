# AfyaPapo Mobile Client Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication Flow](#authentication-flow)
4. [Emergency SOS Flow](#emergency-sos-flow)
5. [Responder Mobile App](#responder-mobile-app)
6. [Real-time Features](#real-time-features)
7. [Offline Capabilities](#offline-capabilities)
8. [Push Notifications](#push-notifications)
9. [Location Services](#location-services)
10. [Error Handling](#error-handling)

## Overview

The AfyaPapo mobile client integrates with the GraphQL API to provide emergency response capabilities for citizens and medical responders in Tanzania. The system supports both native iOS/Android apps and Progressive Web Apps (PWAs).

### Supported Platforms
- **iOS**: Native Swift/SwiftUI or React Native
- **Android**: Native Kotlin/Java or React Native
- **Progressive Web App**: For areas with limited app store access

### Key Features
- **One-tap SOS**: Instant emergency incident creation
- **Real-time Tracking**: Live updates on responder status and location
- **Multi-language**: English and Swahili support
- **Offline-first**: Core functionality works without internet
- **Push Notifications**: Critical emergency alerts

## Setup & Configuration

### GraphQL Client Configuration

```javascript
// GraphQL client setup with authentication
import { GraphQLClient } from 'graphql-request';
import { createClient as createWSClient } from 'graphql-ws';

class AfyaPapoClient {
  constructor() {
    this.httpClient = new GraphQLClient('http://localhost:8000/graphql/', {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    this.wsClient = createWSClient({
      url: 'ws://localhost:8000/ws/graphql/',
      connectionParams: () => ({
        Authorization: `Bearer ${this.getAccessToken()}`
      }),
    });
    
    this.accessToken = null;
    this.refreshToken = null;
  }
  
  setAuthTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // Update HTTP client headers
    this.httpClient.setHeaders({
      Authorization: `Bearer ${accessToken}`
    });
    
    // Store securely
    this.secureStorage.setItem('accessToken', accessToken);
    this.secureStorage.setItem('refreshToken', refreshToken);
  }
  
  async request(query, variables = {}) {
    try {
      return await this.httpClient.request(query, variables);
    } catch (error) {
      if (error.response?.errors?.[0]?.extensions?.code === 'AUTHENTICATION_REQUIRED') {
        await this.refreshAccessToken();
        return await this.httpClient.request(query, variables);
      }
      throw error;
    }
  }
  
  async refreshAccessToken() {
    if (!this.refreshToken) throw new Error('No refresh token available');
    
    const response = await this.httpClient.request(`
      mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          success
          accessToken
          refreshToken
        }
      }
    `, { refreshToken: this.refreshToken });
    
    if (response.refreshToken.success) {
      this.setAuthTokens(response.refreshToken.accessToken, response.refreshToken.refreshToken);
    } else {
      // Refresh failed, redirect to login
      this.logout();
    }
  }
}

const afyaPapoClient = new AfyaPapoClient();
export default afyaPapoClient;
```

### Environment Configuration

```javascript
// config/environment.js
const config = {
  development: {
    API_URL: 'http://localhost:8000/graphql/',
    WS_URL: 'ws://localhost:8000/ws/graphql/',
    TWILIO_ACCOUNT_SID: 'your-dev-twilio-sid',
    FIREBASE_CONFIG: {
      // Your Firebase config for push notifications
    }
  },
  production: {
    API_URL: 'https://api.afyapapo.org/graphql/',
    WS_URL: 'wss://api.afyapapo.org/ws/graphql/',
    TWILIO_ACCOUNT_SID: 'your-prod-twilio-sid',
    FIREBASE_CONFIG: {
      // Your production Firebase config
    }
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

## Authentication Flow

### User Registration

```javascript
// services/AuthService.js
export class AuthService {
  async registerUser(userData) {
    const REGISTER_MUTATION = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          success
          message
          user {
            id
            phoneNumber
            verificationStatus
          }
          errors
        }
      }
    `;
    
    const variables = {
      input: {
        phoneNumber: userData.phoneNumber,
        userType: userData.userType, // 'CITIZEN' or 'RESPONDER'
        preferredLanguage: userData.language, // 'EN' or 'SW'
        fullName: userData.fullName,
        emergencyContactName: userData.emergencyContactName,
        emergencyContactPhone: userData.emergencyContactPhone,
        password: userData.password
      }
    };
    
    try {
      const response = await afyaPapoClient.request(REGISTER_MUTATION, variables);
      
      if (response.register.success) {
        // Registration successful, proceed to phone verification
        await this.requestPhoneVerification(userData.phoneNumber);
        return { success: true, user: response.register.user };
      } else {
        return { success: false, errors: response.register.errors };
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  async requestPhoneVerification(phoneNumber) {
    const REQUEST_OTP_MUTATION = `
      mutation RequestOTP($input: RequestOTPInput!) {
        requestOTP(input: $input) {
          success
          message
          expiresAt
        }
      }
    `;
    
    const response = await afyaPapoClient.request(REQUEST_OTP_MUTATION, {
      input: {
        phoneNumber,
        verificationType: 'REGISTRATION'
      }
    });
    
    return response.requestOTP;
  }
  
  async verifyPhoneNumber(phoneNumber, otpCode) {
    const VERIFY_PHONE_MUTATION = `
      mutation VerifyPhone($input: VerifyPhoneInput!) {
        verifyPhone(input: $input) {
          success
          accessToken
          refreshToken
          user {
            id
            phoneNumber
            isPhoneVerified
            verificationStatus
            profile {
              fullName
            }
          }
          message
          errors
        }
      }
    `;
    
    const response = await afyaPapoClient.request(VERIFY_PHONE_MUTATION, {
      input: {
        phoneNumber,
        otpCode,
        verificationType: 'REGISTRATION'
      }
    });
    
    if (response.verifyPhone.success) {
      // Store authentication tokens
      afyaPapoClient.setAuthTokens(
        response.verifyPhone.accessToken,
        response.verifyPhone.refreshToken
      );
      
      // Store user data locally
      await this.storeUserData(response.verifyPhone.user);
    }
    
    return response.verifyPhone;
  }
  
  async login(phoneNumber, password) {
    const LOGIN_MUTATION = `
      mutation Login($input: LoginInput!) {
        login(input: $input) {
          success
          accessToken
          refreshToken
          user {
            id
            phoneNumber
            userType
            preferredLanguage
            profile {
              fullName
              bloodType
              medicalConditions
            }
            emergencyContacts {
              name
              phoneNumber
              relationship
            }
          }
          message
          errors
        }
      }
    `;
    
    const deviceInfo = await this.getDeviceInfo();
    
    const response = await afyaPapoClient.request(LOGIN_MUTATION, {
      input: {
        phoneNumber,
        password,
        deviceInfo
      }
    });
    
    if (response.login.success) {
      afyaPapoClient.setAuthTokens(
        response.login.accessToken,
        response.login.refreshToken
      );
      
      await this.storeUserData(response.login.user);
      
      // Initialize push notifications
      await this.setupPushNotifications();
    }
    
    return response.login;
  }
  
  async getDeviceInfo() {
    // Platform-specific device information
    return {
      deviceId: await this.getDeviceId(),
      platform: Platform.OS, // 'ios' or 'android'
      appVersion: DeviceInfo.getVersion(),
      osVersion: DeviceInfo.getSystemVersion(),
      deviceModel: DeviceInfo.getModel()
    };
  }
}
```

### Session Management

```javascript
// services/SessionManager.js
export class SessionManager {
  constructor() {
    this.tokenRefreshTimer = null;
    this.isRefreshing = false;
  }
  
  startSession(accessToken, refreshToken) {
    afyaPapoClient.setAuthTokens(accessToken, refreshToken);
    this.scheduleTokenRefresh();
  }
  
  scheduleTokenRefresh() {
    // Refresh token 2 minutes before expiry (15min - 2min = 13min)
    const refreshTime = 13 * 60 * 1000; // 13 minutes in milliseconds
    
    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }
  
  async refreshToken() {
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    
    try {
      await afyaPapoClient.refreshAccessToken();
      this.scheduleTokenRefresh(); // Schedule next refresh
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.endSession(); // Force logout
    } finally {
      this.isRefreshing = false;
    }
  }
  
  endSession() {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    // Clear stored tokens
    afyaPapoClient.clearTokens();
    
    // Clear user data
    this.clearUserData();
    
    // Navigate to login screen
    this.navigateToLogin();
  }
}
```

## Emergency SOS Flow

### One-Tap SOS Implementation

```javascript
// components/EmergencyButton.js
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { LocationService } from '../services/LocationService';
import { EmergencyService } from '../services/EmergencyService';

export const EmergencyButton = () => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [location, setLocation] = useState(null);
  
  useEffect(() => {
    // Get current location when component mounts
    LocationService.getCurrentLocation()
      .then(setLocation)
      .catch(console.error);
  }, []);
  
  const handleSOSPress = async () => {
    try {
      setIsEmergency(true);
      
      // Get fresh location
      const currentLocation = await LocationService.getCurrentLocation();
      
      // Show emergency type selection
      const emergencyType = await this.showEmergencyTypeModal();
      
      // Create incident
      const incident = await EmergencyService.createSOSIncident({
        location: currentLocation,
        emergencyType,
        description: emergencyType.description,
        patientCount: 1,
        ambulanceNeeded: emergencyType.needsAmbulance
      });
      
      // Navigate to emergency tracking screen
      this.navigateToEmergencyTracking(incident.id);
      
    } catch (error) {
      console.error('SOS error:', error);
      Alert.alert(
        'Error',
        'Failed to create emergency. Please try again or call emergency services directly.',
        [
          { text: 'Retry', onPress: this.handleSOSPress },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setIsEmergency(false);
    }
  };
  
  const showEmergencyTypeModal = () => {
    return new Promise((resolve) => {
      const emergencyTypes = [
        {
          type: 'MEDICAL_EMERGENCY',
          title: 'Medical Emergency',
          description: 'General medical emergency',
          needsAmbulance: true
        },
        {
          type: 'CARDIAC_ARREST',
          title: 'Cardiac Arrest',
          description: 'Heart attack or cardiac arrest',
          needsAmbulance: true
        },
        {
          type: 'BREATHING_DIFFICULTY',
          title: 'Breathing Difficulty',
          description: 'Severe breathing problems',
          needsAmbulance: true
        },
        {
          type: 'SEVERE_BLEEDING',
          title: 'Severe Bleeding',
          description: 'Major bleeding or trauma',
          needsAmbulance: true
        },
        {
          type: 'TRAFFIC_ACCIDENT',
          title: 'Traffic Accident',
          description: 'Road traffic accident',
          needsAmbulance: true
        }
      ];
      
      // Show modal with emergency types
      // User selects type and provides additional details
      // Return selected emergency type
    });
  };
  
  return (
    <TouchableOpacity
      style={styles.sosButton}
      onPress={handleSOSPress}
      disabled={isEmergency}
    >
      <View style={styles.sosButtonInner}>
        <Text style={styles.sosButtonText}>SOS</Text>
        <Text style={styles.sosButtonSubtext}>Emergency</Text>
      </View>
    </TouchableOpacity>
  );
};
```

### Emergency Service Implementation

```javascript
// services/EmergencyService.js
export class EmergencyService {
  async createSOSIncident(emergencyData) {
    const CREATE_INCIDENT_MUTATION = `
      mutation CreateIncident($input: CreateIncidentInput!) {
        createIncident(input: $input) {
          id
          incidentNumber
          status
          severity
          location {
            latitude
            longitude
          }
          assignments {
            id
            responder {
              fullName
              phoneNumber
              responderType
            }
            estimatedTravelTime
            responseDeadline
          }
          triage {
            triageColor
            priorityScore
          }
          timeline {
            eventType
            description
            timestamp
          }
        }
      }
    `;
    
    const variables = {
      input: {
        incidentType: emergencyData.emergencyType.type,
        location: {
          latitude: emergencyData.location.latitude,
          longitude: emergencyData.location.longitude,
          accuracy: emergencyData.location.accuracy
        },
        description: emergencyData.description || emergencyData.emergencyType.description,
        symptoms: emergencyData.symptoms || '',
        patientCount: emergencyData.patientCount || 1,
        patientAge: emergencyData.patientAge,
        patientGender: emergencyData.patientGender,
        patientConscious: emergencyData.patientConscious,
        patientBreathing: emergencyData.patientBreathing,
        ambulanceNeeded: emergencyData.ambulanceNeeded,
        addressDescription: await this.getAddressDescription(emergencyData.location),
        specializedEquipmentNeeded: emergencyData.specializedEquipment || ''
      }
    };
    
    const response = await afyaPapoClient.request(CREATE_INCIDENT_MUTATION, variables);
    
    // Store incident locally for offline access
    await this.storeIncidentLocally(response.createIncident);
    
    // Send notification to emergency contacts
    await this.notifyEmergencyContacts(response.createIncident);
    
    return response.createIncident;
  }
  
  async getAddressDescription(location) {
    try {
      // Reverse geocoding to get address
      const address = await LocationService.reverseGeocode(location);
      return address.formattedAddress;
    } catch (error) {
      console.error('Failed to get address:', error);
      return `${location.latitude}, ${location.longitude}`;
    }
  }
  
  async notifyEmergencyContacts(incident) {
    try {
      const user = await this.getCurrentUser();
      const emergencyContacts = user.emergencyContacts;
      
      for (const contact of emergencyContacts) {
        await this.sendEmergencyNotification(contact, incident);
      }
    } catch (error) {
      console.error('Failed to notify emergency contacts:', error);
    }
  }
  
  async updateIncidentStatus(incidentId, status, notes = '') {
    const UPDATE_STATUS_MUTATION = `
      mutation UpdateIncidentStatus($input: UpdateIncidentStatusInput!) {
        updateIncidentStatus(input: $input) {
          id
          status
          timeline {
            eventType
            description
            timestamp
          }
        }
      }
    `;
    
    const location = await LocationService.getCurrentLocation();
    
    const response = await afyaPapoClient.request(UPDATE_STATUS_MUTATION, {
      input: {
        incidentId,
        status,
        notes,
        location
      }
    });
    
    return response.updateIncidentStatus;
  }
}
```

## Responder Mobile App

### Assignment Notifications

```javascript
// services/ResponderService.js
export class ResponderService {
  async listenForAssignments(userId) {
    const ASSIGNMENT_NOTIFICATIONS = `
      subscription AssignmentNotifications($userId: ID!) {
        assignmentNotifications(userId: $userId) {
          assignment {
            id
            incident {
              incidentNumber
              incidentType
              severity
              location {
                latitude
                longitude
              }
              description
              patientCount
              patientConscious
              patientBreathing
            }
            estimatedDistance
            estimatedTravelTime
            responseDeadline
            priority
          }
          notificationType
          message
          timestamp
        }
      }
    `;
    
    return afyaPapoClient.wsClient.subscribe({
      query: ASSIGNMENT_NOTIFICATIONS,
      variables: { userId }
    }, {
      next: (data) => {
        const notification = data.data.assignmentNotifications;
        
        if (notification.notificationType === 'NEW_ASSIGNMENT') {
          this.handleNewAssignment(notification.assignment);
        }
      },
      error: (err) => {
        console.error('Assignment subscription error:', err);
        // Implement retry logic
        setTimeout(() => this.listenForAssignments(userId), 5000);
      }
    });
  }
  
  async handleNewAssignment(assignment) {
    // Show assignment notification
    await this.showAssignmentNotification(assignment);
    
    // Play notification sound
    await this.playNotificationSound();
    
    // Send push notification if app is in background
    if (AppState.currentState !== 'active') {
      await this.sendPushNotification(assignment);
    }
    
    // Show assignment modal
    this.showAssignmentModal(assignment);
  }
  
  async acceptAssignment(assignmentId) {
    const ACCEPT_ASSIGNMENT_MUTATION = `
      mutation AcceptAssignment($assignmentId: ID!) {
        acceptAssignment(assignmentId: $assignmentId) {
          id
          status
          incident {
            incidentNumber
            location {
              latitude
              longitude
            }
            description
            reporter {
              phoneNumber
            }
          }
          estimatedTravelTime
          responseDeadline
        }
      }
    `;
    
    try {
      const response = await afyaPapoClient.request(ACCEPT_ASSIGNMENT_MUTATION, {
        assignmentId
      });
      
      const assignment = response.acceptAssignment;
      
      // Update responder status
      await this.updateResponderStatus('EN_ROUTE');
      
      // Start navigation to incident
      await this.startNavigation(assignment.incident.location);
      
      // Start location tracking
      await this.startLocationTracking();
      
      return assignment;
    } catch (error) {
      console.error('Failed to accept assignment:', error);
      throw error;
    }
  }
  
  async declineAssignment(assignmentId, reason) {
    const DECLINE_ASSIGNMENT_MUTATION = `
      mutation DeclineAssignment($input: DeclineAssignmentInput!) {
        declineAssignment(input: $input) {
          id
          status
          declineReason
        }
      }
    `;
    
    const response = await afyaPapoClient.request(DECLINE_ASSIGNMENT_MUTATION, {
      input: {
        assignmentId,
        reason
      }
    });
    
    return response.declineAssignment;
  }
  
  async updateResponderLocation() {
    const location = await LocationService.getCurrentLocation();
    
    const UPDATE_LOCATION_MUTATION = `
      mutation UpdateResponderLocation($location: LocationInput!) {
        updateResponderLocation(location: $location) {
          id
          currentLocation {
            latitude
            longitude
          }
          availability {
            lastLocationUpdate
          }
        }
      }
    `;
    
    return await afyaPapoClient.request(UPDATE_LOCATION_MUTATION, {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      }
    });
  }
  
  startLocationTracking() {
    // Update location every 30 seconds while on assignment
    this.locationInterval = setInterval(async () => {
      try {
        await this.updateResponderLocation();
      } catch (error) {
        console.error('Failed to update location:', error);
      }
    }, 30000);
  }
  
  stopLocationTracking() {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
    }
  }
}
```

### Navigation Integration

```javascript
// services/NavigationService.js
export class NavigationService {
  async startNavigation(destination) {
    const currentLocation = await LocationService.getCurrentLocation();
    
    // Platform-specific navigation
    if (Platform.OS === 'ios') {
      const url = `http://maps.apple.com/?daddr=${destination.latitude},${destination.longitude}&dirflg=d`;
      await Linking.openURL(url);
    } else {
      const url = `google.navigation:q=${destination.latitude},${destination.longitude}&mode=d`;
      await Linking.openURL(url);
    }
  }
  
  async calculateRoute(start, end) {
    // Use routing service to calculate distance and time
    const route = await this.routingService.calculateRoute(start, end);
    return {
      distance: route.distance,
      duration: route.duration,
      polyline: route.polyline
    };
  }
}
```

## Real-time Features

### WebSocket Connection Management

```javascript
// services/RealtimeService.js
export class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
    this.connectionRetries = 0;
    this.maxRetries = 5;
  }
  
  async subscribeToIncident(incidentId, callback) {
    const INCIDENT_UPDATES = `
      subscription IncidentUpdates($incidentId: ID!) {
        incidentUpdates(incidentId: $incidentId) {
          incident {
            id
            status
            assignments {
              status
              responder {
                fullName
                currentLocation {
                  latitude
                  longitude
                }
              }
              estimatedTravelTime
              actualTravelTime
            }
            timeline {
              eventType
              description
              timestamp
            }
          }
          updateType
          message
          timestamp
        }
      }
    `;
    
    const subscription = afyaPapoClient.wsClient.subscribe({
      query: INCIDENT_UPDATES,
      variables: { incidentId }
    }, {
      next: (data) => {
        const update = data.data.incidentUpdates;
        callback(update);
        
        // Reset retry counter on successful message
        this.connectionRetries = 0;
      },
      error: (error) => {
        console.error('Incident subscription error:', error);
        this.handleSubscriptionError(incidentId, callback);
      },
      complete: () => {
        console.log('Incident subscription completed');
      }
    });
    
    this.subscriptions.set(incidentId, subscription);
    return subscription;
  }
  
  handleSubscriptionError(incidentId, callback) {
    if (this.connectionRetries < this.maxRetries) {
      this.connectionRetries++;
      
      // Exponential backoff
      const delay = Math.pow(2, this.connectionRetries) * 1000;
      
      setTimeout(() => {
        console.log(`Retrying subscription (attempt ${this.connectionRetries})`);
        this.subscribeToIncident(incidentId, callback);
      }, delay);
    } else {
      console.error('Max retries reached for incident subscription');
      // Fall back to polling
      this.startPolling(incidentId, callback);
    }
  }
  
  startPolling(incidentId, callback) {
    const pollInterval = setInterval(async () => {
      try {
        const incident = await this.getIncidentUpdate(incidentId);
        callback({ incident, updateType: 'POLLED', timestamp: new Date() });
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // Poll every 10 seconds
    
    this.subscriptions.set(incidentId, { unsubscribe: () => clearInterval(pollInterval) });
  }
  
  unsubscribeFromIncident(incidentId) {
    const subscription = this.subscriptions.get(incidentId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(incidentId);
    }
  }
  
  cleanup() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions.clear();
  }
}
```

## Offline Capabilities

### Data Synchronization

```javascript
// services/OfflineService.js
export class OfflineService {
  constructor() {
    this.pendingOperations = [];
    this.offlineData = {};
  }
  
  async storeForOffline(key, data) {
    try {
      await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }
  
  async getOfflineData(key) {
    try {
      const data = await AsyncStorage.getItem(`offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }
  
  async queueOperation(operation) {
    const operationId = Date.now().toString();
    const queuedOperation = {
      id: operationId,
      ...operation,
      timestamp: Date.now(),
      retries: 0
    };
    
    this.pendingOperations.push(queuedOperation);
    await this.savePendingOperations();
    
    // Try to sync immediately if online
    if (await this.isOnline()) {
      this.syncPendingOperations();
    }
    
    return operationId;
  }
  
  async syncPendingOperations() {
    const operations = [...this.pendingOperations];
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        this.removePendingOperation(operation.id);
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        operation.retries++;
        
        // Remove operation if max retries reached
        if (operation.retries >= 3) {
          this.removePendingOperation(operation.id);
        }
      }
    }
    
    await this.savePendingOperations();
  }
  
  async executeOperation(operation) {
    switch (operation.type) {
      case 'CREATE_INCIDENT':
        return await afyaPapoClient.request(operation.mutation, operation.variables);
      case 'UPDATE_LOCATION':
        return await afyaPapoClient.request(operation.mutation, operation.variables);
      case 'ACCEPT_ASSIGNMENT':
        return await afyaPapoClient.request(operation.mutation, operation.variables);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }
  
  removePendingOperation(operationId) {
    this.pendingOperations = this.pendingOperations.filter(op => op.id !== operationId);
  }
  
  async isOnline() {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected;
  }
  
  // Listen for connectivity changes
  setupConnectivityListener() {
    return NetInfo.addEventListener(state => {
      if (state.isConnected && this.pendingOperations.length > 0) {
        this.syncPendingOperations();
      }
    });
  }
}
```

## Push Notifications

### Firebase Configuration

```javascript
// services/NotificationService.js
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export class NotificationService {
  constructor() {
    this.isConfigured = false;
  }
  
  async initialize() {
    // Request permission
    const authStatus = await messaging().requestPermission({
      alert: true,
      announcement: false,
      badge: true,
      carPlay: true,
      provisional: false,
      sound: true,
    });
    
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      await this.setupNotifications();
      this.isConfigured = true;
    }
  }
  
  async setupNotifications() {
    // Get FCM token
    const token = await messaging().getToken();
    
    // Register token with backend
    await this.registerDeviceToken(token);
    
    // Handle foreground notifications
    messaging().onMessage(async remoteMessage => {
      this.handleForegroundNotification(remoteMessage);
    });
    
    // Handle background notifications
    messaging().onNotificationOpenedApp(remoteMessage => {
      this.handleNotificationPress(remoteMessage);
    });
    
    // Handle notification when app is completely closed
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          this.handleNotificationPress(remoteMessage);
        }
      });
    
    // Token refresh handling
    messaging().onTokenRefresh(token => {
      this.registerDeviceToken(token);
    });
  }
  
  async registerDeviceToken(token) {
    const REGISTER_DEVICE_MUTATION = `
      mutation RegisterDevice($input: RegisterDeviceInput!) {
        registerDevice(input: $input) {
          success
          message
        }
      }
    `;
    
    const deviceInfo = await this.getDeviceInfo();
    
    try {
      await afyaPapoClient.request(REGISTER_DEVICE_MUTATION, {
        input: {
          deviceToken: token,
          deviceType: Platform.OS.toUpperCase(),
          deviceId: deviceInfo.deviceId,
          appVersion: deviceInfo.appVersion,
          osVersion: deviceInfo.osVersion,
          deviceName: deviceInfo.deviceName
        }
      });
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }
  
  handleForegroundNotification(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    // Show custom in-app notification
    this.showInAppNotification({
      title: notification.title,
      body: notification.body,
      data: data,
      onPress: () => this.handleNotificationPress(remoteMessage)
    });
    
    // Play notification sound for emergency alerts
    if (data.type === 'EMERGENCY_ALERT') {
      this.playEmergencySound();
    }
  }
  
  handleNotificationPress(remoteMessage) {
    const { data } = remoteMessage;
    
    switch (data.type) {
      case 'NEW_ASSIGNMENT':
        // Navigate to assignment details
        this.navigateToAssignment(data.assignmentId);
        break;
      case 'INCIDENT_UPDATE':
        // Navigate to incident tracking
        this.navigateToIncident(data.incidentId);
        break;
      case 'EMERGENCY_ALERT':
        // Show emergency alert details
        this.showEmergencyAlert(data);
        break;
      default:
        // Navigate to notifications list
        this.navigateToNotifications();
    }
  }
  
  async scheduleLocalNotification(notification) {
    // For critical notifications when push fails
    const notificationId = await this.localNotificationService.scheduleNotification({
      title: notification.title,
      body: notification.body,
      data: notification.data,
      triggerAt: notification.triggerAt || new Date(),
      sound: notification.sound || 'default',
      priority: notification.priority || 'high'
    });
    
    return notificationId;
  }
}
```

## Location Services

### GPS and Location Management

```javascript
// services/LocationService.js
import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';

export class LocationService {
  constructor() {
    this.watchId = null;
    this.lastKnownLocation = null;
  }
  
  async requestLocationPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'AfyaPapo Location Permission',
          message: 'AfyaPapo needs access to your location for emergency services.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS handles permission automatically
  }
  
  async getCurrentLocation() {
    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }
    
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          this.lastKnownLocation = location;
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          
          // Fall back to last known location
          if (this.lastKnownLocation) {
            resolve(this.lastKnownLocation);
          } else {
            reject(error);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    });
  }
  
  startLocationTracking(callback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 30000, // Update every 30 seconds
      ...options
    };
    
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp
        };
        
        this.lastKnownLocation = location;
        callback(location);
      },
      (error) => {
        console.error('Location tracking error:', error);
      },
      defaultOptions
    );
    
    return this.watchId;
  }
  
  stopLocationTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
  
  async reverseGeocode(location) {
    // Use geocoding service to convert coordinates to address
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.longitude},${location.latitude}.json?access_token=${MAPBOX_TOKEN}`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        return {
          formattedAddress: data.features[0].place_name,
          components: data.features[0].context
        };
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
    
    return {
      formattedAddress: `${location.latitude}, ${location.longitude}`,
      components: []
    };
  }
  
  calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) *
      Math.cos(this.deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  }
  
  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}
```

## Error Handling

### Comprehensive Error Management

```javascript
// services/ErrorHandler.js
export class ErrorHandler {
  static handleGraphQLError(error) {
    if (error.response?.errors) {
      const graphqlErrors = error.response.errors;
      
      for (const gqlError of graphqlErrors) {
        const errorCode = gqlError.extensions?.code;
        
        switch (errorCode) {
          case 'AUTHENTICATION_REQUIRED':
            return this.handleAuthError();
          case 'PERMISSION_DENIED':
            return this.handlePermissionError(gqlError.message);
          case 'RATE_LIMIT_EXCEEDED':
            return this.handleRateLimitError();
          case 'VALIDATION_ERROR':
            return this.handleValidationError(gqlError);
          case 'RESOURCE_NOT_FOUND':
            return this.handleNotFoundError(gqlError.message);
          default:
            return this.handleGenericError(gqlError.message);
        }
      }
    }
    
    // Network or other errors
    if (error.code === 'NETWORK_ERROR') {
      return this.handleNetworkError();
    }
    
    return this.handleGenericError(error.message);
  }
  
  static handleAuthError() {
    // Clear tokens and redirect to login
    afyaPapoClient.clearTokens();
    NavigationService.navigateToLogin();
    
    return {
      type: 'AUTH_ERROR',
      message: 'Please log in again',
      action: 'LOGIN_REQUIRED'
    };
  }
  
  static handleNetworkError() {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network connection failed. Please check your internet connection.',
      action: 'RETRY'
    };
  }
  
  static handleValidationError(error) {
    return {
      type: 'VALIDATION_ERROR',
      message: error.message,
      field: error.path?.[0],
      action: 'FIX_INPUT'
    };
  }
  
  static handleRateLimitError() {
    return {
      type: 'RATE_LIMIT_ERROR',
      message: 'Too many requests. Please wait a moment before trying again.',
      action: 'WAIT_AND_RETRY'
    };
  }
  
  static handleGenericError(message) {
    return {
      type: 'GENERIC_ERROR',
      message: message || 'An unexpected error occurred',
      action: 'RETRY'
    };
  }
  
  static showError(error) {
    const handledError = this.handleGraphQLError(error);
    
    // Show appropriate UI based on error type
    switch (handledError.action) {
      case 'LOGIN_REQUIRED':
        // Show login modal
        break;
      case 'RETRY':
        Alert.alert(
          'Error',
          handledError.message,
          [
            { text: 'Retry', onPress: () => this.retryLastOperation() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        break;
      case 'FIX_INPUT':
        // Highlight problematic field
        break;
      default:
        Alert.alert('Error', handledError.message);
    }
  }
}
```

This comprehensive mobile client integration guide provides developers with all the necessary components to build robust citizen and responder mobile applications for the AfyaPapo emergency response system, with full offline capabilities, real-time updates, and proper error handling.