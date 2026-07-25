import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS } from '../../constants/colors';
import { apiService } from '../../services/api';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Lupa password</Text>
        <Text style={styles.copy}>Masukkan nomor HP atau email. Instruksi dikirim melalui kanal akun yang sudah terverifikasi.</Text>
        <Input label="Nomor HP atau Email" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" />
        <Button title="Kirim instruksi" loading={loading} disabled={loading || !identifier.trim()} onPress={async () => {
          setLoading(true);
          try {
            const result = await apiService.forgotPassword(identifier.trim());
            Alert.alert('Periksa kanal Anda', result.message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
          } catch {
            Alert.alert('Periksa kanal Anda', 'Jika akun ditemukan, instruksi pemulihan akan dikirim melalui kanal yang terdaftar.');
          } finally { setLoading(false); }
        }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: COLORS.warmCharcoal[100] },
  card: { borderRadius: 20, padding: 20, backgroundColor: COLORS.warmCharcoal[50] },
  title: { color: COLORS.cream[50], fontSize: 26, fontWeight: '800', marginBottom: 8 },
  copy: { color: COLORS.cream[200], lineHeight: 20, marginBottom: 22 },
});
