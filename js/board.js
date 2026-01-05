// board.js - CHANGES v1: initial file
import { escapeHTML } from "./cards.js";

export function setupDropZone(zoneEl, onDropFigure){
  zoneEl.addEventListener('dragover', (e)=>{
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    zoneEl.style.borderColor = 'rgba(139,211,255,.40)';
  });
  zoneEl.addEventListener('dragleave', ()=>{
    zoneEl.style.borderColor = 'rgba(255,255,255,.12)';
  });
  zoneEl.addEventListener('drop', (e)=>{
    e.preventDefault();
    zoneEl.style.borderColor = 'rgba(255,255,255,.12)';
    const id = e.dataTransfer.getData('text/plain');
    if(id) onDropFigure(id);
  });
}

export function renderChip(fig){
  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.innerHTML = `<img alt="" src="${fig.image}"><span>${escapeHTML(fig.name)}</span>`;
  chip.title = fig.role;
  return chip;
}
