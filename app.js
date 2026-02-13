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
  GitHub Pages nao protege admin de verdade.
  Isso aqui e apenas UI. A seguranca real vem do Supabase (auth) + RLS.
*/
const ADMIN_CODE = "TROQUE_ESSA_SENHA";

function setStatus(text) {
  const s = $("#statusTxt");
  if (s) s.textContent = text;
}

function showAdminPanel(show) {
  const p = $("#adminPanel");
  if (p) p.style.display = show ? "block" : "none";
}

function isAdmin() {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "1";
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

function wireMenu() {
  const avatarBtn = $("#avatarBtn");
  const overlay = $("#menuOverlay");

  if (avatarBtn) {
    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMenu();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeMenu();
    });
  }

  const miAdmin = $("#miAdmin");
  if (miAdmin) {
    miAdmin.addEventListener("click", () => {
      closeMenu();
      if (!isAdmin()) {
        alert("Acesso admin: somente o dono.");
        return;
      }
      scrollToEl("adminPanel");
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
}

document.addEventListener("DOMContentLoaded", () => {
  applyRoleUI();
  wireMenu();
  wireButtons();
});      e.stopPropagation(); // não deixa o clique "vazar" e fechar na hora
      toggleMenu();
    });
  }

  // 2) Clicar fora fecha
  document.addEventListener("click", (e) => {
    if (!avatarMenu) return;

    const clickedInsideMenu = avatarMenu.contains(e.target);
    const clickedAvatar = avatarBtn && avatarBtn.contains(e.target);

    if (!clickedInsideMenu && !clickedAvatar) closeMenu();
  });

  // 3) ESC fecha
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // 4) Cliques em qualquer coisa com data-go
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-go]");
    if (!el) return;

    e.preventDefault();

    const go = el.getAttribute("data-go");

    // Se clicou num item do menu, fecha o menu
    if (avatarMenu && avatarMenu.contains(el)) closeMenu();

    // Rotas DEMO (depois a gente troca por páginas reais / Supabase / etc.)
    const routes = {
      products: "Produtos 🛒 (em breve)",
      how: "Como funciona 📌 (em breve)",
      support: "Suporte 💬 (em breve)",
      add_supplier: "Adicionar fornecedor ✅ (admin)",
      admin: "Painel admin 📊",
      logs: "Logs de acesso 🧾",
      chart: "Gráfico de vendas 📈",
      payments: "Pagamentos 💸",
    };

    // Se quiser navegar de verdade, você pode trocar por:
    // window.location.href = "./produtos.html"
    // ou usar ?page=products etc.
    alert(routes[go] || `Ação: ${go}`);
  });

  // 5) Sinal de vida (pode apagar depois)
  // console.log("app.js carregou ✅");
})();
