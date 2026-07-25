import React, { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS } from '../../constants/colors';
import { apiService } from '../../services/api';

type Step = 'email' | 'otp' | 'password';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      if (step === 'email') {
        const result = await apiService.forgotPassword(email.trim());
        setChallengeId(result.challenge_id);
        setStep('otp');
        Alert.alert('Periksa email', 'Jika email terdaftar, kode OTP telah dikirim. Periksa juga folder spam.');
      } else if (step === 'otp') {
        if (!/^\d{6}$/.test(otp)) {
          Alert.alert('Kode belum lengkap', 'Masukkan enam digit kode OTP.');
          return;
        }
        const result = await apiService.verifyRecovery(challengeId, otp);
        setRecoveryToken(result.recovery_token);
        setStep('password');
      } else {
        if (password.length < 10) {
          Alert.alert('Password belum aman', 'Password minimal 10 karakter.');
          return;
        }
        if (password !== confirmPassword) {
          Alert.alert('Password tidak cocok', 'Periksa konfirmasi password baru.');
          return;
        }
        const result = await apiService.resetPassword(recoveryToken, password);
        Alert.alert('Password diperbarui', result.message, [
          { text: 'Masuk', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Belum berhasil', error.response?.data?.error || 'Permintaan belum dapat diproses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {step === 'email' ? 'Lupa password' : step === 'otp' ? 'Masukkan kode OTP' : 'Password baru'}
        </Text>
        <Text style={styles.copy}>
          {step === 'email' && 'Masukkan email akun Anda. Kode pemulihan akan dikirim melalui email.'}
          {step === 'otp' && `Masukkan enam digit kode yang dikirim ke ${email}.`}
          {step === 'password' && 'Gunakan password baru minimal 10 karakter.'}
        </Text>
        {step === 'email' && (
          <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        )}
        {step === 'otp' && (
          <Input label="Kode OTP" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" maxLength={6} />
        )}
        {step === 'password' && (
          <>
            <Input label="Password baru" value={password} onChangeText={setPassword} secureTextEntry />
            <Input label="Konfirmasi password baru" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          </>
        )}
        <Button
          title={step === 'email' ? 'Kirim kode OTP' : step === 'otp' ? 'Verifikasi OTP' : 'Simpan password baru'}
          loading={loading}
          disabled={loading || (step === 'email' && !email.trim())}
          onPress={submit}
        />
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
