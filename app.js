"use strict";

const $ = (sel) => document.querySelector(sel);

function scrollToEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const ADMIN_STORAGE_KEY = "cs_admin_ok";

/*
  IMPORTANTE:
  GitHub Pages não protege admin de verdade.
  Isso aqui é apenas UI. A segurança real vem do Supabase (auth) + RLS.
*/
const ADMIN_CODE = "TROQUE_ESSA_SENHA";

function setStatus(text) {
  const s = $("#statusTxt");
  if (s) s.textContent = text;
}

function isAdmin() {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "1";
}

function applyRoleUI() {
  if (isAdmin()) {
    setStatus("admin");
  } else {
    setStatus("Lista VIP");
  }
}

/* ✅ Menu animado (usa .on no overlay) */
function openMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.classList.add("on");
}

function closeMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.classList.remove("on");
}

function toggleMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.classList.toggle("on");
}

function wireMenu() {
  const avatarBtn = $("#avatarBtn");
  const overlay = $("#menuOverlay");
  const menuCard = overlay ? overlay.querySelector(".menuCard") : null;

  // 1) Botão do avatar abre/fecha
  if (avatarBtn) {
    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  // 2) Clique fora do card fecha (evita fechar quando clica dentro)
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      const clickedInsideCard = menuCard && menuCard.contains(e.target);
      if (!clickedInsideCard) closeMenu();
    });
  }

  // 3) ESC fecha
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // 4) Itens do menu
  const miAdmin = $("#miAdmin");
  if (miAdmin) {
    miAdmin.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) {
        alert("Acesso admin: somente o dono.");
        return;
      }
      // abre o admin.html direto
      window.location.href = "./admin.html";
    });
  }

  const miAdd = $("#miAdd");
  if (miAdd) {
    miAdd.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) {
        alert("Somente o admin pode adicionar fornecedor.");
        return;
      }
      alert("Adicionar fornecedor (em breve)");
    });
  }

  const miLogs = $("#miLogs");
  if (miLogs) {
    miLogs.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) {
        alert("Somente o admin pode ver logs.");
        return;
      }
      alert("Logs (em breve)");
    });
  }

  const miGraf = $("#miGraf");
  if (miGraf) {
    miGraf.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) {
        alert("Somente o admin pode ver grafico.");
        return;
      }
      alert("Grafico (em breve)");
    });
  }

  const miPay = $("#miPay");
  if (miPay) {
    miPay.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) {
        alert("Somente o admin pode ver pagamentos.");
        return;
      }
      alert("Pagamentos (em breve)");
    });
  }

  const miLogin = $("#miLogin");
  if (miLogin) {
    miLogin.addEventListener("click", () => {
      closeMenu();

      const code = prompt("Codigo do admin:");
      if (!code) return;

      if (code === ADMIN_CODE) {
        localStorage.setItem(ADMIN_STORAGE_KEY, "1");
        applyRoleUI();
        alert("Admin ativado.");
      } else {
        alert("Codigo invalido.");
      }
    });
  }

  const miLogout = $("#miLogout");
  if (miLogout) {
    miLogout.addEventListener("click", () => {
      closeMenu();
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      applyRoleUI();
      alert("Saiu.");
    });
  }
}

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

  const detLojista = $("#detLojista");
  if (detLojista) {
    detLojista.addEventListener("click", () => {
      alert("Detalhes do plano Lojista (em breve)");
    });
  }

  const detFinal = $("#detFinal");
  if (detFinal) {
    detFinal.addEventListener("click", () => {
      alert("Detalhes do plano Consumidor Final (em breve)");
    });
  }
}

/* Loader do index (some quando DOM estiver pronto) */
function initLoader() {
  const loader = $("#loader");
  if (!loader) return;

  // dá um tempinho pra animação aparecer e não piscar
  setTimeout(() => {
    loader.classList.add("off");
  }, 250);
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  applyRoleUI();
  wireMenu();
  wireButtons();
});
