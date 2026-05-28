import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("lms-session");

  if (sessionCookie) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionCookie.value));
      if (session && session.role) {
        redirect(`/dashboard/${session.role}`);
      }
    } catch (e) {
      // If parsing fails, delete cookie and redirect to login
    }
  }

  // If not authenticated, redirect to login
  redirect("/login");
}
