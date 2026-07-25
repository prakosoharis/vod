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
  const [legalConsent, setLegalConsent] = useState(false);
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
    if (password.length < 8) {
      Alert.alert('Error', 'Password minimal 8 karakter');
      return;
    }
    if (!legalConsent) {
      Alert.alert('Persetujuan diperlukan', 'Baca dan setujui Syarat dan Ketentuan serta Kebijakan Privasi.');
      return;
    }
    try {
      await register(email.trim(), password, fullName.trim() || undefined);
    } catch (error: any) {
      const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
      const networkCode = error?.code ? ` (${error.code})` : '';
      const message = apiMessage || (error?.request
        ? `Tidak dapat menghubungi server${networkCode}.\n\nEndpoint: ${API_BASE_URL}\n\nPeriksa internet atau DNS perangkat, lalu coba buka https://smashstream.id/health di browser perangkat.`
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
              placeholder="Minimal 8 karakter"
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

            <View style={styles.consentRow}>
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: legalConsent }}
                onPress={() => setLegalConsent((value) => !value)}
                style={[styles.checkbox, legalConsent && styles.checkboxChecked]}
              >
                {legalConsent && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.consentText}>
                Saya telah membaca dan menyetujui{' '}
                <Text style={styles.legalLink} onPress={() => navigation.getParent()?.navigate('LegalWeb', { path: '/terms', title: 'Syarat dan Ketentuan' })}>Syarat dan Ketentuan</Text>
                {' '}serta{' '}
                <Text style={styles.legalLink} onPress={() => navigation.getParent()?.navigate('LegalWeb', { path: '/privacy', title: 'Kebijakan Privasi' })}>Kebijakan Privasi</Text>
                {' '}SMASHSTREAM.
              </Text>
            </View>

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
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginVertical: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.cream[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.accent[500],
    borderColor: COLORS.accent[500],
  },
  checkmark: { color: '#fff', fontWeight: '800' },
  consentText: { flex: 1, color: COLORS.cream[200], fontSize: 12, lineHeight: 18 },
  legalLink: { color: COLORS.accent[400], textDecorationLine: 'underline' },
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
