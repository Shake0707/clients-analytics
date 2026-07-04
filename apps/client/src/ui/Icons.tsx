interface IconProps {
  size?: number;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const PlusIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2.2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const BackIcon = ({ size = 18 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const SearchIcon = ({ size = 17 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </svg>
);

export const CloseIcon = ({ size = 17 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={2}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const EditIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.9}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const TrashIcon = ({ size = 16 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.9}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
  </svg>
);

export const ThemeIcon = ({ size = 19 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.7} />
    <path d="M12 3.2a8.8 8.8 0 0 1 0 17.6z" fill="currentColor" />
  </svg>
);

export const HomeIcon = ({ size = 23 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.9}>
    <path d="M4 11l8-6 8 6M6 10v9h12v-9" />
  </svg>
);

export const ClientsIcon = ({ size = 23 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.9}>
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
  </svg>
);

export const SalesIcon = ({ size = 23 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.9}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
);

export const ProductsIcon = ({ size = 23 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} strokeWidth={1.9}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
    <path d="M4 7.5l8 4.5 8-4.5" />
  </svg>
);
