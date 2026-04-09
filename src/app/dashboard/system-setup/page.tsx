import { redirect } from 'next/navigation';

export default function SystemSetupPage() {
  redirect('/dashboard/admin?section=payers');
}
