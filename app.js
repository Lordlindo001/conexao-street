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
const ADMIN_CODE = "Euteamoluptameuamor010324c";

function setStatus(text) {
  const s = $("#statusTxt");
  if (s) s.textContent = text;
}

function isAdmin() {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "1";
}

function applyRoleUI() {
  setStatus(isAdmin() ? "admin" : "Lista VIP");
}

/* ===== Menu (Android-friendly) ===== */

let __prevBodyOverflow = "";
let __prevHtmlOverflow = "";

function lockScroll(lock) {
  const html = document.documentElement;
  const body = document.body;

  if (lock) {
    __prevHtmlOverflow = html.style.overflow;
    __prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
  } else {
    html.style.overflow = __prevHtmlOverflow || "";
    body.style.overflow = __prevBodyOverflow || "";
  }
}

function openMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.classList.add("on");
  lockScroll(true);
}

function closeMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  overlay.classList.remove("on");
  lockScroll(false);
}

function toggleMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  const willOpen = !overlay.classList.contains("on");
  if (willOpen) openMenu();
  else closeMenu();
}

function wireMenu() {
  const avatarBtn = $("#avatarBtn");
  const overlay = $("#menuOverlay");
  const menuCard = overlay ? overlay.querySelector(".menuCard") : null;

  // 1) Avatar abre/fecha (pointerdown é melhor no Android)
  if (avatarBtn) {
    avatarBtn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  // 2) Clique fora fecha (sem fechar quando clica dentro)
  if (overlay) {
    overlay.addEventListener("pointerdown", (e) => {
      const clickedInsideCard = menuCard && menuCard.contains(e.target);
      if (!clickedInsideCard) closeMenu();
    });
  }

  // 3) ESC fecha
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // 4) Itens do menu

  // Painel novo (admin.html)
  const miAdmin = $("#miAdmin");
  if (miAdmin) {
    miAdmin.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) {
        alert("Acesso admin: somente o dono.");
        return;
      }
      window.location.href = "./admin.html";
    });
  }

  // ✅ Painel antigo em arquivo novo: admin-p.html
  const miAdminP = $("#miAdminP");
  if (miAdminP) {
    miAdminP.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) {
        alert("Acesso admin: somente o dono.");
        return;
      }
      window.location.href = "./admin-p.html";
    });
  }

  const miAdd = $("#miAdd");
  if (miAdd) {
    miAdd.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode adicionar fornecedor.");
      alert("Adicionar fornecedor (em breve)");
    });
  }

  const miLogs = $("#miLogs");
  if (miLogs) {
    miLogs.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver logs.");
      alert("Logs (em breve)");
    });
  }

  const miGraf = $("#miGraf");
  if (miGraf) {
    miGraf.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver grafico.");
      alert("Grafico (em breve)");
    });
  }

  const miPay = $("#miPay");
  if (miPay) {
    miPay.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) return alert("Somente o admin pode ver pagamentos.");
      alert("Pagamentos (em breve)");
    });
  }

  const miLogin = $("#miLogin");
  if (miLogin) {
    miLogin.addEventListener("click", () => {
      closeMenu();

      const code = prompt("Codigo do admin:");
      if (!code) return;

      if (code.trim() === ADMIN_CODE) {
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
  // ✅ Ver fornecedores -> abre a vitrine
  const btnProdutos = $("#btnProdutos");
  if (btnProdutos) {
    btnProdutos.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./products.html";
    });
  }

  // mantém scroll pro "Como funciona"
  const btnComo = $("#btnComo");
  if (btnComo) {
    btnComo.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl("sec-como");
    });
  }

  // mantém scroll pro "Suporte"
  const btnSuporte = $("#btnSuporte");
  if (btnSuporte) {
    btnSuporte.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl("sec-suporte");
    });
  }

  // ✅ Comprar -> abre checkout único com o produto correto
  const buyLojista = $("#buyLojista");
  if (buyLojista) {
    buyLojista.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./checkout.html?id=lojista";
    });
  }

  const buyFinal = $("#buyFinal");
  if (buyFinal) {
    buyFinal.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./checkout.html?id=final";
    });
  }

  const detLojista = $("#detLojista");
  if (detLojista) detLojista.addEventListener("click", () => alert("Detalhes do plano Lojista (em breve)"));

  const detFinal = $("#detFinal");
  if (detFinal) detFinal.addEventListener("click", () => alert("Detalhes do plano Consumidor Final (em breve)"));
}

/* Loader do index (some quando DOM estiver pronto) */
function initLoader() {
  const loader = $("#loader");
  if (!loader) return;

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
