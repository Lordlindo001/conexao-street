// app.js — menu do avatar (overlay) + loader + rotas (GitHub Pages safe)
(() => {
  function $(id){ return document.getElementById(id); }

  // navegação segura pra GitHub Pages (evita path quebrado)
  function go(path){
    const url = new URL(path, window.location.href);
    window.location.href = url.toString();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const avatarBtn = $("avatarBtn");
    const menuOverlay = $("menuOverlay");
    const loader = $("loader");

    // some com loader quando carregar
    if (loader) setTimeout(() => loader.classList.add("off"), 250);

    if (!avatarBtn || !menuOverlay) {
      console.warn("[menu] Elementos não encontrados:", {
        avatarBtn: !!avatarBtn,
        menuOverlay: !!menuOverlay
      });
      return;
    }

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

    // abre/fecha pelo avatar
    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    }, { passive:false });

    // fecha clicando fora do card
    menuOverlay.addEventListener("click", (e) => {
      if (e.target === menuOverlay) closeMenu();
    });

    // fecha no ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // ✅ ROTAS REAIS DO SEU REPO (sem 404)
    // (e o que não tem página própria vai pro admin.html#secao)
    const routes = {
      miAdmin:  "admin.html",
      miAdminP: "admin-p.html",
      miMember: "member.html",

      miAdd:    "admin.html#add",
      miLogs:   "admin.html#logs",
      miGraf:   "admin.html#grafico",
      miPay:    "admin.html#pagamentos",
      miLogin:  "admin.html#login",

      // "Sair" volta pra home (pode trocar se quiser)
      miLogout: "index.html"
    };

    Object.keys(routes).forEach((id) => {
      const el = $(id);
      if (!el) return;

      el.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
        // micro delay só pra animação fechar antes de navegar
        setTimeout(() => go(routes[id]), 60);
      }, { passive:false });
    });
  });
})();
