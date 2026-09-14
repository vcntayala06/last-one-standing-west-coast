"use strict";

const CACHE_VERSION="6.38-iphone-screen-fix";
const CACHE_NAME=`last-one-standing-shell-${CACHE_VERSION}`;
const APP_SHELL=[
 "./",
 "./index.html",
 "./app.css",
 "./app.js",
 "./assets/visual-6.36/references/LOS_CORRECT_6_36_LANDSCAPE_RUNTIME.png",
 "./assets/visual-6.36/references/LOS_CORRECT_6_36_PORTRAIT_RUNTIME.png",
 "./assets/visual-6.36/references/LOS_CORRECT_6_36_ULTRAWIDE_RUNTIME.png",
 "./assets/west-coast/runtime/LOS_TIMES_UP_LANDSCAPE_CLEAN.png",
 "./assets/west-coast/runtime/LOS_TIMES_UP_PORTRAIT_CLEAN.png",
 "./assets/west-coast/runtime/LOS_TIMES_UP_ULTRAWIDE_CLEAN.png",
 "./assets/west-coast/runtime/LOS_PASS_SKIP_LANDSCAPE_RUNTIME_LOCKED.png",
 "./assets/west-coast/runtime/LOS_PASS_SKIP_PORTRAIT_RUNTIME_LOCKED.png",
 "./assets/west-coast/runtime/LOS_PASS_SKIP_ULTRAWIDE_RUNTIME_LOCKED.png",
 "./assets/west-coast/runtime/LOS_CURRENT_STANDINGS_LANDSCAPE_NO_LOGO.png",
 "./assets/west-coast/runtime/LOS_CURRENT_STANDINGS_PORTRAIT_NO_LOGO.png",
 "./assets/west-coast/runtime/LOS_CURRENT_STANDINGS_ULTRAWIDE_RUNTIME_LOCKED.png",
 "./assets/west-coast/runtime/LOS_ELIMINATED_LANDSCAPE_NO_LOGO_NO_CIRCLE.png",
 "./assets/west-coast/runtime/LOS_ELIMINATED_PORTRAIT_NO_LOGO_NO_CIRCLE.png",
 "./assets/west-coast/runtime/LOS_ELIMINATED_ULTRAWIDE_NO_LOGO_NO_CIRCLE.png",
 "./assets/west-coast/runtime/FINAL_SHOWDOWN_MATCHUP_LANDSCAPE_CLEAN.png",
 "./assets/west-coast/runtime/FINAL_SHOWDOWN_MATCHUP_PORTRAIT_CLEAN.png",
 "./assets/west-coast/runtime/FINAL_SHOWDOWN_MATCHUP_ULTRAWIDE_CLEAN.png",
 "./assets/west-coast/runtime/final-showdown-question/Final_Showdown_Landscape_CLEAN.png",
 "./assets/west-coast/runtime/final-showdown-question/Final_Showdown_Portrait_CLEAN.png",
 "./assets/west-coast/runtime/final-showdown-question/Final_Showdown_Ultrawide_CLEAN.png",
 "./assets/west-coast/runtime/choose-your-game/Choose_Your_Game_Landscape_Runtime_LOCKED.png",
 "./assets/west-coast/runtime/choose-your-game/Choose_Your_Game_Portrait_Runtime_LOCKED.png",
 "./assets/west-coast/runtime/choose-your-game/Choose_Your_Game_Ultrawide_Runtime_LOCKED.png",
 "./assets/west-coast/runtime/home/LOS_HOME_WEST_COAST_LANDSCAPE_RUNTIME_LOCKED.png",
 "./assets/west-coast/runtime/home/LOS_HOME_WEST_COAST_PORTRAIT_RUNTIME_LOCKED.png",
 "./assets/west-coast/runtime/home/LOS_HOME_WEST_COAST_ULTRAWIDE_RUNTIME_LOCKED.png",
 "./assets/west-coast/master-runtime/West_Coast_Master_Runtime_Landscape.png",
 "./assets/west-coast/master-runtime/West_Coast_Master_Runtime_Portrait.png",
 "./assets/west-coast/master-runtime/West_Coast_Master_Runtime_Ultrawide.png",
 "./assets/west-coast/runtime/Winner_Landscape_Runtime_REFINED.png",
 "./assets/west-coast/runtime/Winner_Portrait_Runtime_REFINED_V2.png",
 "./assets/west-coast/runtime/Winner_Ultrawide_Runtime_REFINED.png",
 "./assets/visual-6.36/los-avatar-atlas-v2.png",
 "./assets/visual-6.36/los-avatar-style-expansion-v3.png",
 "./host-provider.js",
 "./service-worker-register.js",
 "./question-bank-data.js",
 "./question-bank-batch-1.js",
 "./question-bank-batch-2.js",
 "./question-bank-batch-3.js",
 "./question-bank-batch-4.js",
 "./question-bank-batch-5.js",
 "./question-bank-batch-6.js",
 "./question-bank-batch-7.js",
 "./question-bank-batch-8.js",
 "./question-bank-batch-9.js",
 "./question-bank-batch-10.js",
 "./question-bank.js",
 "./manifest.webmanifest",
 "./apple-touch-icon.png",
 "./icon-192.png",
 "./icon-512.png"
];

self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith("last-one-standing-shell-")&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||url.pathname.includes("/api/"))return;
 if(request.mode==="navigate"){
  event.respondWith(fetch(request).catch(()=>caches.open(CACHE_NAME).then(cache=>cache.match("./index.html"))));
  return;
 }
 event.respondWith(caches.open(CACHE_NAME).then(cache=>cache.match(request,{ignoreSearch:true})).then(cached=>cached||fetch(request)));
});
