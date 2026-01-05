// relations.js - CHANGES v1: initial file
import { escapeHTML } from "./cards.js";

export function groupRelationshipsByFigure(relationships){
  const m = new Map();
  for(const r of relationships){
    for(const fid of (r.figures||[])){
      if(!m.has(fid)) m.set(fid, []);
      m.get(fid).push(r);
    }
  }
  return m;
}

export function renderRelationshipCard(r){
  const el = document.createElement('div');
  el.className = 'notice';
  el.innerHTML = `
    <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
      <div>
        <b>${escapeHTML(r.type)}</b> <span class="badge">${escapeHTML(r.phase || "—")}</span>
        <div style="margin-top:6px;">${escapeHTML(r.prompt || "")}</div>
        ${r.evidence ? `<div class="small" style="margin-top:8px;">Textanker: ${escapeHTML(r.evidence)}</div>` : ``}
      </div>
      <div class="badge warn">Beziehungskarte</div>
    </div>
  `;
  return el;
}
