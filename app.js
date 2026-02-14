// app.js — menu do avatar (overlay) + loader
(() => {
  function $(id){ return document.getElementById(id); }

  document.addEventListener("DOMContentLoaded", () => {
    const avatarBtn = $("avatarBtn");
    const menuOverlay = $("menuOverlay");
    const loader = $("loader");

    // some com loader quando carregar
    if (loader) {
      setTimeout(() => loader.classList.add("off"), 250);
    }

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
      // só fecha se clicar no fundo (overlay), não dentro do card
      if (e.target === menuOverlay) closeMenu();
    });

    // fecha no ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // ==== Navegação dos itens do menu (troca os links aqui se quiser) ====
    function go(url){ window.location.href = url; }

    const routes = {
      miAdmin:  "admin.html",
      miAdminP: "adminp.html",
      miAdd:    "add.html",
      miLogs:   "logs.html",
      miGraf:   "grafico.html",
      miPay:    "pagamentos.html",
      miLogin:  "login.html",
      miLogout: "index.html"
    };

    Object.keys(routes).forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("click", () => go(routes[id]));
    });
  });
})();