import { Ionicons } from "@expo/vector-icons";
import { Animated, StyleSheet, View } from "react-native";
import ThreeDotsLoader from "./ThreeDotsLoader";
import { useRef } from "react";

const LoaderComponent = () => {
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const iconRotate = iconRotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          {/* Animated Icon */}
          <Animated.View
            style={[
              styles.loaderIconContainer,
              {
                transform: [
                  { rotate: iconRotate },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <Ionicons name="time-outline" size={40} color="#ef4444" />
          </Animated.View>

          {/* Three Dots Loader */}
          <View style={styles.loaderDotsWrapper}>
            <ThreeDotsLoader color="#ef4444" size={14} />
          </View>

          {/* Text */}
          <Text style={styles.loaderTitle}>Chargement de l'historique</Text>
          <Text style={styles.loaderSubtitle}>Récupération de vos livraisons...</Text>

          {/* Decorative animated circles */}
          <View style={styles.decorativeCircles}>
            <Animated.View
              style={[
                styles.decorativeCircle,
                styles.decorativeCircle1,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0.1, 0.2],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.decorativeCircle,
                styles.decorativeCircle2,
                {
                  transform: [{ 
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [1, 1.15],
                    })
                  }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0.05, 0.1],
                  }),
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loaderContent: {
    alignItems: 'center',
    padding: 32,
  },
  loaderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  loaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 24,
  },
  loaderSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
})

export default LoaderComponent