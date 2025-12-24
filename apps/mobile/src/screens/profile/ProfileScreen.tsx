import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeIcon } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { COLORS, THEME } from '../../constants';
import Button from '../../components/ui/Button';

const ProfileScreen: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();

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
      icon: 'list',
      title: 'Daftar Saya',
      subtitle: 'Lihat film dan serial yang ditandai',
      onPress: () => console.log('Navigate to My List'),
    },
    {
      icon: 'history',
      title: 'Riwayat Tontonan',
      subtitle: 'Lihat film yang telah ditonton',
      onPress: () => console.log('Navigate to Watch History'),
    },
    {
      icon: 'download',
      title: 'Unduhan',
      subtitle: 'Kelola konten yang diunduh',
      onPress: () => console.log('Navigate to Downloads'),
    },
    {
      icon: 'settings',
      title: 'Pengaturan',
      subtitle: 'Atur preferensi aplikasi',
      onPress: () => console.log('Navigate to Settings'),
    },
    {
      icon: 'help',
      title: 'Bantuan',
      subtitle: 'Dapatkan bantuan dan dukungan',
      onPress: () => console.log('Navigate to Help'),
    },
    {
      icon: 'info',
      title: 'Tentang',
      subtitle: 'Informasi tentang aplikasi',
      onPress: () => console.log('Navigate to About'),
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
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <SafeIcon
                  name={item.icon}
                  size={24}
                  color={COLORS.cream[200]}
                  style={styles.menuIcon}
                />
                <View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <SafeIcon name="chevron-right" size={24} color={COLORS.cream[200]} />
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
  menuIcon: {
    marginRight: THEME.spacing.lg,
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