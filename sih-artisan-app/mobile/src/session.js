import { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// One session per role (artisan / buyer), persisted on the phone, so judges can
// switch viewpoints without logging in again — same idea as web/src/session.jsx.
const KEY = "shilpsaathi.sessions";
const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState({});
  const [ready, setReady] = useState(false);
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const saved = raw ? JSON.parse(raw) : {};
        setSessions(saved.sessions || {});
        setActiveRole(saved.activeRole || null);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = (next, role) => AsyncStorage.setItem(KEY, JSON.stringify({ sessions: next, activeRole: role })).catch(() => {});

  const signIn = useCallback((role, user, token) => {
    setSessions((s) => {
      const next = { ...s, [role]: { user, token } };
      persist(next, role);
      return next;
    });
    setActiveRole(role);
  }, []);

  const update = useCallback((role, patch) => {
    setSessions((s) => {
      if (!s[role]) return s;
      const next = { ...s, [role]: { ...s[role], user: { ...s[role].user, ...patch } } };
      persist(next, role);
      return next;
    });
  }, []);

  const signOut = useCallback((role) => {
    setSessions((s) => {
      const next = { ...s };
      delete next[role];
      const other = Object.keys(next)[0] || null;
      persist(next, other);
      setActiveRole(other);
      return next;
    });
  }, []);

  const switchRole = useCallback((role) => {
    setActiveRole(role);
    setSessions((s) => {
      persist(s, role);
      return s;
    });
  }, []);

  return (
    <SessionContext.Provider value={{ sessions, ready, activeRole, signIn, update, signOut, switchRole }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(role) {
  const ctx = useContext(SessionContext);
  return {
    ...ctx,
    user: role ? ctx.sessions[role]?.user || null : null,
    signOut: () => ctx.signOut(role),
    update: (patch) => ctx.update(role, patch),
  };
}
