import { createContext, useState, useCallback, useEffect, useRef } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

const DRAFT_PREFIX = "certapp.draft.";

export const AppDataContext = createContext(null);

export function saveDraft(username, data) {
  if (!username) return;
  try {
    localStorage.setItem(
      DRAFT_PREFIX + username,
      JSON.stringify({ ...data, savedAt: new Date().toISOString() }),
    );
  } catch {}
}

export function getDraft(username) {
  if (!username) return null;
  try {
    const raw = localStorage.getItem(DRAFT_PREFIX + username);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft(username) {
  if (!username) return;
  try {
    localStorage.removeItem(DRAFT_PREFIX + username);
  } catch {

  }
}

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const esRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setApplications([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const collection = await api.applications();
      setApplications(collection.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);


  useEffect(() => {
    if (!user) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }
    const es = new EventSource("/api/v1/events", { withCredentials: true });
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "application_update") refresh();
      } catch {}
    };
    es.onerror = () => {
      es.close();

      setTimeout(() => {
        if (user) {
          const next = new EventSource("/api/v1/events", { withCredentials: true });
          esRef.current = next;
          next.onmessage = es.onmessage;
          next.onerror = es.onerror;
        }
      }, 5000);
    };
    return () => {
      es.close();
      esRef.current = null;
    };
  }, [user, refresh]);


  const addApplication = useCallback(
    async ({ files, ...data }) => {
      const fd = new FormData();
      fd.append("data", JSON.stringify(data));
      if (files?.photo) fd.append("photo", files.photo);
      if (files?.education) fd.append("education", files.education);
      if (files?.competency) fd.append("competency", files.competency);
      if (files?.tradeLicense) fd.append("tradeLicense", files.tradeLicense);
      if (files?.faydaFront) fd.append("faydaFront", files.faydaFront);
      if (files?.faydaBack) fd.append("faydaBack", files.faydaBack);
      if (files?.existingCertificate)
        fd.append("existingCertificate", files.existingCertificate);
      if (files?.others?.length) {
        files.others.forEach((f) => fd.append("others", f));
      }

      const created = await api.submitApplication(fd);
      setApplications((prev) => [created, ...prev]);
      clearDraft(user?.username);
      return created;
    },
    [user],
  );

  const withdrawApplication = useCallback(async (id) => {
    const updated = await api.withdrawApplication(id);
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const updateApplication = useCallback(async (id, patch) => {
    const updated = await api.updateApplication(id, patch);
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const staffDecide = useCallback(async (id, decision, reason) => {
    const updated = await api.decide(id, decision, reason);
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const adminDecide = useCallback(async (id, decision, reason) => {
    const updated = await api.decide(id, decision, reason);
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const generateCertificate = useCallback(async (id) => {
    const updated = await api.generateCertificate(id);
    setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const value = {
    applications,
    loading,
    error,
    refresh,
    addApplication,
    withdrawApplication,
    updateApplication,
    staffDecide,
    adminDecide,
    generateCertificate,
    getById: (id) => applications.find((a) => a.id === id) || null,
    saveDraft,
    getDraft,
    clearDraft,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}
