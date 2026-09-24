import { createContext, useContext, useState, useCallback } from "react";

// One session per role, so judges can switch Artisan ⇄ Buyer ⇄ Admin without re-logging.
const KEY = "shilpsaathi.sessions";

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};
const write = (v) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* storage unavailable (private mode) — sessions stay in memory */
  }
};

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [sessions, setSessions] = useState(read);

  const signIn = useCallback((role, user, token) => {
    setSessions((s) => {
      const next = { ...s, [role]: { user, token } };
      write(next);
      return next;
    });
  }, []);

  const updateUser = useCallback((role, patch) => {
    setSessions((s) => {
      if (!s[role]) return s;
      const next = { ...s, [role]: { ...s[role], user: { ...s[role].user, ...patch } } };
      write(next);
      return next;
    });
  }, []);

  const signOut = useCallback((role) => {
    setSessions((s) => {
      const next = { ...s };
      delete next[role];
      write(next);
      return next;
    });
  }, []);

  return (
    <SessionContext.Provider value={{ sessions, signIn, signOut, updateUser }}>{children}</SessionContext.Provider>
  );
}

export function useSession(role) {
  const ctx = useContext(SessionContext);
  return {
    user: ctx.sessions[role]?.user || null,
    sessions: ctx.sessions,
    signIn: ctx.signIn,
    signOut: () => ctx.signOut(role),
    update: (patch) => ctx.updateUser(role, patch),
  };
}
