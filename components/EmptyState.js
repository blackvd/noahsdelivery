import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Empty State
const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="cube-outline" size={64} color="#d1d5db" />
    </View>
    <Text style={styles.emptyTitle}>Aucune livraison</Text>
    <Text style={styles.emptySubtitle}>
      Vous n'avez pas encore effectué de livraison
    </Text>
    <TouchableOpacity
      style={styles.emptyButton}
      onPress={() => navigation.navigate("Home")}
    >
      <Ionicons name="add-circle" size={20} color="#fff" />
      <Text style={styles.emptyButtonText}>Nouvelle livraison</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
})

export default EmptyState;
