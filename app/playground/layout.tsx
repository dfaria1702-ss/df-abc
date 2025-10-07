import type React from 'react';

// Force dynamic rendering for playground routes
export const dynamic = 'force-dynamic';

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='h-full'>
      <div className='p-4'>{children}</div>
    </div>
  );
}

