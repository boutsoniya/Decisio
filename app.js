const demo=[
{Region:"North",Category:"Electronics",Revenue:185000,Profit:37000},{Region:"North",Category:"Home",Revenue:92000,Profit:16560},
{Region:"South",Category:"Electronics",Revenue:142000,Profit:25560},{Region:"South",Category:"Home",Revenue:118000,Profit:21240},
{Region:"East",Category:"Electronics",Revenue:97000,Profit:19400},{Region:"East",Category:"Home",Revenue:74000,Profit:11840},
{Region:"West",Category:"Electronics",Revenue:151000,Profit:30200},{Region:"West",Category:"Home",Revenue:109000,Profit:19620},
{Region:"North",Category:"Grocery",Revenue:68000,Profit:8160},{Region:"South",Category:"Grocery",Revenue:76000,Profit:9120},
{Region:"East",Category:"Grocery",Revenue:63000,Profit:7560},{Region:"West",Category:"Grocery",Revenue:71000,Profit:9940}
];
let rows=[...demo];
let schemaInfo={mapped:true,missing:[]};
// Lightweight schema mapping keeps the browser prototype useful with real-world column names.
function cleanKey(k){return String(k||"").toLowerCase().replace(/[^a-z0-9]/g,"")}
function mapField(keys, aliases){
  for(const alias of aliases){const hit=keys.find(k=>cleanKey(k)===cleanKey(alias));if(hit)return hit}
  for(const alias of aliases){const hit=keys.find(k=>cleanKey(k).includes(cleanKey(alias)));if(hit)return hit}
}
function normalizeRows(input){
  if(!Array.isArray(input)||!input.length){schemaInfo={mapped:false,missing:["Region","Category","Revenue","Profit"]};return []}
  const keys=Object.keys(input[0]||{});
  const regionKey=mapField(keys,["Region","Area","Zone","Territory","Market"]);
  const categoryKey=mapField(keys,["Category","Product Category","Segment","Department"]);
  const revenueKey=mapField(keys,["Revenue","Sales","Sales Amount","Total Sales","Amount"]);
  const profitKey=mapField(keys,["Profit","Net Profit","Gross Profit","Margin Value"]);
  const missing=[];
  if(!regionKey)missing.push("Region");
  if(!categoryKey)missing.push("Category");
  if(!revenueKey)missing.push("Revenue");
  if(!profitKey)missing.push("Profit");
  schemaInfo={mapped:missing.length===0,missing};
  return input.map(r=>({
    ...r,
    Region: regionKey ? (r[regionKey]??"Unknown") : (r.Region??"Unknown"),
    Category: categoryKey ? (r[categoryKey]??"Unknown") : (r.Category??"Unknown"),
    Revenue: revenueKey ? num(r[revenueKey]) : num(r.Revenue),
    Profit: profitKey ? num(r[profitKey]) : num(r.Profit)
  }))
}
function schemaStatus(){
  return schemaInfo.mapped ? "Mapped · Ready" : "Needs · "+schemaInfo.missing.join(", ");
}

const $=id=>document.getElementById(id);
const num=x=>Number(String(x??"").replace(/[^0-9.-]/g,""))||0;
const money=x=>"₹"+Math.round(x).toLocaleString("en-IN");
const total=k=>rows.reduce((s,r)=>s+num(r[k]),0);
const regions=()=>{const m={};rows.forEach(r=>m[r.Region]=(m[r.Region]||0)+num(r.Revenue));return Object.entries(m).sort((a,b)=>b[1]-a[1])};
const categories=()=>{const m={};rows.forEach(r=>{m[r.Category]??={r:0,p:0};m[r.Category].r+=num(r.Revenue);m[r.Category].p+=num(r.Profit)});return Object.entries(m).map(([k,v])=>[k,v.p/v.r,v.r,v.p]).sort((a,b)=>b[1]-a[1])};

function renderRegions(){const a=regions(),mx=a[0]?.[1]||1;$("regionBars").innerHTML=a.map(x=>'<div class="region-bar"><b>'+money(x[1])+'</b><i style="height:'+Math.max(8,x[1]/mx*170)+'px"></i><span>'+x[0]+'</span></div>').join("")}
function renderCats(){const a=categories(),mx=a[0]?.[1]||1;$("categoryBars").innerHTML=a.map(x=>'<div class="cat-row"><span>'+x[0]+'</span><i><b style="width:'+Math.max(8,x[1]/mx*100)+'%"></b></i><strong>'+(x[1]*100).toFixed(1)+'%</strong></div>').join("")}
function dashboard(){const r=total("Revenue"),p=total("Profit"),a=regions(),c=categories();$("rev").textContent=money(r);$("profit").textContent=money(p);$("margin").textContent=(p/r*100).toFixed(1)+"%";$("records").textContent=rows.length;$("meta").textContent=rows.length+" rows · "+Object.keys(rows[0]||{}).length+" fields · "+schemaStatus();renderRegions();renderCats();if(a[0]){$("insight1").textContent=a[0][0]+" leads revenue";$("insight1text").textContent=money(a[0][1])+" observed revenue."}if(c[0]){$("insight2").textContent=c[0][0]+" leads margin";$("insight2text").textContent=(c[0][1]*100).toFixed(1)+"% observed margin."}}
function table(data,headers){$("etable").innerHTML='<table class="evidence"><thead><tr>'+headers.map(h=>"<th>"+h+"</th>").join("")+'</tr></thead><tbody>'+data.map(r=>"<tr>"+r.map((x,i)=>"<td class='"+(i===r.length-1&&String(x).includes("PASS")?"pass":"")+"'>"+x+"</td>").join("")+"</tr>").join("")+"</tbody></table>"}
function answerMetrics(items){$("answerMetrics").innerHTML=items.map(x=>'<div class="metric"><span>'+x[0]+'</span><b>'+x[1]+'</b></div>').join("")}
function chart(title,html){return '<div class="answer-chart"><h4>'+title+'</h4>'+html+'</div>'}
function analyze(q){q=(q||"").toLowerCase();const a=regions(),c=categories();if(q.includes("region")||q.includes("revenue")){const t=a[0];$("atitle").textContent=t[0]+" is currently the strongest revenue region.";$("atext").textContent="Computed from "+rows.length+" observed rows. "+t[0]+" contributes "+money(t[1])+" of revenue.";$("method").textContent="Revenue is aggregated by Region and sorted highest to lowest from the loaded dataset.";answerMetrics([["Top region",t[0]],["Regional revenue",money(t[1])],["Share of revenue",(t[1]/total("Revenue")*100).toFixed(1)+"%"]]);$("answerCharts").innerHTML=chart("Revenue by region",'<div class="region-bars mini">'+a.map(x=>'<div class="region-bar"><b>'+money(x[1])+'</b><i style="height:'+Math.max(8,x[1]/(a[0][1])*110)+'px"></i><span>'+x[0]+'</span></div>').join("")+"</div>");table(a.map(x=>[x[0],money(x[1]),(x[1]/total("Revenue")*100).toFixed(1)+"%","Computed · PASS"]),["Region","Revenue","Share","Evidence"])}else if(q.includes("margin")||q.includes("category")){const t=c[0];$("atitle").textContent=t[0]+" has the highest observed profit margin.";$("atext").textContent="Margin is calculated as Profit ÷ Revenue from the uploaded data.";$("method").textContent="Profit margin = Profit / Revenue for each category; no unsupported external assumptions are used.";answerMetrics([["Top category",t[0]],["Profit margin",(t[1]*100).toFixed(1)+"%"],["Category revenue",money(t[2])]]);$("answerCharts").innerHTML=chart("Profit margin by category",'<div class="category-bars">'+c.map(x=>'<div class="cat-row"><span>'+x[0]+'</span><i><b style="width:'+Math.max(8,x[1]/c[0][1]*100)+'%"></b></i><strong>'+(x[1]*100).toFixed(1)+'%</strong></div>').join("")+"</div>");table(c.map(x=>[x[0],money(x[2]),money(x[3]),(x[1]*100).toFixed(1)+"%","Computed · PASS"]),["Category","Revenue","Profit","Margin","Evidence"])}else if(q.includes("price")||q.includes("10%")){$("atitle").textContent="A price-change scenario can be tested before you act.";$("atext").textContent="The simulator applies a transparent proportional price/revenue assumption to the observed baseline."; $("method").textContent="Scenario = observed totals × (1 + price change). This is a sensitivity model, not a forecast guarantee.";answerMetrics([["Baseline revenue",money(total("Revenue"))],["At +10%",money(total("Revenue")*1.1)],["Modeled delta","+10%"]]);$("answerCharts").innerHTML=chart("Scenario impact",'<div class="compare-bars"><div><span>Baseline</span><i style="width:65%"></i></div><div><span>+10%</span><i style="width:72%"></i></div></div>');table([["Baseline",money(total("Revenue")),money(total("Profit"))],["+10%",money(total("Revenue")*1.1),money(total("Profit")*1.1)]],["Case","Revenue","Profit"])}else{$("atitle").textContent="Question needs an available business field.";$("atext").textContent="Try revenue by region, margin by category, or a price-change scenario. Unsupported conclusions are guarded.";$("method").textContent="The current browser prototype only answers questions that can be computed from the loaded fields.";answerMetrics([["Guard","Active"],["Supported fields","Revenue, Profit"],["Evidence","Linked"]]);$("answerCharts").innerHTML="";table([["Guard","Blocked","PASS"]],["Check","Action","Status"])}$("answerBase").textContent=money(total("Revenue"));$("answerScenario").textContent=money(total("Revenue")*1.1);
  const briefTitle=$("briefTitle"),briefText=$("briefText"),trailAnswer=$("trailAnswer"),trailDecision=$("trailDecision");
  if(briefTitle){
    if(q.includes("region")||q.includes("revenue")){briefTitle.textContent="Revenue signal to investigate";briefText.textContent=a[0][0]+" contributes "+money(a[0][1])+" in observed revenue. Use the evidence table to inspect the regional split before acting.";trailAnswer.textContent="Regional revenue was aggregated and ranked from the loaded rows.";trailDecision.textContent="Investigate the leading region; no causal claim is made from revenue alone."}
    else if(q.includes("margin")||q.includes("category")){briefTitle.textContent="Margin signal to investigate";briefText.textContent=c[0][0]+" has the highest observed margin at "+(c[0][1]*100).toFixed(1)+"%. Check the underlying revenue and profit values before changing allocation.";trailAnswer.textContent="Category margin was computed as Profit ÷ Revenue.";trailDecision.textContent="Investigate the margin leader with its underlying volume and profit evidence."}
    else if(q.includes("price")||q.includes("10%")){briefTitle.textContent="Scenario ready for review";briefText.textContent="A +10% price assumption models revenue at "+money(total("Revenue")*1.1)+". This is a sensitivity result, not a forecast guarantee.";trailAnswer.textContent="Observed totals were scaled using the stated scenario assumption.";trailDecision.textContent="Stress-test the assumption before using the scenario operationally."}
    else {briefTitle.textContent="Question needs a supported field";briefText.textContent="Decisio can only compute conclusions from fields available in the loaded dataset.";trailAnswer.textContent="The question was checked against supported fields.";trailDecision.textContent="Choose a supported question or upload a dataset with the required fields."}
  }
}
function sim(){const p=+$("slider").value,r=total("Revenue"),pr=total("Profit");$("pv").textContent=(p>=0?"+":"")+p+"%";$("br").textContent=money(r);$("sr").textContent=money(r*(1+p/100));$("bp").textContent=money(pr);$("sp").textContent=money(pr*(1+p/100));$("delta").textContent=(p>=0?"+":"")+p+"%";$("delta2").textContent=(p>=0?"+":"")+p+"%";$("meter").style.width=Math.max(10,Math.abs(p)/30*100)+"%";$("scenarioBar").style.width=Math.min(100,65+(p/30)*35)+"%";$("flag").textContent=Math.abs(p)>15?"Review assumption":"Transparent";$("note").textContent=Math.abs(p)>15?"Large moves need elasticity validation before operational use.":"Proportional price/revenue relationship; not a forecast guarantee."}
function setStep(v){
  const order=["dashboard","answer","simulator","reliability"],idx=order.indexOf(v);
  document.querySelectorAll(".decision-steps .step").forEach((el,i)=>{el.classList.toggle("active",i===idx||i===0&&v==="dashboard");el.classList.toggle("done",i<idx)});
}
function page(v){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===v));setStep(v);document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.page===v));$("crumb").textContent=v==="dashboard"?"Visual Summary":v==="simulator"?"Price Scenario":v==="reliability"?"Validation Guard":"Evidence & Answer";if(v==="answer")analyze($("q").value);if(v==="simulator")sim()}
document.querySelectorAll("[data-page]").forEach(x=>x.addEventListener("click",()=>page(x.dataset.page)));
document.querySelectorAll("[data-q]").forEach(x=>x.addEventListener("click",()=>{$("q").value=x.dataset.q;analyze(x.dataset.q);page("answer")}));
$("ask").addEventListener("click",()=>{analyze($("q").value);page("answer")});$("topAnalyze").addEventListener("click",()=>{analyze($("q").value);page("answer")});
$("slider").addEventListener("input",sim);

let walkthroughTimer=null;
function toast(title,textValue){
  const box=$("demoToast"); if(!box)return;
  $("toastTitle").textContent=title; $("toastText").textContent=textValue; box.classList.add("show");
}
function stopWalkthrough(){
  if(walkthroughTimer){clearTimeout(walkthroughTimer);walkthroughTimer=null}
  $("demoToast")?.classList.remove("show");
}
function runWalkthrough(){
  stopWalkthrough();
  resetWorkspace();
  const stages=[
    [0,"01 · DATA","Demo dataset loaded — fields are detected and ready.","dashboard"],
    [4500,"02 · ANSWER","Revenue is aggregated by region from the observed rows.","answer"],
    [9500,"03 · EVIDENCE","Inspect the calculation trail before taking a decision.","answer"],
    [14000,"04 · SIMULATE","Now test a +10% price assumption against the baseline.","simulator"],
    [20500,"05 · STRESS-TEST","Push the assumption and inspect the reliability flag.","simulator"],
    [26500,"06 · RELIABILITY","The validation guard keeps assumptions visible.","reliability"],
    [33000,"DONE · DECISION READY","Data → Answer → Evidence → Simulation → Reliability.","reliability"]
  ];
  stages.forEach(([delay,title,msg,target])=>{
    setTimeout(()=>{
      if(!$("demoToast")?.classList.contains("show") && delay!==0)return;
      page(target);
      if(target==="answer"){$("q").value=delay<6000?"Which region is driving the most revenue?":"Which region is driving the most revenue?";analyze($("q").value)}
      if(target==="simulator"){$("slider").value=delay>=20000?20:10;sim()}
      toast(title,msg);
    },delay);
  });
  walkthroughTimer=setTimeout(()=>{toast("DONE · Decision ready","Walkthrough complete. You can now explore any screen manually.");walkthroughTimer=null},35000);
}
$("walkthroughBtn")?.addEventListener("click",runWalkthrough);
$("stopWalkthrough")?.addEventListener("click",stopWalkthrough);
$("dataHint")?.addEventListener("click",()=>toast("Evidence-first workflow","Upload data → ask a question → inspect evidence → simulate an assumption → stress-test → validate."));
$("uploadBtn").addEventListener("click",()=>{$("upload").classList.toggle("open");$("file").click()});
$("uploadNav").addEventListener("click",()=>{$("upload").classList.add("open");page("dashboard");$("file").click()});
$("demoNav").addEventListener("click",()=>{rows=normalizeRows([...demo]);$("dataset").textContent="Demo retail dataset";dashboard();analyze($("q").value);sim();page("dashboard")});
function loadFile(f){const x=/\.(xlsx|xls)$/i.test(f.name),reader=new FileReader();reader.onload=z=>{try{if(x){const w=XLSX.read(new Uint8Array(z.target.result),{type:"array"});rows=normalizeRows(XLSX.utils.sheet_to_json(w.Sheets[w.SheetNames[0]],{defval:""}))}else{const lines=z.target.result.trim().split(/\r?\n/);const h=lines.shift().split(",");rows=normalizeRows(lines.map(s=>{const v=s.split(",");const o={};h.forEach((k,i)=>o[k.trim()]=v[i]?.trim()||"");return o}))}$("dataset").textContent=f.name;dashboard();analyze($("q").value);sim()}catch(err){alert("Could not read file. Use CSV/XLSX with a header row.")}};x?reader.readAsArrayBuffer(f):reader.readAsText(f)}
$("file").addEventListener("change",e=>{const f=e.target.files[0];if(f)loadFile(f)});
function resetWorkspace(){schemaInfo={mapped:true,missing:[]};rows=[...demo];$("dataset").textContent="Demo retail dataset";$("q").value="Which region is driving the most revenue?";dashboard();analyze($("q").value);sim();page("dashboard");$("upload").classList.remove("open");$("file").value=""}
function wireDropzone(){const dz=$("dropzone");if(!dz)return;["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("drag")}));["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("drag")}));dz.addEventListener("drop",e=>{const f=e.dataTransfer.files[0];if(f)loadFile(f)})}
$("resetBtn").addEventListener("click",resetWorkspace);$("useDemo").addEventListener("click",resetWorkspace);wireDropzone();
dashboard();analyze($("q").value);sim();