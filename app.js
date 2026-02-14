// app.js — menu do avatar (overlay) + loader + rotas GitHub Pages safe
(() => {
  function $(id){ return document.getElementById(id); }

  // resolve links relativo ao URL atual (GitHub Pages safe, mesmo com querystring)
  function resolveHref(to){
    return new URL(to, window.location.href).toString();
  }

  function go(to){
    window.location.assign(resolveHref(to));
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

    // ✅ Rotas corrigidas para os arquivos que EXISTEM no repo
    // (e deixa pronto pra adicionar "Painel membro" com id="miMember")
    const routes = {
      miAdmin:  "./admin.html",
      miAdminP: "./admin-p.html",

      // se você adicionar esse item no HTML do menu:
      // <div class="mi" id="miMember"><b>Painel membro</b><small>quem já comprou</small></div>
      miMember: "./member.html",

      // Esses itens podem apontar para seções do admin-p (sem criar páginas novas)
      miAdd:    "./admin-p.html#add",
      miLogs:   "./admin-p.html#logs",
      miGraf:   "./admin-p.html#grafico",
      miPay:    "./admin-p.html#pagamentos",
      miLogin:  "./admin-p.html#login",

      miLogout: "./index.html"
    };

    Object.keys(routes).forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener("click", (e) => {
        e.preventDefault();
        closeMenu();
        go(routes[id]);
      });
    });
  });
})();
