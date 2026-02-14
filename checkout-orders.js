// checkout-orders.js — cria pedido PENDENTE em public.cs_orders (Supabase)
// Compatível com seu checkout.html (botão: #confirmBtn)
// Requisitos:
// - supabase-js v2 carregado (CDN) -> window.supabase
// - SUPABASE_URL/ANON_KEY definidos (aceita vários nomes)
// - products.json na raiz

(() => {
  "use strict";

  // 1) Config (aceita os nomes que você já usa no projeto)
  const SUPABASE_URL =
    window.CS_SUPABASE_URL ||
    window.SUPABASE_URL ||
    window.__SUPABASE_URL__ ||
    (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) ||
    "";

  const SUPABASE_ANON_KEY =
    window.CS_SUPABASE_ANON_KEY ||
    window.SUPABASE_ANON_KEY ||
    window.__SUPABASE_ANON_KEY__ ||
    (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY) ||
    "";

  function $(id){ return document.getElementById(id); }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[checkout-orders] Falta SUPABASE_URL/ANON_KEY (ou CS_SUPABASE_URL/CS_SUPABASE_ANON_KEY).");
    return;
  }

  if (!window.supabase?.createClient) {
    console.warn("[checkout-orders] supabase-js não carregou (window.supabase).");
    return;
  }

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function pickBtn(){
    // ✅ PRIORIDADE pro seu botão real do layout
    const prefer = $("confirmBtn");
    if (prefer) return prefer;

    // fallback (outros IDs comuns)
    return (
      $("btnPay") ||
      $("btnCheckout") ||
      $("btnFinalizar") ||
      $("btnConfirmar") ||
      $("btnCreateOrder") ||
      $("payBtn") ||
      document.querySelector('[data-action="pay"]')
    );
  }

  function getQueryParam(name){
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  async function loadProducts(){
    try{
      const res = await fetch("./products.json", { cache:"no-store" });
      if(!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }catch{
      return [];
    }
  }

  function toCents(price){
    const n = Number(price);
    if(Number.isNaN(n)) return null;
    return Math.round(n * 100);
  }

  function safeText(v){
    return String(v || "").trim();
  }

  function setChip(txt, isOk){
    const chip = $("payStatusChip") || $("statusChip");
    if(!chip) return;
    chip.textContent = txt;
    chip.classList.remove("ok","warn");
    chip.classList.add(isOk ? "ok" : "warn");
  }

  async function createOrder(btn){
    const productId = safeText(getQueryParam("id"));
    const products = await loadProducts();

    const p =
      products.find(x => String(x.id||"").toLowerCase() === productId.toLowerCase()) ||
      null;

    const product_name = p ? safeText(p.name) : (productId ? `Produto ${productId}` : "Produto");
    const amount = p && p.price != null ? Number(p.price) : null;
    const amount_cents = amount != null ? toCents(amount) : null;

    const buyer_name  = safeText($("buyerName")?.value);
    const buyer_email = safeText($("buyerEmail")?.value);
    const buyer_phone = safeText($("buyerPhone")?.value);

    if ($("buyerEmail") && !buyer_email) {
      alert("Coloque um e-mail pra gente identificar seu pedido 🙂");
      return;
    }

    // trava duplo clique
    if (btn) btn.disabled = true;
    setChip("criando…", false);

    // id local (pra rastrear mesmo sem retornar row por RLS)
    const local_ref =
      (crypto?.randomUUID ? crypto.randomUUID() : `ref_${Date.now()}`);

    const payload = {
      buyer_name: buyer_name || null,
      buyer_email: buyer_email || null,
      buyer_phone: buyer_phone || null,

      product_id: productId || null,
      product_name,

      amount: amount != null ? amount : null,
      amount_cents: amount_cents != null ? amount_cents : null,
      currency: "BRL",

      status: "PENDENTE",
      payment_status: "PENDENTE",
      order_status: "CRIADO",

      payment_provider: "manual",
      provider: "manual",
      provider_ref: local_ref,

      raw: {
        source: "checkout",
        ua: navigator.userAgent,
        page: location.pathname + location.search
      }
    };

    // ✅ MUITO IMPORTANTE:
    // Não fazemos .select().single() aqui, porque tua policy de SELECT é só admin.
    // O INSERT pode estar liberado, mas o RETURNING cai na SELECT e quebra por RLS.
    const { error } = await sb
      .from("cs_orders")
      .insert(payload);

    if (btn) btn.disabled = false;

    if (error) {
      console.error("[checkout-orders] insert error:", error);
      setChip("erro", false);

      const msg =
        `Não consegui criar o pedido.\n\n` +
        `message: ${error.message || ""}\n` +
        `code: ${error.code || ""}\n` +
        `details: ${error.details || ""}\n` +
        `hint: ${error.hint || ""}`;

      alert(msg);
      return;
    }

    // salva “ref” local pra tu bater no admin e achar
    try{ localStorage.setItem("cs_last_order_ref", String(local_ref)); }catch{}
    try{ localStorage.setItem("cs_last_order_email", String(buyer_email || "")); }catch{}
    try{ localStorage.setItem("cs_last_order_product", String(productId || "")); }catch{}

    setChip("pendente", false);

    const box = $("orderStatusBox");
    if (box) box.textContent = `Pedido criado (PENDENTE). Ref: ${local_ref}`;

    alert(`Pedido criado ✅\nStatus: PENDENTE\nRef: ${local_ref}\n(agora o admin aprova)`);
    console.log("[checkout-orders] pedido criado (sem retorno por RLS de SELECT). ref:", local_ref);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = pickBtn();
    if (!btn) {
      console.warn("[checkout-orders] Não achei botão de confirmar pagamento (confirmBtn).");
      return;
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      createOrder(btn);
    }, { passive:false });
  });
})();