import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeIcon } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { COLORS, THEME } from '../../constants';
import Button from '../../components/ui/Button';
import { apiService } from '../../services/api';

const ProfileScreen: React.FC = () => {
  const { user, logout, isAuthenticated, updateUser } = useAuthStore();
  const navigation = useNavigation<any>();
  const [sendingVerification, setSendingVerification] = useState(false);
  const isVerified = Boolean(user?.email_verified || user?.email_verified_at || user?.account_status === 'ACTIVE');

  useFocusEffect(
    React.useCallback(() => {
      if (!isAuthenticated) return;
      apiService.checkAuth()
        .then((result) => updateUser(result.user || result))
        .catch(() => undefined);
    }, [isAuthenticated, updateUser])
  );

  const resendVerification = async () => {
    setSendingVerification(true);
    try {
      const result = await apiService.resendRegistration();
      Alert.alert('Email dikirim', result.message || 'Silakan periksa inbox email Anda. Tautan berlaku selama 5 menit.');
    } catch (error: any) {
      Alert.alert('Belum dapat dikirim', error.response?.data?.error || 'Silakan coba kembali nanti.');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'bookmark-border',
      title: 'Daftar Saya',
      subtitle: 'Lihat film dan serial yang ditandai',
      onPress: () => navigation.navigate('MyList'),
    },
    {
      icon: 'history',
      title: 'Riwayat Tontonan',
      subtitle: 'Lihat film yang telah ditonton',
      onPress: () => navigation.navigate('WatchHistory'),
    },
    {
      icon: 'local-movies',
      title: 'Tayangan Disewa',
      subtitle: 'Lihat film dan serial beserta masa sewanya',
      onPress: () => navigation.navigate('RentalHistory'),
    },
    {
      icon: 'event',
      title: 'Live Event',
      subtitle: 'Lihat siaran langsung yang tersedia',
      onPress: () => navigation.navigate('LiveEvents'),
    },
    {
      icon: 'file-download',
      title: 'Unduhan',
      subtitle: 'Kelola konten yang diunduh',
      onPress: () => console.log('Navigate to Downloads'),
    },
    {
      icon: 'privacy-tip',
      title: 'Kebijakan Privasi',
      subtitle: 'Cara kami memproses data',
      onPress: () => navigation.navigate('LegalWeb', { path: '/privacy', title: 'Kebijakan Privasi' }),
    },
    {
      icon: 'description',
      title: 'Syarat dan Ketentuan',
      subtitle: 'Ketentuan penggunaan layanan',
      onPress: () => navigation.navigate('LegalWeb', { path: '/terms', title: 'Syarat dan Ketentuan' }),
    },
    {
      icon: 'contact-support',
      title: 'Kontak dan Bantuan',
      subtitle: 'Kirim permintaan dukungan',
      onPress: () => navigation.navigate('LegalWeb', { path: '/contact', title: 'Kontak dan Bantuan' }),
    },
    {
      icon: 'currency-exchange',
      title: 'Kebijakan Refund',
      subtitle: 'Ketentuan pengembalian dana',
      onPress: () => navigation.navigate('LegalWeb', { path: '/refund-policy', title: 'Kebijakan Refund' }),
    },
    {
      icon: 'delete-forever',
      title: 'Hapus Akun',
      subtitle: 'Ajukan penghapusan akun dan data',
      onPress: () => navigation.navigate('AccountDeletion'),
    },
  ];

  if (!isAuthenticated) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
        <View style={styles.container}>
          <View style={styles.notAuthenticated}>
            <SafeIcon name="account-circle" size={64} color={COLORS.cream[200]} />
            <Text style={styles.notAuthTitle}>Belum Login</Text>
            <Text style={styles.notAuthSubtitle}>Login untuk mengakses profil Anda</Text>
            <Button
              title="Login"
              onPress={() => console.log('Navigate to Login')}
              style={styles.loginButton}
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.warmCharcoal[100]} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <SafeIcon name="account-circle" size={80} color={COLORS.accent[500]} />
            </View>
            <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={[styles.verificationBadge, isVerified ? styles.verifiedBadge : styles.unverifiedBadge]}>
              <Text style={[styles.verificationText, isVerified ? styles.verifiedText : styles.unverifiedText]}>
                {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
              </Text>
            </View>
          </View>
        </View>

        {!isVerified && (
          <View style={styles.verificationCard}>
            <Text style={styles.verificationTitle}>Verifikasi email untuk membuka transaksi</Text>
            <Text style={styles.verificationCopy}>Anda dapat melihat katalog, tetapi belum dapat menyewa tayangan atau membeli tiket.</Text>
            <Button
              title={sendingVerification ? 'Mengirim…' : 'Kirim Ulang Verifikasi'}
              onPress={resendVerification}
              disabled={sendingVerification}
              style={styles.verificationButton}
            />
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <SafeIcon
                    name={item.icon}
                    size={26}
                    color={COLORS.accent[400]}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <SafeIcon name="chevron-right" size={24} color={COLORS.cream[200]} opacity={0.6} />
            </TouchableOpacity>
          ))}
        </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.warmCharcoal[100],
  },
  notAuthenticated: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.xxl,
  },
  notAuthTitle: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginTop: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  notAuthSubtitle: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
    textAlign: 'center',
    marginBottom: THEME.spacing.xxl,
  },
  loginButton: {
    paddingHorizontal: THEME.spacing.xxl,
  },
  header: {
    backgroundColor: COLORS.warmCharcoal[50],
    padding: THEME.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.warmCharcoal[50]}80`,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: THEME.spacing.lg,
  },
  userName: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: COLORS.cream[50],
    marginBottom: THEME.spacing.xs,
  },
  userEmail: {
    fontSize: THEME.typography.fontSize.md,
    color: COLORS.cream[200],
  },
  verificationBadge: { marginTop: 10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  verifiedBadge: { backgroundColor: 'rgba(16,185,129,.15)' },
  unverifiedBadge: { backgroundColor: 'rgba(245,158,11,.15)' },
  verificationText: { fontSize: 10, fontWeight: '800' },
  verifiedText: { color: '#6ee7b7' },
  unverifiedText: { color: '#fcd34d' },
  verificationCard: { margin: 18, marginBottom: 0, borderRadius: 14, padding: 16, backgroundColor: 'rgba(245,158,11,.10)', borderWidth: 1, borderColor: 'rgba(245,158,11,.24)' },
  verificationTitle: { color: COLORS.cream[50], fontWeight: '700', fontSize: 15 },
  verificationCopy: { color: COLORS.cream[200], fontSize: 12, lineHeight: 18, marginTop: 5 },
  verificationButton: { marginTop: 14 },
  menuContainer: {
    marginTop: THEME.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warmCharcoal[50],
    paddingVertical: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warmCharcoal[100],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.accent[500]}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.medium,
    color: COLORS.cream[50],
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
  },
  logoutContainer: {
    padding: THEME.spacing.xl,
  },
  logoutButton: {
    borderColor: COLORS.accent[600],
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
  },
  versionText: {
    fontSize: THEME.typography.fontSize.sm,
    color: COLORS.cream[200],
  },
});

export default ProfileScreen;
