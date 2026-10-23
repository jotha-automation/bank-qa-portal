import { useEffect, useState } from "react";
import { getSession, type Session } from "@/lib/store";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
    // Only react to session key changes — inscription/config storage events must not
    // remount the app shell (avoids transient "Cargando..." during demo seeding).
    const onChange = (event: StorageEvent) => {
      if (event.key && event.key !== "dav.session") return;
      setSession(getSession());
    };
    window.addEventListener("storage", onChange);
    return () => window.removeEventListener("storage", onChange);
  }, []);

  return { session, ready };
}
