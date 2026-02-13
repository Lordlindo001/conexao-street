"use strict";

const $ = (sel) => document.querySelector(sel);

function scrollToEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const ADMIN_KEY = "cs_admin_ok";

function isAdmin() {
  return localStorage.getItem(ADMIN_KEY) === "1";
}

function setStatusUI() {
  const statusTxt = $("#statusTxt");
  const roleChip = $("#roleChip");
  const statusPill = $("#statusPill");
  const miAdmin = $("#miAdmin");

  if (isAdmin()) {
    if (statusTxt) statusTxt.textContent = "admin";
    if (roleChip) {
      roleChip.textContent = "on";
      roleChip.className = "chip";
      roleChip.style.borderColor = "rgba(36,209,141,.35)";
      roleChip.style.background = "rgba(36,209,141,.10)";
    }
    if (statusPill) statusPill.textContent = "Admin";
    if (miAdmin) miAdmin.classList.remove("hide");
  } else {
    if (statusTxt) statusTxt.textContent = "visitante";
    if (roleChip) {
      roleChip.textContent = "off";
      roleChip.className = "chip";
      roleChip.style.borderColor = "rgba(255,255,255,.12)";
      roleChip.style.background = "rgba(255,255,255,.04)";
    }
    if (statusPill) statusPill.textContent = "Visitante";
    if (miAdmin) miAdmin.classList.add("hide");
  }
}

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

function toggleMenu() {
  const overlay = $("#menuOverlay");
  if (!overlay) return;
  const isOpen = overlay.style.display === "block";
  if (isOpen) closeMenu();
  else openMenu();
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

  document.addEventListener("click", (e) => {
    const overlayNow = $("#menuOverlay");
    if (!overlayNow) return;
    const clickedAvatar = avatarBtn && avatarBtn.contains(e.target);
    const menuBox = overlayNow.querySelector(".menuBox");
    const clickedInsideMenu = menuBox && menuBox.contains(e.target);

    if (!clickedAvatar && !clickedInsideMenu) closeMenu();
  });

  document.addEventListener("click", (e) => {
    const item = e.target.closest("[data-go]");
    if (!item) return;

    e.preventDefault();
    const go = item.getAttribute("data-go");

    if (go === "close") {
      closeMenu();
      return;
    }

    if (go === "buy") {
      closeMenu();
      scrollToEl("sec-comprar");
      return;
    }

    if (go === "products") {
      closeMenu();
      alert("Seus produtos em breve");
      return;
    }

    if (go === "admin") {
      closeMenu();
      if (!isAdmin()) {
        alert("Acesso admin somente o dono");
        return;
      }
      window.location.href = "./admin.html";
      return;
    }
  });
}

function wireButtons() {
  const btnComprar = $("#btnComprar");
  const btnComo = $("#btnComo");
  const btnSuporte = $("#btnSuporte");

  if (btnComprar) {
    btnComprar.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl("sec-comprar");
    });
  }
  if (btnComo) {
    btnComo.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl("sec-como");
    });
  }
  if (btnSuporte) {
    btnSuporte.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToEl("sec-suporte");
    });
  }

  const buyLojista = $("#buyLojista");
  const buyFinal = $("#buyFinal");
  const detLojista = $("#detLojista");
  const detFinal = $("#detFinal");

  if (buyLojista) {
    buyLojista.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Checkout Fornecedores logistas R$ 30,00 em breve");
    });
  }
  if (buyFinal) {
    buyFinal.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Checkout Fornecedores consumidor final R$ 25,00 em breve");
    });
  }

  if (detLojista) {
    detLojista.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Lista para quem vende e revende. Conteudo e acesso em breve");
    });
  }
  if (detFinal) {
    detFinal.addEventListener("click", (e) => {
      e.preventDefault();
      alert("Lista para compra pessoal. Conteudo e acesso em breve");
    });
  }
}

function initLoader() {
  const loader = $("#loader");
  if (!loader) return;
  requestAnimationFrame(() => {
    loader.classList.add("off");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  setStatusUI();
  wireMenu();
  wireButtons();
});
