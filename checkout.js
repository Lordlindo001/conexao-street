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

function paidKey(productId){
  return `cs_paid_${String(productId||"")}`;
}

function isMarkedPaid(productId){
  return localStorage.getItem(paidKey(productId)) === "1";
}

function markPaid(productId){
  localStorage.setItem(paidKey(productId), "1");
}

async function boot(){
  showLoader(true);

  const id = getParam("id");
  const catalog = await getCatalog();
  const p = catalog.find
