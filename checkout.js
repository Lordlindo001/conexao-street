"use strict";

const el = (id) => document.getElementById(id);

const loader = el("loader");

function showLoader(on){
  if(!loader) return;
  if(on) loader.classList.remove("off");
  else loader.classList.add("off");
}

function moneyBRL(v){
  return (Number(v)||0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

async function getCatalog(){
  const override = localStorage.getItem("cs_catalog_override");
  if(override){
    try { return JSON.parse(override); } catch {}
  }
  const res = await fetch("./products.json", { cache:"no-store" });
  if(!res.ok) throw new Error("Falha ao carregar products.json");
  return res.json();
}

/*
  Promo rules (admin):
  localStorage cs_pricing_rules = {
    "lojista": { promoOn:true, type:"none|percent|fixed", percent:10, fixedPrice:25 },
    "final":   { promoOn:false, type:"none", percent:0, fixedPrice:null }
  }
*/
function getPricingRules(){
  const raw = localStorage.getItem("cs_pricing_rules");
  if(!raw) return {};
  try { return JSON.parse(raw); } catch { return {}; }
}

function calcPrice(basePrice, rule){
  if(!rule || !rule.promoOn) return { final: basePrice, note: null };

  if(rule.type === "percent"){
    const pct = Math.max(0, Math.min(95, Number(rule.percent)||0));
    const final = +(basePrice * (1 - pct/100)).toFixed(2);
    return { final, note: `Promoção aplicada: -${pct}% (Admin)` };
  }

  if(rule.type === "fixed"){
    const fp = Number(rule.fixedPrice);
    if(!isFinite(fp) || fp <= 0) return { final: basePrice, note: null };
    return { final: +fp.toFixed(2), note: `Preço promocional definido pelo Admin` };
  }

  return { final: basePrice, note: null };
}

async function boot(){
  showLoader(true);

  const id = getParam("id");
  const catalog = await getCatalog();
  const p = catalog.find(x => String(x.id) === String(id)) || catalog[0];

  if(!p) throw new Error("Produto não encontrado");

  const rules = getPricingRules();
  const rule = rules[p.id];
  const priced = calcPrice(p.price, rule);

  el("img").style.backgroundImage = `url('${String(p.image||"").replaceAll("'","%27")}')`;
  el("name").textContent = p.name || "Produto";
  el("desc").textContent = p.description || "";
  el("price").textContent = moneyBRL(priced.final);

  const promoHint = el("promoHint");
  if(priced.note){
    promoHint.style.display = "";
    promoHint.textContent = priced.note;
  }else{
    promoHint.style.display = "none";
  }

  // copiar chave pix
  el("copyPix").addEventListener("click", async () => {
    const v = el("payKey").value || "";
    try{
      await navigator.clipboard.writeText(v);
      alert("Copiado ✅");
    }catch{
      alert("Não deu pra copiar automaticamente. Segura e copia manualmente.");
    }
  });

  // “já paguei” (layout)
  el("confirmBtn").addEventListener("click", () => {
    alert("Ok! Agora seu sistema real vai confirmar o pagamento e liberar acesso (próximo passo).");
  });

  setTimeout(() => showLoader(false), 250);
}

document.addEventListener("DOMContentLoaded", () => {
  boot().catch(e => {
    showLoader(false);
    alert(String(e.message || e));
  });
});
