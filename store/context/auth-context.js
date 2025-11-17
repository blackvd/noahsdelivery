import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext({
  token: '',
  clientType: 'CLIENT',
  isAuthenticated: false,
  authenticate: (token, clientType) => {},
  logout: () => {}
})

function AuthContextProvider({children}) {
  const [authToken, setAuthToken] = useState()
  const [userType, setUserType] = useState('CLIENT')

  function authenticate(token, clientType) {
    setAuthToken(token)
    setUserType(clientType)
    AsyncStorage.setItem('token', token)
    AsyncStorage.setItem('userType', clientType)
  }

  function logout() {
    setAuthToken(null)
    AsyncStorage.removeItem('token')
  }

  const value = {
    token: authToken,
    clientType: userType,
    isAuthenticated: !!authToken,
    authenticate: authenticate,
    logout: logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContextProvider