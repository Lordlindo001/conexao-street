"use strict";

/*
  Conexao Street - app.js (demo)
  Observacao: GitHub Pages nao protege admin de verdade.
  Isso aqui e so UI. Seguranca real vem do Supabase (auth) + RLS.
*/

const $ = (sel) => document.querySelector(sel);

function scrollToEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ===== ADMIN (demo) ===== */
const ADMIN_STORAGE_KEY = "cs_admin_ok";

/* TROQUE AQUI */
const ADMIN_PIN = "9017";

function isAdmin() {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "1";
}

function setAdmin(on) {
  if (on) localStorage.setItem(ADMIN_STORAGE_KEY, "1");
  else localStorage.removeItem(ADMIN_STORAGE_KEY);
}

function setStatus(text) {
  const s = $("#statusTxt");
  if (s) s.textContent = text;
}

function showAdminPanel(show) {
  const p = $("#adminPanel");
  if (p) p.style.display = show ? "block" : "none";
}

function applyRoleUI() {
  if (isAdmin()) {
    setStatus("Admin");
    showAdminPanel(true);

    const pend = $("#admPend");
    const sales = $("#admSales");
    const logs = $("#admLogs");

    if (pend) pend.textContent = "1";
    if (sales) sales.textContent = "R$ 29,90";
    if (logs) logs.textContent = "18";
  } else {
    setStatus("Visitante");
    showAdminPanel(false);
  }
}

/* ===== MENU (overlay) ===== */
function openMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.style.display = "block";
  overlay.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
}

function isMenuOpen() {
  const overlay = $("#menuOverlay");
  if (!overlay) return false;
  return overlay.style.display === "block";
}

function toggleMenu() {
  if (isMenuOpen()) closeMenu();
  else openMenu();
}

function wireMenu() {
  const avatarBtn = $("#avatarBtn");
  const overlay = $("#menuOverlay");
  const menuBox = $("#menuBox"); // opcional: se existir no HTML

  if (avatarBtn) {
    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  // Clique fora fecha (se overlay existir)
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      // Se existir menuBox, so fecha quando clicar fora dele
      if (menuBox) {
        if (!menuBox.contains(e.target)) closeMenu();
        return;
      }
      // Se nao existir menuBox, fecha clicando no fundo
      if (e.target === overlay) closeMenu();
    });
  }

  // ESC fecha
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Itens do menu (ids do seu HTML)
  const miAdmin = $("#miAdmin");
  if (miAdmin) {
    miAdmin.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      if (!isAdmin()) return alert("Acesso admin: somente o dono.");
      scrollToEl("adminPanel");
    });
  }

  const miAdd = $("#miAdd");
  if (miAdd) {
    miAdd.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode adicionar fornecedor.");
      alert("Adicionar fornecedor (em breve)");
    });
  }

  const miLogs = $("#miLogs");
  if (miLogs) {
    miLogs.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver logs.");
      alert("Logs (em breve)");
    });
  }

  const miGraf = $("#miGraf");
  if (miGraf) {
    miGraf.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver grafico.");
      alert("Grafico (em breve)");
    });
  }

  const miPay = $("#miPay");
  if (miPay) {
    miPay.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver pagamentos.");
      alert("Pagamentos (em breve)");
    });
  }

  // Login admin
  const miLogin = $("#miLogin");
  if (miLogin) {
    miLogin.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();

      const pin = prompt("Digite o PIN do admin:");
      if (!pin) return;

      if (pin === ADMIN_PIN) {
        setAdmin(true);
        applyRoleUI();
        alert("Admin ativado.");
      } else {
        alert("PIN incorreto.");
      }
    });
  }

  // Logout
  const miLogout = $("#miLogout");
  if (miLogout) {
    miLogout.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      setAdmin(false);
      applyRoleUI();
      alert("Saiu.");
    });
  }
}

/* ===== BOTOES PRINCIPAIS ===== */
function wireButtons() {
  const btnProdutos = $("#btnProdutos");
  if (btnProdutos) {
    btnProdutos.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl("sec-fornecedores");
    });
  }

  const btnComo = $("#btnComo");
  if (btnComo) {
    btnComo.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl("sec-como");
    });
  }

  const btnSuporte = $("#btnSuporte");
  if (btnSuporte) {
    btnSuporte.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl("sec-suporte");
    });
  }

  const buyLojista = $("#buyLojista");
  if (buyLojista) {
    buyLojista.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Abrir checkout: Fornecedores Logistas R$ 30,00 (em breve)");
    });
  }

  const buyFinal = $("#buyFinal");
  if (buyFinal) {
    buyFinal.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Abrir checkout: Fornecedores Consumidor Final R$ 25,00 (em breve)");
    });
  }
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", () => {
  applyRoleUI();
  wireMenu();
  wireButtons();
});
