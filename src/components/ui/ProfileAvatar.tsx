import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProfileAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
  imgClassName?: string;
  version?: string | number | Date | null;
}

const canCacheBust = (url: string) => /^https?:\/\//i.test(url);

const buildStableImageSrc = (src?: string | null, version?: ProfileAvatarProps['version']) => {
  const trimmed = src?.trim();
  if (!trimmed) return '';
  if (!version || !canCacheBust(trimmed)) return trimmed;

  const rawVersion = version instanceof Date ? version.getTime() : version;
  const separator = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${separator}avatarVersion=${encodeURIComponent(String(rawVersion))}`;
};

export function ProfileAvatar({
  src,
  name,
  className,
  fallbackClassName,
  imgClassName,
  version,
}: ProfileAvatarProps) {
  const [failedSrc, setFailedSrc] = React.useState('');
  const imageSrc = buildStableImageSrc(src, version);
  const shouldShowImage = imageSrc && failedSrc !== imageSrc;
  const initial = name?.trim()?.charAt(0)?.toUpperCase();

  React.useEffect(() => {
    setFailedSrc('');
  }, [imageSrc]);

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden bg-white/10 text-[#d4af37]',
        className,
      )}
      title={name || undefined}
    >
      {shouldShowImage ? (
        <img
          src={imageSrc}
          alt={name ? `${name} profile` : 'profile'}
          className={cn('h-full w-full object-cover', imgClassName)}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(imageSrc)}
        />
      ) : initial ? (
        <span className={cn('text-sm font-black', fallbackClassName)}>{initial}</span>
      ) : (
        <User className={cn('h-1/2 w-1/2', fallbackClassName)} />
      )}
    </div>
  );
}
