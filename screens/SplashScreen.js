import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

function SplashScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const bounce = (anim, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -8,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    bounce(dot1, 0).start();
    bounce(dot2, 100).start();
    bounce(dot3, 200).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Animated.Image
          source={require("../assets/images/logo.png")}
          style={[styles.logo, { opacity: logoOpacity }]}
          resizeMode="contain"
        />

        <View style={styles.loaderContainer}>
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot1 }] }]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot2 }] }]}
          />
          <Animated.View
            style={[styles.dot, { transform: [{ translateY: dot3 }] }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white", // your primary color
    alignItems: "center",
    justifyContent: "center",
  },
  centerContent: {
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 15,
  },
  loaderContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E53935", // orange secondaire
    marginHorizontal: 5,
  },
});

export default SplashScreen;
