// main.js - CHANGES v1: initial file
import { fetchJSON, fetchText } from "./loadData.js";
import { makeFigureCard, escapeHTML } from "./cards.js";
import { setupDropZone, renderChip } from "./board.js";
import { groupRelationshipsByFigure, renderRelationshipCard } from "./relations.js";

const state = {
  figures: [],
  relationships: [],
  interpretations: [],
  timeline: [],
  placement: {
    nahe: new Set(),
    distanz: new Set(),
    konflikt: new Set(),
  },
  selectedFigureId: null,
  relByFigure: new Map(),
};

const els = {};
function q(id){ return document.getElementById(id); }

function setStatus(msg, kind="info"){
  const s = q('status');
  const badge = kind === "ok" ? "ok" : kind === "bad" ? "bad" : kind === "warn" ? "warn" : "";
  s.innerHTML = `<span class="badge ${badge}">${escapeHTML(msg)}</span>`;
}

function figureById(id){ return state.figures.find(f=>f.id===id); }

function renderFigureList(){
  const wrap = q('figureGrid');
  wrap.innerHTML = "";
  for(const fig of state.figures){
    const card = makeFigureCard(fig);
    card.addEventListener('dblclick', ()=> openFigure(fig.id));
    wrap.appendChild(card);
  }
}

function renderZones(){
  const zones = [
    {key:"nahe", title:"Nähe / Bindung", hint:"Lege Figuren hier ab, die (im Text oder in deiner Deutung) durch Nähe, Loyalität, Körperlichkeit, Schutz verbunden sind."},
    {key:"distanz", title:"Distanz / Ausblendung", hint:"Lege Figuren hier ab, die übersehen, verdrängt, vergessen, aus dem Blick gedrängt werden – oder selbst verdrängen."},
    {key:"konflikt", title:"Konflikt / Bruch", hint:"Lege Figuren hier ab, bei denen der Text Brüche zeigt: Denunziation, Anpassung, Macht, Angst, moralische Kollision."},
  ];
  for(const z of zones){
    q(`zone_${z.key}_hint`).textContent = z.hint;
  }
  refreshZoneChips();
}

function refreshZoneChips(){
  const map = {nahe:"zone_nahe_placed", distanz:"zone_distanz_placed", konflikt:"zone_konflikt_placed"};
  for(const [k, targetId] of Object.entries(map)){
    const target = q(targetId);
    target.innerHTML = "";
    for(const fid of state.placement[k]){
      const fig = figureById(fid);
      if(fig) target.appendChild(renderChip(fig));
    }
  }
  updateProgress();
}

function updateProgress(){
  const total = state.figures.length;
  const placed = new Set([...state.placement.nahe, ...state.placement.distanz, ...state.placement.konflikt]).size;
  const pct = total ? Math.round((placed/total)*100) : 0;
  q('progressText').textContent = `${placed}/${total} Figuren platziert (${pct}%)`;
}

function addPlacement(zoneKey, figureId){
  // remove from other zones first (one-zone rule for clarity; can be changed later)
  for(const k of Object.keys(state.placement)){
    state.placement[k].delete(figureId);
  }
  state.placement[zoneKey].add(figureId);
  refreshZoneChips();
  setStatus(`Platziert: ${figureById(figureId)?.name ?? figureId} → ${zoneKey}`, "ok");
}

function setupDnD(){
  setupDropZone(q('zone_nahe'), (id)=>addPlacement('nahe', id));
  setupDropZone(q('zone_distanz'), (id)=>addPlacement('distanz', id));
  setupDropZone(q('zone_konflikt'), (id)=>addPlacement('konflikt', id));
}

function openFigure(figureId){
  const fig = figureById(figureId);
  if(!fig) return;
  state.selectedFigureId = figureId;

  q('modalTitle').textContent = fig.name;
  q('modalImg').src = fig.image;
  q('modalName').textContent = fig.name;
  q('modalRole').textContent = fig.role;

  q('relList').innerHTML = "";
  const rels = state.relByFigure.get(figureId) || [];
  if(rels.length === 0){
    const empty = document.createElement('div');
    empty.className = 'notice';
    empty.textContent = "Noch keine Beziehungskarten zugeordnet.";
    q('relList').appendChild(empty);
  }else{
    for(const r of rels){
      q('relList').appendChild(renderRelationshipCard(r));
    }
  }

  // interpretations random selection for this opening
  const pick = pickInterpretations(2);
  const interpWrap = q('interpList');
  interpWrap.innerHTML = "";
  for(const i of pick){
    const el = document.createElement('div');
    el.className = 'notice';
    el.innerHTML = `
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
        <div>
          <b>${escapeHTML(i.title)}</b> <span class="badge">${escapeHTML(i.level)}</span>
          <div style="margin-top:6px;">${escapeHTML(i.prompt)}</div>
          ${i.help ? `<div class="small" style="margin-top:8px;">Impuls: ${escapeHTML(i.help)}</div>` : ``}
        </div>
        <div class="badge">Interpretation</div>
      </div>
    `;
    interpWrap.appendChild(el);
  }

  // figure markdown
  fetchText(fig.text).then(md=>{
    q('mdBox').innerHTML = renderMarkdown(md);
  }).catch(err=>{
    q('mdBox').textContent = "Fehler beim Laden der Figurentexte: " + err.message;
  });

  q('modal').classList.add('show');
}

function renderMarkdown(md){
  // intentionally simple: headings + lists + paragraphs (no external libs)
  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;
  for(const line of lines){
    const l = line.trim();
    if(l.startsWith("# ")){
      if(inList){ html += "</ul>"; inList=false; }
      html += `<h1>${escapeHTML(l.slice(2))}</h1>`;
    } else if(l.startsWith("## ")){
      if(inList){ html += "</ul>"; inList=false; }
      html += `<h2>${escapeHTML(l.slice(3))}</h2>`;
    } else if(l.startsWith("- ")){
      if(!inList){ html += "<ul>"; inList=true; }
      html += `<li>${escapeHTML(l.slice(2))}</li>`;
    } else if(l === ""){
      if(inList){ html += "</ul>"; inList=false; }
      html += "<div style='height:8px'></div>";
    } else {
      if(inList){ html += "</ul>"; inList=false; }
      html += `<p>${escapeHTML(l)}</p>`;
    }
  }
  if(inList) html += "</ul>";
  return html;
}

function pickInterpretations(n){
  const arr = [...state.interpretations];
  // shuffle
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr.slice(0,n);
}

function closeModal(){
  q('modal').classList.remove('show');
}

function resetBoard(){
  for(const k of Object.keys(state.placement)) state.placement[k].clear();
  refreshZoneChips();
  setStatus("Board zurückgesetzt.", "warn");
}

function exportState(){
  const obj = {
    placement: {
      nahe: [...state.placement.nahe],
      distanz: [...state.placement.distanz],
      konflikt: [...state.placement.konflikt],
    }
  };
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:"application/json"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = "beziehungsfeld_state.json";
  a.click();
  URL.revokeObjectURL(a.href);
  setStatus("Export erstellt (beziehungsfeld_state.json).", "ok");
}

function importState(file){
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const obj = JSON.parse(reader.result);
      for(const k of Object.keys(state.placement)) state.placement[k].clear();
      for(const k of ["nahe","distanz","konflikt"]){
        for(const id of (obj.placement?.[k] || [])){
          state.placement[k].add(id);
        }
      }
      refreshZoneChips();
      setStatus("Import geladen.", "ok");
    }catch(e){
      setStatus("Import fehlgeschlagen: " + e.message, "bad");
    }
  };
  reader.readAsText(file);
}

async function boot(){
  setStatus("Lade Daten…", "warn");
  try{
    state.figures = await fetchJSON("data/figures.json");
    state.relationships = await fetchJSON("data/relationships.json");
    state.interpretations = await fetchJSON("data/interpretations.json");
    state.timeline = await fetchJSON("data/timeline.json");
    state.relByFigure = groupRelationshipsByFigure(state.relationships);

    renderFigureList();
    renderZones();
    setupDnD();
    renderTimeline();

    wireUI();
    setStatus("Bereit. Ziehe Figuren ins Beziehungsfeld oder doppelklicke für Profil.", "ok");
  }catch(err){
    console.error(err);
    setStatus("Fehler beim Laden: " + err.message, "bad");
  }
}

function renderTimeline(){
  const wrap = q('timeline');
  wrap.innerHTML = "";
  for(const t of state.timeline){
    const box = document.createElement('div');
    box.className = "notice";
    box.innerHTML = `
      <div style="display:flex; gap:10px; align-items:flex-start; justify-content:space-between;">
        <div>
          <b>${escapeHTML(t.label)}</b>
          <ul style="margin:8px 0 0 18px; color: rgba(232,236,241,.88);">
            ${(t.questions||[]).map(qs=>`<li>${escapeHTML(qs)}</li>`).join("")}
          </ul>
        </div>
        <span class="badge">Zeitbruch</span>
      </div>
    `;
    wrap.appendChild(box);
  }
}

function wireUI(){
  q('btnReset').addEventListener('click', resetBoard);
  q('btnExport').addEventListener('click', exportState);
  q('btnImport').addEventListener('click', ()=> q('fileImport').click());
  q('fileImport').addEventListener('change', (e)=>{
    const f = e.target.files?.[0];
    if(f) importState(f);
    e.target.value = "";
  });

  q('btnHow').addEventListener('click', ()=>{
    q('how').style.display = (q('how').style.display === "none" ? "block" : "none");
  });

  q('modalClose').addEventListener('click', closeModal);
  q('modal').addEventListener('click', (e)=>{
    if(e.target === q('modal')) closeModal();
  });

  // click chip opens figure
  for(const k of ["nahe","distanz","konflikt"]){
    q(`zone_${k}_placed`).addEventListener('click', (e)=>{
      const chip = e.target.closest?.('.chip');
      if(!chip) return;
      // chip structure doesn't carry id, so use text match
      const name = chip.textContent?.trim();
      const fig = state.figures.find(f=>f.name===name);
      if(fig) openFigure(fig.id);
    });
  }

  // open figure from list via single click button
  q('btnOpenSelected').addEventListener('click', ()=>{
    const sel = q('selectFigure').value;
    if(sel) openFigure(sel);
  });

  // populate select
  const sel = q('selectFigure');
  sel.innerHTML = `<option value="">– Figur wählen –</option>` + state.figures.map(f=>`<option value="${f.id}">${escapeHTML(f.name)} (${escapeHTML(f.role)})</option>`).join("");
}

boot();
