// config.js
"use strict";

window.APP_CONFIG = {
  SUPABASE_URL: "https://oshlcbyycnxfhoithats.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGxjYnl5Y254ZmhvaXRoYXRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5MzQzNzQsImV4cCI6MjA4NjUxMDM3NH0.K_ac5DRPxabYytjTG5fktvs_lAFsbixYIzTLrUZ3BVc",

  // nome do site (UI)
  BRAND_NAME: "Conexão Street",

  // admin UI code (só UI — segurança real é Supabase)
  ADMIN_UI_CODE: "Euteamoluptameuamor010324c",
};

// ✅ ponte pros scripts antigos (checkout-orders.js etc.)
window.SUPABASE_URL = window.APP_CONFIG.SUPABASE_URL;
window.SUPABASE_ANON_KEY = window.APP_CONFIG.SUPABASE_ANON_KEY;