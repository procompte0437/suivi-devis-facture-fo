import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorText } from '../api';
import { dateInput, INVOICE_STATUS, PROJECT_STATUS, QUOTE_STATUS, todayISO } from '../format';
import { Banner, Field, Loading, Pill } from '../components/ui';
import { Gantt } from '../components/Gantt';

const EMPTY = {
  client_id: '',
  manager_id: '',
  name: '',
  description: '',
  status: 'cadrage',
  progress: 0,
  budget: 0,
  start_date: todayISO(),
  due_date: todayISO(45),
  milestones: [
    { title: 'Cadrage', due_date: '', done: false },
    { title: 'Production', due_date: '', done: false },
    { title: 'Livraison', due_date: '', done: false },
  ],
  tasks: [{ title: '', staff_id: '', start_date: '', end_date: '', progress: 0 }],
  budget_lines: [{ label: '', planned: '', spent: '' }],
};

export default function ProjectDetail() {
  const { id } = useParams();
  const isNew = !id || id === 'nouveau';
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [project, setProject] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api('/clients').then(setClients).catch((err) => setError(errorText(err)));
    api('/team').then(setUsers).catch(() => setUsers([]));
    api('/staff').then(setStaff).catch(() => setStaff([]));
  }, []);

  useEffect(() => {
    if (isNew) {
      setReady(true);
      return;
    }
    api(`/projects/${id}`)
      .then((data) => {
        setProject(data);
        setForm({
          client_id: data.client_id,
          manager_id: data.manager_id || '',
          name: data.name,
          description: data.description || '',
          status: data.status,
          progress: data.progress,
          budget: data.budget,
          start_date: dateInput(data.start_date),
          due_date: dateInput(data.due_date),
          milestones: data.milestones?.length ? data.milestones : EMPTY.milestones,
          tasks: data.tasks?.length ? data.tasks.map((task) => ({
            title: task.title,
            staff_id: task.staff_id || '',
            start_date: dateInput(task.start_date),
            end_date: dateInput(task.end_date),
            progress: task.progress || 0,
          })) : EMPTY.tasks,
          budget_lines: (data.budget_lines || data.budgetLines)?.length ? (data.budget_lines || data.budgetLines) : EMPTY.budget_lines,
        });
      })
      .catch((err) => setError(errorText(err)))
      .finally(() => setReady(true));
  }, [id, isNew]);

  function setMilestone(index, patch) {
    setForm({
      ...form,
      milestones: form.milestones.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    });
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    const payload = {
      ...form,
      client_id: Number(form.client_id),
      manager_id: form.manager_id ? Number(form.manager_id) : null,
      progress: Number(form.progress),
      budget: Number(form.budget || 0),
      milestones: form.milestones.filter((item) => item.title.trim()),
      tasks: form.tasks.filter((item) => item.title.trim()).map((item) => ({
        ...item,
        staff_id: item.staff_id ? Number(item.staff_id) : null,
        progress: Number(item.progress || 0),
      })),
      budget_lines: form.budget_lines.filter((item) => item.label.trim()).map((item) => ({
        label: item.label,
        planned: Number(item.planned || 0),
        spent: Number(item.spent || 0),
      })),
    };
    try {
      const saved = isNew
        ? await api('/projects', { method: 'POST', body: payload })
        : await api(`/projects/${id}`, { method: 'PUT', body: payload });
      setNotice('Projet enregistré.');
      if (isNew) navigate(`/projets/${saved.id}`, { replace: true });
      else setProject(saved);
    } catch (err) {
      setError(errorText(err));
    }
  }

  if (!ready) return <Loading inline label="Ouverture du projet" />;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker"><Link to="/projets">Projets</Link> {project ? `· ${project.code}` : ''}</p>
          <h1>{form.name || 'Nouveau projet'}</h1>
        </div>
        {project ? <Pill status={project.status} map={PROJECT_STATUS} /> : null}
      </header>
      <div className="stack" style={{ marginBottom: 12 }}>
        <Banner>{error}</Banner>
        <Banner tone="ok">{notice}</Banner>
      </div>
      <form className="studio" onSubmit={save}>
        <div className="editor">
          <div className="card fields">
            <Field label="Client">
              <select value={form.client_id} onChange={(event) => setForm({ ...form, client_id: event.target.value })} required>
                <option value="">Choisir</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}
              </select>
            </Field>
            <Field label="Pilote">
              <select value={form.manager_id} onChange={(event) => setForm({ ...form, manager_id: event.target.value })}>
                <option value="">Moi, par défaut</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </Field>
            <Field label="Nom" wide><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></Field>
            <Field label="Statut">
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {Object.entries(PROJECT_STATUS).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
              </select>
            </Field>
            <Field label="Avancement %"><input type="number" min="0" max="100" value={form.progress} onChange={(event) => setForm({ ...form, progress: event.target.value })} /></Field>
            <Field label="Budget"><input type="number" min="0" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} /></Field>
            <Field label="Début"><input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} /></Field>
            <Field label="Fin visée"><input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} /></Field>
            <Field label="Intention" wide><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          </div>
          <button className="btn btn-primary" type="submit">Enregistrer le projet</button>
        </div>
        <div className="card">
          <div className="actions" style={{ justifyContent: 'space-between' }}>
            <h2>Jalons</h2>
            <button
              className="btn btn-tiny"
              type="button"
              onClick={() => {
                const done = form.milestones.filter((item) => item.done).length;
                const progress = form.milestones.length ? Math.round((done / form.milestones.length) * 100) : 0;
                setForm({ ...form, progress });
              }}
            >
              Calculer l’avancement
            </button>
          </div>
          <div className="progress" style={{ margin: '12px 0 16px' }}><span style={{ width: `${form.progress || 0}%` }} /></div>
          {form.milestones.map((milestone, index) => (
            <label className="check-row" key={index}>
              <input type="checkbox" checked={Boolean(milestone.done)} onChange={(event) => setMilestone(index, { done: event.target.checked })} />
              <input value={milestone.title} onChange={(event) => setMilestone(index, { title: event.target.value })} />
              <input type="date" value={dateInput(milestone.due_date)} onChange={(event) => setMilestone(index, { due_date: event.target.value })} />
            </label>
          ))}
          <button className="btn btn-tiny" type="button" onClick={() => setForm({ ...form, milestones: [...form.milestones, { title: '', due_date: '', done: false }] })}>Ajouter un jalon</button>
          <h3 style={{ marginTop: 22 }}>Tâches par personne</h3>
          {form.tasks.map((task, index) => (
            <div className="task-row" key={index}>
              <input placeholder="Tâche" value={task.title} onChange={(event) => setForm({ ...form, tasks: form.tasks.map((item, i) => i === index ? { ...item, title: event.target.value } : item) })} />
              <select value={task.staff_id} onChange={(event) => setForm({ ...form, tasks: form.tasks.map((item, i) => i === index ? { ...item, staff_id: event.target.value } : item) })}>
                <option value="">Personne</option>
                {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </select>
              <input type="date" value={task.start_date || ''} onChange={(event) => setForm({ ...form, tasks: form.tasks.map((item, i) => i === index ? { ...item, start_date: event.target.value } : item) })} />
              <input type="date" value={task.end_date || ''} onChange={(event) => setForm({ ...form, tasks: form.tasks.map((item, i) => i === index ? { ...item, end_date: event.target.value } : item) })} />
              <input type="number" min="0" max="100" value={task.progress} onChange={(event) => setForm({ ...form, tasks: form.tasks.map((item, i) => i === index ? { ...item, progress: event.target.value } : item) })} />
            </div>
          ))}
          <button className="btn btn-tiny" type="button" onClick={() => setForm({ ...form, tasks: [...form.tasks, { title: '', staff_id: '', start_date: form.start_date, end_date: form.due_date, progress: 0 }] })}>Ajouter une tâche</button>
          <Gantt
            start={form.start_date}
            end={form.due_date}
            tasks={form.tasks.map((task) => ({
              ...task,
              staff_name: staff.find((member) => String(member.id) === String(task.staff_id))?.name,
            }))}
          />
          <h3 style={{ marginTop: 22 }}>Budget du projet</h3>
          {form.budget_lines.map((line, index) => (
            <div className="task-row" key={index}>
              <input placeholder="Poste" value={line.label} onChange={(event) => setForm({ ...form, budget_lines: form.budget_lines.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
              <input type="number" min="0" placeholder="Prévu" value={line.planned} onChange={(event) => setForm({ ...form, budget_lines: form.budget_lines.map((item, i) => i === index ? { ...item, planned: event.target.value } : item) })} />
              <input type="number" min="0" placeholder="Dépensé" value={line.spent} onChange={(event) => setForm({ ...form, budget_lines: form.budget_lines.map((item, i) => i === index ? { ...item, spent: event.target.value } : item) })} />
            </div>
          ))}
          <button className="btn btn-tiny" type="button" onClick={() => setForm({ ...form, budget_lines: [...form.budget_lines, { label: '', planned: '', spent: '' }] })}>Ajouter un poste</button>
          {project ? (
            <div style={{ marginTop: 22 }}>
              <h3>Pièces liées</h3>
              <div className="link-list">
                {project.quotes?.map((quote) => (
                  <Link key={quote.id} to={`/devis/${quote.id}`}><span>{quote.number}</span><Pill status={quote.display_status} map={QUOTE_STATUS} /></Link>
                ))}
                {project.invoices?.map((invoice) => (
                  <Link key={invoice.id} to={`/factures/${invoice.id}`}><span>{invoice.number}</span><Pill status={invoice.display_status} map={INVOICE_STATUS} /></Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
