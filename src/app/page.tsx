import { redirect } from "next/navigation";

// Root just routes into the auth flow; middleware takes it from there
// based on session + role.
export default function Home() {
  redirect("/login");
}
