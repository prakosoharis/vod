import React, { useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS } from '../../constants/colors';
import { apiService } from '../../services/api';

const smashLogo = require('../../assets/smash-logo-transparent.png');

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [destination, setDestination] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [consent, setConsent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const start = async () => {
    if (!fullName.trim() || !destination.trim()) return Alert.alert('Data belum lengkap', 'Lengkapi seluruh field registrasi.');
    if (password.length < 10) return Alert.alert('Password belum aman', 'Password minimal 10 karakter dan mendukung passphrase.');
    if (password !== confirm) return Alert.alert('Password tidak cocok', 'Periksa konfirmasi password.');
    if (!consent) return Alert.alert('Persetujuan diperlukan', 'Setujui Syarat dan Kebijakan Privasi.');
    setLoading(true);
    try {
      await apiService.startRegistration({
        method: 'email', fullName: fullName.trim(),
        destination: destination.trim(), password,
      });
      setRegisteredEmail(destination.trim());
    } catch (error: any) {
      Alert.alert('Pendaftaran belum berhasil', error.response?.data?.error || 'Layanan verifikasi belum tersedia.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Image source={smashLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>{registeredEmail ? 'Pendaftaran berhasil' : 'Buat akun SMASH'}</Text>
          {registeredEmail ? (
            <View style={styles.card}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.copy}>Kami mengirim tombol verifikasi ke <Text style={styles.strong}>{registeredEmail}</Text>. Tautan berlaku selama 5 menit.</Text>
              <Text style={styles.notice}>Anda tetap dapat login untuk melihat katalog. Penyewaan dan pembelian tiket baru tersedia setelah email terverifikasi.</Text>
              <Button title="Masuk ke Akun" onPress={() => navigation.navigate('Login')} />
            </View>
          ) : (
            <View style={styles.card}>
              <Input label="Nama tampilan" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
              <Input
                label="Email"
                placeholder="email@contoh.com"
                value={destination}
                onChangeText={setDestination}
                keyboardType="email-address"
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
  successIcon: { color: '#34d399', fontSize: 38, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  strong: { color: COLORS.cream[50], fontWeight: '700' },
  notice: { color: COLORS.cream[200], fontSize: 12, lineHeight: 18, padding: 12, marginBottom: 18, borderRadius: 10, backgroundColor: 'rgba(245,158,11,.10)' },
  or: { color: COLORS.cream[200], textAlign: 'center', marginVertical: 14 },
  social: { borderWidth: 1, borderColor: `${COLORS.cream[50]}30`, borderRadius: 12, padding: 13, marginBottom: 10 },
  socialText: { color: COLORS.cream[50], textAlign: 'center', fontWeight: '600' },
});
