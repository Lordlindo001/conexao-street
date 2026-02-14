"use strict";

/*
  UI + Auth mock (funciona sem Supabase)
  - Menu abre por vários botões (se existirem):
      #logoMenuBtn  (topo direito)
      #brandBtn     (área da marca topo esquerdo)
      #logoBtn      (quadrado da logo topo esquerdo)
      #avatarBtn    (opcional)
      .logoMenuBtn  (fallback por classe)
  - Fix Android: evita "toggle duplo" (pointerdown + click) no mesmo toque
  - Usuário "logado" = localStorage.cs_user
  - Admin UI = localStorage.cs_admin_ok
*/

const UI = (() => {
  const USER_KEY = "cs_user"; // {name,email}
  const ADMIN_KEY = "cs_admin_ok";

  const $ = (sel) => document.querySelector(sel);

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function isLogged() {
    const u = getUser();
    return !!(u && u.email);
  }

  function isAdmin() {
    return localStorage.getItem(ADMIN_KEY) === "1";
  }

  function setUser(userObj) {
    localStorage.setItem(USER_KEY, JSON.stringify(userObj));
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
  }

  function ensureLogged() {
    if (isLogged()) return true;

    const name = prompt("Seu nome:");
    if (!name) return false;

    const email = prompt("Seu e-mail (o mesmo do pagamento):");
    if (!email) return false;

    setUser({ name: name.trim(), email: email.trim().toLowerCase() });
    return true;
  }

  function closeMenu() {
    const menu = $("#userMenu");
    const overlay = $("#menuBackdrop");
    if (menu) menu.classList.remove("on");
    if (overlay) overlay.classList.remove("on");
  }

  function openMenu() {
    const menu = $("#userMenu");
    const overlay = $("#menuBackdrop");
    if (menu) menu.classList.add("on");
    if (overlay) overlay.classList.add("on");
  }

  function toggleMenu() {
    const menu = $("#userMenu");
    if (!menu) return;
    const on = menu.classList.contains("on");
    if (on) closeMenu();
    else openMenu();
  }

  function applyMenuVisibility() {
    const miHome = $("#miHome");
    const miMember = $("#miMember");
    const miLogin = $("#miLogin");
    const miLogout = $("#miLogout");
    const miAdmin = $("#miAdmin");
    const miAdminP = $("#miAdminP");

    const logged = isLogged();
    const admin = isAdmin();

    if (miHome) miHome.style.display = "";

    // Área membro sempre visível; valida login no clique
    if (miMember) miMember.style.display = "";

    if (miLogin) miLogin.style.display = logged ? "none" : "";
    if (miLogout) miLogout.style.display = logged ? "" : "none";

    if (miAdmin) miAdmin.style.display = admin ? "" : "none";
    if (miAdminP) miAdminP.style.display = admin ? "" : "none";
  }

  // ✅ Evita toggle duplo (pointerdown + click) no mesmo toque
  function bindMenuOpener(el) {
    if (!el) return;

    // flag por elemento
    el.__cs_skip_click = false;

    const openHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      applyMenuVisibility();
      toggleMenu();
    };

    // pointerdown/touchstart disparam primeiro: marcamos pra ignorar o click que vem depois
    const firstHandler = (e) => {
      el.__cs_skip_click = true;
      setTimeout(() => (el.__cs_skip_click = false), 450);
      openHandler(e);
    };

    const clickHandler = (e) => {
      if (el.__cs_skip_click) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      openHandler(e);
    };

    el.addEventListener("pointerdown", firstHandler);
    el.addEventListener("touchstart", firstHandler, { passive: false });
    el.addEventListener("click", clickHandler);
  }

  function wireMenu() {
    const overlay = $("#menuBackdrop");
    const menu = $("#userMenu");

    // ✅ Abre menu por esses IDs (se existirem na página)
    bindMenuOpener($("#logoMenuBtn"));
    bindMenuOpener($("#brandBtn"));
    bindMenuOpener($("#logoBtn"));
    bindMenuOpener($("#avatarBtn"));

    // ✅ fallback por classe (caso tenha só .logoMenuBtn)
    document.querySelectorAll(".logoMenuBtn").forEach((btn) => bindMenuOpener(btn));

    // Fecha clicando fora
    if (overlay) {
      const close = (e) => {
        e.preventDefault();
        closeMenu();
      };
      overlay.addEventListener("pointerdown", close);
      overlay.addEventListener("touchstart", close, { passive: false });
      overlay.addEventListener("click", close);
    }

    // Impede clique “vazar” dentro do menu
    if (menu) {
      menu.addEventListener("pointerdown", (e) => e.stopPropagation());
      menu.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
      menu.addEventListener("click", (e) => e.stopPropagation());
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // Itens
    const miHome = $("#miHome");
    if (miHome) miHome.addEventListener("click", () => {
      closeMenu();
      window.location.href = "./";
    });

    const miMember = $("#miMember");
    if (miMember) miMember.addEventListener("click", () => {
      closeMenu();
      if (!ensureLogged()) return;
      window.location.href = "./member.html";
    });

    const miLogin = $("#miLogin");
    if (miLogin) miLogin.addEventListener("click", () => {
      closeMenu();
      const ok = ensureLogged();
      if (ok) alert("Login feito ✅");
      applyMenuVisibility();
    });

    const miLogout = $("#miLogout");
    if (miLogout) miLogout.addEventListener("click", () => {
      closeMenu();
      logout();
      alert("Saiu ✅");
      applyMenuVisibility();
    });

    const miAdmin = $("#miAdmin");
    if (miAdmin) miAdmin.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Acesso admin: somente o dono.");
      window.location.href = "./admin.html";
    });

    const miAdminP = $("#miAdminP");
    if (miAdminP) miAdminP.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Acesso admin: somente o dono.");
      window.location.href = "./admin-p.html";
    });

    applyMenuVisibility();
  }

  return {
    getUser,
    isLogged,
    ensureLogged,
    isAdmin,
    wireMenu,
    applyMenuVisibility,
    logout,
    setUser,
  };
})();