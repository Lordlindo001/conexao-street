// app.js — Conexão Street (wireframe interativo)

// helper
const $ = (sel) => document.querySelector(sel);

// mapeia botões principais (pelos textos)
function findButtonByText(text) {
  const buttons = Array.from(document.querySelectorAll("a.btn, button.btn, a, button"));
  return buttons.find(b => (b.textContent || "").trim().toLowerCase() === text.toLowerCase());
}

function toast(msg){
  // toast simples, sem lib
  let t = document.getElementById("toast_cs");
  if (!t){
    t = document.createElement("div");
    t.id = "toast_cs";
    t.style.position = "fixed";
    t.style.left = "50%";
    t.style.bottom = "18px";
    t.style.transform = "translateX(-50%)";
    t.style.padding = "12px 14px";
    t.style.borderRadius = "14px";
    t.style.border = "1px solid rgba(255,255,255,.12)";
    t.style.background = "rgba(15,15,20,.92)";
    t.style.backdropFilter = "blur(10px)";
    t.style.color = "rgba(255,255,255,.92)";
    t.style.fontFamily = "system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica Neue,Arial";
    t.style.fontSize = "13px";
    t.style.zIndex = "9999";
    t.style.maxWidth = "92vw";
    t.style.boxShadow = "0 18px 60px rgba(0,0,0,.45)";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { t.style.opacity = "0"; }, 2200);
}

// 1) Avatar abre/fecha “menu do avatar”
function setupAvatarMenu(){
  const avatar = $(".avatar");
  const menu = $(".menu");
  if (!avatar || !menu) return;

  // começa fechado no mobile
  menu.style.display = "none";
  menu.dataset.open = "0";

  avatar.style.cursor = "pointer";
  avatar.addEventListener("click", () => {
    const open = menu.dataset.open === "1";
    menu.style.display = open ? "none" : "block";
    menu.dataset.open = open ? "0" : "1";
    toast(open ? "Menu fechado" : "Menu aberto");
  });
}

// 2) Botões do topo
function setupTopButtons(){
  const verProdutos = findButtonByText("Ver produtos");
  const comoFunciona = findButtonByText("Como funciona");
  const suporte = findButtonByText("Suporte");

  if (verProdutos){
    verProdutos.addEventListener("click", (e) => {
      e.preventDefault();
      toast("Abrindo: Produtos (demo) 🛒");
      // Futuro: location.href = "/produtos.html"
    });
  }

  if (comoFunciona){
    comoFunciona.addEventListener("click", (e) => {
      e.preventDefault();
      toast("Como funciona: compra → login → 2FA → acesso ✅");
    });
  }

  if (suporte){
    suporte.addEventListener("click", (e) => {
      e.preventDefault();
      toast("Suporte: em breve WhatsApp / e-mail 📩");
      // Futuro: location.href = "/suporte.html"
    });
  }
}

// 3) Itens do mini menu (admin)
function setupMiniMenu(){
  const items = Array.from(document.querySelectorAll(".menu .mi"));
  if (!items.length) return;

  const map = {
    "Adicionar fornecedor": "Abrindo: Adicionar fornecedor (admin) ➕",
    "Painel administrador": "Abrindo: Painel admin (cards) 📊",
    "Logs": "Abrindo: Logs de acesso 🧾",
    "Gráfico": "Abrindo: Gráfico de vendas 📈",
    "Pagamentos": "Abrindo: Pagamentos pendentes 💳",
  };

  items.forEach(el => {
    const label = (el.textContent || "").trim().split("\n")[0].trim();
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      toast(map[label] || `Clicou em: ${label}`);
      // Futuro: trocar por location.href pra rotas reais
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupAvatarMenu();
  setupTopButtons();
  setupMiniMenu();
  toast("Site carregado ✅ (modo interativo)");
});
