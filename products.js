"use strict";

const grid = document.getElementById("grid");

function moneyBRL(v){
  return (Number(v)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

async function getCatalog(){
  // se admin tiver carregado override no navegador, usa ele
  const override = localStorage.getItem("cs_catalog_override");
  if(override){
    try { return JSON.parse(override); } catch {}
  }
  const res = await fetch("./products.json", { cache:"no-store" });
  if(!res.ok) throw new Error("Falha ao carregar products.json");
  return res.json();
}

function cardHTML(p){
  const safeName = String(p.name||"");
  const safeDesc = String(p.description||"");
  const img = String(p.image||"");

  return `
    <div class="card">
      <div class="img" style="background-image:url('${img.replaceAll("'","%27")}')"></div>
      <div class="cwrap">
        <div class="name">${safeName}</div>
        <div class="desc">${safeDesc}</div>
        <div class="row">
          <div class="price">${moneyBRL(p.price)}</div>
          <button class="btn" data-id="${p.id}">Comprar</button>
        </div>
      </div>
    </div>
  `;
}

async function boot(){
  try{
    const catalog = await getCatalog();
    grid.innerHTML = catalog.map(cardHTML).join("");

    grid.querySelectorAll("button[data-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.location.href = `./checkout.html?id=${encodeURIComponent(id)}`;
      });
    });
  }catch(e){
    grid.innerHTML = `<div style="color:#a6a6b3;padding:14px">Erro: ${String(e.message||e)}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", boot);
