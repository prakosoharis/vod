import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { cn } from '../../utils';
import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';

const menuItems = [
  {
    icon: 'Bookmark',
    title: 'Daftar Saya',
    subtitle: 'Lihat film dan serial yang ditandai',
    path: '/my-list',
  },
  {
    icon: 'History',
    title: 'Riwayat Tontonan',
    subtitle: 'Lihat film yang telah ditonton',
    path: '/history',
  },
  {
    icon: 'Download',
    title: 'Unduhan',
    subtitle: 'Kelola konten yang diunduh',
    path: '/downloads',
  },
  {
    icon: 'Settings',
    title: 'Pengaturan',
    subtitle: 'Atur preferensi aplikasi',
    path: '/settings',
  },
  {
    icon: 'HelpCircle',
    title: 'Bantuan',
    subtitle: 'Dapatkan bantuan dan dukungan',
    path: '/help',
  },
  {
    icon: 'Info',
    title: 'Tentang',
    subtitle: 'Informasi tentang aplikasi',
    path: '/about',
  },
];

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-surface rounded-2xl p-8 shadow-2xl text-center">
          <Icon name="UserCircle" size={80} className="text-text-muted mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-primary-50 mb-4">Belum Login</h2>
          <p className="text-secondary text-lg mb-8">Login untuk mengakses profil Anda</p>
          <Button size="lg" onClick={() => navigate('/auth/login')} className="w-full">
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 px-8 pb-16">
        <h1 className="text-5xl font-bold text-primary-50 mb-8">Profil</h1>

        <div className="max-w-2xl">
          <div className="bg-surface rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-accent-500/20 rounded-full flex items-center justify-center">
                <Icon name="User" size={48} className="text-accent-500" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary-50 mb-2">
                  {user?.full_name || 'User'}
                </h2>
                <p className="text-secondary text-lg">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl overflow-hidden mb-8">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-6 p-6 hover:bg-surface-hover transition-colors border-b border-primary-700 last:border-b-0"
              >
                <div className="w-14 h-14 bg-accent-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon as any} size={28} className="text-accent-500" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-semibold text-primary-50 mb-1">{item.title}</h3>
                  <p className="text-secondary">{item.subtitle}</p>
                </div>
                <Icon name="ChevronRight" size={24} className="text-text-muted" />
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={handleLogout}
            className="w-full"
          >
            Logout
          </Button>

          <p className="text-center text-text-muted mt-8">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
