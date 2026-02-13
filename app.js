// app.js

// 1) util: seleciona com segurança
const $ = (sel) => document.querySelector(sel);

// 2) pega elementos (pelas classes que já existem no seu HTML)
const btnVerProdutos = $(".btn.primary");         // "Ver produtos"
const btnComo = document.querySelectorAll(".btn")[1]; // "Como funciona"
const btnSuporte = document.querySelectorAll(".btn")[2]; // "Suporte"
const avatar = $(".avatar");                      // bolinha roxa (conta)
const menuChip = document.querySelector(".chip"); // "menu do avatar" (só pra teste)

const menu = document.querySelector(".menu");     // menu da conta (lado direito)

// 3) estado do menu
let menuAberto = false;

// 4) função abrir/fechar menu
function toggleMenu() {
  menuAberto = !menuAberto;
  if (menu) menu.style.display = menuAberto ? "block" : "none";
}

// 5) inicia com menu escondido (fica mais real)
if (menu) menu.style.display = "none";

// 6) eventos
if (btnVerProdutos) {
  btnVerProdutos.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Abrir: Página de produtos 🛒 (em breve)");
    // no futuro: window.location.href = "./produtos.html";
  });
}

if (btnComo) {
  btnComo.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Abrir: Como funciona ✅ (em breve)");
    // no futuro: window.location.href = "./como.html";
  });
}

if (btnSuporte) {
  btnSuporte.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Abrir: Suporte 💬 (em breve)");
    // no futuro: window.location.href = "./suporte.html";
  });
}

if (avatar) {
  avatar.style.cursor = "pointer";
  avatar.addEventListener("click", () => {
    toggleMenu();
  });
}

// 7) fecha menu se clicar fora (bem “site real”)
document.addEventListener("click", (e) => {
  const clicouNoMenu = menu && menu.contains(e.target);
  const clicouNoAvatar = avatar && avatar.contains(e.target);
  if (menuAberto && !clicouNoMenu && !clicouNoAvatar) {
    menuAberto = false;
    if (menu) menu.style.display = "none";
  }
});

// 8) clique nos itens do menu (Adicionar fornecedor / Painel / Logs / Gráfico / Pagamentos)
document.querySelectorAll(".menu .mi").forEach((item) => {
  item.style.cursor = "pointer";
  item.addEventListener("click", () => {
    const texto = item.innerText.split("\n")[0].trim();
    alert(`Abrir: ${texto} (em breve)`);
    // no futuro: navegar pra páginas reais
  });
});
