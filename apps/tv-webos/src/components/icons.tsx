/**
 * Icon System - Material Design style (matches Android Material Icons)
 *
 * Path data from Google Material Icons (filled/outlined variants).
 * Same look as react-native-vector-icons/MaterialIcons used in Android app.
 *
 * Icons: home, search, live-tv, person, chat-bubble, send, wifi, wifi-off,
 *        error-outline, play, pause, arrow-back, chevron-left, chevron-right,
 *        add, check, star, settings, logout (exit-to-app), lock, refresh,
 *        schedule, payments, movie, account-circle
 */
import type { ReactNode, FC } from 'react';
import { COLORS } from '@/constants';

interface IconProps {
  size?: number;
  color?: string;
}

// Material Icon viewBox is 24x24
const wrap = (path: ReactNode): FC<IconProps> =>
  ({ size = 32, color = COLORS.cream[50] }: IconProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {path}
    </svg>
  );

// ============ Navigation Icons ============

// home (filled) - matches Material "home"
export const HomeIcon = wrap(
  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
);

// search (filled)
export const SearchIcon = wrap(
  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
);

// live-tv (filled)
export const LiveIcon = wrap(
  <path d="M21 6h-7.59l3.29-3.29L16 1l-4 4-4-4-.71.71L10.59 6H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h18v12zM9 10v8l7-4z" />
);

// person (filled)
export const UserIcon = wrap(
  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
);

// account-circle (filled)
export const AccountCircleIcon = wrap(
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
);

// ============ Chat / Live Icons ============

// chat-bubble (filled)
export const ChatIcon = wrap(
  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
);

// chat-bubble-outline
export const ChatOutlineIcon = wrap(
  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 1.99-.9 1.99-2L22 4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM6 12h8v2H6zm0-3h10v2H6zm0-3h10v2H6z" />
);

// send (filled)
export const SendIcon = wrap(
  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
);

// wifi (filled)
export const WifiIcon = wrap(
  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
);

// wifi-off
export const WifiOffIcon = wrap(
  <path d="M22.99 9V19c0 .55-.45 1-1 1h-1v2l-3-2H8.99l3.5 3.5c.39.39 1.01.39 1.4 0 .39-.39.39-1.01 0-1.4L11.4 22H5.99L4 22c-.55 0-1-.45-1-1V3.41L1.39 2.81c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l18.79 18.79c.39.39.39 1.02 0 1.41-.39.39-1.02.39-1.41 0L18.59 19h3.4c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1zM5 19h11.59L5 7.41V19zm6-12c0 .36.21.65.5.83l1.65-1.65c-.18-.29-.47-.5-.83-.5-.73 0-1.32.59-1.32 1.32zm13.32-3.32C18.93 2.93 14.45 2.93 11 6l2.49 2.49c.59-.59 1.54-.59 2.13 0 .59.59.59 1.54 0 2.13l3.18 3.18c1.65-1.66 1.65-4.34 0-6L20.32 3.68z" />
);

// error-outline
export const ErrorIcon = wrap(
  <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
);

// ============ Player Icons ============

// play-arrow (filled)
export const PlayIcon = wrap(
  <path d="M8 5v14l11-7z" />
);

// pause (filled)
export const PauseIcon = wrap(
  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
);

// arrow-back
export const BackIcon = wrap(
  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
);

// chevron-right
export const ChevronRightIcon = wrap(
  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
);

// chevron-left
export const ChevronLeftIcon = wrap(
  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
);

// fast-forward (for seek forward)
export const FastForwardIcon = wrap(
  <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
);

// fast-rewind (for seek backward)
export const FastRewindIcon = wrap(
  <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
);

// ============ Action Icons ============

// add (plus)
export const PlusIcon = wrap(
  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
);

// check
export const CheckIcon = wrap(
  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
);

// star (filled) - default yellow color like Material star
export function StarIcon({ size = 32, color = '#FBBF24' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      style={{ display: 'block' }}
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

// settings (filled)
export const SettingsIcon = wrap(
  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
);

// exit-to-app (logout)
export const LogoutIcon = wrap(
  <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
);

// lock (filled)
export const LockIcon = wrap(
  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
);

// refresh
export const RefreshIcon = wrap(
  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
);

// schedule (clock)
export const ClockIcon = wrap(
  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
);

// ============ Content / Payment Icons ============

// movie (filled)
export const MovieIcon = wrap(
  <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
);

// payments (credit card)
export const PaymentsIcon = wrap(
  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
);

// qr-code (still available, but no longer used in SubscriptionGate)
export const QRCodeIcon = wrap(
  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h2v2h-2v-2zm-3 0h2v2h-2v-2zm-1 0v2h-2v-2h2zm-2 4h2v2h-2v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2zm0-2v-2h2v2h-2z" />
);

// smartphone (for "use mobile app" instruction)
export const SmartphoneIcon = wrap(
  <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
);

// language / public (for "use web" instruction)
export const LanguageIcon = wrap(
  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z" />
);

// info (filled)
export const InfoIcon = wrap(
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
);

// warning (filled)
export const WarningIcon = wrap(
  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
);

// close (X) - for modal close button
export const CloseIcon = wrap(
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
);
