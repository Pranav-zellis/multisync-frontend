// app/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies(); // ⬅️ await it
  const token = cookieStore.get("id_token")?.value;
  const tenant = cookieStore.get("tenant")?.value;

  if (!token) {
    redirect(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`);
  }

  if (tenant) {
    redirect("/dashboard");
  } else {
    redirect("/tenants");
  }
}
