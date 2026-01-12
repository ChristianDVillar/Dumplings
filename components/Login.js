import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, Dimensions } from 'react-native';
import Header from './Header';
import Footer from './Footer';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../utils/translations';

const Login = ({ onLogin }) => {
  const { language, setLanguage } = useAppContext();
  const t = useTranslations(language);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState(null); // 'username' o 'password'

  // Usuarios del sistema
  const users = {
    'administrador': {
      password: 'admintest',
      role: 'admin'
    },
    'general': {
      password: 'graltest',
      role: 'general'
    },
    'cocina': {
      password: 'cocinatest',
      role: 'kitchen'
    }
  };

  const handleLogin = () => {
    // Limpiar errores previos
    setErrorMessage('');
    setErrorType(null);

    if (!username || !password) {
      setErrorMessage(t.login.errorEmpty);
      return;
    }

    const user = users[username.toLowerCase()];
    
    if (!user) {
      setErrorMessage(t.login.errorUserNotFound);
      setErrorType('username');
      return;
    }

    if (user.password !== password) {
      setErrorMessage(t.login.errorWrongPassword);
      setErrorType('password');
      return;
    }

    // Login exitoso
    onLogin(user.role, username);
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.contentContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.title}>{t.login.title}</Text>
          <Text style={styles.subtitle}>{t.login.subtitle}</Text>
          
          {/* Selector de idioma */}
          <View style={styles.languageSelector}>
            <Text style={styles.languageLabel}>{t.login.selectLanguage}</Text>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[styles.languageButton, language === 'es' && styles.languageButtonActive]}
                onPress={() => setLanguage('es')}
              >
                <Text style={[styles.languageButtonText, language === 'es' && styles.languageButtonTextActive]}>
                  🇪🇸 ES
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.languageButton, language === 'en' && styles.languageButtonActive]}
                onPress={() => setLanguage('en')}
              >
                <Text style={[styles.languageButtonText, language === 'en' && styles.languageButtonTextActive]}>
                  🇬🇧 EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.languageButton, language === 'zh' && styles.languageButtonActive]}
                onPress={() => setLanguage('zh')}
              >
                <Text style={[styles.languageButtonText, language === 'zh' && styles.languageButtonTextActive]}>
                  🇨🇳 中文
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.login.username}</Text>
            <TextInput
              style={[
                styles.input,
                errorType === 'username' && styles.inputError
              ]}
              placeholder={t.login.usernamePlaceholder}
              placeholderTextColor="#999"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errorType === 'username') {
                  setErrorMessage('');
                  setErrorType(null);
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.login.password}</Text>
            <TextInput
              style={[
                styles.input,
                errorType === 'password' && styles.inputError
              ]}
              placeholder={t.login.passwordPlaceholder}
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorType === 'password') {
                  setErrorMessage('');
                  setErrorType(null);
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>{t.login.loginButton}</Text>
          </TouchableOpacity>

        </View>
      </View>
      <Footer />
    </View>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isMobile = SCREEN_WIDTH < 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? 15 : 20,
  },
  loginCard: {
    width: '100%',
    maxWidth: isMobile ? '95%' : 400,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: isMobile ? 20 : 30,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    }),
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFA500',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    padding: 15,
    color: '#FFD700',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  loginButton: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  loginButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  infoText: {
    fontSize: 12,
    color: '#FFA500',
    marginVertical: 2,
  },
  errorContainer: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  languageSelector: {
    backgroundColor: '#3A3A3A',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  languageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 8,
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  languageButton: {
    flex: 1,
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
    borderWidth: 1.5,
    borderColor: '#555',
    alignItems: 'center',
    minHeight: 32,
    justifyContent: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFA500',
  },
  languageButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFD700',
  },
  languageButtonTextActive: {
    color: '#1A1A1A',
  },
});

export default Login;

