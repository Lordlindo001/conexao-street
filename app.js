// app.js — menu do avatar (overlay) + loader + rotas + botões de compra/scroll (GitHub Pages safe)
(() => {
  "use strict";
  function $(id){ return document.getElementById(id); }

  // navegação segura pra GitHub Pages (evita path quebrado)
  function go(path){
    const url = new URL(path, window.location.href);
    window.location.href = url.toString();
  }

  function scrollToId(id){
    const el = document.getElementById(id);
    if(!el) return;
    try{ el.scrollIntoView({ behavior:"smooth", block:"start" }); }
    catch{ el.scrollIntoView(); }
  }

  async function resolveProductId(kind){
    try{
      const res = await fetch("./products.json", { cache:"no-store" });
      if(!res.ok) return null;
      const arr = await res.json();
      if(!Array.isArray(arr)) return null;

      const k = String(kind||"").toLowerCase();

      // 1) por id
      let p = arr.find(x => String(x.id||"").toLowerCase() === k);
      if(p && p.id != null) return String(p.id);

      // 2) por nome (contém palavras)
      const byName = (needle) => arr.find(x =>
        String(x.name||"").toLowerCase().includes(needle)
      );
      if(k === "lojista"){
        p = byName("lojist") || byName("logist") || byName("revend") || byName("loja");
      }else{
        p = byName("consum") || byName("final") || byName("pessoal");
      }
      if(p && p.id != null) return String(p.id);

      // 3) fallback: 1º/2º item
      if(k === "lojista") return arr[0]?.id != null ? String(arr[0].id) : null;
      return arr[1]?.id != null ? String(arr[1].id) : null;
    }catch{
      return null;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const loader = $("loader");
    if (loader) setTimeout(() => loader.classList.add("off"), 250);

    // ====== HOME CTAs (index.html) ======
    const btnProdutos = $("btnProdutos");
    const btnComo = $("btnComo");
    const btnSuporte = $("btnSuporte");
    const buyLojista = $("buyLojista");
    const buyFinal = $("buyFinal");
    const detLojista = $("detLojista");
    const detFinal = $("detFinal");

    if(btnProdutos) btnProdutos.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      go("products.html");
    }, { passive:false });

    if(btnComo) btnComo.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToId("sec-como");
    }, { passive:false });

    if(btnSuporte) btnSuporte.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToId("sec-suporte");
    }, { passive:false });

    // ✅ impede qualquer <a href="admin.html"> “por trás” de capturar clique
    if(detLojista) detLojista.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToId("sec-como");
    }, { passive:false });

    if(detFinal) detFinal.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToId("sec-como");
    }, { passive:false });

    async function goCheckout(kind){
      const pid = await resolveProductId(kind);
      if(pid) go(`checkout.html?id=${encodeURIComponent(pid)}`);
      else go("products.html");
    }

    if(buyLojista) buyLojista.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      goCheckout("lojista");
    }, { passive:false });

    if(buyFinal) buyFinal.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      goCheckout("final");
    }, { passive:false });

    // ====== MENU OVERLAY (avatar) ======
    const avatarBtn = $("avatarBtn");
    const menuOverlay = $("menuOverlay");
    if (!avatarBtn || !menuOverlay) return;

    function openMenu(){
      menuOverlay.classList.add("on");
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    }

    function closeMenu(){
      menuOverlay.classList.remove("on");
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    function toggleMenu(){
      if (menuOverlay.classList.contains("on")) closeMenu();
      else openMenu();
    }

    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    }, { passive:false });

    menuOverlay.addEventListener("click", (e) => {
      if (e.target === menuOverlay) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    const routes = {
      miAdmin:  "admin.html",
      miAdminP: "admin-p.html",
      miMember: "member.html",
      miAdd:    "admin.html#add",
      miLogs:   "admin.html#logs",
      miGraf:   "admin.html#grafico",
      miPay:    "admin.html#pagamentos",
      miLogin:  "admin.html#login",
      miLogout: "index.html"
    };

    Object.keys(routes).forEach((id) => {
      const node = $(id);
      if (!node) return;

      node.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
        setTimeout(() => go(routes[id]), 60);
      }, { passive:false });
    });
  });
})();