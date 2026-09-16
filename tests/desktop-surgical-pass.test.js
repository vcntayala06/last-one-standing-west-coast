"use strict";

const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {launch,createPage,show,verifyVisualAssets}=require("./helpers/responsive-harness");

const ROOT=path.resolve(__dirname,".."),OUT=path.join(ROOT,"test-artifacts","desktop-surgical-pass"),PHASE=process.env.SNAPSHOT_PHASE||"after";
const screens=[{name:"question",show:"question-ordinary",asset:"West_Coast_Master_Runtime_"},{name:"youre-up",show:"handoff",asset:"West_Coast_Master_Runtime_"},{name:"winner",show:"champion",asset:"Winner_"}];

async function render(page,screen){
 await show(page,screen.show);
 if(screen.name==="question")await page.evaluate(()=>{const a=window.__RESPONSIVE__,s=a.state;s.game.current={q:"Which internationally recognized scientific achievement permanently transformed how generations understand humanity’s relationship with the natural world?",a:"The theory of evolution by natural selection"};a.question(true)});
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(120);
}

test(`desktop surgical ${PHASE} captures`,{timeout:180000},async()=>{
 fs.mkdirSync(path.join(OUT,PHASE),{recursive:true});const browser=await launch();
 try{
  for(const viewport of [{width:1918,height:1010,name:"1918x1010"},{width:1920,height:1080,name:"1920x1080"},{width:430,height:932,name:"430x932"},{width:932,height:430,name:"932x430"}]){
     const page=await createPage(browser,viewport);
   try{for(const screen of screens){await render(page,screen);const proof=await verifyVisualAssets(page,{required:[screen.asset],avatar:true});assert.deepEqual(proof.missing,[]);assert.deepEqual(proof.decodeFailures,[]);assert.deepEqual(proof.network.requestFailed,[]);assert.deepEqual(proof.network.httpErrors,[]);const geometry=await page.evaluate(name=>{const rect=e=>e?.getBoundingClientRect(),result={horizontal:document.documentElement.scrollWidth-innerWidth,vertical:document.documentElement.scrollHeight-innerHeight};if(name==="question"){const q=rect(document.querySelector(".question-text")),inputs=rect(document.querySelector(".question-inputs")),area=rect(document.querySelector(".wc-question-presentation"));Object.assign(result,{question:q,inputs,area,gap:inputs.top-q.bottom,contained:q.top>=area.top-1&&q.bottom<=area.bottom+1})}if(name==="youre-up"){const board=rect(document.querySelector(".wc-master-board")),nameRect=rect(document.querySelector(".handoff-player-name"));Object.assign(result,{boardCenter:board.left+board.width/2,nameCenter:nameRect.left+nameRect.width/2,delta:Math.abs(board.left+board.width/2-(nameRect.left+nameRect.width/2)),lines:nameRect.height/parseFloat(getComputedStyle(document.querySelector(".handoff-player-name")).lineHeight)})}if(name==="winner"){const gearElement=document.querySelector(".wc-settings-gear"),gear=rect(gearElement),style=getComputedStyle(gearElement),artOpacity=getComputedStyle(document.querySelector(".wc-settings-gear-art")).opacity;Object.assign(result,{gear,gearVisible:style.display!=="none"&&style.visibility!=="hidden"&&gear.width>0&&gear.height>0,gearInside:gear.left>=0&&gear.top>=0&&gear.right<=innerWidth&&gear.bottom<=innerHeight,zIndex:style.zIndex,artOpacity})}return result},screen.name);assert.ok(geometry.horizontal<=1&&geometry.vertical<=1);if(PHASE==="after"&&viewport.width>950){if(screen.name==="question"){assert.equal(geometry.contained,true);assert.ok(geometry.gap>=20)}if(screen.name==="youre-up")assert.ok(geometry.delta<=1);if(screen.name==="winner"){assert.equal(geometry.gearVisible,true);assert.equal(geometry.gearInside,true);assert.equal(geometry.artOpacity,"1")}}fs.writeFileSync(path.join(OUT,PHASE,`${viewport.name}-${screen.name}.json`),JSON.stringify(geometry,null,2));await page.screenshot({path:path.join(OUT,PHASE,`${viewport.name}-${screen.name}.png`),animations:"disabled"})}if(viewport.name==="1920x1080"){await render(page,screens[2]);await page.screenshot({path:path.join(OUT,PHASE,"1918x1010-winner-fullscreen.png"),animations:"disabled"})}}finally{await page.close()}
  }
  // Mobile geometry remains protected by the production responsive suite. This
  // focused test deliberately keeps its assertions inside the desktop media range.
 }finally{await browser.close()}
});
