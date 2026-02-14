"use strict";

const $ = (sel) => document.querySelector(sel);

function scrollToEl(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setStatus(text) {
  const s = $("#statusTxt");
  if (s) s.textContent = text;
}

function applyRoleUI() {
  if (UI && UI.isAdmin && UI.isAdmin()) setStatus("admin");
  else setStatus("Lista VIP");
}

function wireButtons() {
  const btnProdutos = $("#btnProdutos");
  if (btnProdutos) {
    btnProdutos.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "./products.html";
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

function initLoader() {
  const loader = $("#loader");
  if (!loader) return;
  setTimeout(() => loader.classList.add("off"), 220);
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  if (window.UI && UI.wireMenu) UI.wireMenu();
  applyRoleUI();
  wireButtons();
});