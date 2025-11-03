import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { completeOnboarding } from "../utils/storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    title: "Envoyez vos colis facilement et rapidement",
    description: "Demandez une livraison en quelques secondes. Nos coursiers sont prêts à récupérer votre colis et à le livrer en toute sécurité.",
    icon: "package-variant",
    image: require("../assets/images/onboarding1.jpg"),
  },
  {
    id: "2",
    title: "Suivez vos livraisons en temps réel",
    description: "Sachez exactement où se trouve votre colis à tout moment grâce à notre système de suivi en direct.",
    icon: "map-marker",
    image: require("../assets/images/onboarding2.jpg"),
  },
  {
    id: "3",
    title: "Des chauffeurs fiables, des livraisons sécurisées",
    description: "Tous nos chauffeurs sont des professionnels certifiés qui s'engagent à livrer vos colis avec soin.",
    icon: "shield-check",
    image: require("../assets/images/onboarding3.jpg"),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    navigation.replace("Auth");
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={item.icon} size={40} color="#E53935" />
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, currentIndex === index && styles.activeDot]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar />

      {/* Bouton Skip */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
      />

      {/* Footer avec dots et bouton */}
      <View style={styles.footer}>
        {renderDots()}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? "Commencer" : "Suivant"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  slide: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#101828",
    marginBottom: 15,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#101828",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: "#4a5565",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e5393585",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#E53935",
    width: 30,
  },
  nextButton: {
    backgroundColor: '#E53935',
    width: '90%',
    paddingVertical: 18,
    borderRadius: 12, // 👈 Légèrement arrondi
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 4 
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default OnboardingScreen;
