"use strict";

/*
  UI + Auth mock (funciona sem Supabase)
  - Logo no topo direito abre mini menu
  - Usuário "logado" = localStorage.cs_user
  - Admin UI continua sendo cs_admin_ok (seu padrão)
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

    // login simples (mock)
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
    const miAdmin = $("#miAdmin");     // opcional (se quiser)
    const miAdminP = $("#miAdminP");   // opcional (se quiser)

    const logged = isLogged();
    const admin = isAdmin();

    if (miHome) miHome.style.display = "";
    if (miMember) miMember.style.display = logged ? "" : "none";

    if (miLogin) miLogin.style.display = logged ? "none" : "";
    if (miLogout) miLogout.style.display = logged ? "" : "none";

    // Se quiser manter admin acessível pelo menu (só quando admin)
    if (miAdmin) miAdmin.style.display = admin ? "" : "none";
    if (miAdminP) miAdminP.style.display = admin ? "" : "none";
  }

  function wireMenu() {
    const btn = $("#logoMenuBtn");
    const overlay = $("#menuBackdrop");

    if (btn) {
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        applyMenuVisibility();
        toggleMenu();
      });
    }

    if (overlay) {
      overlay.addEventListener("pointerdown", () => closeMenu());
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

    // Admin (opcional)
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
