import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const TimelineItem = ({ icon, iconColor, label, address, isActive }) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineIconContainer}>
      <View style={[styles.timelineIcon, { backgroundColor: iconColor }]}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
      {!isActive && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <Text style={styles.timelineLabel}>{label}</Text>
      <Text style={styles.timelineAddress}>{address}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  timelineIconContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#d1d5db",
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  timelineAddress: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});

export default TimelineItem;
