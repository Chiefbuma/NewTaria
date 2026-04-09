import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCurrentSessionUser } from '@/lib/auth';
import { getRoleLabel } from '@/lib/role-utils';

export default async function ProfilePage() {
  const user = await getCurrentSessionUser();

  if (!user) {
    redirect('/');
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Name" value={user.name} />
          <DetailRow label="Phone" value={user.phone || 'Not set'} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Role" value={getRoleLabel(user.role)} />
          <DetailRow label="Partner" value={user.partner_name || 'Not assigned'} />
          <DetailRow
            label="Password Status"
            value={user.must_change_password ? 'Change required' : user.password_changed_at ? 'Updated' : 'Temporary'}
          />
          <div className="pt-2">
            <Button asChild>
              <Link href="/change-password">Change Password</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}
