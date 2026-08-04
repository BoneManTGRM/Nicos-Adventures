import { useEffect, useMemo, useRef, useState } from "react";
import { createProfile, exportProfile, importProfile } from "../storage";
import type { Language, LocalProfile, LocalSaveStore } from "../types";
import type { Announce, UpdateProfile } from "./common";

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 ** 2).toFixed(1)} MB`;
}

export function Settings({
  store,
  profile,
  setStore,
  update,
  announce,
}: {
  store: LocalSaveStore;
  profile: LocalProfile;
  setStore: (store: LocalSaveStore) => void;
  update: UpdateProfile;
  announce: Announce;
}) {
  const language = profile.language;
  const [newName, setNewName] = useState("");
  const [renameValue, setRenameValue] = useState(profile.playerName);
  const [status, setStatus] = useState("");
  const [storageEstimate, setStorageEstimate] = useState<{ usage?: number; quota?: number }>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const localBytes = useMemo(() => new TextEncoder().encode(JSON.stringify(store)).byteLength, [store]);

  useEffect(() => setRenameValue(profile.playerName), [profile.id, profile.playerName]);
  useEffect(() => {
    if (!("storage" in navigator) || typeof navigator.storage.estimate !== "function") return;
    void navigator.storage.estimate().then((estimate) => setStorageEstimate({ usage: estimate.usage, quota: estimate.quota })).catch(() => undefined);
  }, [store]);

  const download = () => {
    const blob = new Blob([exportProfile(profile)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nicos-world-${profile.playerName.replace(/[^a-z0-9-]+/gi, "-").toLowerCase() || "profile"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(language === "es-MX" ? "Respaldo descargado." : "Backup downloaded.");
    announce(language === "es-MX" ? "Respaldo descargado." : "Backup downloaded.");
  };

  const addProfile = () => {
    if (!newName.trim()) return;
    const next = createProfile(newName, language);
    setStore({ ...store, activeProfileId: next.id, profiles: [...store.profiles, next].slice(-12) });
    setNewName("");
    setStatus(language === "es-MX" ? "Perfil agregado." : "Profile added.");
    announce(language === "es-MX" ? `${next.playerName}: perfil agregado.` : `${next.playerName}: profile added.`);
  };

  const rename = () => {
    const clean = renameValue.trim().slice(0, 24);
    if (!clean || clean === profile.playerName) return;
    update({ ...profile, playerName: clean });
    setStatus(language === "es-MX" ? "Perfil renombrado." : "Profile renamed.");
    announce(language === "es-MX" ? `Perfil renombrado a ${clean}.` : `Profile renamed to ${clean}.`);
  };

  const deleteProfile = () => {
    if (store.profiles.length <= 1) {
      setStatus(language === "es-MX" ? "Debe quedar al menos un perfil." : "At least one profile must remain.");
      return;
    }
    if (!window.confirm(language === "es-MX" ? `¿Eliminar el perfil de ${profile.playerName}?` : `Delete ${profile.playerName}'s profile?`)) return;
    const profiles = store.profiles.filter((item) => item.id !== profile.id);
    const next = profiles[0];
    setStore({ ...store, profiles, activeProfileId: next.id });
    setStatus(language === "es-MX" ? "Perfil eliminado." : "Profile deleted.");
    announce(language === "es-MX" ? "Perfil eliminado." : "Profile deleted.");
  };

  const restore = async (file: File) => {
    try {
      const imported = importProfile(await file.text());
      setStore({ ...store, activeProfileId: imported.id, profiles: [...store.profiles, imported].slice(-12) });
      setStatus(language === "es-MX" ? "Perfil restaurado correctamente." : "Profile restored successfully.");
      announce(language === "es-MX" ? "Perfil restaurado correctamente." : "Profile restored successfully.");
    } catch {
      setStatus(language === "es-MX" ? "No se pudo restaurar ese archivo." : "That file could not be restored.");
      announce(language === "es-MX" ? "No se pudo restaurar ese archivo." : "That file could not be restored.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const privacyCards = [
    { emoji: "🔒", en: "Profiles stay in this browser.", es: "Los perfiles permanecen en este navegador." },
    { emoji: "🚫", en: "No accounts, ads, or analytics.", es: "Sin cuentas, anuncios ni analítica." },
    { emoji: "🎬", en: "Videos download locally and are not stored in the profile.", es: "Los videos se descargan localmente y no se guardan en el perfil." },
    { emoji: "🧠", en: "Ask Nico uses a built-in local knowledge library.", es: "Pregúntale a Nico usa una biblioteca local integrada." },
  ];

  return (
    <div className="settings-system">
      <section className="settings-card" aria-labelledby="settings-language-heading">
        <header><span aria-hidden="true">🌐</span><div><small>{language === "es-MX" ? "Presentación" : "Presentation"}</small><h2 id="settings-language-heading">{language === "es-MX" ? "Idioma" : "Language"}</h2></div></header>
        <label>
          {language === "es-MX" ? "Idioma de la interfaz" : "Interface language"}
          <select value={language} onChange={(event) => {
            const next = event.target.value as Language;
            update({ ...profile, language: next });
            announce(next === "es-MX" ? "Idioma cambiado." : "Language changed.");
          }}>
            <option value="en">English</option>
            <option value="es-MX">Español de México</option>
          </select>
        </label>
      </section>

      <section className="settings-card" aria-labelledby="settings-profile-heading">
        <header><span aria-hidden="true">👤</span><div><small>{store.profiles.length}/12</small><h2 id="settings-profile-heading">{language === "es-MX" ? "Perfiles locales" : "Local profiles"}</h2></div></header>
        <label>
          {language === "es-MX" ? "Perfil activo" : "Active profile"}
          <select value={profile.id} onChange={(event) => setStore({ ...store, activeProfileId: event.target.value })}>
            {store.profiles.map((item) => <option key={item.id} value={item.id}>{item.playerName}</option>)}
          </select>
        </label>
        <div className="settings-inline-form">
          <label>{language === "es-MX" ? "Cambiar nombre" : "Rename profile"}<input value={renameValue} maxLength={24} onChange={(event) => setRenameValue(event.target.value)} /></label>
          <button type="button" onClick={rename} disabled={!renameValue.trim() || renameValue.trim() === profile.playerName}>{language === "es-MX" ? "Guardar nombre" : "Save name"}</button>
        </div>
        <div className="settings-inline-form">
          <label>{language === "es-MX" ? "Nuevo amigo" : "New friend"}<input value={newName} maxLength={24} onChange={(event) => setNewName(event.target.value)} /></label>
          <button type="button" onClick={addProfile} disabled={!newName.trim()}>＋ {language === "es-MX" ? "Agregar perfil" : "Add profile"}</button>
        </div>
        <button type="button" className="danger" onClick={deleteProfile} disabled={store.profiles.length <= 1}>🗑️ {language === "es-MX" ? "Eliminar perfil activo" : "Delete active profile"}</button>
      </section>

      <section className="settings-card" aria-labelledby="settings-backup-heading">
        <header><span aria-hidden="true">💾</span><div><small>{formatBytes(localBytes)}</small><h2 id="settings-backup-heading">{language === "es-MX" ? "Respaldo y almacenamiento" : "Backup and storage"}</h2></div></header>
        <p>{language === "es-MX" ? "Descarga un respaldo antes de borrar datos del navegador o cambiar de dispositivo." : "Download a backup before clearing browser data or changing devices."}</p>
        <div className="storage-meter">
          <div><span>{language === "es-MX" ? "Tamaño del perfil" : "Profile size"}</span><strong>{formatBytes(localBytes)}</strong></div>
          {storageEstimate.usage !== undefined && storageEstimate.quota !== undefined && <><progress max={storageEstimate.quota} value={storageEstimate.usage}>{storageEstimate.usage}/{storageEstimate.quota}</progress><small>{formatBytes(storageEstimate.usage)} / {formatBytes(storageEstimate.quota)}</small></>}
        </div>
        <div className="fw-action-row">
          <button type="button" onClick={download}>⬇️ {language === "es-MX" ? "Descargar respaldo" : "Download backup"}</button>
          <button type="button" onClick={() => fileInput.current?.click()}>⬆️ {language === "es-MX" ? "Restaurar respaldo" : "Restore backup"}</button>
        </div>
        <input hidden ref={fileInput} type="file" accept=".json,application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void restore(file); }} />
      </section>

      <section className="settings-card settings-privacy-card" aria-labelledby="settings-privacy-heading">
        <header><span aria-hidden="true">🛡️</span><div><small>{language === "es-MX" ? "Privacidad por diseño" : "Privacy by design"}</small><h2 id="settings-privacy-heading">{language === "es-MX" ? "Cómo se protegen los datos" : "How data is protected"}</h2></div></header>
        <div className="privacy-grid">
          {privacyCards.map((card) => <article key={card.en}><span aria-hidden="true">{card.emoji}</span><p>{language === "es-MX" ? card.es : card.en}</p></article>)}
        </div>
      </section>

      {status && <p className="settings-status" role="status">{status}</p>}
    </div>
  );
}
