// Enable dynamic params for this dynamic route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function PlaygroundModelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
