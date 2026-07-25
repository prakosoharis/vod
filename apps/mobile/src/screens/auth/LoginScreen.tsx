import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS } from '../../constants/colors';
import { API_BASE_URL } from '../../constants';

const smashLogo = require('../../assets/smash-logo-transparent.png');

interface Props {
  navigation: any;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Error', 'Nomor HP, email, atau username dan password harus diisi');
      return;
    }
    try {
      await login(identifier.trim(), password);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
      const networkCode = error?.code ? ` (${error.code})` : '';
      const message = apiMessage || (error?.request
        ? `Tidak dapat menghubungi server${networkCode}.\n\nEndpoint: ${API_BASE_URL}\n\nPeriksa internet atau DNS perangkat, lalu coba buka https://smashstream.id/health di browser perangkat.`
        : 'Data login tidak sesuai. Periksa kembali dan coba lagi.');
      Alert.alert('Login Gagal', message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.glowTop} />
          <View style={styles.glowBottom} />
          <View style={styles.header}>
            <Image source={smashLogo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.eyebrow}>WELCOME BACK</Text>
            <Text style={styles.title}>Masuk ke SMASH</Text>
            <Text style={styles.subtitle}>Lanjutkan cerita yang belum selesai.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nomor HP, Email, atau Username"
              placeholder="0812…, email, atau username"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Masuk"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[styles.registerLink, { textAlign: 'center', marginBottom: 18 }]}>Lupa password?</Text>
            </TouchableOpacity>
            <Text style={{ color: COLORS.cream[200], textAlign: 'center', marginBottom: 12 }}>atau</Text>
            {(['google', 'facebook'] as const).map((provider) => (
              <TouchableOpacity
                key={provider}
                style={{ borderWidth: 1, borderColor: `${COLORS.cream[50]}30`, borderRadius: 12, padding: 13, marginBottom: 10 }}
                onPress={() => Alert.alert('Belum tersedia', `Continue with ${provider === 'google' ? 'Google' : 'Facebook'} menunggu konfigurasi provider.`)}
              >
                <Text style={{ color: COLORS.cream[50], textAlign: 'center', fontWeight: '600' }}>
                  Continue with {provider === 'google' ? 'Google' : 'Facebook'}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: `${COLORS.accent[500]}18`,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -110,
    left: -110,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: `${COLORS.primary[400]}18`,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 174,
    height: 136,
    marginBottom: 4,
  },
  eyebrow: {
    color: COLORS.accent[400],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 9,
  },
  title: {
    color: COLORS.cream[50],
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.cream[100],
    textAlign: 'center',
  },
  form: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    backgroundColor: `${COLORS.warmCharcoal[50]}E8`,
    borderWidth: 1,
    borderColor: `${COLORS.cream[50]}14`,
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: COLORS.cream[200],
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.accent[500],
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
