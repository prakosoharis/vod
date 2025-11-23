import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../../store/authStore';
import { COLORS } from '../../constants';
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
      <View style={styles.container}>
        <View style={styles.notAuthenticated}>
          <Icon name="account-circle" size={64} color={COLORS.textSecondary} />
          <Text style={styles.notAuthTitle}>Belum Login</Text>
          <Text style={styles.notAuthSubtitle}>Login untuk mengakses profil Anda</Text>
          <Button
            title="Login"
            onPress={() => console.log('Navigate to Login')}
            style={styles.loginButton}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={80} color={COLORS.textSecondary} />
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
              <Icon
                name={item.icon}
                size={24}
                color={COLORS.textSecondary}
                style={styles.menuIcon}
              />
              <View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  notAuthenticated: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notAuthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  notAuthSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  loginButton: {
    paddingHorizontal: 32,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: 24,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  menuContainer: {
    marginTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  logoutContainer: {
    padding: 24,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default ProfileScreen;