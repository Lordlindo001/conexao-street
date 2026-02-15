// ui.js — menu mini (checkout/member) + gate admin REAL (Supabase cs_admins)
// + guard de páginas admin (admin.html / admin-p.html)
// + modo visitante: esconde admin sempre
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
  function writeUser(u){ localStorage.setItem(KEY_USER, JSON.stringify(u || null)); }
  function clearUser(){ localStorage.removeItem(KEY_USER); }

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

  // ✅ singleton do client
  let _sb = null;
  function getClient(){
    if(_sb) return _sb;
    if(!window.supabase?.createClient) return null;

    const cfg = getCfg();
    if(!cfg.url || !cfg.key) return null;

    _sb = window.supabase.createClient(cfg.url, cfg.key);
    return _sb;
  }

  // ✅ cache admin (15s)
  let _adminCache = { v:false, ts:0 };
  async function isAdmin({ force=false } = {}){
    try{
      const now = Date.now();
      if(!force && (now - _adminCache.ts) < 15000) return _adminCache.v;

      const client = getClient();
      if(!client){
        _adminCache = { v:false, ts: now };
        return false;
      }

      const { data: auth } = await client.auth.getUser();
      const uid = auth?.user?.id;
      if(!uid){
        _adminCache = { v:false, ts: now };
        return false;
      }

      const { data, error } = await client
        .from("cs_admins")
        .select("user_id")
        .eq("user_id", uid)
        .maybeSingle();

      const ok = !error && !!data;
      _adminCache = { v: ok, ts: now };
      return ok;
    }catch{
      _adminCache = { v:false, ts: Date.now() };
      return false;
    }
  }

  // ✅ mostra/esconde itens admin no menu
  async function applyMenuVisibility(){
    const miAdmin  = document.getElementById("miAdmin");
    const miAdminP = document.getElementById("miAdminP");

    // seguro: escondido por padrão
    if(miAdmin)  miAdmin.style.display  = "none";
    if(miAdminP) miAdminP.style.display = "none";

    const admin = await isAdmin();
    if(admin){
      if(miAdmin)  miAdmin.style.display  = "";
      if(miAdminP) miAdminP.style.display = "";
    }
    return admin;
  }

  // ✅ menu mini (member/checkout)
  function wireMenu(){
    const btn  = document.getElementById("logoMenuBtn");
    const back = document.getElementById("menuBackdrop");
    const menu = document.getElementById("userMenu");
    if(!btn || !back || !menu) return;

    const open = async () => {
      await applyMenuVisibility();
      back.classList.add("on");
      menu.classList.add("on");
    };

    const close = () => {
      back.classList.remove("on");
      menu.classList.remove("on");
    };

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

      el.addEventListener("click", async (e) => {
        e.preventDefault();

        if(id === "miLogout") clearUser();

        // trava REAL
        if(id === "miAdmin" || id === "miAdminP"){
          const admin = await isAdmin({ force:true });
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

  // ✅ guard: bloqueia acesso direto às páginas admin
  async function guardAdminPages(){
    const p = (location.pathname || "").toLowerCase();
    const isAdminPage = p.endsWith("/admin.html") || p.endsWith("admin.html") || p.endsWith("/admin-p.html") || p.endsWith("admin-p.html");
    if(!isAdminPage) return;

    const ok = await isAdmin({ force:true });
    if(!ok){
      alert("Acesso restrito ao administrador.");
      go("index.html");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    try { wireMenu(); } catch {}
    try { guardAdminPages(); } catch {}
  });

  window.UI = {
    go,
    getUser: readUser,
    setUser: writeUser,
    clearUser,
    isLogged,
    ensureLogged,
    wireMenu,
    isAdmin,
    applyMenuVisibility
  };
})();