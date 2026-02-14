// checkout-orders.js — cria pedido PENDENTE em public.cs_orders (Supabase)
// Requisitos no checkout.html:
// - ter o supabase-js carregado (CDN) + SUPABASE_URL e SUPABASE_ANON_KEY definidos
// - ter algum botão de finalizar (vários IDs suportados abaixo)
// - (opcional) inputs com ids: buyerName, buyerEmail, buyerPhone

(() => {
  "use strict";

  // 1) Config (usa variáveis globais se já existir no seu projeto)
  const SUPABASE_URL =
    window.SUPABASE_URL ||
    window.__SUPABASE_URL__ ||
    "";

  const SUPABASE_ANON_KEY =
    window.SUPABASE_ANON_KEY ||
    window.__SUPABASE_ANON_KEY__ ||
    "";

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[checkout-orders] Falta SUPABASE_URL ou SUPABASE_ANON_KEY.");
    return;
  }

  // supabase-js v2 expõe window.supabase
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function $(id){ return document.getElementById(id); }

  function pickBtn(){
    return (
      $("btnPay") ||
      $("btnCheckout") ||
      $("btnFinalizar") ||
      $("btnConfirmar") ||
      $("btnCreateOrder") ||
      $("payBtn") ||
      document.querySelector('[data-action="pay"]') ||
      document.querySelector('button[type="submit"]')
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

  async function createOrder(){
    const productId = safeText(getQueryParam("id"));
    const products = await loadProducts();

    const p = products.find(x => String(x.id).toLowerCase() === productId.toLowerCase()) || null;
    const product_name = p ? safeText(p.name) : (productId ? `Produto ${productId}` : "Produto");
    const amount = p && p.price != null ? Number(p.price) : null;
    const amount_cents = amount != null ? toCents(amount) : null;

    const buyer_name = safeText($("buyerName")?.value);
    const buyer_email = safeText($("buyerEmail")?.value);
    const buyer_phone = safeText($("buyerPhone")?.value);

    // Se tiver input de email e estiver vazio, avisar (pra você conseguir identificar no admin)
    if ($("buyerEmail") && !buyer_email) {
      alert("Coloque um e-mail pra gente identificar seu pedido 🙂");
      return;
    }

    const payload = {
      buyer_name: buyer_name || null,
      buyer_email: buyer_email || null,
      buyer_phone: buyer_phone || null,

      product_id: productId || null,
      product_name,

      amount: amount != null ? amount : null,
      amount_cents: amount_cents != null ? amount_cents : null,
      currency: "BRL",

      // status “do seu sistema”
      status: "PENDENTE",
      payment_status: "PENDENTE",
      order_status: "CRIADO",

      // provedor (por enquanto manual; depois a gente troca pro webhook real)
      payment_provider: "manual",
      provider: "manual",
      provider_ref: crypto?.randomUUID ? crypto.randomUUID() : `ref_${Date.now()}`,

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

    if (error) {
      console.error("[checkout-orders] insert error:", error);
      alert("Não consegui criar o pedido. Tenta novamente.");
      return;
    }

    // Se seu checkout já redireciona pra pagamento, aqui vira “criou pedido, agora paga”
    alert(`Pedido criado ✅\nStatus: PENDENTE\nID: ${data.id}`);
    console.log("[checkout-orders] pedido criado:", data);

    // opcional: se tiver um elemento pra mostrar status na tela
    const box = $("orderStatusBox");
    if (box) box.textContent = `Pedido criado: ${data.id} (PENDENTE)`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const btn = pickBtn();
    if (!btn) {
      console.warn("[checkout-orders] Não achei botão de finalizar no checkout.");
      return;
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      createOrder();
    }, { passive:false });
  });
})();
