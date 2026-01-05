// loadData.js - CHANGES v1: initial file
export async function fetchJSON(path){
  const res = await fetch(path, {cache: "no-store"});
  if(!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.json();
}

export async function fetchText(path){
  const res = await fetch(path, {cache: "no-store"});
  if(!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.text();
}
