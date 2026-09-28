import type { LessonItem } from './lessons';
import type { Language } from '../types';

/** Decorations repeat authored values; the equivalent lesson text remains visible. */
export function LessonVisual({ item, language }: { item: LessonItem; language: Language }) {
 const diagram = item.diagram;
 return <div className="learning-visual">
  {diagram && <div className="learning-diagram" aria-hidden="true">
   {diagram.kind === 'groups' ? diagram.groups.map((amount, index) => <div className="learning-object-group" key={index}>
    <div className="learning-objects">{Array.from({length:amount}, (_, i) => <span className="learning-object" key={i}>●</span>)}</div>
    {diagram.operation && <strong>{index === 0 ? diagram.operation : '= ?'}</strong>}
   </div>) : diagram.rows.map((row, index) => <div className="learning-tile-row" key={index}>{row.map((token, i) => <span className="learning-tile" data-symbol={token} key={i}>{({red:'●', blue:'●',circle:'○',triangle:'△',square:'□'} as Record<string,string>)[token] ?? token}</span>)}</div>)}
  </div>}
  <div className={/^●(?: ●)*$/.test(item.visual[language]) ? "learning-visual-text--assistive" : undefined}>{item.visual[language]}</div>
 </div>;
}
