import './style.css';
import { createIcons, ClipboardList, Plus, Search, RefreshCw, CircleDot, Clock3, CheckCircle2, ArrowUpRight, Inbox, Server } from 'lucide';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
const statuses = ['Ouvert', 'En cours', 'Résolu'];
let tickets = [];
let filter = 'Tous';
let query = '';
let localOnly = false;
const localStorageKey = 'clair-demo-tickets-v1';
const demoTickets = [
  { id: 'demo-1', titre: 'Accès au VPN impossible', description: 'Le client VPN affiche une erreur de connexion depuis ce matin.', statut: 'Ouvert', created_at: '2026-11-19T08:30:00.000Z' },
  { id: 'demo-2', titre: 'Installation de la suite bureautique', description: 'Besoin de la dernière version sur le poste de la salle de réunion.', statut: 'En cours', created_at: '2026-11-18T13:15:00.000Z' },
  { id: 'demo-3', titre: 'Réinitialisation du mot de passe Wi-Fi invité', description: 'Le code affiché à l’accueil ne fonctionne plus.', statut: 'Résolu', created_at: '2026-11-17T09:05:00.000Z' },
];

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#" aria-label="Clair, accueil"><span class="brand-mark"><i data-lucide="clipboard-list"></i></span><span>clair<span class="brand-dot">.</span><small>ESPACE DE TRAVAIL</small></span></a>
      <div class="workspace"><span class="workspace-icon">S</span><span><b>Support informatique</b><small>Équipe interne</small></span><span class="chevron">⌄</span></div>
      <div class="nav-caption">ESPACE</div>
      <button class="nav-item active"><i data-lucide="inbox"></i> Tous les tickets <span id="nav-count" class="nav-count">0</span></button>
      <div class="nav-caption second-caption">VUES</div>
      <button class="nav-item view-link" data-filter="Ouvert"><span class="side-dot open-dot"></span> Ouverts <span class="nav-count" id="open-count">0</span></button>
      <button class="nav-item view-link" data-filter="En cours"><span class="side-dot progress-dot"></span> En cours <span class="nav-count" id="progress-count">0</span></button>
      <button class="nav-item view-link" data-filter="Résolu"><span class="side-dot done-dot"></span> Résolus <span class="nav-count" id="done-count">0</span></button>
      <div class="sidebar-bottom"><div class="online" id="connection-status"><span></span> Vérification…</div><small>Clair · version 1.0</small></div>
    </aside>
    <main class="main-area">
      <header class="topbar"><div class="breadcrumb">Espace de travail <span>/</span> <b>Tickets</b></div><div class="top-actions"><span class="avatar">ÉI</span><span class="user-label">Équipe informatique</span></div></header>
      <section class="content">
        <div class="eyebrow"><span class="eyebrow-line"></span> CENTRE DE SUPPORT</div>
        <div class="heading-row"><div><h1>Demandes informatiques</h1><p class="subtitle">Toutes les demandes de votre équipe, au même endroit.</p></div><button id="new-ticket" class="primary-button"><i data-lucide="plus"></i> Nouveau ticket</button></div>
        <div class="stats-grid">
          <article class="stat-card"><div class="stat-top"><span>Total des tickets</span><span class="stat-icon indigo"><i data-lucide="clipboard-list"></i></span></div><div class="stat-number" id="total-stat">0</div><div class="stat-foot">Demandes enregistrées</div></article>
          <article class="stat-card"><div class="stat-top"><span>À traiter</span><span class="stat-icon amber"><i data-lucide="circle-dot"></i></span></div><div class="stat-number" id="open-stat">0</div><div class="stat-foot">En attente de prise en charge</div></article>
          <article class="stat-card"><div class="stat-top"><span>En cours</span><span class="stat-icon blue"><i data-lucide="clock-3"></i></span></div><div class="stat-number" id="progress-stat">0</div><div class="stat-foot">En cours de résolution</div></article>
          <article class="stat-card"><div class="stat-top"><span>Résolus</span><span class="stat-icon green"><i data-lucide="check-circle-2"></i></span></div><div class="stat-number" id="done-stat">0</div><div class="stat-foot">Demandes terminées</div></article>
        </div>
        <section class="ticket-panel">
          <div class="panel-heading"><div><h2>Liste des tickets</h2><p>Consultez et mettez à jour les demandes.</p></div><div class="toolbar"><label class="search-box"><i data-lucide="search"></i><input id="search" placeholder="Rechercher…" aria-label="Rechercher dans les tickets" /></label><button id="refresh" class="icon-button" title="Actualiser" aria-label="Actualiser"><i data-lucide="refresh-cw"></i></button></div></div>
          <div class="filter-row"><div class="tabs"><button class="tab selected" data-filter="Tous">Tous <span id="all-tab-count">0</span></button><button class="tab" data-filter="Ouvert">Ouverts</button><button class="tab" data-filter="En cours">En cours</button><button class="tab" data-filter="Résolu">Résolus</button></div><span class="sort-label">Plus récents d'abord <span>⌄</span></span></div>
          <div class="table-wrap"><table><thead><tr><th>DEMANDE</th><th>STATUT</th><th>DATE DE CRÉATION</th><th></th></tr></thead><tbody id="tickets-body"></tbody></table></div>
          <div id="empty-state" class="empty-state" hidden><div class="empty-icon"><i data-lucide="inbox"></i></div><h3>Aucun ticket pour le moment</h3><p>Créez une demande pour commencer à suivre les incidents.</p><button class="text-button" id="empty-create">+ Créer un ticket</button></div>
          <div class="panel-footer"><span id="result-count">0 ticket</span><span>Les données sont enregistrées automatiquement</span></div>
        </section>
        <footer class="page-footer"><span>Clair · Outil de suivi du support informatique</span><a href="${API_URL}/health" target="_blank" rel="noreferrer">État de l'API <i data-lucide="arrow-up-right"></i></a></footer>
      </section>
    </main>
  </div>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>
  <dialog id="ticket-dialog"><form id="ticket-form"><div class="dialog-top"><div><div class="eyebrow"><span class="eyebrow-line"></span> NOUVELLE DEMANDE</div><h2>Créer un ticket</h2><p>Décrivez le problème pour aider l'équipe à le résoudre.</p></div><button type="button" class="dialog-close" id="close-dialog" aria-label="Fermer">×</button></div><label class="field-label" for="title-input">Titre <span>Obligatoire</span></label><input id="title-input" name="titre" maxlength="120" placeholder="Ex. Impossible d'accéder au VPN" required /><label class="field-label" for="description-input">Description <span>Obligatoire</span></label><textarea id="description-input" name="description" maxlength="2000" rows="5" placeholder="Décrivez les étapes et le message d'erreur éventuel…" required></textarea><div class="dialog-actions"><button type="button" id="cancel-dialog" class="secondary-button">Annuler</button><button class="primary-button" type="submit"><i data-lucide="plus"></i> Créer le ticket</button></div></form></dialog>
`;

createIcons({ icons: { ClipboardList, Plus, Search, RefreshCw, CircleDot, Clock3, CheckCircle2, ArrowUpRight, Inbox, Server } });
const $ = (selector) => document.querySelector(selector);
const toast = (message, isError = false) => { const el = $('#toast'); el.textContent = message; el.classList.toggle('error', isError); el.classList.add('visible'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('visible'), 3200); };
const dateLabel = (value) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
function readLocalTickets() {
  try {
    const saved = JSON.parse(localStorage.getItem(localStorageKey));
    if (Array.isArray(saved)) return saved;
  } catch { /* Recréer les exemples si les données locales sont illisibles. */ }
  localStorage.setItem(localStorageKey, JSON.stringify(demoTickets));
  return [...demoTickets];
}
function saveLocalTickets(value) { localStorage.setItem(localStorageKey, JSON.stringify(value)); }
function setConnectionLabel(message, demo = false) {
  $('#connection-status').innerHTML = `<span${demo ? ' class="demo-status-dot"' : ''}></span>${message}`;
  $('#connection-status').title = demo ? 'Les modifications restent dans ce navigateur.' : 'API et base de données disponibles.';
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Erreur HTTP ${response.status}`);
  return body;
}

function render() {
  const counts = Object.fromEntries(statuses.map((status) => [status, tickets.filter((ticket) => ticket.statut === status).length]));
  $('#total-stat').textContent = tickets.length; $('#open-stat').textContent = counts['Ouvert']; $('#progress-stat').textContent = counts['En cours']; $('#done-stat').textContent = counts['Résolu'];
  $('#nav-count').textContent = tickets.length; $('#open-count').textContent = counts['Ouvert']; $('#progress-count').textContent = counts['En cours']; $('#done-count').textContent = counts['Résolu']; $('#all-tab-count').textContent = tickets.length;
  const filtered = tickets.filter((ticket) => (filter === 'Tous' || ticket.statut === filter) && `${ticket.titre} ${ticket.description}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')));
  $('#tickets-body').innerHTML = filtered.map((ticket) => `<tr><td><div class="ticket-title">${escapeHtml(ticket.titre)}</div><div class="ticket-description">${escapeHtml(ticket.description)}</div></td><td><label class="status-select status-${statuses.indexOf(ticket.statut)}"><span class="status-dot"></span><select aria-label="Statut de ${escapeHtml(ticket.titre)}" data-id="${ticket.id}">${statuses.map((status) => `<option ${status === ticket.statut ? 'selected' : ''}>${status}</option>`).join('')}</select><span class="select-caret">⌄</span></label></td><td><span class="date-label">${dateLabel(ticket.created_at)}</span></td><td><span class="row-arrow">↗</span></td></tr>`).join('');
  $('#empty-state').hidden = filtered.length !== 0;
  $('.table-wrap').hidden = filtered.length === 0;
  $('#result-count').textContent = `${filtered.length} ticket${filtered.length > 1 ? 's' : ''}`;
}

async function loadTickets() {
  $('#refresh').classList.add('spinning');
  try {
    if (localOnly) throw new Error('Mode démonstration');
    tickets = await request('/api/tickets');
    setConnectionLabel('API connectée');
    render();
  }
  catch {
    localOnly = true;
    try {
      tickets = readLocalTickets();
      setConnectionLabel('Démo locale', true);
      render();
    } catch {
      toast('Le stockage local est indisponible dans ce navigateur.', true);
    }
  }
  finally { $('#refresh').classList.remove('spinning'); }
}

$('#new-ticket').addEventListener('click', () => $('#ticket-dialog').showModal());
$('#empty-create').addEventListener('click', () => $('#ticket-dialog').showModal());
$('#close-dialog').addEventListener('click', () => $('#ticket-dialog').close());
$('#cancel-dialog').addEventListener('click', () => $('#ticket-dialog').close());
$('#ticket-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const button = event.submitter; button.disabled = true;
  const form = new FormData(event.currentTarget);
  try {
    const payload = { titre: String(form.get('titre')).trim(), description: String(form.get('description')).trim() };
    if (localOnly) {
      tickets = [{ id: `local-${Date.now()}`, ...payload, statut: 'Ouvert', created_at: new Date().toISOString() }, ...tickets];
      saveLocalTickets(tickets); render();
    } else {
      await request('/api/tickets', { method: 'POST', body: JSON.stringify(payload) });
      await loadTickets();
    }
    event.currentTarget.reset(); $('#ticket-dialog').close(); toast('Le ticket a bien été créé.');
  }
  catch (error) { toast(error.message, true); }
  finally { button.disabled = false; }
});
$('#tickets-body').addEventListener('change', async (event) => {
  if (!event.target.matches('select[data-id]')) return;
  const select = event.target; select.disabled = true;
  try {
    if (localOnly) {
      tickets = tickets.map((ticket) => ticket.id === select.dataset.id ? { ...ticket, statut: select.value } : ticket);
      saveLocalTickets(tickets); render();
    } else {
      await request(`/api/tickets/${select.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ statut: select.value }) });
      await loadTickets();
    }
    toast('Statut mis à jour.');
  }
  catch (error) { toast(error.message, true); await loadTickets(); }
});
$('#search').addEventListener('input', (event) => { query = event.target.value; render(); });
$('#refresh').addEventListener('click', loadTickets);
document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
  filter = button.dataset.filter;
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('selected', tab.dataset.filter === filter));
  document.querySelectorAll('.view-link').forEach((link) => link.classList.toggle('active', link.dataset.filter === filter));
  render();
}));
loadTickets();
