// src/screens/DeliveryInProgressScreen.js
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { changeDeliveryStatus } from "../../../utils/delivery";
import { AuthContext } from "../../../store/context/auth-context";

const { width, height } = Dimensions.get("window");

const DeliveryInProgressScreen = ({ navigation, route }) => {
  const authCtx = useContext(AuthContext);
  const { delivery } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [progressAnim] = useState(new Animated.Value(0));
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [selectedReturnReason, setSelectedReturnReason] = useState(null);
  const [returnPhoto, setReturnPhoto] = useState(null);
  const [pickupCoords, setPickupCoords] = useState({});
  const [dropoffCoords, setDropoffCoords] = useState({});

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const returnScaleAnim = useRef(new Animated.Value(0)).current;

  // Données de la livraison
  const deliverySteps = [
    { id: 0, label: "En route vers pickup", status: "active" },
    { id: 1, label: "Colis récupéré", status: "pending" },
    { id: 2, label: "En livraison", status: "pending" },
    { id: 3, label: "Livraison terminée", status: "pending" },
  ];

  const customerInfo = {
    name: "Marie Kouassi",
    phone: "+225 07 00 00 00 00",
    rating: 4.9,
  };

  const returnReasons = [
    {
      id: 1,
      title: "Colis non conforme",
      description: "Le contenu ne correspond pas à la commande",
      icon: "cube-outline",
    },
    {
      id: 2,
      title: "Colis endommagé",
      description: "Le colis est abîmé ou ouvert",
      icon: "warning-outline",
    },
    {
      id: 3,
      title: "Refus du client",
      description: "Le destinataire refuse de recevoir le colis",
      icon: "close-circle-outline",
    },
    {
      id: 4,
      title: "Erreur d'adresse",
      description: "Le colis n'est pas destiné à cette adresse",
      icon: "location-outline",
    },
    {
      id: 5,
      title: "Autre raison",
      description: "Précisez la raison du retour",
      icon: "ellipsis-horizontal-outline",
    },
  ];

  useEffect(() => {
    //getPickupCoords()

    setPickupCoords((prev) => ({
      ...prev,
      latitude: delivery.addressDeliveries.find(
        (addr) => addr.type === "PICKUP"
      ).latitude,
      longitude: delivery.addressDeliveries.find(
        (addr) => addr.type === "PICKUP"
      ).longitude,
    }));

    //getDropOffCoords()
    setDropoffCoords((prev) => ({
      ...prev,
      latitude: delivery.addressDeliveries.find(
        (addr) => addr.type === "DROPOFF"
      ).latitude,
      longitude: delivery.addressDeliveries.find(
        (addr) => addr.type === "DROPOFF"
      ).longitude,
    }));
  }, []);

  // const getPickupCoords = () => {
  //   if(!delivery) return {}

  //   console.log("PICKUP :::", delivery.addressDeliveries).find((addr) => addr.type === "PICKUP");

  //   return {
  //     latitude: delivery.addressDeliveries
  //       .find((addr) => addr.type === "PICKUP")
  //       .latitude.toFixed(3),
  //     longitude: delivery.addressDeliveries
  //       .find((addr) => addr.type === "PICKUP")
  //       .longitude.toFixed(3),
  //   };
  // };

  // const getDropOffCoords = () => {
  //   if(!delivery) return {}
  //   return {
  //     latitude: delivery.addressDeliveries
  //       .find((addr) => addr.type === "DROPOFF")
  //       .latitude.toFixed(3),
  //     longitude: delivery.addressDeliveries
  //       .find((addr) => addr.type === "DROPOFF")
  //       .longitude.toFixed(3),
  //   };
  // };

  // Animation de progression
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep / (deliverySteps.length - 1)) * 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Animation du modal de confirmation
  useEffect(() => {
    if (showConfirmationModal) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [showConfirmationModal]);

  // Animation du modal de retour
  useEffect(() => {
    if (showReturnModal) {
      Animated.spring(returnScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      returnScaleAnim.setValue(0);
      // Reset des valeurs
      setSelectedReturnReason(null);
      setReturnReason("");
      setReturnPhoto(null);
    }
  }, [showReturnModal]);

  const handleCallCustomer = (phoneNumber) => {
    //const phoneNumber = customerInfo.phone.replace(/\s/g, "");
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleNavigate = () => {
    const label = customerInfo.name;
    const url = Platform.select({
      ios: `maps:0,0?q=${
        delivery.addressDeliveries.find((addr) => addr.type === "DROPOFF")
          .latitude
      },${
        delivery.addressDeliveries.find((addr) => addr.type === "DROPOFF")
          .longitude
      }`,
      android: `geo:0,0?q=${
        delivery.addressDeliveries.find((addr) => addr.type === "DROPOFF")
          .latitude
      },${
        delivery.addressDeliveries.find((addr) => addr.type === "DROPOFF")
          .longitude
      }(${label})`,
    });
    Linking.openURL(url);
  };

  const handleNextStep = async () => {
    try {
      let step = 'ASSIGNED'
      const nextStep = currentStep + 1
      if (nextStep < deliverySteps.length - 1) {
        switch(nextStep){
          case 1:
            step = 'PICKEDUP'
            break
          case 2:
            step = 'IN_PROGRESS'
            break
        }
        setCurrentStep(nextStep);
      } else {
        // Dernière étape - Afficher modal de confirmation
        step = 'DELIVERED'
        setShowConfirmationModal(true);
      }
      
      const comment = selectedReturnReason !== null ? selectedReturnReason.description : ""
      const response = await changeDeliveryStatus(delivery.id, step, comment,authCtx.token)
    } catch (error) {
      console.log("Erreur pour changer le status : ", error);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Vous devez autoriser l'accès à la caméra pour prendre une photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setDeliveryPhoto(result.assets[0].uri);
      Alert.alert(
        "Photo capturée",
        "La photo de livraison a été prise avec succès."
      );
    }
  };

  const handleGetSignature = () => {
    // Simulation de la signature
    // Dans une vraie app, ouvrir un écran de signature
    setHasSignature(true);
    Alert.alert(
      "Signature obtenue",
      "La signature du destinataire a été enregistrée."
    );
  };

  const handleConfirmDelivery = () => {
    setShowConfirmationModal(false);
    Alert.alert(
      "Livraison confirmée",
      "La livraison a été confirmée avec succès.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleCancelDelivery = () => {
    Alert.alert(
      "Annuler la livraison",
      "Êtes-vous sûr de vouloir annuler cette livraison ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleReturnPackage = () => {
    setShowReturnModal(true);
  };

  const handleTakeReturnPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Vous devez autoriser l'accès à la caméra pour prendre une photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReturnPhoto(result.assets[0].uri);
    }
  };

  const handleConfirmReturn = () => {
    if (!selectedReturnReason) {
      Alert.alert("Erreur", "Veuillez sélectionner une raison de retour.");
      return;
    }

    if (selectedReturnReason === 5 && !returnReason.trim()) {
      Alert.alert("Erreur", "Veuillez préciser la raison du retour.");
      return;
    }

    if (!returnPhoto) {
      Alert.alert("Erreur", "Veuillez prendre une photo du colis.");
      return;
    }

    setShowReturnModal(false);

    Alert.alert(
      "Retour confirmé",
      "Le retour du colis a été enregistré. Veuillez le ramener à l'expéditeur.",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const canConfirmDelivery = deliveryPhoto && hasSignature;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {/* Pickup Marker */}
        <Marker coordinate={pickupCoords}>
          <View style={styles.markerContainer}>
            <View style={[styles.marker, styles.pickupMarker]}>
              <Ionicons name="location" size={20} color="#fff" />
            </View>
          </View>
        </Marker>

        {/* Dropoff Marker */}
        <Marker coordinate={dropoffCoords}>
          <View style={styles.markerContainer}>
            <View style={[styles.marker, styles.dropoffMarker]}>
              <Ionicons name="flag" size={20} color="#fff" />
            </View>
          </View>
        </Marker>

        {/* Driver Marker */}
        {/* <Marker coordinate={driverCoords}>
          <View style={styles.driverMarker}>
            <Ionicons name="car" size={24} color="#fff" />
          </View>
        </Marker> */}

        {/* Route Line */}
        <Polyline
          coordinates={[pickupCoords, dropoffCoords]}
          strokeColor="#ef4444"
          strokeWidth={3}
          lineDashPattern={[10, 5]}
        />
      </MapView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={true}
          >
            {/* Handle */}
            <View style={styles.handle} />

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Étape {currentStep + 1}/{deliverySteps.length}
              </Text>
            </View>

            {/* Current Step */}
            <View style={styles.currentStepCard}>
              <View style={styles.stepIcon}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              </View>
              <View style={styles.stepInfo}>
                <Text style={styles.stepLabel}>En cours</Text>
                <Text style={styles.stepTitle}>
                  {deliverySteps[currentStep].label}
                </Text>
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.customerCard}>
              <View style={styles.customerHeader}>
                <View style={styles.customerAvatar}>
                  <Ionicons name="person" size={24} color="#6b7280" />
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{delivery.client.fullName !== null ? delivery.client.fullName : "Guest"}</Text>
                  <View style={styles.customerRating}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={styles.customerRatingText}>
                      {delivery.client.averageRating}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCallCustomer(delivery.client.phone)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Delivery Info */}
            <View style={styles.deliveryInfoCard}>
              <View style={styles.locationItem}>
                <View style={styles.locationDot} />
                <View style={styles.locationContent}>
                  <Text style={styles.locationLabel}>Point de départ</Text>
                  <Text style={styles.locationAddress}>
                    {
                      delivery.addressDeliveries.find(
                        (addr) => addr.type === "PICKUP"
                      ).name
                    }
                  </Text>
                </View>
              </View>

              <View style={styles.locationLine} />

              <View style={styles.locationItem}>
                <View style={[styles.locationDot, styles.locationDotEnd]} />
                <View style={styles.locationContent}>
                  <Text style={styles.locationLabel}>Destination</Text>
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

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.navigateButton}
                onPress={handleNavigate}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.navigateButtonText}>Navigation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextStepButton}
                onPress={handleNextStep}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStepButtonText}>
                  {currentStep === deliverySteps.length - 1
                    ? "Terminer livraison"
                    : "Étape suivante"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Return Package Button */}
            {currentStep >= 2 && (
              <TouchableOpacity
                style={styles.returnButton}
                onPress={handleReturnPackage}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="return-down-back-outline"
                  size={20}
                  color="#f59e0b"
                />
                <Text style={styles.returnButtonText}>
                  Signaler un retour de colis
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelDelivery}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Annuler la livraison</Text>
            </TouchableOpacity>

            {/* Steps Timeline */}
            <View style={styles.stepsTimeline}>
              {deliverySteps.map((step, index) => (
                <View key={step.id} style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      index <= currentStep && styles.stepDotActive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.stepLabel,
                      index <= currentStep && styles.stepLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.modalIconContainer}>
              <View style={styles.modalIcon}>
                <Ionicons name="checkmark-circle" size={64} color="#10b981" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Confirmation de livraison</Text>
            <Text style={styles.modalSubtitle}>
              Veuillez prendre une photo du colis et obtenir la signature du
              destinataire
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalActionButton,
                  deliveryPhoto && styles.modalActionButtonCompleted,
                ]}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <View style={styles.modalActionIcon}>
                  <Ionicons
                    name={deliveryPhoto ? "checkmark-circle" : "camera-outline"}
                    size={24}
                    color={deliveryPhoto ? "#10b981" : "#6b7280"}
                  />
                </View>
                <View style={styles.modalActionText}>
                  <Text style={styles.modalActionTitle}>Prendre une photo</Text>
                  <Text style={styles.modalActionSubtitle}>
                    {deliveryPhoto ? "Photo capturée" : "Photo du colis livré"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalActionButton,
                  hasSignature && styles.modalActionButtonCompleted,
                ]}
                onPress={handleGetSignature}
                activeOpacity={0.7}
              >
                <View style={styles.modalActionIcon}>
                  <Ionicons
                    name={hasSignature ? "checkmark-circle" : "create-outline"}
                    size={24}
                    color={hasSignature ? "#10b981" : "#6b7280"}
                  />
                </View>
                <View style={styles.modalActionText}>
                  <Text style={styles.modalActionTitle}>
                    Obtenir la signature
                  </Text>
                  <Text style={styles.modalActionSubtitle}>
                    {hasSignature
                      ? "Signature obtenue"
                      : "Signature du destinataire"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmationModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  !canConfirmDelivery && styles.modalConfirmButtonDisabled,
                ]}
                onPress={handleConfirmDelivery}
                disabled={!canConfirmDelivery}
                activeOpacity={0.7}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmer</Text>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Return Package Modal */}
      <Modal
        visible={showReturnModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowReturnModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.returnModalContainer,
              {
                transform: [{ scale: returnScaleAnim }],
              },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View style={styles.returnModalHeader}>
                <View style={styles.returnModalIcon}>
                  <Ionicons name="return-down-back" size={32} color="#f59e0b" />
                </View>
                <TouchableOpacity
                  style={styles.returnModalClose}
                  onPress={() => setShowReturnModal(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.returnModalTitle}>Retour de colis</Text>
              <Text style={styles.returnModalSubtitle}>
                Sélectionnez la raison du retour et prenez une photo du colis
              </Text>

              {/* Reasons List */}
              <View style={styles.returnReasonsList}>
                {returnReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.returnReasonCard,
                      selectedReturnReason === reason.id &&
                        styles.returnReasonCardSelected,
                    ]}
                    onPress={() => setSelectedReturnReason(reason.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.returnReasonIconContainer,
                        selectedReturnReason === reason.id &&
                          styles.returnReasonIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={reason.icon}
                        size={24}
                        color={
                          selectedReturnReason === reason.id
                            ? "#f59e0b"
                            : "#6b7280"
                        }
                      />
                    </View>
                    <View style={styles.returnReasonContent}>
                      <Text
                        style={[
                          styles.returnReasonTitle,
                          selectedReturnReason === reason.id &&
                            styles.returnReasonTitleSelected,
                        ]}
                      >
                        {reason.title}
                      </Text>
                      <Text style={styles.returnReasonDescription}>
                        {reason.description}
                      </Text>
                    </View>
                    {selectedReturnReason === reason.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#f59e0b"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Reason Input */}
              {selectedReturnReason === 5 && (
                <View style={styles.customReasonContainer}>
                  <Text style={styles.customReasonLabel}>
                    Précisez la raison
                  </Text>
                  <TextInput
                    style={styles.customReasonInput}
                    placeholder="Décrivez la raison du retour..."
                    placeholderTextColor="#9ca3af"
                    value={returnReason}
                    onChangeText={setReturnReason}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              )}

              {/* Take Photo Button */}
              <TouchableOpacity
                style={[
                  styles.returnPhotoButton,
                  returnPhoto && styles.returnPhotoButtonCompleted,
                ]}
                onPress={handleTakeReturnPhoto}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={returnPhoto ? "checkmark-circle" : "camera-outline"}
                  size={24}
                  color={returnPhoto ? "#10b981" : "#6b7280"}
                />
                <Text
                  style={[
                    styles.returnPhotoButtonText,
                    returnPhoto && styles.returnPhotoButtonTextCompleted,
                  ]}
                >
                  {returnPhoto
                    ? "Photo capturée"
                    : "Prendre une photo du colis"}
                </Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <View style={styles.returnModalButtons}>
                <TouchableOpacity
                  style={styles.returnModalCancelButton}
                  onPress={() => setShowReturnModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.returnModalCancelButtonText}>
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.returnModalConfirmButton,
                    (!selectedReturnReason || !returnPhoto) &&
                      styles.returnModalConfirmButtonDisabled,
                  ]}
                  onPress={handleConfirmReturn}
                  disabled={!selectedReturnReason || !returnPhoto}
                  activeOpacity={0.7}
                >
                  <Text style={styles.returnModalConfirmButtonText}>
                    Confirmer le retour
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  map: {
    height: height * 0.4,
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  pickupMarker: {
    backgroundColor: "#ef4444",
  },
  dropoffMarker: {
    backgroundColor: "#111827",
  },
  driverMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    borderWidth: 4,
    borderColor: "#fff",
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    alignSelf: "center",
    marginVertical: 12,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  currentStepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  stepIcon: {
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  customerCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  customerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  customerRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  customerRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  deliveryInfoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    marginRight: 12,
    marginTop: 4,
  },
  locationDotEnd: {
    backgroundColor: "#111827",
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 20,
  },
  locationLine: {
    width: 2,
    height: 24,
    backgroundColor: "#d1d5db",
    marginLeft: 5,
    marginVertical: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  navigateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  navigateButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  nextStepButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    elevation: 4,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextStepButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  returnButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffbeb",
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#fde68a",
  },
  returnButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f59e0b",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#dc2626",
  },
  stepsTimeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 16,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#d1d5db",
  },
  stepDotActive: {
    backgroundColor: "#10b981",
  },
  stepLabel: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#111827",
    fontWeight: "600",
  },
  // Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
  },
  modalIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  modalActions: {
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  modalActionButtonCompleted: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  modalActionIcon: {
    marginRight: 12,
  },
  modalActionText: {
    flex: 1,
  },
  modalActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  modalActionSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  modalConfirmButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalConfirmButtonDisabled: {
    backgroundColor: "#d1d5db",
    elevation: 0,
    shadowOpacity: 0,
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  // Return Modal Styles
  returnModalContainer: {
    width: "100%",
    maxWidth: 450,
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
  },
  returnModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  returnModalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fffbeb",
    justifyContent: "center",
    alignItems: "center",
  },
  returnModalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  returnModalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  returnModalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 24,
  },
  returnReasonsList: {
    gap: 12,
    marginBottom: 24,
  },
  returnReasonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  returnReasonCardSelected: {
    backgroundColor: "#fffbeb",
    borderColor: "#f59e0b",
  },
  returnReasonIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  returnReasonIconContainerSelected: {
    backgroundColor: "#fef3c7",
  },
  returnReasonContent: {
    flex: 1,
  },
  returnReasonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  returnReasonTitleSelected: {
    color: "#f59e0b",
  },
  returnReasonDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  customReasonContainer: {
    marginBottom: 24,
  },
  customReasonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  customReasonInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    minHeight: 80,
  },
  returnPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  returnPhotoButtonCompleted: {
    backgroundColor: "#d1fae5",
    borderColor: "#10b981",
  },
  returnPhotoButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  returnPhotoButtonTextCompleted: {
    color: "#10b981",
  },
  returnModalButtons: {
    gap: 12,
  },
  returnModalCancelButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  returnModalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  returnModalConfirmButton: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  returnModalConfirmButtonDisabled: {
    backgroundColor: "#d1d5db",
    elevation: 0,
    shadowOpacity: 0,
  },
  returnModalConfirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});

export default DeliveryInProgressScreen;
