import { redirect } from 'next/navigation';

// Redirect /login → /dang-nhap (Vietnamese route)
export default function LoginRedirectPage() {
  redirect('/dang-nhap');
}