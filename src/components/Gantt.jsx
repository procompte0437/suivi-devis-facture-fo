import { useEffect, useMemo, useRef, useState } from 'react';
import { initials } from '../format';

/*
 * Diagramme de Gantt de DOUKOU.
 * - échelle mois / semaines / jours, trois niveaux de zoom (ajusté, semaines, mois) ;
 * - barres déplaçables et redimensionnables (si onChange est fourni) ;
 * - jalons en losange, ligne du jour, période du projet, retards signalés.
 */

const DAY = 86400000;
const ZOOMS = [
  ['fit', 'Ajusté'],
  ['week', 'Semaines'],
  ['month', 'Mois'],
];
const LABEL_WIDTH = 230;

export function Gantt({ tasks = [], milestones = [], start, end, onChange, emptyText, label = 'Tâche' }) {
  const [zoom, setZoom] = useState('fit');
  const [drag, setDrag] = useState(null);
  const [width, setWidth] = useState(800);
  const box = useRef(null);
  const today = toISO(new Date());

  useEffect(() => {
    if (!box.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);

  const rows = tasks
    .map((task, index) => ({ ...task, index }))
    .filter((task) => task.title && task.start_date && task.end_date);
  const marks = milestones.filter((item) => item.title && item.due_date);

  const range = useMemo(() => {
    const stamps = rows.flatMap((task) => [task.start_date, task.end_date])
      .concat(marks.map((item) => toISO(item.due_date)))
      .concat([start, end, today].filter(Boolean));
    if (!stamps.length) return null;
    const min = addDays(stamps.reduce((a, b) => (b < a ? b : a)), -3);
    const max = addDays(stamps.reduce((a, b) => (b > a ? b : a)), 4);
    return { min, max, days: Math.max(7, diff(min, max)) };
  }, [rows, marks, start, end, today]);

  if (!rows.length && !marks.length) {
    return <p className="muted gantt-empty">{emptyText || 'Ajoutez des tâches avec une date de début et de fin : le planning se dessine ici.'}</p>;
  }

  const area = Math.max(320, width - LABEL_WIDTH - 2);
  const perDay = zoom === 'week' ? 30 : zoom === 'month' ? 9 : area / range.days;
  const total = Math.max(area, range.days * perDay);
  const x = (iso) => diff(range.min, iso) * perDay;

  const months = monthBands(range.min, range.max).map((band) => ({ ...band, left: x(band.from), width: (diff(band.from, band.to) + 1) * perDay }));
  const ticks = tickDays(range.min, range.max, perDay);

  // Glisser-déposer : on calcule le décalage en jours pendant le mouvement.
  function startDrag(event, task, mode) {
    if (!onChange) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDrag({ index: task.index, mode, originX: event.clientX, start: task.start_date, end: task.end_date, delta: 0 });
  }
  function moveDrag(event) {
    if (!drag) return;
    const delta = Math.round((event.clientX - drag.originX) / perDay);
    if (delta !== drag.delta) setDrag({ ...drag, delta });
  }
  function endDrag() {
    if (!drag) return;
    const next = draggedDates(drag);
    if (drag.delta !== 0) onChange(drag.index, next);
    setDrag(null);
  }

  return (
    <div className="gx" ref={box}>
      <div className="gx-tools">
        <div className="gx-zoom" role="radiogroup" aria-label="Échelle">
          {ZOOMS.map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={zoom === value} className={zoom === value ? 'on' : ''} onClick={() => setZoom(value)}>{label}</button>
          ))}
        </div>
        <ul className="gx-legend">
          <li><i className="lg-run" />En cours</li>
          <li><i className="lg-done" />Terminé</li>
          <li><i className="lg-late" />En retard</li>
          <li><i className="lg-ms" />Jalon</li>
        </ul>
        {onChange ? <span className="gx-hint">Glissez une barre pour la déplacer, tirez un bord pour changer la durée.</span> : null}
      </div>

      <div className="gx-scroll">
        <div className="gx-grid" style={{ width: LABEL_WIDTH + total }} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
          <div className="gx-head">
            <div className="gx-corner" style={{ width: LABEL_WIDTH }}>{label}</div>
            <div className="gx-timeline" style={{ width: total }}>
              <div className="gx-months">
                {months.map((band) => <span key={band.from} style={{ left: band.left, width: band.width }}>{band.label}</span>)}
              </div>
              <div className="gx-ticks">
                {ticks.map((tick) => (
                  <span key={tick.iso} className={tick.weekend ? 'we' : ''} style={{ left: x(tick.iso), width: tick.span * perDay }}>{tick.label}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="gx-body">
            <div className="gx-canvas" style={{ left: LABEL_WIDTH, width: total }} aria-hidden="true">
              {perDay >= 14 ? ticks.filter((tick) => tick.weekend).map((tick) => <span key={tick.iso} className="gx-we" style={{ left: x(tick.iso), width: perDay }} />) : null}
              {start && end ? <span className="gx-window" style={{ left: x(start), width: Math.max(perDay, (diff(start, end) + 1) * perDay) }} /> : null}
              <span className="gx-today" style={{ left: x(today) + perDay / 2 }}><em>Aujourd’hui</em></span>
            </div>

            {marks.length ? (
              <div className="gx-row gx-ms-row">
                <div className="gx-label" style={{ width: LABEL_WIDTH }}><b>Jalons</b><small>{marks.filter((item) => item.done).length} sur {marks.length} atteints</small></div>
                <div className="gx-lane" style={{ width: total }}>
                  {marks.map((item, markIndex) => (
                    <span key={`${item.title}${item.due_date}`} data-label={labelFits(marks, markIndex, x) ? 'show' : 'hide'} className={`gx-ms${item.done ? ' done' : ''}${!item.done && toISO(item.due_date) < today ? ' late' : ''}`} style={{ left: x(toISO(item.due_date)) + perDay / 2 }} title={`${item.title} · ${pretty(toISO(item.due_date))}${item.done ? ' · atteint' : ''}`}>
                      <i />
                      <small>{item.title}</small>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {rows.map((task) => {
              const live = drag && drag.index === task.index ? draggedDates(drag) : { start_date: task.start_date, end_date: task.end_date };
              const progress = Math.max(0, Math.min(100, Number(task.progress) || 0));
              const late = progress < 100 && live.end_date < today;
              const state = progress >= 100 ? 'done' : late ? 'late' : 'run';
              const left = x(live.start_date);
              const barWidth = Math.max(perDay, (diff(live.start_date, live.end_date) + 1) * perDay);
              return (
                <div className="gx-row" key={task.index}>
                  <div className="gx-label" style={{ width: LABEL_WIDTH }}>
                    <span className="gx-avatar" title={task.staff_name || 'Non assignée'}>{task.staff_name ? initials(task.staff_name) : '·'}</span>
                    <span>
                      <b>{task.title}</b>
                      <small>{task.staff_name || 'Non assignée'} · {diff(live.start_date, live.end_date) + 1} j</small>
                    </span>
                  </div>
                  <div className="gx-lane" style={{ width: total }}>
                    <div
                      className={`gx-bar ${state}${onChange ? ' editable' : ''}${drag?.index === task.index ? ' dragging' : ''}`}
                      style={{ left, width: barWidth }}
                      title={`${task.title} · ${pretty(live.start_date)} → ${pretty(live.end_date)} · ${progress} %`}
                      onPointerDown={(event) => startDrag(event, task, 'move')}
                    >
                      <span className="gx-fill" style={{ width: `${progress}%` }} />
                      {barWidth > 54 ? <span className="gx-text">{progress} %</span> : null}
                      {onChange ? (
                        <>
                          <span className="gx-handle l" onPointerDown={(event) => { event.stopPropagation(); startDrag(event, task, 'start'); }} />
                          <span className="gx-handle r" onPointerDown={(event) => { event.stopPropagation(); startDrag(event, task, 'end'); }} />
                        </>
                      ) : null}
                    </div>
                    {drag?.index === task.index ? (
                      <span className="gx-tip" style={{ left }}>{pretty(live.start_date)} → {pretty(live.end_date)}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Un libellé de jalon n'est affiché que s'il ne chevauche pas le précédent.
function labelFits(marks, index, x) {
  const sorted = marks.map((item, i) => ({ i, left: x(toISO(item.due_date)) })).sort((a, b) => a.left - b.left);
  let last = -Infinity;
  for (const mark of sorted) {
    const fits = mark.left - last >= 96;
    if (fits) last = mark.left;
    if (mark.i === index) return fits;
  }
  return true;
}

function draggedDates(drag) {
  if (drag.mode === 'move') return { start_date: addDays(drag.start, drag.delta), end_date: addDays(drag.end, drag.delta) };
  if (drag.mode === 'start') {
    const next = addDays(drag.start, drag.delta);
    return { start_date: next > drag.end ? drag.end : next, end_date: drag.end };
  }
  const next = addDays(drag.end, drag.delta);
  return { start_date: drag.start, end_date: next < drag.start ? drag.start : next };
}

function monthBands(min, max) {
  const bands = [];
  let cursor = min;
  while (cursor <= max) {
    const date = parse(cursor);
    const last = toISO(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    const to = last < max ? last : max;
    const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    bands.push({ from: cursor, to, label: label.charAt(0).toUpperCase() + label.slice(1) });
    cursor = addDays(to, 1);
  }
  return bands;
}

function tickDays(min, max, perDay) {
  const ticks = [];
  if (perDay >= 14) {
    for (let cursor = min; cursor <= max; cursor = addDays(cursor, 1)) {
      const date = parse(cursor);
      ticks.push({ iso: cursor, span: 1, label: date.getDate(), weekend: [0, 6].includes(date.getDay()) });
    }
    return ticks;
  }
  // Semaines (lundis) quand l'échelle est serrée.
  let cursor = min;
  while (parse(cursor).getDay() !== 1) cursor = addDays(cursor, 1);
  for (; cursor <= max; cursor = addDays(cursor, 7)) {
    const weekendDay = parse(cursor);
    ticks.push({ iso: cursor, span: 7, label: perDay * 7 >= 34 ? `${weekendDay.getDate()}/${weekendDay.getMonth() + 1}` : '', weekend: false });
    ticks.push({ iso: addDays(cursor, 5), span: 0, label: '', weekend: true });
  }
  return ticks.filter((tick) => tick.span > 0);
}

function parse(iso) {
  return new Date(`${String(iso).slice(0, 10)}T00:00:00`);
}

export function toISO(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

export function addDays(iso, count) {
  const date = parse(iso);
  date.setDate(date.getDate() + count);
  return toISO(date);
}

export function diff(from, to) {
  return Math.round((parse(to) - parse(from)) / DAY);
}

function pretty(iso) {
  return parse(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
