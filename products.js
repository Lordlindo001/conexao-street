// products.js — renderiza products.html a partir de products.json (GitHub Pages safe)
(() => {
  "use strict";

  function go(path){
    const url = new URL(path, window.location.href);
    window.location.href = url.toString();
  }

  function brl(v){
    const n = Number(v || 0);
    try { return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" }); }
    catch { return "R$ " + n.toFixed(2).replace(".", ","); }
  }

  async function loadProducts(){
    // 1) override opcional por localStorage
    const override = localStorage.getItem("cs_catalog_override");
    if(override){
      try{
        const arr = JSON.parse(override);
        if(Array.isArray(arr)) return arr;
      }catch{}
    }

    // 2) products.json
    const res = await fetch("./products.json", { cache:"no-store" });
    if(!res.ok) throw new Error("Falha ao carregar products.json");
    const arr = await res.json();
    if(!Array.isArray(arr)) throw new Error("products.json não é array");
    return arr;
  }

  function render(products){
    const grid =
      document.getElementById("productsGrid") ||
      document.getElementById("grid") ||
      document.querySelector("[data-products-grid]");

    if(!grid){
      console.warn("[products] Nenhuma grid encontrada (productsGrid/grid/data-products-grid).");
      return;
    }

    grid.innerHTML = "";

    products.forEach((p) => {
      const id = String(p.id ?? "").trim();
      const name = String(p.name ?? "Produto");
      const price = Number(p.price ?? 0);
      const img = String(p.image ?? "");
      const desc = String(p.description ?? "");

      const card = document.createElement("div");
      card.className = "product-card";

      const imgEl = img ? `<img class="product-img" src="${img}" alt="${name}">` : "";
      card.innerHTML = `
        ${imgEl}
        <div class="product-body">
          <div class="product-title">${name}</div>
          <div class="product-price">${brl(price)}</div>
          ${desc ? `<div class="product-desc">${desc}</div>` : ""}
          <button class="product-buy" type="button">Comprar</button>
        </div>
      `;

      const btn = card.querySelector(".product-buy");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if(id) go(`checkout.html?id=${encodeURIComponent(id)}`);
        else go("checkout.html");
      }, { passive:false });

      grid.appendChild(card);
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try{
      const products = await loadProducts();
      render(products);
    }catch(err){
      console.error(err);
      const el = document.getElementById("productsError") || document.querySelector("[data-products-error]");
      if(el) el.textContent = "Não consegui carregar os produtos. Verifica o products.json.";
    }
  });
})();