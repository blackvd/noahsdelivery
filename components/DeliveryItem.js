import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import LoaderComponent from "./Loader";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DeliveryItem = ({ item, index }) => {
  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à  $ {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à  $ {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    const statusMap = {
      delivered: { label: "Livré", color: "#10b981", icon: "checkmark-circle" },
      cancelled: { label: "Annulé", color: "#ef4444", icon: "close-circle" },
      pending: { label: "En attente", color: "#f59e0b", icon: "time" },
    };
    return statusMap[status] || statusMap.pending;
  };

  const statusBadge = getStatusBadge(item.status);

  return (
    <Animated.View
      style={[
        styles.deliveryCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("DeliveryHistoryDetails", { delivery: item })
        }
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: ` $ {statusBadge.color}15` },
              ]}
            >
              <Ionicons
                name={statusBadge.icon}
                size={20}
                color={statusBadge.color}
              />
            </View>
            <View>
              <Text style={styles.cardId}>#{item.id.slice(0, 8)}</Text>
              <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: ` $ {statusBadge.color}15` },
            ]}
          >
            <Text
              style={[styles.statusBadgeText, { color: statusBadge.color }]}
            >
              {statusBadge.label}
            </Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressesContainer}>
          <View style={styles.addressRow}>
            <View style={[styles.addressDot, { backgroundColor: "#ef4444" }]} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.pickup.address}
            </Text>
          </View>

          <View style={styles.addressLine} />

          <View style={styles.addressRow}>
            <View style={[styles.addressDot, { backgroundColor: "#1f2937" }]} />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.dropoff.address}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.cardFooterItem}>
            <Ionicons name="cube-outline" size={16} color="#6b7280" />
            <Text style={styles.cardFooterText}>{item.packageSize}</Text>
          </View>

          <View style={styles.cardFooterItem}>
            <Ionicons name="bicycle-outline" size={16} color="#6b7280" />
            <Text style={styles.cardFooterText}>{item.vehicleType}</Text>
          </View>

          <View style={styles.cardFooterItem}>
            <Text style={styles.cardPrice}>{item.price} FCFA</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Afficher le loader pendant le chargement initial
if (isLoading) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LoaderComponent />
    </SafeAreaView>
  );
}

export default DeliveryItem;
