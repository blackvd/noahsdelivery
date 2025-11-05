import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const UpdateItem = ({ time, status, icon, isActive, isPending }) => (
  <View style={styles.updateItem}>
    <View
      style={[
        styles.updateIcon,
        isActive && styles.updateIconActive,
        isPending && styles.updateIconPending,
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={isActive ? "#10b981" : isPending ? "#d1d5db" : "#10b981"}
      />
    </View>
    <View style={styles.updateContent}>
      <Text
        style={[styles.updateStatus, isPending && styles.updateStatusPending]}
      >
        {status}
      </Text>
      <Text style={styles.updateTime}>{time}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  updateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  updateIconActive: {
    backgroundColor: "#d1fae5",
  },
  updateIconPending: {
    backgroundColor: "#f9fafb",
  },
  updateContent: {
    flex: 1,
  },
  updateStatus: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  updateStatusPending: {
    color: "#9ca3af",
  },
  updateTime: {
    fontSize: 13,
    color: "#6b7280",
  },
});

export default UpdateItem;
