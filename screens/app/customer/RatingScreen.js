import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function RatingScreen({ navigation, route }) {
  const { orderId, driver, deliveryData } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const ratingTags = [
    { id: 1, label: "🚀 Rapide", value: "fast" },
    { id: 2, label: "🎯 Professionnel", value: "professional" },
    { id: 3, label: "😊 Amical", value: "friendly" },
    { id: 4, label: "📦 Prudent", value: "careful" },
    { id: 5, label: "💬 Bonne communication", value: "communication" },
    { id: 6, label: "⏰ À l'heure", value: "ontime" },
  ];

  const toggleTag = (tagValue) => {
    if (selectedTags.includes(tagValue)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagValue));
    } else {
      setSelectedTags([...selectedTags, tagValue]);
    }
  };

  const handleSubmitRating = () => {
    if (rating === 0) {
      Alert.alert("Évaluation requise", "Veuillez sélectionner une note par étoiles");
      return;
    }

    console.log("Submit Rating:", {
      orderId,
      driverId: driver.fullname,
      rating,
      tags: selectedTags,
      comment,
    });

    // API call here
    // ...

    // Success feedback
    Alert.alert("Merci !", "Vos commentaires nous aident à améliorer notre service.", [
      {
        text: "Done",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "CustomerApp" }], // ou votre écran principal
          });
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ef4444" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Évaluez votre livraison</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Driver Card */}
          <View style={styles.driverCard}>
            <Image source={{ uri: `https://avatar.iran.liara.run/username?username=${driver.fullname}` }} style={styles.driverPhoto} />
            <Text style={styles.driverName}>{driver.fullname}</Text>
            {/* <Text style={styles.driverVehicle}>{driver.vehicle}</Text> */}
            <View style={styles.orderInfo}>
              <Text style={styles.orderIdText}>Commande: {orderId}</Text>
            </View>
          </View>

          {/* Star Rating */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>Comment s'est passée la livraison ?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={48}
                    color={star <= rating ? "#fbbf24" : "#d1d5db"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {rating > 0 && (
              <Text style={styles.ratingLabel}>
                {rating === 5 && "Excellent! 🎉"}
                {rating === 4 && "Super! 👍"}
                {rating === 3 && "Bon 😊"}
                {rating === 2 && "Pourrait être mieux 😐"}
                {rating === 1 && "Insatisfait 😞"}
              </Text>
            )}
          </View>

          {/* Tags */}
          {rating > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Qu'est-ce qui vous a plu ?</Text>
              <View style={styles.tagsContainer}>
                {ratingTags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tag,
                      selectedTags.includes(tag.value) && styles.tagSelected,
                    ]}
                    onPress={() => toggleTag(tag.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag.value) &&
                          styles.tagTextSelected,
                      ]}
                    >
                      {tag.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Comment */}
          {rating > 0 && (
            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>
                Commentaires supplémentaires (facultatif)
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Partagez votre expérience..."
                placeholderTextColor="#9ca3af"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>{comment.length}/500</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button */}
        {rating > 0 && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitRating}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Soumettre</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  driverCard: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  driverPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#ef4444",
    marginBottom: 16,
  },
  driverName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  driverVehicle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
  },
  orderInfo: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  ratingSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
    marginTop: 8,
  },
  tagsSection: {
    marginBottom: 32,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tag: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tagSelected: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  tagText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  tagTextSelected: {
    color: "#ef4444",
  },
  commentSection: {
    marginBottom: 32,
  },
  commentInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#111827",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  characterCount: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "right",
    marginTop: 8,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  submitButton: {
    backgroundColor: "#ef4444",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
});

export default RatingScreen;
