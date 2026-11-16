import { formatDate, money } from '../format';
import { addDays, diff, toISO } from './Gantt';

/*
 * Lecture instantanée d'un projet, calculée à partir de la fiche :
 * santé du planning, fin projetée, budget, facturation, charge de l'équipe, alertes.
 */
export function ProjectInsights({ form, project, staff = [], currency = 'XAF' }) {
  const today = toISO(new Date());
  const tasks = (form.tasks || []).filter((task) => task.title && task.start_date && task.end_date);
  const milestones = (form.milestones || []).filter((item) => item.title);

  // Avancement : pondéré par la durée des tâches s'il y en a, sinon celui saisi.
  const weights = tasks.map((task) => Math.max(1, diff(task.start_date, task.end_date) + 1));
  const weighted = tasks.length
    ? Math.round(tasks.reduce((sum, task, index) => sum + (Number(task.progress) || 0) * weights[index], 0) / weights.reduce((a, b) => a + b, 0))
    : Number(form.progress) || 0;
  const progress = Math.max(0, Math.min(100, weighted));

  // Temps écoulé sur la période prévue.
  const start = form.start_date || tasks.map((task) => task.start_date).sort()[0];
  const end = form.due_date || tasks.map((task) => task.end_date).sort().at(-1);
  const span = start && end ? Math.max(1, diff(start, end)) : 0;
  const elapsed = span ? Math.max(0, Math.min(100, Math.round((diff(start, today) / span) * 100))) : 0;
  const gap = progress - elapsed;
  const closed = ['livre', 'clos'].includes(form.status);
  const health = closed ? ['ok', 'Projet livré'] : !span ? ['info', 'Dates à compléter'] : gap >= 5 ? ['ok', 'En avance'] : gap >= -10 ? ['ok', 'Dans les temps'] : ['warn', 'En retard'];

  // Fin projetée au rythme actuel.
  const started = start && start <= today ? diff(start, today) : 0;
  const projected = !closed && start && progress > 0 && progress < 100 && started > 0
    ? addDays(start, Math.round(started / (progress / 100)))
    : null;
  const slip = projected && end ? diff(end, projected) : 0;

  // Budget : postes saisis, sinon budget global.
  const lines = (form.budget_lines || []).filter((line) => line.label);
  const planned = lines.length ? lines.reduce((sum, line) => sum + Number(line.planned || 0), 0) : Number(form.budget || 0);
  const spent = lines.reduce((sum, line) => sum + Number(line.spent || 0), 0);
  const used = planned > 0 ? Math.round((spent / planned) * 100) : 0;

  // Facturation liée au projet.
  const invoices = (project?.invoices || []).filter((invoice) => invoice.status !== 'annulee');
  const billed = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const paid = invoices.reduce((sum, invoice) => sum + Number(invoice.amount_paid || 0), 0);
  const reference = Number(form.budget || 0) || planned;
  const billedShare = reference > 0 ? Math.min(100, Math.round((billed / reference) * 100)) : 0;

  // Charge par personne (jours de tâche) et avancement moyen.
  const people = {};
  tasks.forEach((task, index) => {
    const name = staff.find((member) => String(member.id) === String(task.staff_id))?.name || task.staff_name || 'Non assignée';
    people[name] ??= { days: 0, done: 0, count: 0 };
    people[name].days += weights[index];
    people[name].done += Number(task.progress) || 0;
    people[name].count += 1;
  });
  const load = Object.entries(people).sort((a, b) => b[1].days - a[1].days);
  const heaviest = load[0]?.[1].days || 1;

  // Alertes.
  const late = tasks.filter((task) => (Number(task.progress) || 0) < 100 && task.end_date < today);
  const missed = milestones.filter((item) => !item.done && item.due_date && toISO(item.due_date) < today);
  const next = milestones.filter((item) => !item.done && item.due_date && toISO(item.due_date) >= today)
    .sort((a, b) => toISO(a.due_date).localeCompare(toISO(b.due_date)))[0];
  const alerts = [
    ...late.map((task) => `Tâche en retard : ${task.title}`),
    ...missed.map((item) => `Jalon dépassé : ${item.title}`),
    ...(used > progress + 15 && planned > 0 ? [`Dépenses à ${used} % pour un avancement de ${progress} %`] : []),
    ...(slip > 0 ? [`Au rythme actuel, fin prévue avec ${slip} jour${slip > 1 ? 's' : ''} de retard`] : []),
  ];

  return (
    <section className="px" aria-label="Lecture du projet">
      <article className="px-card">
        <span>Santé du planning</span>
        <strong>{progress} %</strong>
        <div className="px-meter" title={`Avancement ${progress} % · temps écoulé ${elapsed} %`}>
          <i style={{ width: `${progress}%` }} />
          {span ? <b style={{ left: `${elapsed}%` }} /> : null}
        </div>
        <p>{span ? `${elapsed} % du temps écoulé` : 'Renseignez le début et la fin'}{tasks.length ? ' · pondéré par la durée des tâches' : ''}</p>
        <em className={`px-badge ${health[0]}`}>{health[1]}</em>
      </article>

      <article className="px-card">
        <span>Fin du projet</span>
        <strong>{formatDate(end)}</strong>
        <p>
          {projected ? `Projection au rythme actuel : ${formatDate(projected)}` : closed ? 'Projet terminé' : 'Projection disponible dès le premier avancement'}
        </p>
        {next ? <em className="px-badge info">Prochain jalon · {next.title} · {formatDate(next.due_date)}</em> : null}
      </article>

      <article className="px-card">
        <span>Budget consommé</span>
        <strong>{planned > 0 ? `${used} %` : '—'}</strong>
        <div className="px-meter"><i style={{ width: `${Math.min(100, used)}%`, background: used > 100 ? 'linear-gradient(90deg, #b4532a, #d27a4f)' : undefined }} /></div>
        <p>{money(spent, currency)} dépensés sur {money(planned, currency)} · reste {money(Math.max(0, planned - spent), currency)}</p>
      </article>

      <article className="px-card">
        <span>Facturation</span>
        <strong>{money(billed, currency)}</strong>
        <div className="px-meter"><i style={{ width: `${billedShare}%` }} /></div>
        <p>{billedShare} % du budget facturé · {money(paid, currency)} encaissés{billed > paid ? ` · ${money(billed - paid, currency)} à recevoir` : ''}</p>
      </article>

      <article className="px-card px-wide">
        <span>Charge de l’équipe</span>
        {load.length ? (
          <div className="px-load">
            {load.map(([name, item]) => (
              <div key={name}>
                <em>{name}</em>
                <span><i style={{ width: `${Math.round((item.days / heaviest) * 100)}%` }} /></span>
                <b>{item.days} j · {Math.round(item.done / item.count)} %</b>
              </div>
            ))}
          </div>
        ) : <p>Assignez des tâches datées pour voir la répartition.</p>}
      </article>

      <article className="px-card px-wide">
        <span>Points d’attention</span>
        <ul className="px-alerts">
          {alerts.length ? alerts.slice(0, 5).map((text) => <li key={text}>{text}</li>) : <li className="ok">Rien à signaler : tâches, jalons et budget sont dans les temps.</li>}
        </ul>
      </article>
    </section>
  );
}
