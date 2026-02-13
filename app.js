"use strict";

const $ = (sel) => document.querySelector(sel);
const ADMIN_STORAGE_KEY = "cs_admin_ok";
const ADMIN_CODE = "Euteamoluptameuamor010324c";

function scrollToEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isAdmin() {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "1";
}

function openMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.style.display = "block";
}

function closeMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.style.display = "none";
}

function toggleMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.style.display = overlay.style.display === "block" ? "none" : "block";
}

function initLoader() {
  const loader = $("#loader");
  if (!loader) return;
  requestAnimationFrame(() => loader.classList.add("off"));
}

function wireMenu() {
  const avatarBtn = $("#avatarBtn");
  const overlay = $("#menuOverlay");

  if (avatarBtn) {
    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeMenu();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  const miAdmin = $("#miAdmin");
  if (miAdmin) {
    miAdmin.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Acesso admin somente o dono.");
      window.location.href = "./admin.html";
    });
  }

  const miAdd = $("#miAdd");
  if (miAdd) {
    miAdd.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode adicionar fornecedor.");
      alert("Adicionar fornecedor em breve");
    });
  }

  const miLogs = $("#miLogs");
  if (miLogs) {
    miLogs.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver logs.");
      alert("Logs em breve");
    });
  }

  const miGraf = $("#miGraf");
  if (miGraf) {
    miGraf.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver grafico.");
      alert("Grafico em breve");
    });
  }

  const miPay = $("#miPay");
  if (miPay) {
    miPay.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver pagamentos.");
      alert("Pagamentos em breve");
    });
  }

  const miLogin = $("#miLogin");
  if (miLogin) {
    miLogin.addEventListener("click", () => {
      closeMenu();

      const code = prompt("Senha do admin:");
      if (!code) return;

      if (code === ADMIN_CODE) {
        localStorage.setItem(ADMIN_STORAGE_KEY, "1");
        alert("Admin ativado.");
      } else {
        alert("Senha invalida.");
      }
    });
  }

  const miLogout = $("#miLogout");
  if (miLogout) {
    miLogout.addEventListener("click", () => {
      closeMenu();
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      alert("Saiu.");
    });
  }

  document.addEventListener("click", () => closeMenu());
}

function wireButtons() {
  const btnProdutos = $("#btnProdutos");
  if (btnProdutos) btnProdutos.addEventListener("click", (e) => { e.preventDefault(); scrollToEl("sec-fornecedores"); });

  const btnComo = $("#btnComo");
  if (btnComo) btnComo.addEventListener("click", (e) => { e.preventDefault(); scrollToEl("sec-como"); });

  const btnSuporte = $("#btnSuporte");
  if (btnSuporte) btnSuporte.addEventListener("click", (e) => { e.preventDefault(); scrollToEl("sec-suporte"); });

  const buyLojista = $("#buyLojista");
  if (buyLojista) buyLojista.addEventListener("click", () => alert("Checkout Logistas R$ 30,00 em breve"));

  const buyFinal = $("#buyFinal");
  if (buyFinal) buyFinal.addEventListener("click", () => alert("Checkout Consumidor Final R$ 25,00 em breve"));

  const detLojista = $("#detLojista");
  if (detLojista) detLojista.addEventListener("click", () => alert("Detalhes Logistas em breve"));

  const detFinal = $("#detFinal");
  if (detFinal) detFinal.addEventListener("click", () => alert("Detalhes Consumidor Final em breve"));
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  wireMenu();
  wireButtons();
});
