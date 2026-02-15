// member.js — Área Membro (Supabase-first, com fallback localStorage)
// Regras:
// - Se Supabase estiver configurado (supabase-js + APP_CONFIG), usa cs_orders para listar compras do e-mail logado.
// - Se não estiver, cai no modo antigo (localStorage) para não quebrar nada.
(() => {
  "use strict";

  function $(id){ return document.getElementById(id); }

  function setText(id, txt){
    const el = $(id);
    if(el) el.textContent = String(txt ?? "");
  }

  function moneyBRL(v){
    try{ return Number(v).toLocaleString("pt-BR", { style:"currency", currency:"BRL" }); }
    catch{ return `R$ ${v}`; }
  }

  function makeChip(text, cls){
    const s = document.createElement("span");
    s.className = `chip ${cls||""}`.trim();
    s.textContent = text;
    return s;
  }

  function makeRow(order){
    // order: { product_name/product_id, order_status, payment_status, amount, id, created_at }
    const row = document.createElement("div");
    row.className = "row";

    const top = document.createElement("div");
    top.className = "rowTop";

    const left = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = order.product_name || order.product_id || "Produto";
    left.appendChild(title);

    const right = document.createElement("div");

    const pay = String(order.payment_status || "").toUpperCase();
    const st  = String(order.order_status || "").toUpperCase();

    // status principal
    let statusTxt = "aguardando";
    let statusCls = "warn";

    if(st === "APROVADO"){
      statusTxt = "liberado";
      statusCls = "ok";
    }else if(pay === "PAGO"){
      statusTxt = "pago";
      statusCls = "ok";
    }else if(pay === "PENDENTE" || pay === "PENDENTE_DE_CONFIRMACAO"){
      statusTxt = "pendente";
      statusCls = "warn";
    }

    right.appendChild(makeChip(statusTxt, statusCls));

    // valor + id
    const meta = document.createElement("div");
    meta.style.marginTop = "6px";
    meta.innerHTML = `<small style="color:var(--muted)">Pedido #${order.id ?? "—"} • ${moneyBRL(order.amount ?? 0)}</small>`;
    left.appendChild(meta);

    top.appendChild(left);
    top.appendChild(right);
    row.appendChild(top);

    // mensagem
    const hint = document.createElement("div");
    hint.className = "hint";
    hint.style.marginTop = "10px";
    hint.textContent = (st === "APROVADO")
      ? "Acesso liberado ✅"
      : "Aguardando aprovação do admin…";
    row.appendChild(hint);

    return row;
  }

  function hasSupabaseReady(){
    return !!(window.supabase && window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL && window.APP_CONFIG.SUPABASE_ANON_KEY);
  }

  async function bootSupabase(){
    const user = (window.UI && typeof window.UI.getUser === "function") ? window.UI.getUser() : null;

    // who pill
    if(user?.email) setText("whoPill", user.email);
    else setText("whoPill", "Visitante");

    // se não tem e-mail, não tem como filtrar pedidos
    if(!user?.email){
      setText("statusChip", "faça login");
      const list = $("list");
      if(list){
        list.innerHTML = "";
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `<b>Você precisa entrar</b><div class="hint" style="margin-top:8px">Faça login para ver seus acessos.</div>`;
        list.appendChild(row);
      }
      return;
    }

    const client = window.supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);

    // Busca últimos pedidos desse e-mail
    const { data, error } = await client
      .from("cs_orders")
      .select("id, created_at, product_id, product_name, amount, currency, payment_status, order_status")
      .eq("buyer_email", user.email)
      .order("id", { ascending:false })
      .limit(50);

    const list = $("list");
    if(!list) return;

    list.innerHTML = "";

    if(error){
      console.error("[member cs_orders]", error);
      setText("statusChip", "erro");
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<b>Não consegui carregar seus pedidos.</b><div class="hint" style="margin-top:8px">Tenta de novo mais tarde.</div>`;
      list.appendChild(row);
      return;
    }

    const arr = Array.isArray(data) ? data : [];
    setText("statusChip", `${arr.length} item(ns)`);

    if(!arr.length){
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<b>Nenhuma compra encontrada</b><div class="hint" style="margin-top:8px">Se você já pagou, aguarde o admin aprovar.</div>`;
      list.appendChild(row);
      return;
    }

    arr.forEach((o) => list.appendChild(makeRow(o)));
  }

  // ===== fallback antigo (localStorage) =====
  function bootLegacy(){
    const KEY_ORDERS = "cs_orders";
    const KEY_APPROVALS = "cs_approvals";

    const orders = (() => {
      try{ return JSON.parse(localStorage.getItem(KEY_ORDERS) || "[]"); }
      catch{ return []; }
    })();

    const approvals = (() => {
      try{ return JSON.parse(localStorage.getItem(KEY_APPROVALS) || "[]"); }
      catch{ return []; }
    })();

    const user = (window.UI && typeof window.UI.getUser === "function") ? window.UI.getUser() : null;
    if(user?.email) setText("whoPill", user.email);

    const list = $("list");
    const statusChip = $("statusChip");
    if(!list) return;

    list.innerHTML = "";

    const myEmail = String(user?.email || "").toLowerCase().trim();
    const myOrders = orders.filter(o => String(o?.buyer_email || "").toLowerCase().trim() === myEmail);

    if(statusChip) statusChip.textContent = `${myOrders.length} item(ns)`;

    if(!myOrders.length){
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<b>Nenhuma compra encontrada</b><div class="hint" style="margin-top:8px">Se você já pagou, aguarde o admin aprovar.</div>`;
      list.appendChild(row);
      return;
    }

    myOrders.sort((a,b) => Number(b.id||0) - Number(a.id||0)).forEach((o) => {
      const approved = approvals.some(ap => String(ap?.order_id) === String(o?.id));
      list.appendChild(makeRow({
        id: o?.id,
        product_id: o?.product_id,
        product_name: o?.product_name,
        amount: o?.amount,
        payment_status: o?.payment_status,
        order_status: approved ? "APROVADO" : (o?.order_status || "CRIADO")
      }));
    });
  }

  async function boot(){
    // mini-menu (se existir)
    if(window.UI && typeof window.UI.wireMenu === "function") window.UI.wireMenu();

    // botão voltar
    const goShop = $("goShop");
    if(goShop){
      goShop.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "./products.html";
      }, { passive:false });
    }

    if(hasSupabaseReady()){
      try{
        await bootSupabase();
        return;
      }catch(err){
        console.error("[member supabase boot]", err);
        // se falhar, cai pro legacy
      }
    }
    bootLegacy();
  }

  document.addEventListener("DOMContentLoaded", () => {
    boot().catch?.(()=>{});
  });
})();
