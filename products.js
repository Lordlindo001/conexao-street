// products.js — renderiza products.html a partir de products.json (ou override) e compra vai pro checkout.html?id=...
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function go(path){
    const url = new URL(path, window.location.href);
    window.location.href = url.toString();
  }

  function moneyBRL(v){
    const n = Number(v || 0);
    return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
  }

  function getOverride(){
    try{
      const raw = localStorage.getItem("cs_catalog_override");
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    }catch{
      return null;
    }
  }

  async function loadCatalog(){
    const ov = getOverride();
    if(ov && ov.length) return ov;

    const res = await fetch("./products.json", { cache:"no-store" });
    if(!res.ok) throw new Error("Falha ao carregar products.json");
    const arr = await res.json();
    if(!Array.isArray(arr)) throw new Error("products.json inválido (esperado array)");
    return arr;
  }

  function normalize(arr){
    // garante campos mínimos e evita quebrar layout
    return (arr || [])
      .filter(Boolean)
      .map(p => ({
        id: String(p.id ?? ""),
        name: String(p.name ?? "Produto"),
        price: Number(p.price ?? 0),
        image: String(p.image ?? ""),
        description: String(p.description ?? ""),
        bullets: Array.isArray(p.bullets) ? p.bullets.map(String) : [],
        whatsapp_invite: p.whatsapp_invite ? String(p.whatsapp_invite) : null
      }))
      .filter(p => p.id.length > 0);
  }

  function productCard(p){
    const card = document.createElement("article");
    card.className = "card";

    const glow = document.createElement("div");
    glow.className = "cardGlow";

    const inner = document.createElement("div");
    inner.className = "cardInner";

    // mídia + texto
    const media = document.createElement("div");
    media.className = "pMedia";

    const img = document.createElement("img");
    img.className = "pImg";
    img.alt = p.name;
    img.loading = "lazy";
    if(p.image) img.src = p.image;

    const box = document.createElement("div");
    const h = document.createElement("h3");
    h.className = "pTitle";
    h.textContent = p.name;

    const price = document.createElement("div");
    price.className = "pPrice";
    price.textContent = moneyBRL(p.price);

    const desc = document.createElement("div");
    desc.className = "pDesc";
    desc.textContent = p.description || "";

    box.appendChild(h);
    box.appendChild(price);
    if(p.description) box.appendChild(desc);

    media.appendChild(img);
    media.appendChild(box);

    inner.appendChild(media);

    if(p.bullets && p.bullets.length){
      const ul = document.createElement("ul");
      ul.className = "pBullets";
      p.bullets.forEach(t => {
        const li = document.createElement("li");
        li.textContent = String(t);
        ul.appendChild(li);
      });
      inner.appendChild(ul);
    }

    const row = document.createElement("div");
    row.className = "btnRowInline";

    // ✅ botão comprar (blindado pra não cair em link “por trás”)
    const buy = document.createElement("button");
    buy.type = "button";
    buy.className = "btn primary btnSm";
    buy.textContent = "Comprar";
    buy.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      go(`checkout.html?id=${encodeURIComponent(p.id)}`);
    }, { passive:false });

    row.appendChild(buy);

    // opcional: se quiser mostrar que é WhatsApp no VIP (sem navegar direto, só visual)
    if(p.whatsapp_invite){
      const info = document.createElement("span");
      info.className = "chip";
      info.textContent = "Entrega via WhatsApp";
      row.appendChild(info);
    }

    inner.appendChild(row);

    card.appendChild(glow);
    card.appendChild(inner);
    return card;
  }

  async function main(){
    const grid = $("productsGrid");
    const chip = $("countChip");
    const statusChip = $("statusChip");
    const statusTxt = $("statusTxt");
    const btnBack = $("btnBack");
    const goCheckoutAny = $("goCheckoutAny");

    // volta segura
    if(btnBack){
      btnBack.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        go("index.html");
      }, { passive:false });
    }

    // botão hero checkout (sem id -> vai abrir products se sem query; mas mantém)
    if(goCheckoutAny){
      goCheckoutAny.addEventListener("click", (e) => {
        // se o cara clicar aqui, manda pra products se não tiver id; deixei simples:
        e.preventDefault();
        e.stopPropagation();
        go("checkout.html");
      }, { passive:false });
    }

    try{
      const raw = await loadCatalog();
      const items = normalize(raw);

      if(chip) chip.textContent = `${items.length} itens`;
      if(statusChip) statusChip.className = "chip ok";
      if(statusChip) statusChip.textContent = "Online";
      if(statusTxt) statusTxt.textContent = "Catálogo pronto pra compra.";

      if(!grid) return;
      grid.innerHTML = "";
      items.forEach(p => grid.appendChild(productCard(p)));
    }catch(err){
      console.warn("[products]", err);
      if(chip) chip.textContent = "0 itens";
      if(statusChip) statusChip.className = "chip warn";
      if(statusChip) statusChip.textContent = "Erro";
      if(statusTxt) statusTxt.textContent = "Não consegui carregar o catálogo. Confira o products.json.";
      if(grid) grid.innerHTML = "";
    }
  }

  document.addEventListener("DOMContentLoaded", main);
})();