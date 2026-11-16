import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { dateInput, formatDate, INVOICE_STATUS, PROJECT_STATUS, QUOTE_STATUS, todayISO } from '../format';
import { Banner, Field, Loading, Modal, Pill } from '../components/ui';
import { Gantt } from '../components/Gantt';
import { ProjectInsights } from '../components/ProjectInsights';

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
  tasks: [],
  budget_lines: [],
};

export default function ProjectDetail() {
  const { id } = useParams();
  const isNew = !id || id === 'nouveau';
  const navigate = useNavigate();
  const { can, settings, company, user } = useAuth();
  const [planDirty, setPlanDirty] = useState(false);
  const canWrite = can('projects');
  const [clients, setClients] = useState([]);
  const [step, setStep] = useState({ progress: 0, status: 'cadrage', comment: '' });
  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [project, setProject] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);
  // Fenêtre du formulaire d’ajout : jalon, tâche, poste ou suivi.
  const [fenetre, setFenetre] = useState(null);
  const [jalon, setJalon] = useState({ title: '', due_date: '' });
  const [tache, setTache] = useState({ title: '', staff_id: '', start_date: '', end_date: '', progress: 0 });
  const [poste, setPoste] = useState({ label: '', planned: '', spent: '' });

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
        setStep({ progress: data.progress, status: data.status, comment: '' });
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
      setPlanDirty(false);
      if (isNew) navigate(`/projets/${saved.id}`, { replace: true });
      else setProject(saved);
    } catch (err) {
      setError(errorText(err));
    }
  }

  async function postUpdate(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      const saved = await api(`/projects/${id}/updates`, {
        method: 'POST',
        body: {
          progress: Number(step.progress),
          status: step.status,
          comment: step.comment,
          done_milestones: form.milestones.filter((item) => item.done && item.id).map((item) => item.id),
        },
      });
      setProject(saved);
      setForm({ ...form, progress: saved.progress, status: saved.status, milestones: saved.milestones });
      setStep({ progress: saved.progress, status: saved.status, comment: '' });
      setFenetre(null);
      setNotice('Avancement mis à jour.');
    } catch (err) {
      setError(errorText(err));
    }
  }

  if (!ready) {
    return (
      <div className="page">
        <header className="page-head">
          <div>
            <p className="kicker"><Link to="/projets">Projets</Link></p>
            <h1>Projet</h1>
          </div>
          <button className="btn" type="button" onClick={() => navigate('/projets')}>Retour</button>
        </header>
        <section className="card gantt-card">
          <h2>Planning</h2>
          <Loading compact label="Chargement du projet" />
        </section>
        <div className="studio">
          <div className="card"><Loading compact label="Chargement de la fiche" /></div>
          <div className="card"><Loading compact label="Chargement des tâches" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker"><Link to="/projets">Projets</Link> {project ? `· ${project.code}` : ''}</p>
          <h1>{form.name || 'Nouveau projet'}</h1>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={() => navigate('/projets')}>Retour</button>
          {project ? <Pill status={project.status} map={PROJECT_STATUS} /> : null}
        </div>
      </header>
      <div className="stack" style={{ marginBottom: 12 }}>
        <Banner>{error}</Banner>
        <Banner tone="ok">{notice}</Banner>
        {isNew && user?.role === 'admin' && !company ? <Banner>Choisissez une entreprise dans le menu du haut avant d’enregistrer. La vue « Toutes les entreprises » sert à consulter.</Banner> : null}
      </div>
      {!canWrite ? <p className="muted" style={{ marginBottom: 12 }}>Lecture seule : les projets sont gérés par le chef de projet.</p> : null}
      {project || form.tasks.some((task) => task.title) ? (
        <>
          <ProjectInsights form={form} project={project} staff={staff} currency={settings?.currency} />
          <section className="card gantt-card">
            <header>
              <div>
                <h2>Planning</h2>
                <p className="sub">Diagramme de Gantt des tâches et des jalons, avec la ligne du jour.</p>
              </div>
              {canWrite && planDirty ? <button className="btn btn-primary btn-tiny" type="submit" form="project-form">Enregistrer le planning</button> : null}
            </header>
            <Gantt
              start={form.start_date}
              end={form.due_date}
              milestones={form.milestones}
              tasks={form.tasks.map((task) => ({
                ...task,
                staff_name: staff.find((member) => String(member.id) === String(task.staff_id))?.name,
              }))}
              onChange={canWrite ? (index, dates) => {
                setForm({ ...form, tasks: form.tasks.map((item, i) => (i === index ? { ...item, ...dates } : item)) });
                setPlanDirty(true);
              } : undefined}
            />
          </section>
        </>
      ) : null}
      <form className="studio" id="project-form" onSubmit={save}>
        <fieldset className="editor" disabled={!canWrite} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <div className="card fields">
            <Field label="Client">
              <select value={form.client_id} onChange={(event) => setForm({ ...form, client_id: event.target.value })} required>
                <option value="">Choisir</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}
              </select>
            </Field>
            <Field label="Chef de projet">
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
            <Field label="Description" wide><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
          </div>
          {canWrite ? <button className="btn btn-primary" type="submit">Enregistrer le projet</button> : null}
        </fieldset>
        <fieldset className="card" disabled={!canWrite} style={{ minWidth: 0 }}>
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
          {canWrite ? <button className="btn btn-tiny" type="button" onClick={() => { setJalon({ title: '', due_date: '' }); setFenetre('jalon'); }}>Ajouter un jalon</button> : null}
          <h3 style={{ marginTop: 22 }}>Tâches et responsables</h3>
          {form.tasks.length === 0 ? <p className="muted">Aucune tâche pour le moment.</p> : form.tasks.map((task, index) => (
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
          {canWrite ? <button className="btn btn-tiny" type="button" onClick={() => { setTache({ title: '', staff_id: '', start_date: form.start_date, end_date: form.due_date, progress: 0 }); setFenetre('tache'); }}>Ajouter une tâche</button> : null}
          <h3 style={{ marginTop: 22 }}>Budget du projet</h3>
          {form.budget_lines.length === 0 ? <p className="muted">Aucun poste pour le moment.</p> : form.budget_lines.map((line, index) => (
            <div className="task-row" key={index}>
              <input placeholder="Poste" value={line.label} onChange={(event) => setForm({ ...form, budget_lines: form.budget_lines.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
              <input type="number" min="0" placeholder="Prévu" value={line.planned} onChange={(event) => setForm({ ...form, budget_lines: form.budget_lines.map((item, i) => i === index ? { ...item, planned: event.target.value } : item) })} />
              <input type="number" min="0" placeholder="Dépensé" value={line.spent} onChange={(event) => setForm({ ...form, budget_lines: form.budget_lines.map((item, i) => i === index ? { ...item, spent: event.target.value } : item) })} />
            </div>
          ))}
          {canWrite ? <button className="btn btn-tiny" type="button" onClick={() => { setPoste({ label: '', planned: '', spent: '' }); setFenetre('poste'); }}>Ajouter un poste</button> : null}
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
        </fieldset>
      </form>
      {project ? (
        <section className="card project-log">
          <h2>Suivi de l’avancement</h2>
          <p className="sub">Chaque mise à jour est datée et visible par le client dans son espace.</p>
          {canWrite ? <button className="btn" type="button" onClick={() => setFenetre('suivi')}>Publier une mise à jour</button> : null}
          {project.updates?.length ? (
            <div className="timeline">
              {project.updates.map((item) => (
                <article key={item.id}>
                  <span className="dot" />
                  <div>
                    <div className="quiet-row">
                      <span>{PROJECT_STATUS[item.status]?.label} · {item.progress} %{item.author ? ` · ${item.author.name}` : ''}</span>
                      <span className="muted">{formatDate(item.created_at)}</span>
                    </div>
                    {item.comment ? <p style={{ margin: '4px 0 12px' }}>{item.comment}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="muted">Aucune mise à jour publiée pour l’instant.</p>}
        </section>
      ) : null}
      {fenetre === 'jalon' ? (
        <Modal title="Nouveau jalon" onClose={() => setFenetre(null)}>
          <form className="stack" onSubmit={(event) => {
            event.preventDefault();
            setForm({ ...form, milestones: [...form.milestones, { title: jalon.title.trim(), due_date: jalon.due_date, done: false }] });
            setFenetre(null);
            setNotice('Jalon ajouté. Enregistrez le projet pour le conserver.');
          }}>
            <Field label="Nom" wide><input value={jalon.title} onChange={(event) => setJalon({ ...jalon, title: event.target.value })} required /></Field>
            <Field label="Date" wide><input type="date" value={jalon.due_date} onChange={(event) => setJalon({ ...jalon, due_date: event.target.value })} /></Field>
            <button className="btn btn-primary" type="submit">Ajouter le jalon</button>
          </form>
        </Modal>
      ) : null}
      {fenetre === 'tache' ? (
        <Modal title="Nouvelle tâche" onClose={() => setFenetre(null)}>
          <form className="stack" onSubmit={(event) => {
            event.preventDefault();
            setForm({ ...form, tasks: [...form.tasks, { ...tache, title: tache.title.trim(), progress: Number(tache.progress || 0) }] });
            setFenetre(null);
            setNotice('Tâche ajoutée. Enregistrez le projet pour la conserver.');
          }}>
            <div className="fields">
              <Field label="Tâche" wide><input value={tache.title} onChange={(event) => setTache({ ...tache, title: event.target.value })} required /></Field>
              <Field label="Personne" wide>
                <select value={tache.staff_id} onChange={(event) => setTache({ ...tache, staff_id: event.target.value })}>
                  <option value="">Choisir</option>
                  {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </Field>
              <Field label="Début"><input type="date" value={tache.start_date || ''} onChange={(event) => setTache({ ...tache, start_date: event.target.value })} /></Field>
              <Field label="Fin"><input type="date" value={tache.end_date || ''} onChange={(event) => setTache({ ...tache, end_date: event.target.value })} /></Field>
              <Field label="Avancement %"><input type="number" min="0" max="100" value={tache.progress} onChange={(event) => setTache({ ...tache, progress: event.target.value })} /></Field>
            </div>
            <button className="btn btn-primary" type="submit">Ajouter la tâche</button>
          </form>
        </Modal>
      ) : null}
      {fenetre === 'poste' ? (
        <Modal title="Nouveau poste de budget" onClose={() => setFenetre(null)}>
          <form className="stack" onSubmit={(event) => {
            event.preventDefault();
            setForm({ ...form, budget_lines: [...form.budget_lines, { ...poste, label: poste.label.trim() }] });
            setFenetre(null);
            setNotice('Poste ajouté. Enregistrez le projet pour le conserver.');
          }}>
            <div className="fields">
              <Field label="Poste" wide><input value={poste.label} onChange={(event) => setPoste({ ...poste, label: event.target.value })} required /></Field>
              <Field label="Prévu"><input type="number" min="0" value={poste.planned} onChange={(event) => setPoste({ ...poste, planned: event.target.value })} /></Field>
              <Field label="Dépensé"><input type="number" min="0" value={poste.spent} onChange={(event) => setPoste({ ...poste, spent: event.target.value })} /></Field>
            </div>
            <button className="btn btn-primary" type="submit">Ajouter le poste</button>
          </form>
        </Modal>
      ) : null}
      {fenetre === 'suivi' ? (
        <Modal title="Nouvelle mise à jour" onClose={() => setFenetre(null)}>
          <form className="stack" onSubmit={postUpdate}>
            <Field label="Avancement %" wide>
              <input type="number" min="0" max="100" value={step.progress} onChange={(event) => setStep({ ...step, progress: event.target.value })} required />
            </Field>
            <Field label="État" wide>
              <select value={step.status} onChange={(event) => setStep({ ...step, status: event.target.value })}>
                {Object.entries(PROJECT_STATUS).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
              </select>
            </Field>
            <Field label="Commentaire de suivi" wide>
              <input value={step.comment} maxLength={2000} placeholder="Ex. : fabrication terminée, pose prévue lundi" onChange={(event) => setStep({ ...step, comment: event.target.value })} />
            </Field>
            <button className="btn btn-primary" type="submit">Publier</button>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
