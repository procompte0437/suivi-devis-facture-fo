export function Gantt({ tasks = [], start, end }) {
  const dated = tasks.filter((task) => task.title && task.start_date && task.end_date);
  if (!dated.length) {
    return <p className="muted">Ajoutez des tâches avec un début et une fin pour dessiner le planning.</p>;
  }

  const stamps = dated.flatMap((task) => [task.start_date, task.end_date]).concat([start, end].filter(Boolean));
  const min = stamps.reduce((left, value) => (value < left ? value : left));
  const max = stamps.reduce((left, value) => (value > left ? value : left));
  const span = Math.max(1, days(min, max));
  const today = new Date().toISOString().slice(0, 10);
  const todayLeft = clamp(((days(min, today)) / span) * 100);

  return (
    <div className="gantt" role="img" aria-label="Diagramme de Gantt">
      <div className="gantt-scale"><span>{format(min)}</span><span>Aujourd’hui</span><span>{format(max)}</span></div>
      {dated.map((task, index) => {
        const left = (days(min, task.start_date) / span) * 100;
        const width = Math.max(2, (Math.max(1, days(task.start_date, task.end_date)) / span) * 100);
        return (
          <div className="gantt-row" key={`${task.title}-${index}`}>
            <div>
              <b>{task.title}</b>
              <small>{task.staff_name || 'Non assignée'}</small>
            </div>
            <div className="gantt-track">
              <span className="gantt-today" style={{ left: `${todayLeft}%` }} />
              <span className="gantt-bar" style={{ left: `${left}%`, width: `${width}%` }}>
                <i style={{ width: `${Number(task.progress) || 0}%` }} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function days(from, to) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  return Math.round((end - start) / 86400000);
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function format(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
