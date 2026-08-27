interface WalletBrandIconProps {
  id: string;
  className?: string;
  size?: number;
}

export function WalletBrandIcon({ id, className = 'w-6 h-6', size }: WalletBrandIconProps) {
  const style = size ? { width: size, height: size } : undefined;

  switch (id) {
    case 'bitcoin-com':
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
        >
          <rect width="48" height="48" rx="12" fill="#0AC18E" />
          <path
            d="M24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24C38 16.268 31.732 10 24 10Z"
            fill="white"
            fillOpacity="0.18"
          />
          <path
            d="M22 15V18M28 15V18M22 30V33M28 30V33M18 20.5H27C28.933 20.5 30.5 21.619 30.5 23C30.5 24.381 28.933 25.5 27 25.5H18V20.5ZM18 25.5H28C29.933 25.5 31.5 26.619 31.5 28C31.5 29.381 29.933 30.5 28 30.5H18V25.5Z"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'trust':
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
        >
          <rect width="48" height="48" rx="12" fill="#0500FF" />
          <path
            d="M24 12L34 16.5V25C34 31.5 29.5 36.5 24 38C18.5 36.5 14 31.5 14 25V16.5L24 12Z"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'metamask':
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
        >
          <rect width="48" height="48" rx="12" fill="#F6851B" />
          <path
            d="M34.5 14L24 21.5L25.8 17L34.5 14Z"
            fill="#E2761B"
            stroke="#E2761B"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 14L23.8 21.6L22.2 17L13.5 14Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M31.5 28L28.5 32.5L34 34L35.5 28.2L31.5 28Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 28.2L14 34L19.5 32.5L16.5 28L12.5 28.2Z"
            fill="#E4761B"
            stroke="#E4761B"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.8 23.5L17.2 26.5L22.5 26.8L22.3 21.2L18.8 23.5Z"
            fill="#D7C1B3"
            stroke="#D7C1B3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M29.2 23.5L25.7 21.1L25.5 26.8L30.8 26.5L29.2 23.5Z"
            fill="#D7C1B3"
            stroke="#D7C1B3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 32.5L23.2 30.5L20.2 27.2L19.5 32.5Z"
            fill="#233447"
            stroke="#233447"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28.5 32.5L27.8 27.2L24.8 30.5L28.5 32.5Z"
            fill="#233447"
            stroke="#233447"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 23.5L27 20L31 23L27.5 28L24 23.5Z"
            fill="#CD6116"
          />
          <path
            d="M24 23.5L20.5 28L17 23L21 20L24 23.5Z"
            fill="#CD6116"
          />
        </svg>
      );

    case 'rainbow':
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
        >
          <rect width="48" height="48" rx="12" fill="#1C1E24" />
          <path
            d="M12 34C12 27.3726 17.3726 22 24 22C30.6274 22 36 27.3726 36 34"
            stroke="#FF4B4B"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M15.5 34C15.5 29.3056 19.3056 25.5 24 25.5C28.6944 25.5 32.5 29.3056 32.5 34"
            stroke="#FFA500"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M19 34C19 31.2386 21.2386 29 24 29C26.7614 29 29 31.2386 29 34"
            stroke="#00E5FF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'zerion':
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
        >
          <rect width="48" height="48" rx="12" fill="#2962FF" />
          <path
            d="M15 17H33L21 31H33"
            stroke="white"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'coinbase':
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
        >
          <rect width="48" height="48" rx="12" fill="#0052FF" />
          <circle cx="24" cy="24" r="13" fill="white" />
          <rect x="19" y="19" width="10" height="10" rx="2.5" fill="#0052FF" />
        </svg>
      );

    case 'generic':
    default:
      return (
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          style={style}
        >
          <rect width="48" height="48" rx="12" fill="#131A38" stroke="#20E56B" strokeWidth="2" />
          <path
            d="M16 20C20.5 15.5 27.5 15.5 32 20M19 23.5C22 20.5 26 20.5 29 23.5L24 28.5L19 23.5Z"
            stroke="#20E56B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="33" r="2" fill="#20E56B" />
        </svg>
      );
  }
}
