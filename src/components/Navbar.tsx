"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import CompanySearch from "./CompanySearch";

type NavbarProps = {
  initialUser: any;
  initialProfile: {
    avatar_url: string | null;
  } | null;
};

export default function Navbar({
  initialUser,
  initialProfile,
}: NavbarProps) {

  const [user, setUser] = useState<any>(initialUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authLoading] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isActive = (path: string) => pathname.startsWith(path);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] =
  useState<{
    avatar_url: string | null;
  } | null>(initialProfile);


     useEffect(() => {
      if (!isHomePage) return;

      const handleScroll = () => {
        setScrolled(window.scrollY > 80);
      };

      window.addEventListener(
        "scroll",
        handleScroll
      );

      return () => {
        window.removeEventListener(
          "scroll",
          handleScroll
        );
      };
   
    }, [isHomePage]);

    useEffect(() => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }, []);

    useEffect(() => {
      const loadProfile = async () => {
        if (!user) {
          setProfile(null);
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        setProfile(data);
      };

      loadProfile();
    }, [user]);

    const shouldShowFullNav =  !isHomePage || scrolled;

  return (
    <nav className="sticky top-0 w-full bg-[var(--surface)] backdrop-blur-xl text-[var(--foreground)] z-50">
      <div className="max-w-7xl mx-auto h-20 px-8 rounded-2xl border border-white/10 bg-[var(--surface)] shadow-2xl shadow-black/20 flex items-center justify-between">

       <div className="flex items-center justify-between w-full md:w-auto">

          {/* LOGO */}
       <div className="flex flex-col leading-none">

          <a
            href="/"
            className="text-2xl font-bold tracking-tight"
          >
            <span className="text-white">
              insider
            </span>

            <span className="text-[var(--accent)]">
              ol
            </span>
          </a>

        </div>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white transition-all duration-200"
          >

              {mobileMenuOpen ? (

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-7 h-7 transition-all duration-200"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>

              ) : (

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5"
                  />
                </svg>

              )}

          </button>

        </div>
        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-5">

          
          {/* NAV LINKS */}
          
          <div
              className={`
                flex items-center gap-8
                transition-all duration-800 ease-out
                ${
                  shouldShowFullNav
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-1 pointer-events-none w-0 overflow-hidden"
                }
              `}
            >

              <a
              href="/share"
              className={`nav-link ${isActive("/share") ? "active" : ""}`}            >
              Paylaş
            </a>
         
            <a
              href="/companies"
              className={`nav-link ${isActive("/companies") ? "active" : ""}`}
            >
              Şirketler
            </a>

            <a
              href="/roles"
              className={`nav-link ${isActive("/roles") ? "active" : ""}`}
            >
              Pozisyonlar
            </a>

            <a
            href="/explore"
            className={`nav-link ${isActive("/explore") ? "active" : ""}`}
          >
            Keşfet
          </a>

          </div>
       

          {/* SEARCH + AUTH */}
          <div className="flex items-center gap-5 pl-5 border-l border-white/10">

              <div className="w-[260px]">
          <CompanySearch />
              </div>

              {authLoading ? (

                <div className="w-[157px] flex justify-end" />

              ) : user ? (

                <div
                  className="flex justify-end relative"
                  onMouseLeave={() =>
                    setProfileMenuOpen(false)
                  }
                >

                  <button
                    onClick={() =>
                      setProfileMenuOpen(
                        !profileMenuOpen
                      )
                    }
                    className="avatar-btn"
                  >

                    {profile?.avatar_url && (
                      <img
                        src={profile.avatar_url}
                        alt="avatar"
                        className="
                          w-full h-full
                          object-cover
                          block
                        "
                      />
                    )}

                  </button>

                  {profileMenuOpen && (

                    <div className="profile-dropdown">

                      <a
                        href="/profile"
                        className="profile-menu-item"
                      >
                        Profil
                      </a>

                      <a
                        href="/my-posts"
                        className="profile-menu-item"
                      >
                        Paylaşımlarım
                      </a>

                      <a
                        href="/settings"
                        className="profile-menu-item"
                      >
                        Ayarlar
                      </a>

                      <div className="my-1 border-t border-white/5" />

                      <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          window.location.href = "/";
                        }}
                        className="
                          profile-menu-item
                          profile-menu-item-danger
                        "
                      >
                        Çıkış Yap
                      </button>

                    </div>

                  )}

                </div>

              ) : (

                <div className="w-[157px] flex items-center justify-end gap-5">

                 <a
                    href="/auth/login"
                    className="nav-link"
                    onClick={() => {
                      localStorage.setItem(
                        "redirectAfterAuth",
                        window.location.href
                      );
                    }}
                  >
                    Giriş Yap
                  </a>

                  <a
                    href="/auth/register"
                    className="nav-auth-btn"
                  >
                    Kaydol
                  </a>

                </div>

              )}

            </div>

        </div>
            
      </div>

      {mobileMenuOpen && (

              <div className="md:hidden mt-3 rounded-2xl border border-white/10 bg-[var(--surface)] shadow-2xl shadow-black/20 p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">

                <a
                  href="/contact"
                  className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
                >
                  İletişim
                </a>

                <a
                  href="/companies"
                  className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
                >
                  Şirketler
                </a>

                <a
                  href="/roles"
                  className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
                >
                  Pozisyonlar
                </a>

                {!user && (
   
                  <a
                      href="/auth/login"
                      className="text-[var(--muted)] hover:text-[var(--accent)] transition-all duration-200"
                      onClick={() => {
                        localStorage.setItem(
                          "redirectAfterAuth",
                          window.location.href
                        );
                      }}
                    >
                      Giriş Yap
                    </a>
                )}

                {user ? (

                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                    className="bg-[var(--accent)] text-white rounded-xl py-3 font-medium"
                  >
                    @{user.user_metadata?.username}
                  </button>

                ) : (

                  <a
                    href="/register"
                    className="bg-[var(--accent)] text-white rounded-xl py-3 text-center font-medium"
                  >
                    Kaydol
                  </a>

                )}

              </div>

            )}

    </nav>
  );
}