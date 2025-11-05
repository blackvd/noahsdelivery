import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Contacts from 'expo-contacts';
import MapView, { Marker } from "react-native-maps";

const { width } = Dimensions.get("window");

function HomeScreen({ navigation }) {
  const [selectedSize, setSelectedSize] = useState("small");
  const [selectedMode, setSelectedMode] = useState("motorbike");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [recipientPhone, setRecipientPhone] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(false);

  const packageSizes = [
    { id: "small", label: "Petit", icon: "📦" },
    { id: "medium", label: "Moyen", icon: "📦" },
    { id: "large", label: "Large", icon: "📦" },
  ];

  const deliveryModes = [
    {
      id: "motorbike",
      label: "Moto",
      icon: "🏍️",
      time: "15-20 min",
      available: true,
    },
    {
      id: "tricycle",
      label: "Tricycle",
      icon: "🛺",
      time: "20-30 min",
      available: false,
    },
    {
      id: "car",
      label: "Voiture",
      icon: "🚗",
      time: "25-35 min",
      available: false,
    },
    {
      id: "van",
      label: "Camion",
      icon: "🚐",
      time: "30-40 min",
      available: false,
    },
  ];

  // Charger les contacts
  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          // Filtrer et formater les contacts qui ont un numéro
          const formattedContacts = data
            .filter(contact => contact.phoneNumbers && contact.phoneNumbers.length > 0)
            .map(contact => ({
              id: contact.id,
              name: contact.name || 'Sans nom',
              phone: contact.phoneNumbers[0].number,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);
        } else {
          Alert.alert('Info', 'Aucun contact trouvé sur votre appareil');
        }
      } else {
        Alert.alert(
          'Permission refusée',
          'Pour sélectionner un contact, autorisez l\'accès à vos contacts dans les paramètres'
        );
      }
    } catch (error) {
      console.error('Erreur chargement contacts:', error);
      Alert.alert('Erreur', 'Impossible de charger les contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  // Ouvrir le modal contacts
  const handleOpenContacts = async () => {
    setShowContactsModal(true);
    if (contacts.length === 0) {
      await loadContacts();
    }
  };

  // Rechercher dans les contacts
  const handleSearchContacts = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(
        contact =>
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.phone.includes(query)
      );
      setFilteredContacts(filtered);
    }
  };

  // Sélectionner un contact
  const handleSelectContact = (contact) => {
    setRecipientPhone(contact.phone);
    setShowContactsModal(false);
    setSearchQuery('');
  };

  const handleRequestDelivery = () => {
    console.log({
      pickup: pickupAddress,
      dropoff: dropoffAddress,
      size: selectedSize,
      mode: selectedMode,
      recipientPhone,
      remarks: remarks.trim(),
    });
    // Navigation vers l'écran de confirmation

    navigation.navigate("DeliveryDetails", {
      id: "DEL1032453245",
      pickup: pickupAddress,
      dropoff: dropoffAddress,
      size: selectedSize,
      mode: selectedMode,
      recipientPhone,
      remarks: remarks.trim(),
      time: "24 min", // Calculé dynamiquement
    });
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ef4444" />

      {/* Header fixe */}
      <View style={styles.headerContainer}>
        <SafeAreaView>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.headerTitle}>John Doe</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Cercles décoratifs */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Map qui déborde - Positionnée avec margin négatif */}
        <View style={styles.mapWrapper}>
          <View style={styles.mapContainer}>
            {/* <View style={styles.mapPlaceholder}>
              <View style={styles.driversNearby}>
                <View style={styles.greenDot} />
                <Text style={styles.driversText}>3 drivers nearby</Text>
              </View>

              
              <View style={[styles.marker, { top: 100, left: 180 }]}>
                <Ionicons name="bicycle" size={20} color="#fff" />
              </View>
              <View style={[styles.marker, { top: 140, right: 80 }]}>
                <Ionicons name="bicycle" size={20} color="#fff" />
              </View>
              <View style={[styles.marker, { bottom: 80, right: 20 }]}>
                <Ionicons name="bicycle" size={20} color="#fff" />
              </View>
            </View> */}

            {/* Vrai Map remplacer lors des tests en live */}
            <MapView
                style={styles.mapPlaceholder}
                initialRegion={{
            latitude: 5.3350,
            longitude: -4.0120,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
              >
                <Marker coordinate={{ latitude: 5.3350, longitude: -4.0120 }}>
                  <View style={styles.marker}>
                    <Ionicons name="bicycle" size={20} color="#fff" />
                  </View>
                </Marker>
              </MapView>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Demander une livraison</Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Point de collecte</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={24} color="#ef4444" />
              <TextInput
                style={styles.input}
                placeholder="Enter pickup address"
                placeholderTextColor="#9ca3af"
                value={pickupAddress}
                onChangeText={setPickupAddress}
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Point de livraison</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={24} color="#9ca3af" />
              <TextInput
                style={styles.input}
                placeholder="Enter destination"
                placeholderTextColor="#9ca3af"
                value={dropoffAddress}
                onChangeText={setDropoffAddress}
              />
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Numéro du destinataire</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color="#ef4444" />
              <TextInput
                style={styles.input}
                placeholder="Numéro de téléphone"
                placeholderTextColor="#9ca3af"
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.contactsButton}
                onPress={handleOpenContacts}
              >
                <Ionicons name="people" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Remarque <Text style={styles.optionalText}>(facultatif)</Text></Text>
            <TextInput
              style={styles.remarksInput}
              placeholder="Ajoutez des instructions pour le livreur..."
              placeholderTextColor="#9ca3af"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Taille du colis</Text>
            <View style={styles.sizeContainer}>
              {packageSizes.map((size) => (
                <TouchableOpacity
                  key={size.id}
                  style={[
                    styles.sizeButton,
                    selectedSize === size.id && styles.sizeButtonActive,
                  ]}
                  onPress={() => setSelectedSize(size.id)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === size.id && styles.sizeTextActive,
                    ]}
                  >
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Mode de livraison</Text>
            <View style={styles.modesGrid}>
              {deliveryModes.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    selectedMode === mode.id && styles.modeCardActive,
                    !mode.available && styles.modeCardDisabled,
                  ]}
                  onPress={() => mode.available && setSelectedMode(mode.id)}
                  disabled={!mode.available}
                >
                  {!mode.available && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Bientôt</Text>
                    </View>
                  )}
                  <Text style={styles.modeIcon}>{mode.icon}</Text>
                  <Text
                    style={[
                      styles.modeLabel,
                      selectedMode === mode.id && styles.modeLabelActive,
                      !mode.available && styles.modeLabelDisabled,
                    ]}
                  >
                    {mode.label}
                  </Text>
                  <View style={styles.modeTimeContainer}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={!mode.available ? "#d1d5db" : "#6b7280"}
                    />
                    <Text
                      style={[
                        styles.modeTime,
                        !mode.available && styles.modeTimeDisabled,
                      ]}
                    >
                      {mode.time}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestDelivery}
            activeOpacity={0.8}
          >
            <Ionicons name="cube-outline" size={24} color="#fff" />
            <Text style={styles.requestButtonText}>Valider la requête</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* Modal Contacts */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contactsModal}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un contact</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowContactsModal(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher un contact..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={handleSearchContacts}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchContacts('')}>
                  <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {/* Liste des contacts */}
            {loadingContacts ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Chargement des contacts...</Text>
              </View>
            ) : filteredContacts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Aucun contact trouvé' : 'Aucun contact disponible'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.contactItem}
                    onPress={() => handleSelectContact(item)}
                  >
                    <View style={styles.contactAvatar}>
                      <Text style={styles.contactAvatarText}>
                        {item.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{item.name}</Text>
                      <Text style={styles.contactPhone}>{item.phone}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  headerContainer: {
    backgroundColor: "#ef4444",
    paddingBottom: 40,
    overflow: "hidden",
    position: "relative",
    zIndex: 10,
    elevation: 8,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "#ef4444",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingBottom: 80, // Espace pour la map qui va déborder
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    //paddingBottom: 20,
  },
  greeting: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fbbf24",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -30,
    left: -40,
  },
  mapWrapper: {
    marginTop: 30, // Fait remonter la map pour qu'elle déborde du rouge
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mapContainer: {
    // Container pour l'ombre
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  mapPlaceholder: {
    height: 280,
    backgroundColor: "#e5e7eb",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  driversNearby: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  driversText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  marker: {
    position: "absolute",
    width: 40,
    height: 40,
    backgroundColor: "#ef4444",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  contactsButton: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#e539353f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remarksInput: {
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sizeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  sizeButtonActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  sizeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  sizeTextActive: {
    color: "#ef4444",
  },
  modesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  modeCard: {
    width: (width - 52) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    position: "relative",
  },
  modeCardActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  modeCardDisabled: {
    opacity: 0.6,
  },
  comingSoonBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#f59e0b",
  },
  modeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  modeLabelActive: {
    color: "#ef4444",
  },
  modeLabelDisabled: {
    color: "#9ca3af",
  },
  modeTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modeTime: {
    fontSize: 12,
    color: "#6b7280",
  },
  modeTimeDisabled: {
    color: "#d1d5db",
  },
  requestButton: {
    flexDirection: "row",
    backgroundColor: "#ef4444",
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    elevation: 4,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  requestButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  // Modal contact
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  contactsModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 24,
  },
});

export default HomeScreen;
