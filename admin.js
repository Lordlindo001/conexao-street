"use strict";

const PIN = "Euteamoluptameuamor010324c";
const KEY = "cs_admin_ok";

const el = (id) => document.getElementById(id);

const show = (node) => {
  if (!node) return;
  node.style.display = "";
};

const hide = (node) => {
  if (!node) return;
  node.style.display = "none";
};

const isAuthed = () => localStorage.getItem(KEY) === "1";

function toast(msg) {
  alert(msg);
}

function initLoader() {
  const loader = el("loader");
  if (!loader) return;

  // evita piscar
  setTimeout(() => {
    loader.classList.add("off");
  }, 250);
}

async function miniLoading(ms = 420) {
  const loader = el("loader");
  if (!loader) return;

  loader.classList.remove("off");
  await new Promise((r) => setTimeout(r, ms));
  loader.classList.add("off");
}

function fillDemoKPIs() {
  const kpiSales = el("kpiSales");
  const kpiPend = el("kpiPend");
  const kpiLogs = el("kpiLogs");

  if (kpiSales) kpiSales.textContent = "R$ 29,90";
  if (kpiPend) kpiPend.textContent = "1";
  if (kpiLogs) kpiLogs.textContent = "18";
}

function setAuthedUI(v) {
  const gateBox = el("gateBox");
  const kpis = el("kpis");
  const orders = el("orders");
  const leave = el("leave");
  const pin = el("pin");

  if (v) {
    localStorage.setItem(KEY, "1");

    hide(gateBox);
    show(kpis);
    show(orders);
    if (leave) show(leave);

    fillDemoKPIs();
  } else {
    localStorage.removeItem(KEY);

    show(gateBox);
    hide(kpis);
    hide(orders);
    if (leave) hide(leave);

    if (pin) pin.value = "";
  }
}

function wireAuth() {
  const pin = el("pin");
  const enter = el("enter");
  const leave = el("leave");

  if (enter) {
    enter.addEventListener("click", async () => {
      const v = (pin && pin.value ? pin.value : "").trim();

      if (v === PIN) {
        await miniLoading(450);
        setAuthedUI(true);
      } else {
        toast("PIN incorreto");
        if (pin) pin.focus();
      }
    });
  }

  if (pin) {
    pin.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (enter) enter.click();
      }
    });
  }

  if (leave) {
    leave.addEventListener("click", () => {
      setAuthedUI(false);
      toast("Saiu");
    });
  }
}

function wireShortcuts() {
  const goAdd = el("goAdd");
  const goLogs = el("goLogs");
  const goChart = el("goChart");
  const goPay = el("goPay");

  const needAdmin = () => {
    if (!isAuthed()) {
      toast("Entre no admin primeiro");
      return false;
    }
    return true;
  };

  if (goAdd) goAdd.addEventListener("click", () => needAdmin() && toast("Adicionar fornecedor em breve"));
  if (goLogs) goLogs.addEventListener("click", () => needAdmin() && toast("Logs em breve"));
  if (goChart) goChart.addEventListener("click", () => needAdmin() && toast("Grafico em breve"));

  if (goPay) {
    goPay.addEventListener("click", () => {
      if (!needAdmin()) return;
      const orders = el("orders");
      if (orders) orders.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  wireAuth();
  wireShortcuts();

  if (isAuthed()) setAuthedUI(true);
  else setAuthedUI(false);
});
