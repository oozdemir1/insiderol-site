import { createClient } from "@/lib/server";
import Navbar from "./Navbar";

export default async function NavbarServer() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    profile = data;
  }

  return (
    <Navbar
      initialUser={user}
      initialProfile={profile}
    />
  );
}