import { Ionicons } from "@expo/vector-icons";
import { use, useContext, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../../store/context/auth-context";
import { computePrice, createDelivery } from "../../../utils/delivery";
import ThreeDotsLoader from "../../../components/ThreeDotsLoader";

const { width } = Dimensions.get("window");

function DeliveryDetailsScreen({ navigation, route }) {
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [priceBreakdown, setPriceBreakdown] = useState({
    baseFare: 0,
    distance: 0,
    serviceFee: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const authCtx = useContext(AuthContext);

  const deliveryData = route?.params;

  const paymentMethods = [
    {
      id: "mobile",
      label: "Mobile Money",
      icon: "phone-portrait",
      iconBg: "#ef4444",
      available: false,
    },
    {
      id: "card",
      label: "Carte de crédit",
      icon: "card",
      iconBg: "#6b7280",
      available: false,
    },
    {
      id: "cash",
      label: "Espèce",
      icon: "cash",
      iconBg: "#6b7280",
      available: true,
    },
  ];

  useEffect(() => {
    const onComputePrice = async () => {
      const data = {
        pickupAddress: {
          longitude: deliveryData.pickup.longitude,
          latitude: deliveryData.pickup.latitude,
        },
        dropoffAddress: {
          longitude: deliveryData.dropoff.longitude,
          latitude: deliveryData.dropoff.latitude,
        },
      };
      const response = await computePrice(data, authCtx.token);

      setPriceBreakdown((currentPrice) => ({
        ...currentPrice,
        baseFare: response.basePrice,
        distance: response.distance,
        serviceFee: response.charge,
        total: response.basePrice + response.distance + response.charge,
      }));
    };

    onComputePrice();
  }, []);

  // const priceBreakdown = {
  //   baseFare: 991,
  //   distance: 495,
  //   serviceFee: 165,
  //   total: 1653,
  // };

  const handleConfirm = async () => {
    console.log("Delivery confirmed with:", {
      ...deliveryData,
      payment: selectedPayment,
      price: priceBreakdown.total,
    });

    const deliveryRequest = {
      ...deliveryData,
      payment: selectedPayment,
      price: priceBreakdown.total,
    };

    setIsLoading(true);

    try {
      const response = await createDelivery(deliveryRequest, authCtx.token);

      // Navigation vers l'écran de tracking ou confirmation
      //navigation.navigate('TrackingScreen');
      setIsLoading(false);

      navigation.navigate("Tracking", {deliveryId: response.id, deliveryData: deliveryRequest});
    } catch (error) {
      Alert.alert(
        "Réquête non crée",
        "Impossible de faire la demande de livraison"
      );
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ef4444" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la livraison</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Pickup & Drop-off */}
        <View style={styles.locationCard}>
          <View style={styles.locationItem}>
            <View style={styles.locationDot} />
            <View style={styles.locationLine} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Point de collecte</Text>
              <Text style={styles.locationAddress}>
                {deliveryData.pickup.name}
              </Text>
            </View>
          </View>

          <View style={styles.locationItem}>
            <View style={[styles.locationDot, styles.locationDotBlack]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Point de livraison</Text>
              <Text style={styles.locationAddress}>
                {deliveryData.dropoff.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="cube-outline" size={32} color="#ef4444" />
            <Text style={styles.infoLabel}>Taille</Text>
            <Text style={styles.infoValue}>{deliveryData.size}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={32} color="#ef4444" />
            <Text style={styles.infoLabel}>Durée estimée</Text>
            <Text style={styles.infoValue}>{deliveryData.time}</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="cash-outline" size={32} color="#ef4444" />
            <Text style={styles.infoLabel}>Prix</Text>
            <Text style={styles.infoValue}>{priceBreakdown.total} F</Text>
          </View>
        </View>

        {/* Delivery Mode */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de livraison</Text>
          <View style={styles.deliveryModeCard}>
            <View style={styles.modeIconContainer}>
              <Text style={styles.modeIcon}>🏍️</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeLabel}>Moto</Text>
              <Text style={styles.modeDescription}>Rapide et fiable</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Methode de paiement</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentCard,
                  selectedPayment === method.id && styles.paymentCardActive,
                ]}
                onPress={() => setSelectedPayment(method.id)}
                activeOpacity={0.7}
                disabled={!method.available}
              >
                <View
                  style={[
                    styles.paymentIcon,
                    {
                      backgroundColor:
                        selectedPayment === method.id ? "#ef4444" : "#f3f4f6",
                    },
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={24}
                    color={selectedPayment === method.id ? "#fff" : "#6b7280"}
                  />
                </View>
                <Text
                  style={[
                    styles.paymentLabel,
                    selectedPayment === method.id && styles.paymentLabelActive,
                  ]}
                >
                  {method.label}
                </Text>
                <View
                  style={[
                    styles.radioButton,
                    selectedPayment === method.id && styles.radioButtonActive,
                  ]}
                >
                  {selectedPayment === method.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détail du prix</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Prix de base</Text>
              <Text style={styles.priceValue}>{priceBreakdown.baseFare} F</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Charge distance</Text>
              <Text style={styles.priceValue}>{priceBreakdown.distance} F</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Frais de service</Text>
              <Text style={styles.priceValue}>
                {priceBreakdown.serviceFee} F
              </Text>
            </View>

            <View style={styles.priceDivider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Total</Text>
              <Text style={styles.priceTotalValue}>
                {priceBreakdown.total} F CFA
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ThreeDotsLoader color="#fff" size={10} />
          ) : (
            <Text style={styles.confirmButtonText}>
              Confirmer et demander la livraison
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  safeArea: {
    backgroundColor: "#ef4444",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    marginTop: 4,
    zIndex: 2,
  },
  locationDotBlack: {
    backgroundColor: "#111827",
  },
  locationLine: {
    position: "absolute",
    left: 5.5,
    top: 16,
    width: 1,
    height: 40,
    backgroundColor: "#d1d5db",
    zIndex: 1,
  },
  locationInfo: {
    marginLeft: 16,
    flex: 1,
    paddingBottom: 16,
  },
  locationLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  deliveryModeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  modeIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modeIcon: {
    fontSize: 32,
  },
  modeInfo: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  paymentMethods: {
    gap: 12,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  paymentCardActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  paymentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  paymentLabelActive: {
    color: "#111827",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonActive: {
    borderColor: "#ef4444",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
  },
  priceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 15,
    color: "#6b7280",
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  priceDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  priceTotalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  priceTotalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ef4444",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  confirmButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});

export default DeliveryDetailsScreen;
