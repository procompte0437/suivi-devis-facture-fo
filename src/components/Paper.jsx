import { useAuth } from '../auth';
import { INVOICE_STATUS, QUOTE_STATUS, computeTotals, formatDate, money } from '../format';

function useHouse() {
  const { company, settings } = useAuth();
  return {
    name: company?.name || settings?.company_name || 'Atelier',
    tagline: company?.tagline || settings?.tagline || '',
    address: company?.address || settings?.address || '',
    city: company?.city || settings?.city || '',
    postal: company?.postal_code || '',
    country: company?.country || settings?.country || '',
    email: company?.email || settings?.email || '',
    phone: company?.phone || settings?.phone || '',
    tax: company?.tax_id || settings?.tax_id || '',
    capital: company?.capital || '',
    iban: company?.iban || '',
    legal: company?.legal_form || '',
    payment: company?.payment_note || settings?.payment_note || '',
    footer: company?.footer || settings?.footer || '',
    currency: settings?.currency || 'XAF',
  };
}

function rows(lines) {
  return lines.filter((line) => line.designation);
}

function amount(line) {
  return Number(line.quantity || 0) * Number(line.unit_price || 0);
}

export function Paper(props) {
  const template = props.template || (props.kind === 'facture' ? 'cedre' : 'nomade');
  const map = {
    cedre: Classic,
    iris: Classic,
    canopee: Classic,
    artisans: Artisans,
    csmart: Csmart,
    atelier: Atelier,
    nomade: Nomade,
    ligne: Ligne,
    soleil: Soleil,
    chantier: Chantier,
  };
  const View = map[template] || Classic;
  return <View {...props} template={template} />;
}

function Classic({ kind, template, number, status, client, title, issue, until, lines = [], discount = 0, taxRate = 18, notes }) {
  const house = useHouse();
  const totals = computeTotals(lines, discount, taxRate);
  const tone = template === 'iris' ? 'iris' : template === 'canopee' ? 'canopee' : 'cedre';
  const doc = kind === 'facture' || template === 'cedre' || template === 'iris' ? 'Facture' : 'Devis';
  const label = (kind === 'facture' ? INVOICE_STATUS : QUOTE_STATUS)[status]?.label;

  return (
    <article className={`paper tpl tpl-${tone}`}>
      {tone === 'canopee' ? <div className="tpl-wave" /> : null}
      <header className="tpl-classic-top">
        <div>
          <div className="tpl-logo">{house.name.slice(0, 1)}</div>
          <strong>Logo</strong>
        </div>
        <div className="tpl-classic-title">
          <h2>{doc} N°</h2>
          <p>{house.city || 'Ville'}, le {formatDate(issue)}</p>
          <b>{number || 'Brouillon'}</b>
          {label ? <span className="stamp">{label}</span> : null}
        </div>
      </header>
      <div className="tpl-split">
        <div>
          <strong>{house.name}</strong>
          <p>{house.address || 'Adresse'}</p>
          <p>{[house.postal, house.city].filter(Boolean).join(' ') || 'Ville et code postal'}</p>
          <p>{house.phone || 'Numéro de téléphone'}</p>
          <p>{house.email || 'Email'}</p>
        </div>
        <div className="tpl-client-box">
          <strong>{client?.company || 'Nom du client'}</strong>
          <p>{client?.address || 'Adresse'}</p>
          <p>{client?.phone || 'Numéro de téléphone'}</p>
          <p>{client?.email || 'Email'}</p>
        </div>
      </div>
      {title ? <p className="tpl-object"><b>Objet :</b> {title}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th className="num">Prix unitaire HT</th>
            <th>Unité</th>
            <th className="num">Quantité</th>
            <th className="num">Montant HT</th>
          </tr>
        </thead>
        <tbody>
          {rows(lines).map((line, index) => (
            <tr key={index}>
              <td>{line.designation}{line.detail ? <div className="muted">{line.detail}</div> : null}</td>
              <td className="num">{money(line.unit_price, house.currency)}</td>
              <td>{line.unit}</td>
              <td className="num">{line.quantity}</td>
              <td className="num">{money(amount(line), house.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="tpl-bottom">
        <div>
          <div className="tpl-note">
            <b>Modalités et conditions de règlement :</b>
            <p>{notes || house.payment}</p>
          </div>
          <p><b>{kind === 'facture' ? 'Date d’échéance' : 'Offre valable jusqu’au'} :</b> {formatDate(until)}</p>
        </div>
        <div>
          <table className="tpl-mini">
            <tbody>
              <tr><th>Total HT</th><td>{money(totals.subtotal, house.currency)}</td></tr>
              <tr><th>TVA {Number(taxRate || 0)} %</th><td>{money(totals.tax, house.currency)}</td></tr>
              <tr><th>Total TTC</th><td>{money(totals.total, house.currency)}</td></tr>
            </tbody>
          </table>
          <p className="tpl-sign-label">Signature :</p>
          <div className="tpl-sign" />
        </div>
      </div>
      <footer>
        {house.name}{house.legal ? ` – ${house.legal}` : ''}{house.capital ? ` au capital de ${house.capital}` : ''}
        <br />
        {house.tax ? `N° ${house.tax}` : house.footer}
      </footer>
      {tone === 'canopee' ? <div className="tpl-wave bottom" /> : null}
    </article>
  );
}

function Artisans(props) {
  const house = useHouse();
  const totals = computeTotals(props.lines, props.discount, props.taxRate);
  return (
    <article className="paper tpl tpl-artisans">
      <header>
        <div className="tpl-logo round">{house.name.slice(0, 1)}</div>
        <div>
          <strong>{house.name}</strong>
          <p>{[house.address, house.city].filter(Boolean).join(', ')}</p>
        </div>
        <div>
          <p>{house.email}</p>
          <p>{house.phone}</p>
        </div>
      </header>
      <div className="tpl-split">
        <div>
          <h2>FACTURE</h2>
          <p>Numéro : {props.number || '—'}</p>
          <p>Date : {formatDate(props.issue)}</p>
          <p>Échéance : {formatDate(props.until)}</p>
        </div>
        <div className="tpl-client-box">
          <strong>{props.client?.company || 'Nom du client'}</strong>
          <p>{props.client?.contact_name}</p>
          <p>{[props.client?.address, props.client?.city].filter(Boolean).join(', ')}</p>
        </div>
      </div>
      {props.title ? <p className="tpl-object">Objet : {props.title}</p> : null}
      <table>
        <thead><tr><th>Libellé</th><th className="num">Prix u.</th><th className="num">Qté</th><th className="num">Total</th></tr></thead>
        <tbody>
          {rows(props.lines).map((line, index) => (
            <tr key={index}>
              <td>{line.designation}</td>
              <td className="num">{money(line.unit_price, house.currency)}</td>
              <td className="num">{line.quantity}</td>
              <td className="num">{money(amount(line), house.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="tpl-mini right">
        <tbody>
          <tr><th>Total HT</th><td>{money(totals.subtotal, house.currency)}</td></tr>
          <tr><th>TVA {Number(props.taxRate || 0)} %</th><td>{money(totals.tax, house.currency)}</td></tr>
          <tr><th>Total TTC</th><td>{money(totals.total, house.currency)}</td></tr>
        </tbody>
      </table>
      <footer>{house.footer || house.payment}</footer>
    </article>
  );
}

function Csmart(props) {
  const house = useHouse();
  const totals = computeTotals(props.lines, props.discount, props.taxRate);
  return (
    <article className="paper tpl tpl-csmart">
      <header>
        <div>
          <div>{house.email}</div>
          <div>{house.phone}</div>
        </div>
        <strong>{house.name}</strong>
      </header>
      <div className="tpl-csmart-intro">
        <h2>FACTURE</h2>
        <div>
          <p>Date : {formatDate(props.issue)}</p>
          <p>Échéance : {formatDate(props.until)}</p>
          <p><b>Facture n° {props.number || '________'}</b></p>
        </div>
      </div>
      <div className="tpl-split">
        <div>
          <b>Vendeur</b>
          <p>Nom : {house.name}</p>
          <p>Adresse : {[house.address, house.city].filter(Boolean).join(', ')}</p>
          <p>Identifiant : {house.tax || '—'}</p>
        </div>
        <div>
          <b>Acheteur</b>
          <p>Nom : {props.client?.contact_name || '—'}</p>
          <p>Raison sociale : {props.client?.company || '—'}</p>
          <p>Adresse : {[props.client?.address, props.client?.city].filter(Boolean).join(', ') || '—'}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Réf</th><th>Description</th><th className="num">Quantité</th><th className="num">P.U HT</th><th className="num">Total</th></tr></thead>
        <tbody>
          {rows(props.lines).map((line, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{line.designation}</td>
              <td className="num">{line.quantity}</td>
              <td className="num">{money(line.unit_price, house.currency)}</td>
              <td className="num">{money(amount(line), house.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="tpl-totals-plain">
        <div><span>Total HT</span><b>{money(totals.subtotal, house.currency)}</b></div>
        <div><span>TVA ({Number(props.taxRate || 0)}%)</span><b>{money(totals.tax, house.currency)}</b></div>
        {totals.discount > 0 ? <div><span>Remise</span><b>- {money(totals.discount, house.currency)}</b></div> : null}
        <div><span>Total TTC</span><b>{money(totals.total, house.currency)}</b></div>
      </div>
      <p><b>Conditions de paiement :</b> {props.notes || house.payment}</p>
      <p><b>Mentions :</b> {house.footer}</p>
      <footer>Merci pour votre confirmation.</footer>
    </article>
  );
}

function Atelier(props) {
  const house = useHouse();
  const totals = computeTotals(props.lines, props.discount, props.taxRate);
  return (
    <article className="paper tpl tpl-atelier">
      <header className="tpl-split">
        <div>
          <div className="tpl-logo">{house.name.slice(0, 1)}</div>
          <strong>{house.name}</strong>
          <p>{house.address}</p>
          <p>{[house.postal, house.city, house.country].filter(Boolean).join(' ')}</p>
          <p>{house.phone}</p>
          <p>{house.email}</p>
        </div>
        <div>
          <strong>{props.client?.company}</strong>
          <p>{props.client?.contact_name}</p>
          <p>{[props.client?.address, props.client?.city, props.client?.country].filter(Boolean).join(', ')}</p>
        </div>
      </header>
      <div className="tpl-atelier-title">
        <div>
          <h2>Facture</h2>
          <p>{props.title}</p>
        </div>
        <div>
          <p>N° {props.number || 'Brouillon'}</p>
          <p>En date du {formatDate(props.issue)}</p>
          <p>Échéance au {formatDate(props.until)}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>N°</th><th>Désignation</th><th className="num">Qté</th><th className="num">Prix u.</th><th className="num">Total HT</th></tr></thead>
        <tbody>
          {rows(props.lines).map((line, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{line.designation}{line.detail ? <div className="muted">{line.detail}</div> : null}</td>
              <td className="num">{line.quantity} {line.unit}</td>
              <td className="num">{money(line.unit_price, house.currency)}</td>
              <td className="num">{money(amount(line), house.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="tpl-split">
        <div>
          <b>Conditions de paiement</b>
          <p>{props.notes || house.payment}</p>
        </div>
        <div className="tpl-net">
          <div><span>Total net HT</span><b>{money(totals.subtotal - totals.discount, house.currency)}</b></div>
          <div><span>TVA {Number(props.taxRate || 0)} %</span><b>{money(totals.tax, house.currency)}</b></div>
          <div className="due"><span>Net à payer</span><b>{money(totals.total, house.currency)}</b></div>
        </div>
      </div>
      <footer>{house.name} · {house.city} · {house.tax}</footer>
    </article>
  );
}

function Nomade(props) {
  const house = useHouse();
  const totals = computeTotals(props.lines, props.discount, props.taxRate);
  return (
    <article className="paper tpl tpl-nomade">
      <h2>Devis</h2>
      <div className="tpl-split">
        <div>
          <b>Pour</b>
          <p>{props.client?.contact_name || props.client?.company}</p>
          <p>{props.client?.email}</p>
          <p>{[props.client?.address, props.client?.city].filter(Boolean).join(', ')}</p>
          <p>ID client : {props.client?.code || props.client?.id || '—'}</p>
        </div>
        <div>
          <p><b>Date :</b> {formatDate(props.issue)}</p>
          <p><b>Validité :</b> {formatDate(props.until)}</p>
          <p>{props.number}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Détail / description</th><th className="num">Quantité</th><th className="num">Prix HT</th><th className="num">Total HT</th></tr></thead>
        <tbody>
          {rows(props.lines).map((line, index) => (
            <tr key={index}>
              <td>{line.designation}</td>
              <td className="num">{line.quantity}</td>
              <td className="num">{money(line.unit_price, house.currency)}</td>
              <td className="num">{money(amount(line), house.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="tpl-mini right">
        <tbody>
          <tr><th>Total hors taxe</th><td>{money(totals.subtotal, house.currency)}</td></tr>
          <tr><th>TVA ({Number(props.taxRate || 0)}%)</th><td>{money(totals.tax, house.currency)}</td></tr>
          <tr><th>Total</th><td>{money(totals.total, house.currency)}</td></tr>
        </tbody>
      </table>
      <div className="tpl-accord">
        <b>Bon pour accord</b>
        <div className="tpl-sign" />
        <small>À retourner daté et signé</small>
      </div>
      <p>Merci pour votre confiance !</p>
      <footer>
        <strong>{house.name}</strong>
        <p>{[house.address, house.city].filter(Boolean).join(', ')}</p>
        <p>{house.email} · {house.phone}</p>
      </footer>
    </article>
  );
}

function Ligne(props) {
  const house = useHouse();
  const totals = computeTotals(props.lines, props.discount, props.taxRate);
  return (
    <article className="paper tpl tpl-ligne">
      <header>
        <h2>DEVIS</h2>
        <span className="tpl-pill">Devis n° {props.number || '—'}</span>
      </header>
      <p><b>Date du devis :</b> {formatDate(props.issue)}</p>
      <p><b>Validité du devis :</b> {formatDate(props.until)}</p>
      <div className="tpl-split">
        <div>
          <b>{house.name}</b>
          <p>{house.phone}</p>
          <p>{house.email}</p>
          <p>{[house.address, house.city].filter(Boolean).join(', ')}</p>
        </div>
        <div>
          <b>À l’attention de</b>
          <p>{props.client?.company}</p>
          <p>{props.client?.contact_name}</p>
          <p>{[props.client?.address, props.client?.city].filter(Boolean).join(', ')}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Description</th><th className="num">Prix</th><th className="num">Quantité</th><th className="num">Total</th></tr></thead>
        <tbody>
          {rows(props.lines).map((line, index) => (
            <tr key={index}>
              <td>{line.designation}</td>
              <td className="num">{money(line.unit_price, house.currency)}</td>
              <td className="num">{String(line.quantity).padStart(2, '0')}</td>
              <td className="num">{money(amount(line), house.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="tpl-ligne-totals">
        <div><span>Sous total</span><b>{money(totals.subtotal, house.currency)}</b></div>
        <div><span>TVA ({Number(props.taxRate || 0)}%)</span><b>{money(totals.tax, house.currency)}</b></div>
        <div className="grand"><span>Total</span><b>{money(totals.total, house.currency)}</b></div>
      </div>
      <div className="tpl-split">
        <div>
          <b>Termes et conditions</b>
          <p>{props.notes || house.payment}</p>
        </div>
        <div>
          <b>Signature suivie de la mention « bon pour accord »</b>
          <div className="tpl-sign" />
        </div>
      </div>
      <footer>Merci de votre confiance</footer>
    </article>
  );
}

function Soleil(props) {
  const house = useHouse();
  const totals = computeTotals(props.lines, props.discount, props.taxRate);
  const rate = Number(props.taxRate || 0);
  return (
    <article className="paper tpl tpl-soleil">
      <header className="tpl-split">
        <div className="tpl-logo round">{house.name.slice(0, 2)}</div>
        <div>
          <h2>DEVIS</h2>
          <p>Numéro : {props.number || '—'}</p>
          <p>Date d’émission : {formatDate(props.issue)}</p>
        </div>
      </header>
      <div className="tpl-split">
        <div>
          <b>{house.legal ? `${house.legal} ` : ''}{house.name}</b>
          <p>{house.address}</p>
          <p>{[house.postal, house.city, house.country].filter(Boolean).join(' ')}</p>
          <p>{house.phone}</p>
          <p>{house.email}</p>
          <p>{house.tax}</p>
        </div>
        <div>
          <b>Client</b>
          <p>{props.client?.company}</p>
          <p>{props.client?.contact_name}</p>
          <p>{[props.client?.address, props.client?.city].filter(Boolean).join(', ')}</p>
        </div>
      </div>
      <p className="tpl-object"><b>Objet :</b> {props.title || '—'}</p>
      <p>Durée de validité : jusqu’au {formatDate(props.until)}</p>
      <table>
        <thead>
          <tr>
            <th>Désignation</th><th className="num">Quantité</th><th>Unité</th>
            <th className="num">Prix unitaire HT</th><th className="num">% TVA</th>
            <th className="num">Total TVA</th><th className="num">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {rows(props.lines).map((line, index) => {
            const ht = amount(line);
            return (
              <tr key={index}>
                <td>{line.designation}</td>
                <td className="num">{line.quantity}</td>
                <td>{line.unit}</td>
                <td className="num">{money(line.unit_price, house.currency)}</td>
                <td className="num">{rate}%</td>
                <td className="num">{money(ht * rate / 100, house.currency)}</td>
                <td className="num">{money(ht, house.currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="tpl-split">
        <div>
          <b>Conditions de règlement</b>
          <p>{props.notes || house.payment}</p>
        </div>
        <div className="tpl-net dark">
          <div><span>Total HT</span><b>{money(totals.subtotal, house.currency)}</b></div>
          <div><span>Total TVA</span><b>{money(totals.tax, house.currency)}</b></div>
          <div className="due"><span>Net à payer</span><b>{money(totals.total, house.currency)}</b></div>
        </div>
      </div>
      <p className="tpl-sign-label">Signature du client précédée de la mention « Bon pour accord »</p>
      <div className="tpl-sign" />
      <footer>{house.iban ? `IBAN ${house.iban}` : house.footer}</footer>
    </article>
  );
}

function Chantier(props) {
  const house = useHouse();
  const totals = computeTotals(props.lines, props.discount, props.taxRate);
  const rate = Number(props.taxRate || 0);
  const deposit = Math.round(totals.total * 0.3);
  return (
    <article className="paper tpl tpl-chantier">
      <h2>Devis — {house.name}</h2>
      <div className="tpl-split">
        <div>
          <b>Entreprise</b>
          <p>{house.name}{house.legal ? ` · ${house.legal}` : ''}</p>
          <p>{[house.address, house.postal, house.city].filter(Boolean).join(', ')}</p>
          <p>{house.tax}</p>
          <p>{house.email} · {house.phone}</p>
        </div>
        <div>
          <b>Client</b>
          <p>{props.client?.company}</p>
          <p>{props.client?.contact_name}</p>
          <p>{[props.client?.address, props.client?.city].filter(Boolean).join(', ')}</p>
        </div>
      </div>
      <p>Date du devis : {formatDate(props.issue)} · N° {props.number || '—'} · Validité : {formatDate(props.until)}</p>
      <p className="tpl-object"><b>Objet :</b> {props.title}</p>
      <table>
        <thead>
          <tr>
            <th>N°</th><th>Désignation</th><th className="num">Qté</th><th>Unité</th>
            <th className="num">PU HT</th><th className="num">TVA</th><th className="num">Total HT</th><th className="num">Total TTC</th>
          </tr>
        </thead>
        <tbody>
          {rows(props.lines).map((line, index) => {
            const ht = amount(line);
            const tva = ht * rate / 100;
            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{line.designation}{line.detail ? <div className="muted">{line.detail}</div> : null}</td>
                <td className="num">{line.quantity}</td>
                <td>{line.unit}</td>
                <td className="num">{money(line.unit_price, house.currency)}</td>
                <td className="num">{rate}%</td>
                <td className="num">{money(ht, house.currency)}</td>
                <td className="num">{money(ht + tva, house.currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <table className="tpl-mini right">
        <tbody>
          <tr><th>Sous-total HT</th><td>{money(totals.subtotal, house.currency)}</td></tr>
          <tr><th>TVA {rate} %</th><td>{money(totals.tax, house.currency)}</td></tr>
          <tr><th>Total TTC</th><td>{money(totals.total, house.currency)}</td></tr>
          <tr><th>Acompte demandé (30 %)</th><td>{money(deposit, house.currency)}</td></tr>
          <tr><th>Reste à payer</th><td>{money(totals.total - deposit, house.currency)}</td></tr>
        </tbody>
      </table>
      <p><b>Mentions et règlement</b></p>
      <p>{props.notes || house.payment}</p>
      <p>{house.footer}</p>
      <div className="tpl-split signs">
        <div>Signature du client<br /><div className="tpl-sign" /></div>
        <div>Signature du professionnel<br /><div className="tpl-sign" /></div>
      </div>
    </article>
  );
}
