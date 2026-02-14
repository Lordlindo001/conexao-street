"use strict";

/*
  Estrutura local (mock):
  - cs_orders: [{id, email, name, productId, productName, paidAt, status:"paid_pending"|"approved"}]
  - cs_approvals: { "<email>": { approved: ["lojista","final","grupo_vip"] } }
*/

const ORDERS_KEY = "cs_orders";
const APPROVALS_KEY = "cs_approvals";

const el = (id) => document.getElementById(id);

function loadJSON(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

function moneyBRL(v){
  return (Number(v)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

async function getCatalog(){
  const override = localStorage.getItem("cs_catalog_override");
  if(override){
    try { return JSON.parse(override); } catch {}
  }
  const res = await fetch("./products.json", { cache:"no-store" });
  if(!res.ok) return [];
  return res.json();
}

function isApproved(email, productId) {
  const approvals = loadJSON(APPROVALS_KEY, {});
  const rec = approvals[email];
  const arr = (rec && Array.isArray(rec.approved)) ? rec.approved : [];
  return arr.includes(String(productId));
}

function orderRowHTML(o, catalogItem, approved) {
  const st = approved ? `<span class="chip ok">aprovado</span>` : `<span class="chip warn">aguardando</span>`;
  const wpp = catalogItem && catalogItem.whatsapp_invite ? catalogItem.whatsapp_invite : null;

  let action = "";
  if (approved && wpp) {
    action = `<button class="btn" data-open="${encodeURIComponent(wpp)}" type="button">Entrar no Grupo VIP</button>`;
  } else if (approved) {
    action = `<button class="btn" data-products="1" type="button">Ver meus acessos</button>`;
  } else {
    action = `<button class="btn2" disabled type="button">Aguardando aprovação do admin</button>`;
  }

  return `
    <div class="row">
      <div class="rowTop">
        <b>${o.productName || o.productId}</b>
        ${st}
      </div>
      <div style="height:8px"></div>
      <div class="hint">
        Email: ${o.email || "-"}<br/>
        Pago em: ${o.paidAt ? new Date(o.paidAt).toLocaleString("pt-BR") : "-"}
      </div>
      <div style="height:8px"></div>
      ${action}
    </div>
  `;
}

async function boot() {
  // menu
  UI.wireMenu();

  // login obrigatório
  if (!UI.ensureLogged()) {
    alert("Você precisa fazer login pra acessar a Área Membro.");
    window.location.href = "./";
    return;
  }

  const user = UI.getUser();
  el("whoPill").textContent = user ? user.email : "logado";
  el("statusChip").textContent = "ok";

  const ordersAll = loadJSON(ORDERS_KEY, []);
  const myOrders = ordersAll.filter(o => String(o.email || "").toLowerCase() === String(user.email).toLowerCase());

  const catalog = await getCatalog();

  const list = el("list");
  if (!myOrders.length) {
    el("statusChip").textContent = "vazio";
    list.innerHTML = `<div class="row"><b>Nenhuma compra encontrada</b><div class="hint" style="margin-top:6px">Se você acabou de pagar, finalize no checkout e aguarde aprovação.</div></div>`;
  } else {
    const html = myOrders
      .sort((a,b) => (b.paidAt||0) - (a.paidAt||0))
      .map(o => {
        const item = catalog.find(p => String(p.id) === String(o.productId));
        const approved = isApproved(user.email, o.productId);
        return orderRowHTML(o, item, approved);
      })
      .join("");

    list.innerHTML = html;

    // ações
    list.querySelectorAll("button[data-open]").forEach(btn => {
      btn.addEventListener("click", () => {
        const url = decodeURIComponent(btn.getAttribute("data-open"));
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });

    list.querySelectorAll("button[data-products]").forEach(btn => {
      btn.addEventListener("click", () => {
        alert("Seus acessos estão liberados ✅\n(Agora é só você colar aqui a lista/links do conteúdo quando me mandar.)");
      });
    });
  }

  el("goShop").addEventListener("click", () => window.location.href = "./products.html");
}

document.addEventListener("DOMContentLoaded", boot);
