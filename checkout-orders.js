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
    "";

  const SUPABASE_ANON_KEY =
    window.CS_SUPABASE_ANON_KEY ||
    window.SUPABASE_ANON_KEY ||
    window.__SUPABASE_ANON_KEY__ ||
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
    const res = await fetch("./products.json", { cache:"no-store" });
    if(!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
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
      provider_ref: (crypto?.randomUUID ? crypto.randomUUID() : `ref_${Date.now()}`),

      raw: {
        source: "checkout",
        ua: navigator.userAgent,
        page: location.pathname + location.search
      }
    };

    const { data, error } = await sb
      .from("cs_orders")
      .insert(payload)
      .select("id, created_at, buyer_email, product_id, payment_status, order_status")
      .single();

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

    try{ localStorage.setItem("cs_last_order_id", String(data.id)); }catch{}

    setChip("pendente", false);

    const box = $("orderStatusBox");
    if (box) box.textContent = `Pedido criado: ${data.id} (PENDENTE)`;

    alert(`Pedido criado ✅\nStatus: PENDENTE\nID: ${data.id}`);
    console.log("[checkout-orders] pedido criado:", data);
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
