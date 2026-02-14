"use strict";

const el = (id) => document.getElementById(id);

const loader = el("loader");

function showLoader(on){
  if(!loader) return;
  if(on) loader.classList.remove("off");
  else loader.classList.add("off");
}

function moneyBRL(v){
  return (Number(v)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

async function getCatalog(){
  const override = localStorage.getItem("cs_catalog_override");
  if(override){
    try { return JSON.parse(override); } catch {}
  }
  const res = await fetch("./products.json", { cache:"no-store" });
  if(!res.ok) throw new Error("Falha ao carregar products.json");
  return res.json();
}

function getPricingRules(){
  const raw = localStorage.getItem("cs_pricing_rules");
  if(!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function calcPrice(basePrice, rule){
  if(!rule || !rule.promoOn) return { final: basePrice, note: null };

  if(rule.type === "percent"){
    const pct = Math.max(0, Math.min(95, Number(rule.percent)||0));
    const final = +(basePrice * (1 - pct/100)).toFixed(2);
    return { final, note: `Promoção aplicada: -${pct}% (Admin)` };
  }

  if(rule.type === "fixed"){
    const fp = Number(rule.fixedPrice);
    if(!isFinite(fp) || fp <= 0) return { final: basePrice, note: null };
    return { final: +fp.toFixed(2), note: `Preço promocional definido pelo Admin` };
  }

  return { final: basePrice, note: null };
}

const ORDERS_KEY = "cs_orders";
const APPROVALS_KEY = "cs_approvals";

function loadJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function saveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function isApproved(email, productId) {
  const approvals = loadJSON(APPROVALS_KEY, {});
  const rec = approvals[email];
  const arr = (rec && Array.isArray(rec.approved)) ? rec.approved : [];
  return arr.includes(String(productId));
}

function ensureOrder(email, name, product) {
  const orders = loadJSON(ORDERS_KEY, []);
  const id = `ord_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const o = {
    id,
    email: String(email||"").toLowerCase(),
    name: String(name||""),
    productId: String(product.id),
    productName: String(product.name||product.id),
    paidAt: Date.now(),
    status: "paid_pending"
  };

  orders.push(o);
  saveJSON(ORDERS_KEY, orders);
  return o;
}

async function boot(){
  showLoader(true);

  try{
    if (window.UI && UI.wireMenu) UI.wireMenu();

    const id = getParam("id");
    if(!id) throw new Error("Produto não informado (sem ?id=...)");

    const catalog = await getCatalog();
    const p = catalog.find(x => String(x.id) === String(id));
    if(!p) throw new Error("Produto não encontrado");

    const img = el("img");
    const name = el("name");
    const desc = el("desc");
    const price = el("price");
    const promoHint = el("promoHint");
    const statusChip = el("statusChip");

    const rules = getPricingRules();
    const rule = rules[p.id];
    const pricing = calcPrice(Number(p.price||0), rule);

    if(img) img.style.backgroundImage = `url('${String(p.image||"").replaceAll("'","%27")}')`;
    if(name) name.textContent = p.name || p.id;
    if(desc) desc.textContent = p.description || "";
    if(price) price.textContent = moneyBRL(pricing.final);

    if(pricing.note){
      promoHint.style.display = "";
      promoHint.textContent = pricing.note;
      statusChip.textContent = "promo";
      statusChip.className = "chip ok";
    }else{
      promoHint.style.display = "none";
      statusChip.textContent = "valor único";
      statusChip.className = "chip ok";
    }

    const copyPix = el("copyPix");
    const payKey = el("payKey");
    if(copyPix){
      copyPix.addEventListener("click", async () => {
        try{
          await navigator.clipboard.writeText(payKey.value || "");
          alert("Copiado ✅");
        }catch{
          payKey.select();
          document.execCommand("copy");
          alert("Copiado ✅");
        }
      });
    }

    const confirmBtn = el("confirmBtn");
    const buyerName = el("buyerName");
    const buyerEmail = el("buyerEmail");

    const accessBox = el("accessBox");
    const accessHint = el("accessHint");
    const accessBtn = el("accessBtn");

    function refreshAccessState(email){
      const approved = isApproved(email, p.id);

      accessBox.style.display = "";
      if(!approved){
        accessHint.textContent = "Pagamento registrado. Agora aguarde a aprovação do admin para liberar o acesso.";
        accessBtn.disabled = true;
        accessBtn.textContent = "Aguardando aprovação";
        return;
      }

      if(p.whatsapp_invite){
        accessHint.textContent = "Aprovado ✅ Clique para entrar no Grupo VIP.";
        accessBtn.disabled = false;
        accessBtn.textContent = "Entrar no Grupo VIP";
        accessBtn.onclick = () => window.open(p.whatsapp_invite, "_blank", "noopener,noreferrer");
      }else{
        accessHint.textContent = "Aprovado ✅ Acesse sua Área Membro para ver seu conteúdo.";
        accessBtn.disabled = false;
        accessBtn.textContent = "Abrir Área Membro";
        accessBtn.onclick = () => window.location.href = "./member.html";
      }
    }

    if(confirmBtn){
      confirmBtn.addEventListener("click", () => {
        const nm = (buyerName.value || "").trim();
        const em = (buyerEmail.value || "").trim().toLowerCase();

        if(!nm || nm.length < 2) return alert("Digite seu nome.");
        if(!em || !em.includes("@")) return alert("Digite um e-mail válido.");

        if (window.UI && UI.setUser) UI.setUser({ name: nm, email: em });

        ensureOrder(em, nm, p);

        alert("Pagamento marcado ✅\nAgora aguarde a aprovação do admin.");
        refreshAccessState(em);
      });
    }

    if (window.UI && UI.isLogged && UI.getUser) {
      const u = UI.getUser();
      if (u && u.email) {
        accessBox.style.display = "";
        refreshAccessState(u.email.toLowerCase());
      }
    }

  }catch(e){
    alert(String(e.message || e));
  }finally{
    setTimeout(() => showLoader(false), 200);
  }
}

document.addEventListener("DOMContentLoaded", boot);