// src/screens/DriverHomeScreen.js
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../../store/context/auth-context';

const { width } = Dimensions.get('window');

const DriverHomeScreen = ({ navigation }) => {
  const authCtx = useContext(AuthContext)

  const [isOnline, setIsOnline] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Données du livreur
  const driverData = {
    name: 'Jean Dupont',
    photo: 'https://i.pravatar.cc/150?img=12',
    rating: 4.8,
    totalDeliveries: 248,
    totalEarned: '1,840,000 F',
    todayEarnings: '24,500 F',
    todayTrips: 8,
    todayHours: '6.5h',
    todayRating: 4.8,
  };

  const availableRequests = [
    {
      id: 1,
      distance: '5.2 km',
      time: '~18 min',
      price: '2500 F',
      size: 'moyen',
      pickup: 'Cocody, Abidjan',
      dropoff: 'Plateau, Abidjan',
    },
    {
      id: 2,
      distance: '7.8 km',
      time: '~22 min',
      price: '3200 F',
      size: 'petit',
      pickup: 'Marcory, Abidjan',
      dropoff: 'Yopougon, Abidjan',
    },
    {
      id: 3,
      distance: '3.5 km',
      time: '~12 min',
      price: '1800 F',
      size: 'large',
      pickup: 'Treichville, Abidjan',
      dropoff: 'Adjamé, Abidjan',
    },
  ];

  // Animation du menu
  useEffect(() => {
    if (showProfileMenu) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showProfileMenu]);

  const handleToggleOnline = (value) => {
    setIsOnline(value);
    if (value) {
      Alert.alert('Mode en ligne', 'Vous êtes maintenant disponible pour les livraisons');
    } else {
      Alert.alert('Mode hors ligne', 'Vous ne recevrez plus de nouvelles demandes');
    }
  };

  const handleAccept = (request) => {
    Alert.alert(
      'Accepter la course',
      `Accepter la livraison de ${request.price} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          onPress: () => {
            console.log('Accepted request:', request);
            navigation.navigate('DeliveryInProgress', { delivery: request });
          },
        },
      ]
    );
  };

  const handleDecline = (request) => {
    console.log('Declined request:', request);
  };

  const getSizeBadgeColor = (size) => {
    switch (size) {
      case 'petit':
        return '#dbeafe';
      case 'moyen':
        return '#fef3c7';
      case 'large':
        return '#fce7f3';
      default:
        return '#e5e7eb';
    }
  };

  const getSizeTextColor = (size) => {
    switch (size) {
      case 'petit':
        return '#1e40af';
      case 'moyen':
        return '#b45309';
      case 'large':
        return '#9f1239';
      default:
        return '#374151';
    }
  };

  const handleEditProfile = () => {
    setShowProfileMenu(false);
    setTimeout(() => {
      navigation.navigate('DriverProfile');
    }, 300);
  };

  const handleReportProblem = () => {
    setShowProfileMenu(false);
    setTimeout(() => {
      Alert.alert(
        'Signaler un problème',
        'Choisissez le type de problème',
        [
          { text: 'Problème technique', onPress: () => {} },
          { text: 'Problème de paiement', onPress: () => {} },
          { text: 'Problème avec un client', onPress: () => {} },
          { text: 'Autre', onPress: () => {} },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
    }, 300);
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    setTimeout(() => {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: () => {
              authCtx.logout()
              // navigation.reset({
              //   index: 0,
              //   routes: [{ name: 'Auth' }],
              // });
            },
          },
        ]
      );
    }, 300);
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerSubtitle}>Driver Mode</Text>
              <Text style={styles.headerTitle}>Dashboard</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setShowProfileMenu(true)}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: driverData.photo }}
                style={styles.profileImage}
              />
              <View style={styles.onlineIndicator} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Toggle Online/Offline */}
        <View style={styles.card}>
          <View style={styles.onlineToggle}>
            <View style={styles.onlineLeft}>
              <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
              <Text style={styles.onlineText}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor="#fff"
              ios_backgroundColor="#d1d5db"
            />
          </View>
        </View>

        {/* Overall Performance */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Performance globale</Text>
          <View style={styles.performanceRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={24} color="#fbbf24" />
              <Text style={styles.ratingText}>{driverData.rating}</Text>
            </View>
            <Text style={styles.deliveriesText}>
              {driverData.totalDeliveries} livraisons
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.earnedRow}>
            <Text style={styles.earnedLabel}>Total gagné</Text>
            <Text style={styles.earnedValue}>{driverData.totalEarned}</Text>
          </View>
        </View>

        {/* Today's Performance */}
        <Text style={styles.sectionHeader}>Performance du jour</Text>
        <View style={styles.statsGrid}>
          {/* Earnings */}
          <View style={[styles.statCard, { backgroundColor: '#d1fae5' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cash-outline" size={28} color="#10b981" />
            </View>
            <Text style={styles.statLabel}>Gains</Text>
            <Text style={styles.statValue}>{driverData.todayEarnings}</Text>
          </View>

          {/* Deliveries */}
          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="cube-outline" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.statLabel}>Livraisons</Text>
            <Text style={styles.statValue}>{driverData.todayTrips} courses</Text>
          </View>

          {/* Rating */}
          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="star-outline" size={28} color="#f59e0b" />
            </View>
            <Text style={styles.statLabel}>Note</Text>
            <Text style={styles.statValue}>{driverData.todayRating} ⭐</Text>
          </View>

          {/* Hours */}
          <View style={[styles.statCard, { backgroundColor: '#e9d5ff' }]}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time-outline" size={28} color="#a855f7" />
            </View>
            <Text style={styles.statLabel}>Heures</Text>
            <Text style={styles.statValue}>{driverData.todayHours}</Text>
          </View>
        </View>

        {/* New Requests */}
        <View style={styles.requestsHeader}>
          <Text style={styles.sectionHeader}>Nouvelles demandes</Text>
          <View style={styles.availableBadge}>
            <Text style={styles.availableBadgeText}>
              {availableRequests.length} disponible{availableRequests.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {isOnline ? (
          availableRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestIconContainer}>
                  <Ionicons name="cube" size={28} color="#fff" />
                </View>
                <View style={styles.requestInfo}>
                  <View style={styles.requestTopRow}>
                    <Text style={styles.requestDistance}>{request.distance}</Text>
                    <Text style={styles.requestPrice}>{request.price}</Text>
                  </View>
                  <View style={styles.requestBottomRow}>
                    <Text style={styles.requestTime}>{request.time}</Text>
                    <View
                      style={[
                        styles.sizeBadge,
                        { backgroundColor: getSizeBadgeColor(request.size) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeBadgeText,
                          { color: getSizeTextColor(request.size) },
                        ]}
                      >
                        {request.size}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.requestLocations}>
                <View style={styles.locationRow}>
                  <View style={styles.locationDot} />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationLabel}>Pickup</Text>
                    <Text style={styles.locationAddress}>{request.pickup}</Text>
                  </View>
                </View>

                <View style={styles.locationConnector} />

                <View style={styles.locationRow}>
                  <View style={[styles.locationDot, styles.locationDotDark]} />
                  <View style={styles.locationTextContainer}>
                    <Text style={styles.locationLabel}>Drop-off</Text>
                    <Text style={styles.locationAddress}>{request.dropoff}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={() => handleDecline(request)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#6b7280" />
                  <Text style={styles.declineButtonText}>Refuser</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => handleAccept(request)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.acceptButtonText}>Accepter</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.offlineMessage}>
            <Ionicons name="moon-outline" size={48} color="#9ca3af" />
            <Text style={styles.offlineTitle}>Vous êtes hors ligne</Text>
            <Text style={styles.offlineText}>
              Activez le mode en ligne pour recevoir des demandes
            </Text>
          </View>
        )}

        {/* Espace pour le scroll */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Profile Menu Modal */}
      <Modal
        visible={showProfileMenu}
        transparent
        animationType="none"
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <Animated.View
            style={[
              styles.menuOverlayBackground,
              { opacity: opacityAnim },
            ]}
          />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.menuContent}>
            {/* Menu Header */}
            <View style={styles.menuHeader}>
              <View style={styles.menuProfileSection}>
                <Image
                  source={{ uri: driverData.profileImage }}
                  style={styles.menuProfileImage}
                />
                <View style={styles.menuProfileInfo}>
                  <Text style={styles.menuProfileName}>{driverData.name}</Text>
                  <View style={styles.menuProfileRating}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={styles.menuProfileRatingText}>{driverData.rating}</Text>
                    <Text style={styles.menuProfileDeliveries}>
                      • {driverData.totalDeliveries} livraisons
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.menuCloseButton}
                onPress={() => setShowProfileMenu(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEditProfile}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="person-outline" size={24} color="#111827" />
                </View>
                <Text style={styles.menuItemText}>Modifier le profil</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleReportProblem}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name="alert-circle-outline" size={24} color="#111827" />
                </View>
                <Text style={styles.menuItemText}>Signaler un problème</Text>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={[styles.menuItem, styles.logoutMenuItem]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={[styles.menuItemIcon, styles.logoutIcon]}>
                  <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                </View>
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  Se déconnecter
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            {/* App Version */}
            <View style={styles.menuFooter}>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Modal>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#000',
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6b7280',
  },
  statusDotOnline: {
    backgroundColor: '#10b981',
  },
  onlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  deliveriesText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 16,
  },
  earnedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earnedLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  earnedValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  requestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  availableBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  availableBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  requestDistance: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  requestPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
  },
  requestBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  sizeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sizeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestLocations: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    marginTop: 6,
    marginRight: 12,
  },
  locationDotDark: {
    backgroundColor: '#111827',
  },
  locationConnector: {
    width: 2,
    height: 16,
    backgroundColor: '#e5e7eb',
    marginLeft: 4,
    marginVertical: 4,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
    elevation: 2,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  offlineMessage: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  offlineText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  // Menu Styles
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  menuOverlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fff',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuProfileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuProfileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#10b981',
  },
  menuProfileInfo: {
    flex: 1,
  },
  menuProfileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  menuProfileRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuProfileRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  menuProfileDeliveries: {
    fontSize: 12,
    color: '#9ca3af',
  },
  menuCloseButton: {
    padding: 4,
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  logoutMenuItem: {
    marginTop: 8,
  },
  logoutIcon: {
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
  },
  menuFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default DriverHomeScreen;
