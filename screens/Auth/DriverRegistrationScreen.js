// src/screens/DriverRegistrationScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { registerCourier } from "../../utils/auth";
import { AuthContext } from "../../store/context/auth-context";

const DriverRegistrationScreen = ({ navigation, route }) => {
  const authCtx = useContext(AuthContext);
  const { phone } = route.params || {};

  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    idCardFront: null,
    idCardBack: null,
    licenseFront: null,
    licenseBack: null,
    profilePhoto: null,
  });

  const [loading, setLoading] = useState(false);

  // Demander les permissions au montage
  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission refusée",
            "Nous avons besoin de votre permission pour accéder à vos photos."
          );
        }
      }
    })();
  }, []);

  const pickImage = async (field) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === "profilePhoto" ? [1, 1] : [16, 10],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData({ ...formData, [field]: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger l'image");
    }
  };

  const takePhoto = async (field) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin de votre permission pour utiliser la caméra."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: field === "profilePhoto" ? [1, 1] : [16, 10],
        quality: 0.8,
      });

      if (!result.canceled) {
        setFormData({ ...formData, [field]: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de prendre la photo");
    }
  };

  const showImageOptions = (field, label) => {
    Alert.alert(
      label,
      "Choisissez une option",
      [
        {
          text: "Prendre une photo",
          onPress: () => takePhoto(field),
        },
        {
          text: "Choisir depuis la galerie",
          onPress: () => pickImage(field),
        },
        {
          text: "Annuler",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const validateForm = () => {
    if (!formData.lastName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre nom");
      return false;
    }
    if (!formData.firstName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre prénom");
      return false;
    }
    if (!formData.idCardFront) {
      Alert.alert(
        "Erreur",
        "Veuillez ajouter le recto de votre pièce d'identité"
      );
      return false;
    }
    if (!formData.idCardBack) {
      Alert.alert(
        "Erreur",
        "Veuillez ajouter le verso de votre pièce d'identité"
      );
      return false;
    }
    if (!formData.licenseFront) {
      Alert.alert(
        "Erreur",
        "Veuillez ajouter le recto de votre permis de conduire"
      );
      return false;
    }
    if (!formData.licenseBack) {
      Alert.alert(
        "Erreur",
        "Veuillez ajouter le verso de votre permis de conduire"
      );
      return false;
    }
    if (!formData.profilePhoto) {
      Alert.alert("Erreur", "Veuillez ajouter votre photo de profil");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: "DriverHome" }], // ou votre écran principal
    // });
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Simuler l'upload et l'inscription
      // await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Implémenter l'API d'inscription livreur
      // console.log('Driver Registration Data:', {
      //   phone,
      //   ...formData,
      // });

      const response = await registerCourier(formData)
      authCtx.authenticate(response, 'LIVREUR');

      // Alert.alert(
      //   'Inscription réussie',
      //   'Votre demande a été soumise. Vous recevrez une notification une fois votre compte validé.',
      //   [
      //     {
      //       text: 'OK',
      //       onPress: () => navigation.navigate('Auth'),
      //     },
      //   ]
      // );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
      setLoading(false);
    }
  };

  const renderImageUpload = (field, label, icon) => {
    const image = formData[field];
    const isProfile = field === "profilePhoto";

    return (
      <View style={styles.uploadSection}>
        <Text style={styles.uploadLabel}>{label}</Text>
        <TouchableOpacity
          style={[styles.uploadBox, isProfile && styles.uploadBoxProfile]}
          onPress={() => showImageOptions(field, label)}
          activeOpacity={0.7}
        >
          {image ? (
            <>
              <Image source={{ uri: image }} style={styles.uploadedImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setFormData({ ...formData, [field]: null })}
              >
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.uploadIconContainer}>
                <Ionicons name={icon} size={40} color="#9ca3af" />
              </View>
              <Text style={styles.uploadText}>Appuyez pour ajouter</Text>
              <Text style={styles.uploadSubtext}>Photo ou Galerie</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="light" backgroundColor="#ef4444" />

      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Inscription Livreur</Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Badge */}
        <View style={styles.infoBadge}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoBadgeText}>
            Vos documents seront vérifiés sous 24-48h
          </Text>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#ef4444" />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>

          <Text style={styles.label}>Nom *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Entrez votre nom"
              placeholderTextColor="#9ca3af"
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
            />
          </View>

          <Text style={styles.label}>Prénom *</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={20}
              color="#9ca3af"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Entrez votre prénom"
              placeholderTextColor="#9ca3af"
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
            />
          </View>
        </View>

        {/* Pièce d'identité */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color="#ef4444" />
            <Text style={styles.sectionTitle}>Pièce d'identité *</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Carte d'identité nationale ou passeport
          </Text>

          <View style={styles.doubleUpload}>
            {renderImageUpload("idCardFront", "Recto", "image-outline")}
            {renderImageUpload("idCardBack", "Verso", "image-outline")}
          </View>
        </View>

        {/* Permis de conduire */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car-outline" size={20} color="#ef4444" />
            <Text style={styles.sectionTitle}>Permis de conduire *</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Permis valide pour moto ou véhicule
          </Text>

          <View style={styles.doubleUpload}>
            {renderImageUpload("licenseFront", "Recto", "image-outline")}
            {renderImageUpload("licenseBack", "Verso", "image-outline")}
          </View>
        </View>

        {/* Photo de profil */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="camera-outline" size={20} color="#ef4444" />
            <Text style={styles.sectionTitle}>Photo de profil *</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Photo claire de votre visage
          </Text>

          {renderImageUpload("profilePhoto", "Votre photo", "camera-outline")}
        </View>

        {/* Note de sécurité */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color="#10b981" />
          <Text style={styles.securityNoteText}>
            Vos informations sont sécurisées et confidentielles
          </Text>
        </View>

        {/* Espace pour le bouton */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton fixe */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <Text style={styles.submitButtonText}>Envoi en cours...</Text>
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.submitButtonText}>Soumettre ma demande</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ef4444",
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoBadgeText: {
    flex: 1,
    fontSize: 14,
    color: "#1e40af",
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 14,
  },
  doubleUpload: {
    flexDirection: "row",
    gap: 12,
  },
  uploadSection: {
    flex: 1,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadBox: {
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  uploadBoxProfile: {
    height: 180,
    borderRadius: 16,
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginTop: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 14,
    color: "#065f46",
    lineHeight: 20,
  },
  bottomContainer: {
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
    flexDirection: "row",
    backgroundColor: "#ef4444",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
});

export default DriverRegistrationScreen;
