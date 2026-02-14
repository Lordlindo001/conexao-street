// ui.js — helpers + mini-menu (checkout/member) + login simples (localStorage)
(() => {
  "use strict";
  const KEY_USER = "cs_user";

  function go(path){
    const url = new URL(path, window.location.href);
    window.location.href = url.toString();
  }

  function readUser(){
    const raw = localStorage.getItem(KEY_USER);
    if(!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function writeUser(u){
    localStorage.setItem(KEY_USER, JSON.stringify(u || null));
  }

  function clearUser(){
    localStorage.removeItem(KEY_USER);
  }

  function isLogged(){
    const u = readUser();
    return !!(u && u.email);
  }

  function ensureLogged(){
    if(isLogged()) return true;
    alert("Você precisa entrar primeiro.");
    return false;
  }

  function wireMenu(){
    const btn = document.getElementById("logoMenuBtn");
    const back = document.getElementById("menuBackdrop");
    const menu = document.getElementById("userMenu");
    if(!btn || !back || !menu) return;

    const open = () => { back.classList.add("on"); menu.classList.add("on"); };
    const close = () => { back.classList.remove("on"); menu.classList.remove("on"); };

    btn.addEventListener("click", (e) => { e.preventDefault(); open(); }, { passive:false });
    back.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if(e.key === "Escape") close(); });

    const routes = {
      miHome:   "index.html",
      miMember: "member.html",
      miLogin:  "member.html#login",
      miLogout: "index.html",
      miAdmin:  "admin.html",
      miAdminP: "admin-p.html"
    };

    Object.keys(routes).forEach((id) => {
      const el = document.getElementById(id);
      if(!el) return;

      el.addEventListener("click", (e) => {
        e.preventDefault();
        if(id === "miLogout") clearUser();
        close();
        setTimeout(() => go(routes[id]), 50);
      }, { passive:false });
    });
  }

  window.UI = {
    go,
    getUser: readUser,
    setUser: writeUser,
    clearUser,
    isLogged,
    ensureLogged,
    wireMenu
  };
})();