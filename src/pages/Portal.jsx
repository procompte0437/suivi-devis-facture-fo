import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { api, errorText } from '../api';
import { useAuth } from '../auth';
import { Paper } from '../components/Paper';
import { Banner, Loading, Modal, Pill } from '../components/ui';
import { formatDate, INVOICE_STATUS, METHODS, money, PROJECT_STATUS, QUOTE_STATUS } from '../format';

// Espace client : consultation des devis, factures et projets du client connecté,
// et réponse aux devis envoyés (UC06, UC12).

export function PortalLayout() {
  const { user, company, logout } = useAuth();
  return (
    <div className="portal">
      <header className="portal-top no-print">
        <Link to="/espace-client" className="portal-brand">
          <img src="/logo/logo-doukou-clair.png" alt="DOUKOU" />
        </Link>
        <nav>
          <NavLink to="/espace-client" end>Mes documents</NavLink>
        </nav>
        <div className="portal-me">
          <span>
            <strong>{user?.client?.company || user?.name}</strong>
            <small>{user?.name}</small>
          </span>
          <button className="btn btn-tiny" type="button" onClick={logout}>Se déconnecter</button>
        </div>
      </header>
      <div className="portal-body">
        {company ? <p className="portal-from no-print">Prestataire : {company.name}</p> : null}
        <Outlet />
      </div>
    </div>
  );
}

export function PortalHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/portal').then(setData).catch((err) => setError(errorText(err)));
  }, []);

  if (error) return <Banner>{error}</Banner>;
  if (!data) return <Loading inline label="Chargement de vos documents" />;

  const waiting = data.quotes.filter((quote) => quote.display_status === 'envoye');

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker">Espace client</p>
          <h1>{data.client.company}</h1>
        </div>
      </header>

      <div className="grid-kpis portal-kpis">
        <article className="kpi"><div><span>Devis à valider</span><strong>{data.totals.pending_quotes}</strong></div></article>
        <article className="kpi tone-brass"><div><span>Facturé</span><strong>{money(data.totals.invoiced)}</strong></div></article>
        <article className="kpi"><div><span>Déjà payé</span><strong>{money(data.totals.paid)}</strong></div></article>
        <article className="kpi tone-brass"><div><span>Reste à payer</span><strong>{money(data.totals.balance)}</strong></div></article>
      </div>

      {waiting.length ? (
        <div className="card portal-alert">
          <h2>{waiting.length === 1 ? 'Un devis attend votre réponse' : `${waiting.length} devis attendent votre réponse`}</h2>
          <div className="link-list">
            {waiting.map((quote) => (
              <Link key={quote.id} to={`/espace-client/devis/${quote.id}`}>
                <span>{quote.number} · {quote.title}</span>
                <span>valable jusqu’au {formatDate(quote.valid_until)}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <section className="portal-section">
        <h2>Projets</h2>
        {data.projects.length ? (
          <div className="portal-projects">
            {data.projects.map((project) => (
              <Link className="card" key={project.id} to={`/espace-client/projets/${project.id}`}>
                <div className="quiet-row"><b>{project.name}</b><Pill status={project.status} map={PROJECT_STATUS} /></div>
                <div className="progress" style={{ margin: '12px 0 6px' }}><span style={{ width: `${project.progress}%` }} /></div>
                <small className="muted">
                  {project.progress} % · {project.milestones.filter((step) => step.done).length} étape(s) sur {project.milestones.length}
                  {project.due_date ? ` · fin prévue le ${formatDate(project.due_date)}` : ''}
                </small>
              </Link>
            ))}
          </div>
        ) : <p className="muted">Aucun projet en cours.</p>}
      </section>

      <section className="portal-section">
        <h2>Devis</h2>
        <DocTable
          rows={data.quotes}
          base="/espace-client/devis"
          status={QUOTE_STATUS}
          dateLabel="Validité"
          dateKey="valid_until"
          empty="Aucun devis pour l’instant."
        />
      </section>

      <section className="portal-section">
        <h2>Factures</h2>
        <DocTable
          rows={data.invoices}
          base="/espace-client/factures"
          status={INVOICE_STATUS}
          dateLabel="Échéance"
          dateKey="due_date"
          balance
          empty="Aucune facture pour l’instant."
        />
      </section>
    </div>
  );
}

function DocTable({ rows, base, status, dateLabel, dateKey, balance, empty }) {
  if (!rows.length) return <p className="muted">{empty}</p>;
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>N°</th><th>Objet</th><th>Émis le</th><th>{dateLabel}</th><th>Montant TTC</th>
            {balance ? <th>Reste dû</th> : null}
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><Link to={`${base}/${row.id}`}><b>{row.number}</b></Link></td>
              <td>{row.title}</td>
              <td>{formatDate(row.issue_date)}</td>
              <td>{formatDate(row[dateKey])}</td>
              <td>{money(row.total)}</td>
              {balance ? <td>{money(row.balance)}</td> : null}
              <td><Pill status={row.display_status} map={status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortalQuote() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    api(`/portal/quotes/${id}`).then(setQuote).catch((err) => setError(errorText(err)));
  }, [id]);

  async function confirm() {
    setPending(true);
    setError('');
    try {
      const saved = await api(`/portal/quotes/${id}/decision`, { method: 'POST', body: { decision, note } });
      setQuote(saved);
      setNotice(decision === 'accepte' ? 'Merci, votre accord a été enregistré.' : 'Votre refus a été enregistré.');
      setDecision(null);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  if (error && !quote) return <Banner>{error}</Banner>;
  if (!quote) return <Loading inline label="Chargement du devis" />;

  const open = quote.display_status === 'envoye';

  return (
    <div className="page">
      <header className="page-head no-print">
        <div>
          <p className="kicker"><Link to="/espace-client">Mes documents</Link> · devis</p>
          <h1>{quote.number}</h1>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={() => window.print()}>Imprimer / PDF</button>
          {open ? (
            <>
              <button className="btn btn-danger" type="button" onClick={() => setDecision('refuse')}>Refuser</button>
              <button className="btn btn-primary" type="button" onClick={() => setDecision('accepte')}>Accepter le devis</button>
            </>
          ) : null}
        </div>
      </header>
      <div className="stack no-print" style={{ marginBottom: 12 }}>
        <Banner>{error}</Banner>
        <Banner tone="ok">{notice}</Banner>
        {!open && quote.decided_at ? (
          <p className="muted">
            {QUOTE_STATUS[quote.status]?.label} le {formatDate(quote.decided_at)}
            {quote.decider ? ` par ${quote.decider.name}` : ''}
            {quote.decision_note ? ` — « ${quote.decision_note} »` : ''}
          </p>
        ) : null}
        {quote.display_status === 'expire' ? <p className="muted">Ce devis a dépassé sa date de validité. Contactez-nous pour une nouvelle proposition.</p> : null}
      </div>
      <div className="sheet-wrap portal-sheet">
        <Paper
          kind="devis"
          number={quote.number}
          status={quote.status}
          client={quote.client}
          title={quote.title}
          issue={quote.issue_date}
          until={quote.valid_until}
          lines={quote.lines}
          discount={quote.discount}
          taxRate={quote.tax_rate}
          notes={quote.notes}
          template={quote.template}
        />
      </div>

      {decision ? (
        <Modal title={decision === 'accepte' ? 'Accepter ce devis ?' : 'Refuser ce devis ?'} onClose={() => setDecision(null)}>
          <div className="stack">
            <p>
              {quote.number} · {quote.title} · <b>{money(quote.total)} TTC</b>
            </p>
            <p className="muted">
              {decision === 'accepte'
                ? 'Votre accord sera daté et transmis à l’équipe. Il ne pourra plus être modifié ici.'
                : 'Le refus sera daté et transmis à l’équipe.'}
            </p>
            <label className="field">
              <span>Commentaire (facultatif)</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} />
            </label>
            <div className="actions">
              <button className="btn" type="button" onClick={() => setDecision(null)}>Annuler</button>
              <button className={`btn ${decision === 'accepte' ? 'btn-primary' : 'btn-danger'}`} type="button" disabled={pending} onClick={confirm}>
                {decision === 'accepte' ? 'Confirmer l’accord' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export function PortalInvoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/portal/invoices/${id}`).then(setInvoice).catch((err) => setError(errorText(err)));
  }, [id]);

  if (error) return <Banner>{error}</Banner>;
  if (!invoice) return <Loading inline label="Chargement de la facture" />;

  const methods = Object.fromEntries(METHODS);

  return (
    <div className="page">
      <header className="page-head no-print">
        <div>
          <p className="kicker"><Link to="/espace-client">Mes documents</Link> · facture</p>
          <h1>{invoice.number}</h1>
        </div>
        <div className="actions">
          <Pill status={invoice.display_status} map={INVOICE_STATUS} />
          <button className="btn" type="button" onClick={() => window.print()}>Imprimer / PDF</button>
        </div>
      </header>
      <div className="card no-print" style={{ marginBottom: 14 }}>
        <div className="quiet-row"><span>Montant TTC</span><b>{money(invoice.total)}</b></div>
        <div className="quiet-row"><span>Déjà payé</span><b>{money(invoice.amount_paid)}</b></div>
        <div className="quiet-row"><span>Reste à payer</span><b>{money(invoice.balance)}</b></div>
        <div className="quiet-row"><span>Échéance</span><b>{formatDate(invoice.due_date)}</b></div>
        {invoice.payments?.length ? (
          <>
            <h3 style={{ marginTop: 16 }}>Paiements reçus</h3>
            {invoice.payments.map((payment) => (
              <div className="quiet-row" key={payment.id}>
                <span>{formatDate(payment.paid_at)} · {methods[payment.method] || payment.method}</span>
                <b>{money(payment.amount)}</b>
              </div>
            ))}
          </>
        ) : null}
      </div>
      <div className="sheet-wrap portal-sheet">
        <Paper
          kind="facture"
          number={invoice.number}
          status={invoice.status}
          client={invoice.client}
          title={invoice.title}
          issue={invoice.issue_date}
          until={invoice.due_date}
          lines={invoice.lines}
          discount={invoice.discount}
          taxRate={invoice.tax_rate}
          notes={invoice.notes}
          template={invoice.template}
        />
      </div>
    </div>
  );
}

export function PortalProject() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/portal/projects/${id}`).then(setProject).catch((err) => setError(errorText(err)));
  }, [id]);

  if (error) return <Banner>{error}</Banner>;
  if (!project) return <Loading inline label="Chargement du projet" />;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="kicker"><Link to="/espace-client">Mes documents</Link> · {project.code}</p>
          <h1>{project.name}</h1>
        </div>
        <Pill status={project.status} map={PROJECT_STATUS} />
      </header>
      <div className="portal-project">
        <div className="card">
          <h2>Avancement</h2>
          <div className="progress" style={{ margin: '14px 0 8px' }}><span style={{ width: `${project.progress}%` }} /></div>
          <p><b>{project.progress} %</b></p>
          <div className="quiet-row" style={{ marginTop: 14 }}><span>Début</span><b>{formatDate(project.start_date)}</b></div>
          <div className="quiet-row"><span>Fin prévue</span><b>{formatDate(project.due_date)}</b></div>
          {project.manager ? <div className="quiet-row"><span>Responsable</span><b>{project.manager.name}</b></div> : null}
          <h3 style={{ marginTop: 18 }}>Étapes</h3>
          <ul className="portal-steps">
            {project.milestones.map((step) => (
              <li key={step.id} className={step.done ? 'done' : ''}>
                <span>{step.done ? '✓' : '○'}</span>
                {step.title}
                {step.due_date ? <small>{formatDate(step.due_date)}</small> : null}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2>Suivi</h2>
          {project.updates?.length ? (
            <div className="timeline" style={{ marginTop: 12 }}>
              {project.updates.map((item) => (
                <article key={item.id}>
                  <span className="dot" />
                  <div>
                    <div className="quiet-row">
                      <span>{PROJECT_STATUS[item.status]?.label} · {item.progress} %</span>
                      <span className="muted">{formatDate(item.created_at)}</span>
                    </div>
                    {item.comment ? <p style={{ margin: '4px 0 12px' }}>{item.comment}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="muted" style={{ marginTop: 10 }}>Pas encore de point d’étape publié.</p>}
        </div>
      </div>
    </div>
  );
}
