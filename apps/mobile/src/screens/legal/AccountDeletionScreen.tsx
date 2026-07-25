import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { apiService } from '../../services/api';
import { COLORS, THEME } from '../../constants';

const AccountDeletionScreen = () => {
  const [password, setPassword] = useState('');
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const response = await apiService.getAccountDeletion();
    setActive(response.request);
  };
  useEffect(() => { refresh().catch(() => undefined); }, []);

  const submit = async () => {
    if (!password) {
      return Alert.alert('Password diperlukan', 'Masukkan kembali password akun Anda.');
    }
    setLoading(true);
    try {
      const response = await apiService.requestAccountDeletion(password);
      setActive(response.request);
      setPassword('');
      Alert.alert('Permintaan dicatat', 'Anda dapat membatalkannya selama masa tunggu.');
    } catch (error: any) {
      Alert.alert('Permintaan gagal', error.response?.data?.error || 'Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    const response = await apiService.cancelAccountDeletion();
    setActive(null);
    Alert.alert('Dibatalkan', `Permintaan ${response.request.id} telah dibatalkan.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Hapus Akun</Text>
      <Text style={styles.body}>Penghapusan akun mengakhiri akses ke coin, rental aktif, watchlist, dan konten akun. Data tertentu dapat dipertahankan untuk transaksi, antifraud, sengketa, audit, atau kewajiban hukum.</Text>
      <Text style={styles.notice}>Masa tunggu dan retensi final harus dikonfigurasi serta ditinjau penasihat hukum Indonesia sebelum production.</Text>
      {active ? (
        <View style={styles.card}>
          <Text style={styles.body}>Permintaan aktif hingga {new Date(active.scheduled_for).toLocaleString('id-ID')}.</Text>
          <Button title="Batalkan Permintaan" variant="outline" onPress={cancel} />
        </View>
      ) : (
        <View style={styles.card}>
          <Input label="Konfirmasi Password" value={password} onChangeText={setPassword} secureTextEntry />
          <Button title="Ajukan Penghapusan Akun" onPress={submit} loading={loading} disabled={loading} />
        </View>
      )}
      <Text style={styles.help}>Bantuan: email@smashstream.id</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.warmCharcoal[100] },
  content: { padding: THEME.spacing.xl },
  title: { color: COLORS.cream[50], fontSize: 28, fontWeight: '800', marginBottom: 16 },
  body: { color: COLORS.cream[100], fontSize: 15, lineHeight: 23, marginBottom: 16 },
  notice: { color: COLORS.accent[400], fontSize: 14, lineHeight: 21, marginBottom: 20 },
  card: { padding: 18, borderRadius: 16, backgroundColor: COLORS.warmCharcoal[50], gap: 16 },
  help: { color: COLORS.cream[200], textAlign: 'center', marginTop: 24 },
});

export default AccountDeletionScreen;
