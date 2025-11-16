import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Composant DeliveryCard
const DeliveryCard = ({ delivery, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "#10b981";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? "star" : "star-outline"}
        size={16}
        color="#fbbf24"
      />
    ));
  };

  return (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.deliveryDate}>{delivery.date}</Text>
          <Text style={styles.deliveryId}>{delivery.id}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(delivery.status)}20` },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(delivery.status) },
            ]}
          >
            {delivery.status}
          </Text>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeContainer}>
        {/* Pickup */}
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Départ</Text>
            <Text style={styles.locationAddress}>
              {
                delivery.addressDeliveries.find(
                  (addr) => addr.type === "PICKUP"
                ).name
              }
            </Text>
          </View>
        </View>

        {/* Drop-off */}
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, styles.locationDotBlack]} />
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Arrivée</Text>
            <Text style={styles.locationAddress}>
              {
                delivery.addressDeliveries.find(
                  (addr) => addr.type === "DROPOFF"
                ).name
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        {/* <View style={styles.driverInfo}>
          <Ionicons name="person-circle-outline" size={24} color="#6b7280" />
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{delivery.courier.lastName + " " + delivery.courier.lastName}</Text>
            {delivery.status === "completed" && (
              <View style={styles.ratingContainer}>
                {renderStars(delivery.driver.rating)}
              </View>
            )}
          </View>
        </View> */}

        <View style={styles.priceContainer}>
          <Text style={styles.priceAmount}>{delivery.estimatedPrice} F</Text>
          <Text style={styles.priceCurrency}>CFA</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  deliveryDate: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  deliveryId: {
    fontSize: 13,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  routeContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    marginTop: 4,
    marginRight: 12,
  },
  locationDotBlack: {
    backgroundColor: "#111827",
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  driverInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 2,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 12,
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ef4444",
  },
  priceCurrency: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ef4444",
    marginLeft: 4,
  },
});

export default DeliveryCard;
