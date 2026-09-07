import { useState } from 'react';
import type { LocalProfile, MovieProject } from '../types';
import type { UpdateProfile } from './common';
import { ShowtimeStudio } from '../showtime/ShowtimeStudio';
import '../showtime/showtime.css';
export function HomeTheater({ profile, update }: { profile: LocalProfile; update: UpdateProfile }) {
  const [selected, setSelected] = useState<MovieProject | null>(profile.movieProjects.at(-1) ?? null);
  const es = profile.language === 'es-MX';
  return <section aria-label={es ? 'Televisión de casa' : 'Home television'}>
    <div className="fw-action-row">{profile.movieProjects.map(project => <button key={project.id} aria-pressed={selected?.id === project.id} onClick={() => setSelected(project)}>▶ {project.title}</button>)}<button onClick={() => setSelected(null)}>＋ {es ? 'Nueva película' : 'New movie'}</button></div>
    <ShowtimeStudio key={selected?.id ?? 'new'} profile={profile} initialProject={selected}
      onProjectSaved={project => { update({ ...profile, movieProjects: [...profile.movieProjects.filter(item => item.id !== project.id), project].slice(-40) }); setSelected(project); }}
      onProjectDownloaded={(id, mime) => update({ ...profile, movieProjects: profile.movieProjects.map(item => item.id === id ? { ...item, lastDownloadedAt: new Date().toISOString(), lastMimeType: mime } : item) })} />
  </section>;
}
