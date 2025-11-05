// src/screens/DeliveryHistoryDetailsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const DeliveryHistoryDetailsScreen = ({ navigation, route }) => {
  const { delivery } = route.params;

  const handleCall = () => {
    const phone = '+225 07 XX XX XX XX'; // Remplacer par le vrai numéro
    Linking.openURL(`tel:${phone}`);
  };

  const handleReorder = () => {
    navigation.navigate('Home', {
      reorderData: {
        pickup: delivery.pickup.address,
        dropoff: delivery.dropoff.address,
        size: delivery.packageSize,
        mode: delivery.deliveryMode,
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'canceled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={20}
        color="#fbbf24"
      />
    ));
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" backgroundColor="#ef4444" />

      {/* Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor: `${getStatusColor(delivery.status)}20`,
              },
            ]}
          >
            <Ionicons
              name={
                delivery.status === 'completed'
                  ? 'checkmark-circle'
                  : 'close-circle'
              }
              size={48}
              color={getStatusColor(delivery.status)}
            />
          </View>
          <Text style={styles.statusTitle}>
            {delivery.status === 'completed'
              ? 'Livraison terminée'
              : 'Livraison annulée'}
          </Text>
          <Text style={styles.statusDate}>
            {delivery.date} • {delivery.time}
          </Text>
        </View>

        {/* Order Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Order ID" value={delivery.id} copyable />
            <InfoRow label="Package Size" value={delivery.packageSize} />
            <InfoRow label="Delivery Mode" value={delivery.deliveryMode} />
            <InfoRow
              label="Total Amount"
              value={`${delivery.price} F CFA`}
              highlighted
            />
          </View>
        </View>

        {/* Route */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itinéraire</Text>
          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <View style={styles.routeDot} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Point de collecte</Text>
                <Text style={styles.routeAddress}>
                  {delivery.pickup.location}
                </Text>
                <Text style={styles.routeSubAddress}>
                  {delivery.pickup.address}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeItem}>
              <View style={[styles.routeDot, styles.routeDotBlack]} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Point de livraison</Text>
                <Text style={styles.routeAddress}>
                  {delivery.dropoff.location}
                </Text>
                <Text style={styles.routeSubAddress}>
                  {delivery.dropoff.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Driver Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information du livreur</Text>
          <View style={styles.driverCard}>
            <Image
              source={{ uri: delivery.driver.photo }}
              style={styles.driverPhoto}
            />
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{delivery.driver.name}</Text>
              <Text style={styles.driverVehicle}>{delivery.driver.vehicle}</Text>
              {delivery.status === 'completed' && delivery.driver.rating > 0 && (
                <View style={styles.driverRating}>
                  {renderStars(delivery.driver.rating)}
                </View>
              )}
            </View>
            {delivery.status === 'completed' && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCall}
                activeOpacity={0.7}
              >
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Actions */}
        {delivery.status === 'completed' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.reorderButton}
              onPress={handleReorder}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color="#fff" />
              <Text style={styles.reorderButtonText}>Commander à nouveau</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportButton}
              activeOpacity={0.8}
            >
              <Ionicons name="help-circle-outline" size={20} color="#ef4444" />
              <Text style={styles.supportButtonText}>Aide</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaProvider>
  );
};

// Composant InfoRow
const InfoRow = ({ label, value, highlighted, copyable }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      <Text
        style={[
          styles.infoValue,
          highlighted && styles.infoValueHighlighted,
        ]}
      >
        {value}
      </Text>
      {copyable && (
        <TouchableOpacity style={styles.copyButton}>
          <Ionicons name="copy-outline" size={16} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerSafeArea: {
    backgroundColor: '#ef4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  statusDate: {
    fontSize: 15,
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  infoValueHighlighted: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ef4444',
  },
  copyButton: {
    padding: 4,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    marginTop: 4,
    marginRight: 16,
  },
  routeDotBlack: {
    backgroundColor: '#111827',
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e5e7eb',
    marginLeft: 7,
    marginVertical: 8,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  routeSubAddress: {
    fontSize: 14,
    color: '#6b7280',
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ef4444',
    marginRight: 16,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  driverVehicle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  driverRating: {
    flexDirection: 'row',
    gap: 4,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionsSection: {
    marginHorizontal: 20,
    gap: 12,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    elevation: 4,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  reorderButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
});

export default DeliveryHistoryDetailsScreen;
