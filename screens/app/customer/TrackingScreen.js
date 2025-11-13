// src/screens/TrackingScreen.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Animated,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { findDelivery } from '../../../utils/delivery';
import { AuthContext } from '../../../store/context/auth-context';
import { socket } from '../../../utils/socket';

const { width, height } = Dimensions.get('window');

const TrackingScreen = ({ navigation, route }) => {
  //const delivery = route.params?.delivery || {
  //const delivery = ;
  const [delivery, setDelivery] = useState({
    orderId: 'DEL176226280090',
    pickup: 'hdh',
    dropoff: 'jsj',
    price: '1653 F',
    distance: '8.5 km',
    size: 'small',
    vehicle: 'motorbike',
  })
  const [deliveryData, setDeliveryData] = useState(null)
  const [currentStage, setCurrentStage] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const [driverPosition, setDriverPosition] = useState({
    latitude: 5.3400,
    longitude: -4.0150,
  });

  const progressAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef(null);
  const animationInterval = useRef(null);

  // Étapes du suivi
  const trackingStages = [
    {
      id: 0,
      status: 'assigned',
      label: 'Livreur assigné',
      icon: 'person',
      iconBg: '#10b981',
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      bannerText: '🔍 Recherche de livreur...',
      bannerColor: '#3b82f6',
    },
    {
      id: 1,
      status: 'going_to_pickup',
      label: 'Livreur en route',
      icon: 'bicycle',
      iconBg: '#10b981',
      time: new Date(Date.now() + 3 * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      bannerText: '🚴 Livreur en route vers le point de collecte',
      bannerColor: '#f59e0b',
    },
    {
      id: 2,
      status: 'picked_up',
      label: 'Colis récupéré',
      icon: 'checkmark-circle',
      iconBg: '#10b981',
      time: new Date(Date.now() + 20 * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      bannerText: '📦 Colis récupéré avec succès',
      bannerColor: '#8b5cf6',
    },
    {
      id: 3,
      status: 'on_delivery',
      label: 'Colis livré',
      icon: 'checkmark-done-circle',
      iconBg: '#10b981',
      time: new Date(Date.now() + 32 * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      bannerText: '🚚 En route vers la destination',
      bannerColor: '#ec4899',
    },
    {
      id: 4,
      status: 'delivered',
      label: 'Livraison terminée',
      icon: 'checkmark-done-circle',
      iconBg: '#10b981',
      time: new Date(Date.now() + 45 * 60000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      bannerText: '✅ Colis livré avec succès',
      bannerColor: '#10b981',
    },
  ];

  const driverInfo = {
    name: 'Kouassi Yao',
    phone: '+225 07 00 00 00 00',
    rating: 4.8,
    deliveries: 248,
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    vehicle: 'Honda CB125F',
  };
  

  const pickupCoords = {
    latitude: 5.3599517,
    longitude: -4.0082778,
  };

  const dropoffCoords = {
    latitude: 5.3167747,
    longitude: -4.0161046,
  };

  const positions = {
    initial: { latitude: 5.3400, longitude: -4.0150 },
    pickup: { latitude: 5.3599517, longitude: -4.0082778 },
    dropoff: { latitude: 5.3167747, longitude: -4.0161046 },
  };

  const authCtx = useContext(AuthContext);

  useEffect(() => {
    const loadDelivery = async () => {
      try{
        const response = await findDelivery(route.params.id, authCtx.token)
        console.log("Response API :", response);
        setDeliveryData(response)
      }catch(error) {
        console.log("Erreur lors du chargement :", error);
      }
    }

    if (route.params?.id) {
      loadDelivery();
    }
  }, [route.params?.id])

  useEffect(() => {
    if(deliveryData) {
      setDelivery(prev => ({...prev, orderId: deliveryData.id, size: deliveryData.packageSize, vehicle: deliveryData.deliveryType, price: `${deliveryData.estimatedPrice} F`, pickup: deliveryData.addressDeliveries.find(addr => addr.type === "PICKUP").name, dropoff: deliveryData.addressDeliveries.find(addr => addr.type === "DROPOFF").name}))
    }
  }, [deliveryData])

  // Nettoyer les intervalles au démontage
  useEffect(() => {
    return () => {
      if (animationInterval.current) {
        clearInterval(animationInterval.current);
      }
    };
  }, []);

  // Simulation automatique
  useEffect(() => {
    // const intervals = [4000, 6000, 5000, 6000];

    // let timeoutId;
    // if (currentStage < 4) {
    //   timeoutId = setTimeout(() => {
    //     setCurrentStage(prev => prev + 1);
    //   }, intervals[currentStage]);
    // } else if (currentStage === 4) {
    //   setTimeout(() => {
    //     setShowCompletionModal(true);
    //   }, 1000000);
    // }
    const status = ['PENDING','ASSIGNED','PICKEDUP','IN_PROGRESS','DELIVERED','CANCELLED']

    socket.on('deliveryStatusUpdated', data => {
      console.log('tracking status', deliveryData, delivery);
      console.log(data.deliveryId);
      console.log(data.deliveryId === deliveryData.id);
      if(data.deliveryId === deliveryData.id){
        const stage = status.indexOf(data.status)
        console.log(stage);
        if(stage < 4) {
          setCurrentStage(prev => prev = stage)
        }else {
          setShowCompletionModal(true)
        }
      }
    })

    return () => {
      socket.off("deliveryStatusUpdated");
    };

    //return () => clearTimeout(timeoutId);
  }, [deliveryData, delivery]);

  // Animation position livreur
  useEffect(() => {
    let targetPosition;

    switch (currentStage) {
      case 0:
        targetPosition = positions.initial;
        setDriverPosition(targetPosition);
        break;
      case 1:
        animateDriverPosition(positions.initial, positions.pickup, 6000);
        break;
      case 2:
        targetPosition = positions.pickup;
        setDriverPosition(targetPosition);
        break;
      case 3:
        animateDriverPosition(positions.pickup, positions.dropoff, 6000);
        break;
      case 4:
        targetPosition = positions.dropoff;
        setDriverPosition(targetPosition);
        break;
      default:
        targetPosition = positions.initial;
        setDriverPosition(targetPosition);
    }
  }, [currentStage]);

  const handleRateDelivery = () => {
    setShowCompletionModal(false);
    let deliveryData = delivery
    delivery.driver = driverInfo
    navigation.navigate("Rating", {
      orderId: deliveryData.orderId,
      driver: deliveryData.driver,
      deliveryData: deliveryData,
    });
  };

  const handleCloseLater = () => {
    setShowCompletionModal(false);
    // Retour à l'écran d'accueil
    navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerApp' }], // ou votre écran principal
      });
  };

  const animateDriverPosition = (start, end, duration) => {
    // Nettoyer l'ancien interval
    if (animationInterval.current) {
      clearInterval(animationInterval.current);
    }

    const steps = 60;
    const stepDuration = duration / steps;
    const latStep = (end.latitude - start.latitude) / steps;
    const lngStep = (end.longitude - start.longitude) / steps;

    let currentStep = 0;
    animationInterval.current = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(animationInterval.current);
        setDriverPosition(end);
      } else {
        setDriverPosition({
          latitude: start.latitude + (latStep * currentStep),
          longitude: start.longitude + (lngStep * currentStep),
        });
      }
    }, stepDuration);
  };

  // Animation barre de progression
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: ((currentStage + 1) / 5) * 100,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [currentStage]);

  // Centrer carte sur livreur
  useEffect(() => {
    if (mapReady && mapRef.current && currentStage > 0 && currentStage < 4) {
      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: driverPosition.latitude,
          longitude: driverPosition.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [driverPosition, mapReady, currentStage]);

  const handleCallDriver = () => {
    const phoneNumber = driverInfo.phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleMessageDriver = () => {
    const phoneNumber = driverInfo.phone.replace(/\s/g, '');
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const currentStageData = trackingStages[currentStage];

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="dark" />

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: 5.3350,
            longitude: -4.0120,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
        >
          {/* Pickup Marker */}
          {currentStage < 3 && (
            <Marker coordinate={pickupCoords}>
              <View style={styles.markerContainer}>
                <View style={[styles.marker, { backgroundColor: '#ef4444' }]}>
                  <Ionicons name="location" size={20} color="#fff" />
                </View>
              </View>
            </Marker>
          )}

          {/* Dropoff Marker */}
          <Marker coordinate={dropoffCoords}>
            <View style={styles.markerContainer}>
              <View style={[styles.marker, { backgroundColor: '#1f2937' }]}>
                <Ionicons name="location" size={20} color="#fff" />
              </View>
            </View>
          </Marker>

          {/* Driver Marker */}
          {currentStage > 0 && currentStage < 4 && (
            <Marker coordinate={driverPosition}>
              <View style={styles.driverMarkerContainer}>
                <View style={styles.driverMarker}>
                  <Image
                    source={{ uri: driverInfo.photo }}
                    style={styles.driverPhoto}
                  />
                </View>
              </View>
            </Marker>
          )}

          {/* Route Line */}
          {currentStage > 0 && (
            <Polyline
              coordinates={
                currentStage < 3
                  ? [driverPosition, pickupCoords]
                  : [pickupCoords, driverPosition, dropoffCoords]
              }
              strokeColor={currentStageData.bannerColor}
              strokeWidth={3}
              lineDashPattern={[1]}
            />
          )}
        </MapView>

        {/* Header sur la carte */}
        <SafeAreaView style={styles.mapHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle" size={24} color="#fff" />
          </TouchableOpacity>

          {/* <View style={styles.progressBadge}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
            <Text style={styles.progressText}>
              {Math.round(((currentStage + 1) / 5) * 100)}%
            </Text>
          </View> */}
        </SafeAreaView>

        {/* Banner de statut */}
        <View style={[styles.statusBanner, { backgroundColor: currentStageData.bannerColor }]}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.bannerText}>{currentStageData.bannerText}</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Adresses départ/arrivée */}
          <View style={styles.addressCard}>
            <View style={styles.addressRow}>
              <View style={[styles.addressIcon, { backgroundColor: '#ef4444' }]}>
                <Ionicons name="location" size={16} color="#fff" />
              </View>
              <View style={styles.addressContent}>
                <Text style={styles.addressLabel}>Départ</Text>
                <Text style={styles.addressValue}>{delivery.pickup}</Text>
              </View>
            </View>

            <View style={styles.addressDivider} />

            <View style={styles.addressRow}>
              <View style={[styles.addressIcon, { backgroundColor: '#1f2937' }]}>
                <Ionicons name="location" size={16} color="#fff" />
              </View>
              <View style={styles.addressContent}>
                <Text style={styles.addressLabel}>Arrivée</Text>
                <Text style={styles.addressValue}>{delivery.dropoff}</Text>
              </View>
            </View>
          </View>

          {/* Driver Info Card */}
          {currentStage > 0 && currentStage < 4 && (
            <View style={styles.driverCard}>
              <Image
                source={{ uri: driverInfo.photo }}
                style={styles.driverAvatar}
              />
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driverInfo.name}</Text>
                <Text style={styles.driverVehicle}>{driverInfo.vehicle}</Text>
                <View style={styles.driverRating}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.ratingText}>
                    {driverInfo.rating} ({driverInfo.deliveries} livraisons)
                  </Text>
                </View>
              </View>

              <View style={styles.driverActions}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={handleCallDriver}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={handleMessageDriver}
                >
                  <Ionicons name="chatbubble-outline" size={20} color="#1f2937" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Delivery Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>Détails de la livraison</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Commande</Text>
              <Text style={styles.detailValue}>{delivery.id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Taille du colis</Text>
              <Text style={styles.detailValue}>{delivery.size}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mode de livraison</Text>
              <Text style={styles.detailValue}>{delivery.vehicle}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prix de la course</Text>
              <Text style={[styles.detailValue, styles.priceText]}>{delivery.price}</Text>
            </View>
          </View>

          {/* Suivi de la course */}
          <View style={styles.trackingCard}>
            <Text style={styles.trackingTitle}>Suivi de la course</Text>

            {trackingStages.slice(0, 4).map((stage, index) => (
              <View key={stage.id} style={styles.trackingItem}>
                <View
                  style={[
                    styles.trackingIcon,
                    {
                      backgroundColor: index <= currentStage ? stage.iconBg : '#e5e7eb',
                    },
                  ]}
                >
                  <Ionicons
                    name={stage.icon}
                    size={20}
                    color={index <= currentStage ? '#fff' : '#9ca3af'}
                  />
                </View>
                <View style={styles.trackingContent}>
                  <Text
                    style={[
                      styles.trackingLabel,
                      index === currentStage && styles.trackingLabelActive,
                    ]}
                  >
                    {stage.label}
                  </Text>
                  <Text style={styles.trackingTime}>{stage.time}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </View>

      {/* Modal Livraison terminée */}
      <Modal
        visible={showCompletionModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.completionModal}>
            <View style={styles.completionIcon}>
              <Ionicons name="checkmark" size={60} color="#fff" />
            </View>

            <Text style={styles.completionTitle}>Livraison terminée!</Text>
            <Text style={styles.completionSubtitle}>
              Votre colis a bien été livré à l'adresse {delivery.dropoff}
            </Text>

            <View style={styles.driverMiniCard}>
              <Image
                source={{ uri: driverInfo.photo }}
                style={styles.driverMiniPhoto}
              />
              <View>
                <Text style={styles.driverMiniName}>{driverInfo.name}</Text>
                <Text style={styles.driverMiniVehicle}>{driverInfo.vehicle}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.rateButton}
              onPress={handleRateDelivery}
            >
              <Ionicons name="star" size={20} color="#fff" />
              <Text style={styles.rateButtonText}>Noter la livraison</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleCloseLater}
            >
              <Text style={styles.dismissButtonText}>Pas maintenant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  mapContainer: {
    height: height * 0.45,
  },
  map: {
    flex: 1,
  },
  mapHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    top: 50,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoButton: {
    top: 50,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressBadge: {
    top: 50,
    position: 'absolute',
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#10b981',
    opacity: 0.2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    zIndex: 1,
  },
  statusBanner: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  driverPhoto: {
    width: '100%',
    height: '100%',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    marginTop: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  addressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  addressDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  driverAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#ef4444',
    marginBottom: 12,
  },
  driverInfo: {
    marginBottom: 16,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  driverVehicle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 14,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 14,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  priceText: {
    color: '#ef4444',
    fontSize: 16,
  },
  trackingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  trackingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingContent: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 2,
  },
  trackingLabelActive: {
    fontWeight: '700',
    color: '#1f2937',
  },
  trackingTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completionModal: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  completionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  completionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  driverMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  driverMiniPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  driverMiniName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  driverMiniVehicle: {
    fontSize: 13,
    color: '#6b7280',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    marginBottom: 12,
  },
  rateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  dismissButton: {
    paddingVertical: 12,
  },
  dismissButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default TrackingScreen;
