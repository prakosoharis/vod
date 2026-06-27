/**
 * Sidebar Navigation - Left vertical menu (TV-friendly)
 * Replaces mobile's bottom tab bar
 */
import { useNavigate, useLocation } from 'react-router-dom';
import type { FC } from 'react';
import { Focusable } from './Focusable';
import {
  HomeIcon,
  LiveIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  LogoutIcon,
} from './icons';
import { useAuthStore } from '@/store/authStore';
import { COLORS, THEME } from '@/constants';

interface NavItem {
  key: string;
  label: string;
  icon: FC<{ size?: number; color?: string }>;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Beranda', icon: HomeIcon, path: '/home' },
  { key: 'browse', label: 'Jelajahi', icon: SearchIcon, path: '/browse' },
  { key: 'live', label: 'Live', icon: LiveIcon, path: '/live' },
  { key: 'profile', label: 'Profil', icon: UserIcon, path: '/profile' },
];

interface SidebarProps {
  activeKey?: string;
}

export function Sidebar({ activeKey: activeKeyProp }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const activeKey = activeKeyProp || NAV_ITEMS.find((i) => location.pathname.startsWith(i.path))?.key || 'home';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 320,
        background: COLORS.warmCharcoal[200],
        borderRight: `1px solid ${COLORS.warmCharcoal[50]}`,
        display: 'flex',
        flexDirection: 'column',
        padding: `${THEME.spacing.xxl}px ${THEME.spacing.lg}px`,
        zIndex: THEME.zIndex.sidebar,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: THEME.spacing.md,
          padding: `${THEME.spacing.md}px ${THEME.spacing.lg}px`,
          marginBottom: THEME.spacing.xxl,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            background: `linear-gradient(135deg, ${COLORS.accent[400]} 0%, ${COLORS.accent[600]} 100%)`,
            borderRadius: THEME.borderRadius.lg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          M
        </div>
        <div>
          <div
            style={{
              fontSize: THEME.typography.fontSize.xl,
              fontWeight: THEME.typography.fontWeight.bold,
              color: COLORS.cream[50],
            }}
          >
            Mostara
          </div>
          <div
            style={{
              fontSize: THEME.typography.fontSize.xs,
              color: COLORS.cream[200],
            }}
          >
            VOD • TV
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: THEME.spacing.sm }}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = item.icon;
          return (
            <Focusable
              key={item.key}
              focusKey={`sidebar-${item.key}`}
              onEnter={() => navigate(item.path)}
              focusScale={1.0}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: THEME.spacing.md,
                  padding: `${THEME.spacing.md}px ${THEME.spacing.lg}px`,
                  borderRadius: THEME.borderRadius.lg,
                  background: isActive ? COLORS.accent[500] + '20' : 'transparent',
                  borderLeft: isActive
                    ? `4px solid ${COLORS.accent[500]}`
                    : '4px solid transparent',
                  color: isActive ? COLORS.cream[50] : COLORS.cream[200],
                  fontSize: THEME.typography.fontSize.lg,
                  fontWeight: isActive
                    ? THEME.typography.fontWeight.bold
                    : THEME.typography.fontWeight.medium,
                }}
              >
                <Icon
                  size={36}
                  color={isActive ? COLORS.accent[400] : COLORS.cream[200]}
                />
                <span>{item.label}</span>
              </div>
            </Focusable>
          );
        })}
      </nav>

      {/* Logout (bottom) */}
      <div style={{ marginTop: 'auto' }}>
        <Focusable
          focusKey="sidebar-logout"
          onEnter={handleLogout}
          focusScale={1.0}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: THEME.spacing.md,
              padding: `${THEME.spacing.md}px ${THEME.spacing.lg}px`,
              borderRadius: THEME.borderRadius.lg,
              color: COLORS.cream[200],
              fontSize: THEME.typography.fontSize.lg,
              fontWeight: THEME.typography.fontWeight.medium,
            }}
          >
            <LogoutIcon size={36} />
            <span>Keluar</span>
          </div>
        </Focusable>
      </div>
    </aside>
  );
}

export default Sidebar;
