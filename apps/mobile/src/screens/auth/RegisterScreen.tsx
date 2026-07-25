import React, { useEffect, useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS } from '../../constants/colors';
import { apiService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const smashLogo = require('../../assets/smash-logo-transparent.png');
type Method = 'phone' | 'email';

export default function RegisterScreen({ navigation }: any) {
  const setSession = useAuthStore((state) => state.setSession);
  const [method, setMethod] = useState<Method>('phone');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [destination, setDestination] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!seconds) return;
    const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const start = async () => {
    if (!fullName.trim() || !username.trim() || !destination.trim()) return Alert.alert('Data belum lengkap', 'Lengkapi seluruh field registrasi.');
    if (password.length < 10) return Alert.alert('Password belum aman', 'Password minimal 10 karakter dan mendukung passphrase.');
    if (password !== confirm) return Alert.alert('Password tidak cocok', 'Periksa konfirmasi password.');
    if (!consent) return Alert.alert('Persetujuan diperlukan', 'Setujui Syarat dan Kebijakan Privasi.');
    setLoading(true);
    try {
      const result = await apiService.startRegistration({
        method, fullName: fullName.trim(), username: username.trim(),
        destination: destination.trim(), password,
      });
      setChallenge(result); setSeconds(result.resend_after);
    } catch (error: any) {
      Alert.alert('Pendaftaran belum berhasil', error.response?.data?.error || 'Layanan verifikasi belum tersedia.');
    } finally { setLoading(false); }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(otp)) return Alert.alert('Kode belum lengkap', 'Masukkan enam digit kode verifikasi.');
    setLoading(true);
    try {
      const result = await apiService.verifyRegistration(challenge.challenge_id, otp);
      setSession(result.user, result.token);
    } catch (error: any) {
      Alert.alert('Verifikasi gagal', error.response?.data?.error || 'Kode salah atau kedaluwarsa.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Image source={smashLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>{challenge ? 'Verifikasi akun' : 'Buat akun SMASH'}</Text>
          {challenge ? (
            <View style={styles.card}>
              <Text style={styles.copy}>Kode dikirim melalui {method === 'phone' ? 'WhatsApp' : 'email'} ke {challenge.destination_masked}.</Text>
              <Input
                label="Kode verifikasi"
                value={otp}
                onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                maxLength={6}
              />
              <Button title="Verifikasi dan Masuk" onPress={verify} loading={loading} disabled={loading} />
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => { setChallenge(null); setOtp(''); }}><Text style={styles.link}>Ubah {method === 'phone' ? 'nomor' : 'email'}</Text></TouchableOpacity>
                <TouchableOpacity disabled={seconds > 0 || loading} onPress={async () => {
                  try {
                    const next = await apiService.resendRegistration(challenge.challenge_id);
                    setChallenge(next); setSeconds(next.resend_after);
                  } catch { Alert.alert('Belum dapat dikirim', 'Tunggu cooldown atau coba kembali nanti.'); }
                }}><Text style={[styles.link, seconds > 0 && styles.disabled]}>{seconds ? `Kirim ulang (${seconds})` : 'Kirim ulang'}</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.tabs}>
                {(['phone', 'email'] as Method[]).map((item) => (
                  <TouchableOpacity key={item} onPress={() => { setMethod(item); setDestination(''); }} style={[styles.tab, method === item && styles.activeTab]}>
                    <Text style={method === item ? styles.activeTabText : styles.tabText}>{item === 'phone' ? 'Nomor HP' : 'Email'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Input label="Nama tampilan" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
              <Input label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
              <Input
                label={method === 'phone' ? 'Nomor HP' : 'Email'}
                placeholder={method === 'phone' ? '0812 3456 7890' : 'email@contoh.com'}
                value={destination}
                onChangeText={setDestination}
                keyboardType={method === 'phone' ? 'phone-pad' : 'email-address'}
                autoCapitalize="none"
              />
              <Input label="Password" placeholder="Minimal 10 karakter" value={password} onChangeText={setPassword} secureTextEntry />
              <Input label="Konfirmasi password" value={confirm} onChangeText={setConfirm} secureTextEntry />
              <View style={styles.consentRow}>
                <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: consent }} onPress={() => setConsent(!consent)} style={[styles.checkbox, consent && styles.checked]}>
                  {consent && <Text style={{ color: '#fff' }}>✓</Text>}
                </TouchableOpacity>
                <Text style={styles.consentText}>Saya menyetujui <Text style={styles.link} onPress={() => navigation.getParent()?.navigate('LegalWeb', { path: '/terms', title: 'Syarat dan Ketentuan' })}>Syarat dan Ketentuan</Text> serta <Text style={styles.link} onPress={() => navigation.getParent()?.navigate('LegalWeb', { path: '/privacy', title: 'Kebijakan Privasi' })}>Kebijakan Privasi</Text>.</Text>
              </View>
              <Button title="Lanjutkan" onPress={start} loading={loading} disabled={loading} />
              <Text style={styles.or}>atau</Text>
              {(['Google', 'Facebook'] as const).map((provider) => (
                <TouchableOpacity key={provider} style={styles.social} onPress={() => Alert.alert('Belum tersedia', `Continue with ${provider} menunggu konfigurasi provider resmi.`)}>
                  <Text style={styles.socialText}>Continue with {provider}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={[styles.link, { textAlign: 'center', marginTop: 10 }]}>Sudah punya akun? Masuk</Text></TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.warmCharcoal[100] },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  logo: { width: 160, height: 110, alignSelf: 'center' },
  title: { color: COLORS.cream[50], fontSize: 27, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  copy: { color: COLORS.cream[200], lineHeight: 20, marginBottom: 18 },
  card: { borderRadius: 20, padding: 20, backgroundColor: COLORS.warmCharcoal[50], borderWidth: 1, borderColor: `${COLORS.cream[50]}14` },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.warmCharcoal[100], borderRadius: 12, padding: 4, marginBottom: 18 },
  tab: { flex: 1, padding: 10, borderRadius: 9 }, activeTab: { backgroundColor: COLORS.accent[500] },
  tabText: { color: COLORS.cream[200], textAlign: 'center' }, activeTabText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 14 },
  checkbox: { width: 22, height: 22, borderWidth: 1, borderColor: COLORS.cream[200], borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: COLORS.accent[500], borderColor: COLORS.accent[500] },
  consentText: { flex: 1, color: COLORS.cream[200], fontSize: 12, lineHeight: 18 },
  link: { color: COLORS.accent[400], textDecorationLine: 'underline' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  disabled: { color: COLORS.cream[200] },
  or: { color: COLORS.cream[200], textAlign: 'center', marginVertical: 14 },
  social: { borderWidth: 1, borderColor: `${COLORS.cream[50]}30`, borderRadius: 12, padding: 13, marginBottom: 10 },
  socialText: { color: COLORS.cream[50], textAlign: 'center', fontWeight: '600' },
});
