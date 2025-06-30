// src/app/admin/[...missing]/page.tsx
import { notFound } from "next/navigation";

export default function CatchAllAdminPage() {
  notFound(); // This will render src/app/admin/not-found.tsx
}
