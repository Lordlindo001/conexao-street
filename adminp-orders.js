// adminp-orders.js — lista pedidos e aprova com 1 clique (somente admin)
(() => {
  "use strict";

  function $(id){ return document.getElementById(id); }

  // aceita config.js no formato window.APP_CONFIG e também nomes soltos
  const SUPABASE_URL =
    (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) ||
    window.CS_SUPABASE_URL ||
    window.SUPABASE_URL ||
    window.__SUPABASE_URL__ ||
    "";

  const SUPABASE_ANON_KEY =
    (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY) ||
    window.CS_SUPABASE_ANON_KEY ||
    window.SUPABASE_ANON_KEY ||
    window.__SUPABASE_ANON_KEY__ ||
    "";

  function must(x, name){
    if(!x || String(x).includes("COLE_AQUI") || String(x).includes("SUA_ANON_PUBLIC_KEY_AQUI")){
      console.error("[adminp-orders] faltando", name);
      return false;
    }
    return true;
  }

  function moneyBRL(v){
    try{ return Number(v||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" }); }
    catch{ return `R$ ${v}`; }
  }

  function setMsg(t){
    const el = $("adminMsg");
    if(el) el.textContent = t;
  }

  async function init(){
    // 0) checks
    if(!window.supabase?.createClient){
      console.error("[adminp-orders] supabase-js v2 não carregou");
      setMsg("Erro: supabase-js não carregou.");
      return;
    }

    if(!must(SUPABASE_URL, "SUPABASE_URL") || !must(SUPABASE_ANON_KEY, "SUPABASE_ANON_KEY")){
      setMsg("Faltou configurar Supabase (config.js).");
      return;
    }

    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1) precisa estar logado no Supabase Auth pra bater nas policies de admin
    const { data: authData, error: authErr } = await sb.auth.getUser();
    const user = authData?.user;

    if(authErr){
      console.error("[adminp-orders] auth.getUser error", authErr);
    }

    if(!user?.id){
      setMsg("Faça login no Supabase (Auth) como admin.");
      return;
    }

    // 2) checa se é admin (tabela cs_admins)
    const { data: adm, error: admErr } = await sb
      .from("cs_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if(admErr){
      console.error("[adminp-orders] cs_admins select error", admErr);
      setMsg("Erro ao checar admin. Veja o console.");
      return;
    }

    if(!adm){
      setMsg("Sem permissão de admin (não está em cs_admins).");
      return;
    }

    setMsg("Admin OK. Carregando pedidos...");

    async function list(){
      // pega últimos 50 pedidos
      const { data, error } = await sb
        .from("cs_orders")
        .select("id, created_at, buyer_name, buyer_email, buyer_phone, product_id, product_name, amount, payment_status, order_status, provider_ref")
        .order("created_at", { ascending:false })
        .limit(50);

      if(error){
        console.error("[adminp-orders] cs_orders select error", error);
        setMsg("Erro ao carregar pedidos (policy?). Veja console.");
        return;
      }

      const box = $("ordersBox");
      if(!box){
        console.warn("[adminp-orders] #ordersBox não existe no HTML");
        setMsg("Erro: faltou #ordersBox no admin-p.html");
        return;
      }

      box.innerHTML = "";

      if(!data || data.length === 0){
        setMsg("Nenhum pedido encontrado.");
        return;
      }

      setMsg(`Pedidos carregados: ${data.length}`);

      data.forEach((o) => {
        const row = document.createElement("div");
        row.className = "row";

        const dot = document.createElement("div");
        dot.className = "dot " + (String(o.payment_status||"").toUpperCase()==="PAGO" ? "p" : "w");

        const meta = document.createElement("div");
        meta.className = "meta";

        const title = document.createElement("div");
        title.className = "t";
        title.textContent = `#${o.id} — ${o.product_name || o.product_id || "Produto"}`;

        const desc = document.createElement("div");
        desc.className = "d";
        const when = o.created_at ? new Date(o.created_at).toLocaleString("pt-BR") : "";
        const buyer = `${o.buyer_name || "—"} • ${o.buyer_email || "—"}`;
        const ref = o.provider_ref ? ` • ref ${o.provider_ref}` : "";
        const st = ` • ${o.payment_status || ""} / ${o.order_status || ""}`;
        desc.textContent = `${when} • ${buyer}${st}${ref}`;

        meta.appendChild(title);
        meta.appendChild(desc);

        const amt = document.createElement("div");
        amt.className = "amt";
        amt.textContent = moneyBRL(o.amount);

        const btn = document.createElement("button");
        btn.className = "btn primary";
        btn.type = "button";
        btn.textContent = "Aprovar";

        // só libera aprovar quando pagamento_status == PAGO (mesma regra que você quis)
        const paid = String(o.payment_status||"").toUpperCase() === "PAGO";
        btn.disabled = !paid || String(o.order_status||"").toUpperCase() === "APROVADO";

        btn.addEventListener("click", async () => {
          btn.disabled = true;
          btn.textContent = "Aprovando...";

          const now = new Date().toISOString();

          // atualiza cs_orders
          const { error: upErr } = await sb
            .from("cs_orders")
            .update({ order_status: "APROVADO", approved_at: now, approved_by: user.id })
            .eq("id", o.id);

          if(upErr){
            console.error("[adminp-orders] cs_orders update error", upErr);
            btn.disabled = false;
            btn.textContent = "Aprovar";
            alert("Erro ao aprovar. Veja console.");
            return;
          }

          // registra em cs_approvals (se existir)
          const { error: insErr } = await sb
            .from("cs_approvals")
            .insert({ order_id: o.id, approved_at: now, approved_by: user.id });

          if(insErr){
            console.warn("[adminp-orders] cs_approvals insert warn", insErr);
            // não bloqueia (pedido já foi aprovado)
          }

          await list();
        });

        row.appendChild(dot);
        row.appendChild(meta);
        row.appendChild(amt);
        row.appendChild(btn);

        box.appendChild(row);
      });
    }

    await list();
  }

  document.addEventListener("DOMContentLoaded", () => {
    init().catch(err => {
      console.error("[adminp-orders] fatal", err);
      setMsg("Erro fatal. Veja console.");
    });
  });
})();