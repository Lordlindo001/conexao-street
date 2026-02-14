// ui.js — helpers + mini-menu (checkout/member) + login simples (localStorage)
// + gate admin: só mostra botões admin se for admin de verdade no Supabase
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

  // ✅ pega config do config.js (APP_CONFIG) e também aceita nomes antigos
  function getCfg(){
    const c = window.APP_CONFIG || {};
    return {
      url: c.SUPABASE_URL || window.SUPABASE_URL || window.CS_SUPABASE_URL || "",
      key: c.SUPABASE_ANON_KEY || window.SUPABASE_ANON_KEY || window.CS_SUPABASE_ANON_KEY || "",
    };
  }

  // ✅ checa admin REAL (cs_admins) usando Supabase Auth
  async function isAdmin(){
    try{
      if(!window.supabase?.createClient) return false;

      const cfg = getCfg();
      if(!cfg.url || !cfg.key) return false;

      const client = window.supabase.createClient(cfg.url, cfg.key);

      const { data: auth } = await client.auth.getUser();
      const uid = auth?.user?.id;
      if(!uid) return false;

      const { data, error } = await client
        .from("cs_admins")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();

      if(error) return false;
      return !!data;
    }catch{
      return false;
    }
  }

  // ✅ esconde/mostra itens admin no menu
  async function applyAdminUI(){
    const admin = await isAdmin();

    const miAdmin  = document.getElementById("miAdmin");
    const miAdminP = document.getElementById("miAdminP");

    if(miAdmin)  miAdmin.style.display  = admin ? "" : "none";
    if(miAdminP) miAdminP.style.display = admin ? "" : "none";

    return admin;
  }

  function wireMenu(){
    const btn = document.getElementById("logoMenuBtn");
    const back = document.getElementById("menuBackdrop");
    const menu = document.getElementById("userMenu");
    if(!btn || !back || !menu) return;

    const open = () => { back.classList.add("on"); menu.classList.add("on"); };
    const close = () => { back.classList.remove("on"); menu.classList.remove("on"); };

    // ✅ toda vez que abrir menu, atualiza admin UI
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      await applyAdminUI();
      open();
    }, { passive:false });

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

      el.addEventListener("click", async (e) => {
        e.preventDefault();

        if(id === "miLogout") clearUser();

        // ✅ trava REAL: admin/admin-p só navega se for admin de verdade
        if(id === "miAdmin" || id === "miAdminP"){
          const admin = await isAdmin();
          if(!admin){
            alert("Sem permissão de administrador.");
            close();
            return;
          }
        }

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
    wireMenu,
    isAdmin,
    applyAdminUI
  };
})();