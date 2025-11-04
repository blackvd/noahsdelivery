import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function OTPScreen({ navigation, route }) {
  const { identifier, userType, loginMethod } = route.params || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (value, index) => {
    // Accepter uniquement les chiffres
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Passer au champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Vérifier si tous les champs sont remplis
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e, index) => {
    // Revenir au champ précédent si backspace sur champ vide
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (value) => {
    // Gérer le collage d'un code complet
    const pastedCode = value.replace(/\D/g, "").slice(0, 6);
    const newOtp = pastedCode.split("");

    while (newOtp.length < 6) {
      newOtp.push("");
    }

    setOtp(newOtp);

    if (pastedCode.length === 6) {
      Keyboard.dismiss();
    } else if (pastedCode.length > 0) {
      inputRefs.current[pastedCode.length]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Erreur", "Veuillez saisir le code complet");
      return;
    }

    console.log("Vérification OTP:", {
      code: otpCode,
      identifier,
      userType,
    });

    console.log(userType === 'client');

    if(userType === 'client'){
      // Logique de vérification OTP
      // Si succès, navigation sans possibilité de retour
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerApp' }], // ou votre écran principal
      });
    }
  };

  const handleResend = () => {
    if (!canResend) return;

    console.log("Renvoi du code OTP");
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();

    Alert.alert("Code envoyé", "Un nouveau code a été envoyé");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatIdentifier = () => {
    if (loginMethod === "email") {
      const [name, domain] = identifier.split("@");
      return `${name.slice(0, 2)}***@${domain}`;
    } else {
      return identifier.slice(0, 4) + "****" + identifier.slice(-2);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-open" size={60} color="#E53935" />
        </View>

        {/* Titre et description */}
        <Text style={styles.title}>Vérification</Text>
        <Text style={styles.subtitle}>
          Nous avons envoyé un code de vérification à
        </Text>
        <Text style={styles.identifier}>{formatIdentifier()}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              onPaste={(e) => {
                if (index === 0) {
                  handlePaste(e.nativeEvent.data);
                }
              }}
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.timerText}>
              Renvoyer le code dans{' '}
              <Text style={styles.timerValue}>{formatTime(timer)}</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>
                Renvoyer le code
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.helpContainer}>
          <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
          <Text style={styles.helpText}>
            Le code est valable pendant 10 minutes
          </Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.verifyButton,
            otp.every(digit => digit === '') && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          activeOpacity={0.8}
          disabled={otp.every(digit => digit === '')}
        >
          <Text style={styles.verifyButtonText}>Vérifier</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e539353f",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  identifier: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E53935",
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111827",
    backgroundColor: "#f9fafb",
  },
  otpInputFilled: {
    borderColor: "#E53935",
    backgroundColor: "#e539353f",
  },
  resendContainer: {
    marginBottom: 20,
  },
  timerText: {
    fontSize: 15,
    color: "#6b7280",
  },
  timerValue: {
    fontWeight: "700",
    color: "#E53935",
  },
  resendText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E53935",
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
  },
  helpText: {
    fontSize: 14,
    color: "#6b7280",
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  verifyButton: {
    backgroundColor: "#E53935",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: "#d1d5db",
  },
  verifyButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
});

export default OTPScreen;
