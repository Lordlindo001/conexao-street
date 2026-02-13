// app.js — Conexão Street
// ✅ Abre/fecha menu do avatar
// ✅ Fecha ao clicar fora / apertar ESC
// ✅ Botões com data-go respondem (por enquanto com alert e navegação demo)

(function () {
  const $ = (sel) => document.querySelector(sel);

  const avatarBtn = $("#avatarBtn");
  const avatarMenu = $("#avatarMenu");

  function isMenuOpen() {
    return avatarMenu && avatarMenu.style.display !== "none";
  }

  function openMenu() {
    if (!avatarMenu) return;
    avatarMenu.style.display = "block";
    avatarBtn?.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!avatarMenu) return;
    avatarMenu.style.display = "none";
    avatarBtn?.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (!avatarMenu) return;
    isMenuOpen() ? closeMenu() : openMenu();
  }

  // 1) Clique no avatar
  if (avatarBtn) {
    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation(); // não deixa o clique "vazar" e fechar na hora
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
