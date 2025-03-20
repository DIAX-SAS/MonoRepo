import { redirect } from 'next/navigation';

export default function Page(): null {
  redirect('/dashboard');
  return null;
}
