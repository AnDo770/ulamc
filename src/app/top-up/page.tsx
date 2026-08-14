import { redirect } from 'next/navigation';

// Redirect /top-up → /nap-the (Vietnamese route)
export default function TopUpRedirectPage() {
  redirect('/nap-the');
}