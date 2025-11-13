import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
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
import { requestOtp } from "../../utils/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import ThreeDotsLoader from "../../components/ThreeDotsLoader";

const AuthScreen = ({ navigation }) => {
  const [userType, setUserType] = useState("CLIENT"); // 'client' ou 'livreur'
  const [loginMethod, setLoginMethod] = useState("email"); // 'email' ou 'phone'
  const [identifier, setIdentifier] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    console.log("Connexion:", {
      userType,
      loginMethod,
      identifier,
    });
    // Logique d'authentification

    if(!identifier) {
      Alert.alert('Champs requis', 'Prière fournir un numéro de téléphone ou une adresse mail')
    }

    setIsAuthenticating(true)

    try{
      const response = await requestOtp(identifier, loginMethod, userType)
    }catch(error){
      Alert.alert('Problème de connexion', 'Une erreur est survenu prière réessayer')
    }

    setIsAuthenticating(false)

    // Navigation vers l'écran OTP pour première connexion
    navigation.navigate("OTP", {
      identifier,
      userType,
      loginMethod,
    });
  };

  const handleGoogleLogin = () => {
    console.log("Connexion Google");
    // Logique Google Sign-In
  };

  const handleFacebookLogin = () => {
    console.log("Connexion Facebook");
    // Logique Facebook Login
  };

  // if(isAuthenticating){
  //   return <LoadingOverlay/>
  // }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {/* Loading Overlay avec Three Dots */}
      {isAuthenticating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ThreeDotsLoader color="#ef4444" size={16} />
            <Text style={styles.loadingText}>Connexion en cours</Text>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>
              Bienvenue ! Connectez-vous pour continuer
            </Text>
          </View>

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "CLIENT" && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType("CLIENT")}
              disabled={isAuthenticating}
            >
              <Ionicons
                name="person"
                size={24}
                color={userType === "CLIENT" ? "#ef4444" : "#9ca3af"}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === "CLIENT" && styles.userTypeTextActive,
                ]}
              >
                Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === "LIVREUR" && styles.userTypeButtonActive,
              ]}
              onPress={() => setUserType("LIVREUR")}
              disabled={isAuthenticating}
            >
              <Ionicons
                name="bicycle"
                size={24}
                color={userType === "LIVREUR" ? "#E53935" : "#9ca3af"}
              />
              <Text
                style={[
                  styles.userTypeText,
                  userType === "LIVREUR" && styles.userTypeTextActive,
                ]}
              >
                Livreur
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginMethodContainer}>
            <TouchableOpacity
              style={[
                styles.loginMethodButton,
                loginMethod === "email" && styles.loginMethodButtonActive,
              ]}
              onPress={() => setLoginMethod("email")}
              disabled={isAuthenticating}
            >
              <Ionicons
                name="mail"
                size={20}
                color={loginMethod === "email" ? "#fff" : "#6b7280"}
              />
              <Text
                style={[
                  styles.loginMethodText,
                  loginMethod === "email" && styles.loginMethodTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginMethodButton,
                loginMethod === "phone" && styles.loginMethodButtonActive,
              ]}
              onPress={() => setLoginMethod("phone")}
              disabled={isAuthenticating}
            >
              <Ionicons
                name="call"
                size={20}
                color={loginMethod === "phone" ? "#fff" : "#6b7280"}
              />
              <Text
                style={[
                  styles.loginMethodText,
                  loginMethod === "phone" && styles.loginMethodTextActive,
                ]}
              >
                Téléphone
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name={loginMethod === "email" ? "mail-outline" : "call-outline"}
                size={20}
                color="#9ca3af"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder={
                  loginMethod === "email"
                    ? "Adresse email"
                    : "Numéro de téléphone"
                }
                placeholderTextColor="#9ca3af"
                value={identifier}
                onChangeText={setIdentifier}
                keyboardType={
                  loginMethod === "email" ? "email-address" : "phone-pad"
                }
                autoCapitalize="none"
                autoComplete={loginMethod === "email" ? "email" : "tel"}
                editable={!isAuthenticating}
              />
            </View>

            {/* <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#9ca3af"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View> */}

            {/* <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity> */}
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
              activeOpacity={0.8}
            >
              <FontAwesome name="google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleFacebookLogin}
              activeOpacity={0.8}
            >
              <FontAwesome name="facebook" size={20} color="#4267B2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.loginButton, isAuthenticating && styles.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
            <ThreeDotsLoader color="#fff" size={10} />
          ) : (
            <>
              <Text style={styles.loginButtonText}>Se connecter</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>)}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  userTypeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    gap: 8,
  },
  userTypeButtonActive: {
    borderColor: "#ef4444",
    backgroundColor: "#e539353f",
  },
  userTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  userTypeTextActive: {
    color: "#ef4444",
  },
  loginMethodContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  loginMethodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  loginMethodButtonActive: {
    backgroundColor: "#ef4444",
  },
  loginMethodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  loginMethodTextActive: {
    color: "#fff",
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#ef4444",
    fontWeight: "600",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: "#ef4444",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    gap: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  signupText: {
    fontSize: 15,
    color: "#6b7280",
  },
  signupLink: {
    fontSize: 15,
    color: "#ef4444",
    fontWeight: "700",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
  },
});

export default AuthScreen;
