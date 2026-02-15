// enhance.js — scroll reveal, nicer interactions, tiny helpers (no deps)
(() => {
  "use strict";

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root=document){ return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  // reveal on scroll
  function setupReveal(){
    const els = $all("[data-reveal]");
    if(!els.length) return;

    if(reduce){
      els.forEach(el => el.classList.add("revealed"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if(en.isIntersecting){
          en.target.classList.add("revealed");
          io.unobserve(en.target);
        }
      });
    }, { root:null, threshold: 0.12 });

    els.forEach(el => io.observe(el));
  }

  // smooth anchor scroll
  function setupAnchors(){
    $all('a[href^="#"]').forEach(a => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href").slice(1);
        const t = document.getElementById(id);
        if(!t) return;
        e.preventDefault();
        try{ t.scrollIntoView({ behavior:"smooth", block:"start" }); }
        catch{ t.scrollIntoView(); }
      }, { passive:false });
    });
  }

  // Copy feedback for buttons with data-copy="#id"
  async function copyText(txt){
    try{
      await navigator.clipboard.writeText(txt);
      return true;
    }catch{
      try{
        const ta = document.createElement("textarea");
        ta.value = txt;
        ta.style.position="fixed";
        ta.style.left="-9999px";
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      }catch{
        return false;
      }
    }
  }

  function setupCopy(){
    $all("[data-copy]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const sel = btn.getAttribute("data-copy");
        const el = sel ? $(sel) : null;
        const txt = el ? (el.value || el.textContent || "").trim() : "";
        if(!txt) return;

        const old = btn.textContent;
        const ok = await copyText(txt);
        btn.textContent = ok ? "Copiado ✅" : "Falhou 😭";
        btn.disabled = true;
        setTimeout(() => { btn.textContent = old; btn.disabled = false; }, 900);
      }, { passive:false });
    });
  }

  // who pill on pages that have it
  function paintWho(){
    const who = document.getElementById("whoPill");
    if(!who) return;
    try{
      const u = window.UI && UI.getUser ? UI.getUser() : null;
      if(u && u.email) who.textContent = u.email;
      else who.textContent = "Visitante";
    }catch{
      who.textContent = "Visitante";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("js");
    setupReveal();
    setupAnchors();
    setupCopy();
    paintWho();
  });
})();


// PWA: service worker
(() => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
})();
