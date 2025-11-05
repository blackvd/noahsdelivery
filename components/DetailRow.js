import { StyleSheet, Text, View } from "react-native";

const DetailRow = ({ label, value, highlighted }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[styles.detailValue, highlighted && styles.detailValueHighlighted]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 15,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  detailValueHighlighted: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ef4444",
  },
});

export default DetailRow;
