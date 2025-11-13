import { useContext, useEffect, useState } from "react";
import AppNavigator from "./navigation/AppNavigator";
import AuthContextProvider, { AuthContext } from "./store/context/auth-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Root() {
  const authCtx = useContext(AuthContext)
  useEffect(() => {
    async function fetchToken(){
      const storedToken = await AsyncStorage.getItem('token')
      const storedClientType = await AsyncStorage.getItem('userType')

      if(storedToken) {
        authCtx.authenticate(storedToken, storedClientType)
      }

      setIsTryingLogin(false)
    }

    fetchToken()
  }, [])

  return <AppNavigator />
}

export default function App() {
  return (
    <>
      <AuthContextProvider>
        <Root/>
      </AuthContextProvider>
    </>
  );
}
