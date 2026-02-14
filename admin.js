"use strict";

const KEY_AUTH = "cs_admin_ok";
const KEY_PIN  = "cs_admin_pin"; // opcional: se quiser trocar depois
const KEY_CATALOG_OVERRIDE = "cs_catalog_override";
const KEY_PRICING_RULES = "cs_pricing_rules";

// ✅ PIN fixo (coloque o MESMO que você usa no seu index/app.js)
const PIN = "Euteamoluptameuamor010324c";

const el = (id) => document.getElementById(id);
const pin = el("pin");
const enter = el("enter");
const leave = el("leave");
const authChip = el("authChip");
const tabs = el("tabs");

const tabCatalog = el("tab-catalog");
const tabPricing = el("tab-pricing");
const tabImport = el("tab-import");
const tabExport = el("tab-export");

function isAuthed(){ return localStorage.getItem(KEY_AUTH) === "1"; }

function setAuthUI(on){
  if(on){
    authChip.textContent = "liberado";
    authChip.className = "chip ok";
    el("gate").style.display = "none";
    tabs.style.display = "";
    showTab("catalog");
  }else{
    authChip.textContent = "travado";
    authChip.className = "chip warn";
    el("gate").style.display = "";
    tabs.style.display = "none";
    tabCatalog.style.display = "none";
    tabPricing.style.display = "none";
    tabImport.style.display = "none";
    tabExport.style.display = "none";
  }
}

function showTab(name){
  tabCatalog.style.display = (name === "catalog") ? "" : "none";
  tabPricing.style.display = (name === "pricing") ? "" : "none";
  tabImport.style.display = (name === "import") ? "" : "none";
  tabExport.style.display = (name === "export") ? "" : "none";

  document.querySelectorAll(".tab").forEach(t => {
    t.classList.toggle("on", t.getAttribute("data-tab") === name);
  });

  if(name === "catalog") renderCatalog();
  if(name === "pricing") renderPricing();
  if(name === "import") renderImport();
  if(name === "export") renderExport();
}

function getCatalog(){
  const raw = localStorage.getItem(KEY_CATALOG_OVERRIDE);
  if(!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

async function getBaseCatalog(){
  const res = await fetch("./products.json", { cache:"no-store" });
  if(!res.ok) return [];
  return res.json();
}

function saveCatalog(catalog){
  localStorage.setItem(KEY_CATALOG_OVERRIDE, JSON.stringify(catalog, null, 2));
}

function getRules(){
  const raw = localStorage.getItem(KEY_PRICING_RULES);
  if(!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function saveRules(rules){
  localStorage.setItem(KEY_PRICING_RULES, JSON.stringify(rules, null, 2));
}

function downloadFile(filename, content, mime="application/json"){
  const blob = new Blob([content], { type:mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function rowHTML(title, inner){
  return `
    <div class="row">
      <div class="rowTop">
        <b>${title}</b>
        <span class="chip">admin</span>
      </div>
      <div style="height:10px"></div>
      ${inner}
    </div>
  `;
}

/* ===== Render: Catálogo ===== */
async function renderCatalog(){
  tabCatalog.innerHTML = `<div class="hint">Carregando catálogo...</div>`;

  const base = await getBaseCatalog();
  const current = getCatalog() || base;

  const items = current.map(p => {
    return rowHTML(p.name || p.id, `
      <div class="miniGrid">
        <div>
          <div class="hint">ID</div>
          <input class="inp" data-k="id" data-id="${p.id}" value="${p.id}" />
        </div>
        <div>
          <div class="hint">Nome</div>
          <input class="inp" data-k="name" data-id="${p.id}" value="${p.name||""}" />
        </div>
        <div>
          <div class="hint">Preço base (valor único)</div>
          <input class="inp" data-k="price" data-id="${p.id}" value="${p.price}" />
        </div>
        <div>
          <div class="hint">Imagem (URL)</div>
          <input class="inp" data-k="image" data-id="${p.id}" value="${p.image||""}" />
        </div>
      </div>
      <div style="height:10px"></div>
      <div class="hint">Descrição</div>
      <input class="inp" data-k="description" data-id="${p.id}" value="${(p.description||"").replaceAll('"',"&quot;")}" />
    `);
  }).join("");

  tabCatalog.innerHTML = `
    <div class="hint">
      Isso altera o que aparece em products.html e checkout.html (no seu navegador).  
      Pra tornar global, exporta JSON e sobe no host.
    </div>
    ${items}
    <button class="btn primary" id="saveCatalog" type="button">Salvar catálogo</button>
    <button class="btn" id="resetCatalog" type="button">Resetar (voltar pro products.json)</button>
  `;

  el("saveCatalog").addEventListener("click", () => {
    const updated = current.map(p => ({...p}));

    // lê inputs
    tabCatalog.querySelectorAll("input.inp[data-k]").forEach(inp => {
      const id = inp.getAttribute("data-id");
      const key = inp.getAttribute("data-k");
      const prod = updated.find(x => String(x.id) === String(id));
      if(!prod) return;

      let v = inp.value;

      if(key === "price"){
        v = Number(String(v).replace(",", "."));
        if(!isFinite(v) || v <= 0) v = prod.price;
      }
      prod[key] = v;
    });

    saveCatalog(updated);
    alert("Catálogo salvo ✅");
    renderCatalog();
  });

  el("resetCatalog").addEventListener("click", () => {
    localStorage.removeItem(KEY_CATALOG_OVERRIDE);
    alert("Catálogo resetado ✅");
    renderCatalog();
  });
}

/* ===== Render: Promoções/Preços ===== */
async function renderPricing(){
  tabPricing.innerHTML = `<div class="hint">Carregando regras...</div>`;

  const base = await getBaseCatalog();
  const catalog = getCatalog() || base;

  const rules = getRules();

  const blocks = catalog.map(p => {
    const r = rules[p.id] || { promoOn:false, type:"none", percent:0, fixedPrice:null };
    return rowHTML(p.name || p.id, `
      <div class="miniGrid">
        <div>
          <div class="hint">Promoção ativa?</div>
          <input class="inp" data-rk="promoOn" data-id="${p.id}" value="${r.promoOn ? "sim" : "nao"}" />
          <div class="hint" style="margin-top:6px">Use: sim / nao</div>
        </div>
        <div>
          <div class="hint">Tipo</div>
          <input class="inp" data-rk="type" data-id="${p.id}" value="${r.type}" />
          <div class="hint" style="margin-top:6px">Use: percent / fixed / none</div>
        </div>
        <div>
          <div class="hint">Percentual (%)</div>
          <input class="inp" data-rk="percent" data-id="${p.id}" value="${r.percent||0}" />
        </div>
        <div>
          <div class="hint">Preço fixo (promo)</div>
          <input class="inp" data-rk="fixedPrice" data-id="${p.id}" value="${r.fixedPrice ?? ""}" />
        </div>
      </div>
      <div class="hint" style="margin-top:10px">
        Base: R$ ${Number(p.price).toFixed(2).replace(".", ",")} — checkout usa a regra daqui se estiver ativa.
      </div>
    `);
  }).join("");

  tabPricing.innerHTML = `
    <div class="hint">
      Valor base é único. Promoção só entra se você ligar aqui (admin).  
      checkout.html mostra o preço final automaticamente.
    </div>
    ${blocks}
    <button class="btn primary" id="saveRules" type="button">Salvar promoções</button>
    <button class="btn" id="resetRules" type="button">Resetar promoções</button>
  `;

  el("saveRules").addEventListener("click", () => {
    const newRules = {...rules};

    tabPricing.querySelectorAll("input.inp[data-rk]").forEach(inp => {
      const id = inp.getAttribute("data-id");
      const k = inp.getAttribute("data-rk");
      const v = (inp.value || "").trim();

      newRules[id] = newRules[id] || { promoOn:false, type:"none", percent:0, fixedPrice:null };

      if(k === "promoOn") newRules[id].promoOn = (v.toLowerCase() === "sim");
      else if(k === "type") newRules[id].type = (v || "none");
      else if(k === "percent") newRules[id].percent = Number(String(v).replace(",", ".")) || 0;
      else if(k === "fixedPrice"){
        const n = Number(String(v).replace(",", "."));
        newRules[id].fixedPrice = (isFinite(n) && n > 0) ? n : null;
      }
    });

    saveRules(newRules);
    alert("Promoções salvas ✅");
    renderPricing();
  });

  el("resetRules").addEventListener("click", () => {
    localStorage.removeItem(KEY_PRICING_RULES);
    alert("Promoções resetadas ✅");
    renderPricing();
  });
}

/* ===== Importar ===== */
function renderImport(){
  tabImport.innerHTML = `
    <div class="hint">
      Aqui você importa arquivos JSON para virar “admin global” (você edita aqui, exporta, e sobe no host).
    </div>

    ${rowHTML("Importar catálogo (products.json)", `
      <input class="inp" type="file" id="fileCatalog" accept="application/json" />
      <button class="btn primary" id="importCatalog" type="button">Importar catálogo</button>
    `)}

    ${rowHTML("Importar promoções (pricing.json)", `
      <input class="inp" type="file" id="filePricing" accept="application/json" />
      <button class="btn primary" id="importPricing" type="button">Importar promoções</button>
    `)}
  `;

  el("importCatalog").addEventListener("click", async () => {
    const f = el("fileCatalog").files?.[0];
    if(!f) return alert("Escolha um arquivo JSON");
    const txt = await f.text();
    try{
      const data = JSON.parse(txt);
      if(!Array.isArray(data)) return alert("Catálogo precisa ser um array JSON");
      saveCatalog(data);
      alert("Catálogo importado ✅");
    }catch{
      alert("JSON inválido");
    }
  });

  el("importPricing").addEventListener("click", async () => {
    const f = el("filePricing").files?.[0];
    if(!f) return alert("Escolha um arquivo JSON");
    const txt = await f.text();
    try{
      const data = JSON.parse(txt);
      if(typeof data !== "object") return alert("Pricing precisa ser objeto JSON");
      saveRules(data);
      alert("Promoções importadas ✅");
    }catch{
      alert("JSON inválido");
    }
  });
}

/* ===== Exportar ===== */
async function renderExport(){
  const base = await getBaseCatalog();
  const catalog = getCatalog() || base;
  const rules = getRules();

  tabExport.innerHTML = `
    <div class="hint">
      Exporta os arquivos e sobe no host pra ficar “global”.
    </div>

    ${rowHTML("Exportar catálogo", `
      <button class="btn primary" id="expCatalog" type="button">Baixar catalog.json</button>
      <div class="hint" style="margin-top:8px">Depois você pode renomear pra products.json e subir no site.</div>
    `)}

    ${rowHTML("Exportar promoções", `
      <button class="btn primary" id="expPricing" type="button">Baixar pricing.json</button>
    `)}

    ${rowHTML("Limpar tudo", `
      <button class="btn" id="wipe" type="button">Apagar overrides desse navegador</button>
    `)}
  `;

  el("expCatalog").addEventListener("click", () => {
    downloadFile("catalog.json", JSON.stringify(catalog, null, 2));
  });

  el("expPricing").addEventListener("click", () => {
    downloadFile("pricing.json", JSON.stringify(rules, null, 2));
  });

  el("wipe").addEventListener("click", () => {
    localStorage.removeItem(KEY_CATALOG_OVERRIDE);
    localStorage.removeItem(KEY_PRICING_RULES);
    alert("Overrides apagados ✅");
    renderExport();
  });
}

/* ===== Tabs + Auth ===== */
function wireTabs(){
  document.querySelectorAll(".tab").forEach(t => {
    t.addEventListener("click", () => showTab(t.getAttribute("data-tab")));
  });
}

enter.addEventListener("click", () => {
  const v = (pin.value||"").trim();
  if(v === PIN){
    localStorage.setItem(KEY_AUTH, "1");
    setAuthUI(true);
    leave.style.display = "";
  }else{
    alert("PIN incorreto");
    pin.focus();
  }
});

leave.addEventListener("click", () => {
  localStorage.removeItem(KEY_AUTH);
  setAuthUI(false);
  pin.value = "";
  leave.style.display = "none";
});

document.addEventListener("DOMContentLoaded", () => {
  wireTabs();
  if(isAuthed()){
    setAuthUI(true);
    leave.style.display = "";
  }else{
    setAuthUI(false);
  }
});
