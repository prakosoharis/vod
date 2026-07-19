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

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password tidak cocok');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    try {
      await register(email.trim(), password, fullName.trim() || undefined);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
      const networkCode = error?.code ? ` (${error.code})` : '';
      const message = apiMessage || (error?.request
        ? `Tidak dapat menghubungi server${networkCode}.\n\nEndpoint: ${API_BASE_URL}\n\nPeriksa internet atau DNS perangkat, lalu coba buka https://api.smashstream.id/health di browser perangkat.`
        : 'Gagal membuat akun. Coba lagi.');
      Alert.alert('Pendaftaran Gagal', message);
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
          <View style={styles.header}>
            <Image source={smashLogo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.eyebrow}>JOIN THE STORY</Text>
            <Text style={styles.title}>Buat akun SMASH</Text>
            <Text style={styles.subtitle}>Satu akun untuk semua tayangan pilihanmu.</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nama Lengkap"
              placeholder="Nama Anda (opsional)"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
            <Input
              label="Email"
              placeholder="email@contoh.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input
              label="Konfirmasi Password"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Button
              title="Daftar"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Masuk</Text>
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
    top: -110,
    right: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: `${COLORS.accent[500]}18`,
  },
  header: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logo: {
    width: 142,
    height: 110,
  },
  eyebrow: {
    color: COLORS.accent[400],
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: COLORS.cream[50],
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: COLORS.cream[200],
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.accent[500],
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
