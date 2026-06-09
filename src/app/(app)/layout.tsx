import AppLayout from '@/components/AppLayout';
import SOSButton from '@/components/SOSButton';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      {children}
      <SOSButton />
    </AppLayout>
  );
}
