'use client';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ value, max = 5, size = 'md' }: StarRatingProps) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
  return (
    <span className={`${sizes[size]} tracking-wide`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </span>
  );
}
