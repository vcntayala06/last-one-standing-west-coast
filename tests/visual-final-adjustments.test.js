"use strict";

const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {launch,createPage,show,verifyVisualAssets,instrument}=require("./helpers/responsive-harness");
const ROOT=path.resolve(__dirname,"..");

test("final approved-screen adjustments render from real assets",{timeout:180000},async()=>{
 const viewports=[{width:430,height:932,name:"430x932"},{width:932,height:430,name:"932x430"}],screens=[
  {name:"winner",show:"champion",asset:"Winner_"},
  {name:"question",show:"question-ordinary",asset:"West_Coast_Master_Runtime_"},
  {name:"youre-up",show:"handoff",asset:"West_Coast_Master_Runtime_"},
  {name:"showtime",show:"ready",asset:"West_Coast_Master_Runtime_"},
  {name:"times-up",show:"result-timeout",asset:"LOS_TIMES_UP_"}
 ],out=path.resolve(__dirname,"..","test-artifacts","visual-qa-final-adjustments"),browser=await launch();
 fs.mkdirSync(out,{recursive:true});
 try{
  for(const viewport of viewports){
   const page=await createPage(browser,viewport);
   try{
    for(const screen of screens){
     await show(page,screen.show);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(100);
     const proof=await verifyVisualAssets(page,{required:[screen.asset],avatar:["winner","question","youre-up","times-up"].includes(screen.name)});
     assert.deepEqual(proof.missing,[],`${viewport.name}/${screen.name} missing artwork`);
     assert.deepEqual(proof.decodeFailures,[],`${viewport.name}/${screen.name} decode failure`);
     assert.deepEqual(proof.network.requestFailed,[],`${viewport.name}/${screen.name} request failure`);
     assert.deepEqual(proof.network.httpErrors,[],`${viewport.name}/${screen.name} HTTP asset failure`);
     const geometry=await page.evaluate(name=>{const rect=e=>e?.getBoundingClientRect(),root=document.documentElement,result={horizontal:root.scrollWidth-innerWidth,vertical:root.scrollHeight-innerHeight};if(name==="winner"){const box=rect(document.querySelector(".champion-box")),winner=rect(document.querySelector(".champion-name"));result.centerX=Math.abs((box.left+box.width/2)-(winner.left+winner.width/2));result.centerY=Math.abs((box.top+box.height/2)-(winner.top+winner.height/2))}if(name==="question"){const header=rect(document.querySelector(".wc-question-player")),board=rect(document.querySelector(".wc-master-board")),boardStyle=getComputedStyle(document.querySelector(".wc-master-board")),inputStyle=getComputedStyle(document.querySelector(".keyboard-answer"));result.headerGap=board.top-header.bottom;result.boardBackground=boardStyle.backgroundColor;result.inputOverflow=inputStyle.overflow}if(name==="youre-up"||name==="showtime"){const style=getComputedStyle(document.querySelector(".wc-master-board"));result.border=[style.borderTopWidth,style.borderRightWidth,style.borderBottomWidth,style.borderLeftWidth];result.shadow=style.boxShadow}if(name==="times-up")result.plateSize=getComputedStyle(document.querySelector(".los-gameplay-plate")).backgroundSize;return result},screen.name);
     assert.ok(geometry.horizontal<=1&&geometry.vertical<=1,`${viewport.name}/${screen.name} overflow`);
     if(screen.name==="winner"){assert.ok(geometry.centerX<=1);assert.ok(geometry.centerY<=1)}
     if(screen.name==="question"){assert.ok(geometry.headerGap>=3,`${viewport.name} Question header/frame gap ${geometry.headerGap}`);assert.equal(geometry.boardBackground,"rgba(0, 0, 0, 0)");assert.equal(geometry.inputOverflow,"hidden")}
     if(screen.name==="youre-up"||screen.name==="showtime"){assert.deepEqual(geometry.border,["0px","0px","0px","0px"]);assert.equal(geometry.shadow,"none")}
     if(screen.name==="times-up"&&viewport.width>viewport.height)assert.equal(geometry.plateSize,"124%");
     await page.screenshot({path:path.join(out,`${viewport.name}-${screen.name}.png`),animations:"disabled"});
    }
   }finally{await page.close()}
  }
 }finally{await browser.close()}
});

test("production hostname cannot render the LOCAL TEST overlay",{timeout:60000},async()=>{
 const out=path.join(ROOT,"test-artifacts","visual-qa-final-adjustments"),browser=await launch(),page=await browser.newPage({viewport:{width:932,height:430},deviceScaleFactor:1,reducedMotion:"reduce"});
 fs.mkdirSync(out,{recursive:true});
 let proofRequests=0;
 try{
  await page.route("http://production.example/**",async route=>{const url=new URL(route.request().url()),pathname=decodeURIComponent(url.pathname);if(pathname==="/__los_build_proof"){proofRequests++;return route.fulfill({status:404,contentType:"application/json",body:JSON.stringify({error:"Not found"})})}const target=path.resolve(ROOT,"."+pathname);if(!target.startsWith(ROOT+path.sep)||!fs.existsSync(target)||!fs.statSync(target).isFile())return route.fulfill({status:404,body:"Not found"});const types={".css":"text/css",".js":"text/javascript",".png":"image/png",".webmanifest":"application/manifest+json"};return route.fulfill({status:200,contentType:types[path.extname(target).toLowerCase()]||"application/octet-stream",body:fs.readFileSync(target)})});
  await page.goto("http://production.example/__production_test__.html");
  await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="http://production.example/app.css"></head><body><main id="app"></main></body></html>');
  await page.evaluate(()=>{const data=new Map([["los5_voice","false"]]);Object.defineProperty(window,"localStorage",{value:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key),clear:()=>data.clear()}});class AC{constructor(){this.currentTime=0;this.state="running";this.destination={}}createOscillator(){return{type:"",frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}resume(){}}window.AudioContext=AC;window.__RESPONSIVE__={}});
  for(const file of ["question-bank-data.js",...Array.from({length:10},(_,index)=>`question-bank-batch-${index+1}.js`),"question-bank.js"])await page.addScriptTag({content:fs.readFileSync(path.join(ROOT,file),"utf8")});
  await page.addScriptTag({content:instrument(fs.readFileSync(path.join(ROOT,"app.js"),"utf8"))});
  await page.evaluate(()=>{const a=window.__RESPONSIVE__,s=a.state;s.players=[{id:"p1",name:"Smithandwesin",avatar:"wc-a1"}];s.game={players:[{...s.players[0],correct:1,wrong:0,timeout:0,strikes:0,eliminated:false}],startingCount:1,idx:0,qnum:1,used:[],current:null,answered:false,started:Date.now(),speechLog:[],lastSpeechLog:[],showdown:false};a.champion(s.game.players[0])});
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
  const production=await page.evaluate(()=>({hostname:location.hostname,badge:document.querySelector("#losLocalBuildProof"),label:document.body.innerText.includes("LOCAL TEST"),proof:globalThis.__LOS_LOCAL_BUILD_PROOF__}));
  assert.equal(production.hostname,"production.example");assert.equal(production.badge,null);assert.equal(production.label,false);assert.equal(production.proof,undefined);assert.equal(proofRequests,0,"non-loopback mode must not request build proof");
  const direct=await page.evaluate(async()=>{const response=await fetch("/__los_build_proof");return{status:response.status,body:await response.json()}});assert.equal(direct.status,404);assert.deepEqual(direct.body,{error:"Not found"});assert.equal(proofRequests,1);
  await page.screenshot({path:path.join(out,"932x430-production-no-local-test.png"),animations:"disabled"});
 }finally{await page.close();await browser.close()}
});
