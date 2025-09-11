// src/app/(owner)/owner/page.tsx
import { redirect } from "next/navigation";

export default function OwnerPage() {
  // This page is never rendered, it just handles the redirect.
  redirect("/owner/financials");
}
