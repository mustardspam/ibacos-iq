import logoUrl from '@/assets/aw-starlight-logo.jpg';

interface Props {
  /** 'light' renders the logo white (for dark backgrounds like the nav/login panel).
   *  'dark' renders the original full-color logo (for light backgrounds). */
  variant?: 'light' | 'dark';
  className?: string;
}

const AwStarlightLogo = ({ variant = 'dark', className = '' }: Props) => {
  return (
    <img
      src={logoUrl}
      alt="Ashton Woods / Starlight Homes"
      className={className}
      // On dark backgrounds, flatten the multi-color mark to solid white.
      style={variant === 'light' ? { filter: 'brightness(0) invert(1)' } : undefined}
    />
  );
};

export default AwStarlightLogo;
