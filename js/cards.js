// cards.js - CHANGES v1: initial file
export function makeFigureCard(fig){
  const el = document.createElement('div');
  el.className = 'card';
  el.draggable = true;
  el.dataset.figureId = fig.id;
  el.innerHTML = `
    <div class="avatar"><img alt="${escapeHTML(fig.name)}" src="${fig.image}"></div>
    <div class="meta">
      <p class="name">${escapeHTML(fig.name)}</p>
      <p class="role">${escapeHTML(fig.role)}</p>
    </div>
  `;
  el.addEventListener('dragstart', (e)=>{
    el.classList.add('dragging');
    e.dataTransfer.setData('text/plain', fig.id);
    e.dataTransfer.effectAllowed = 'move';
  });
  el.addEventListener('dragend', ()=>{
    el.classList.remove('dragging');
  });
  return el;
}

export function escapeHTML(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
