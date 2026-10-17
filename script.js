(() => {
  const STORAGE_KEY = "applywise.applications.v1";
  const THEME_KEY = "applywise.theme.v1";
  const statuses = ["Saved","Applied","Assessment","Interview","Offer","Rejected"];
  const terminal = ["Offer","Rejected"];
  const $ = (id) => document.getElementById(id);
  const dateOffset = (days) => { const d = new Date(); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  const makeId = () => (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const sampleData = () => [
    {id:makeId(),company:"Accenture",role:"Advanced Technology Intern",status:"Assessment",deadline:dateOffset(2),link:"https://www.accenture.com/in-en/careers",nextStep:"Revise pseudocode and SQL",notes:"Review assessment instructions and practice timed questions.",createdAt:Date.now()-600000},
    {id:makeId(),company:"Microsoft",role:"Explore Internship",status:"Applied",deadline:dateOffset(6),link:"https://careers.microsoft.com/",nextStep:"Review application status",notes:"Prepare a concise introduction and project explanation.",createdAt:Date.now()-500000},
    {id:makeId(),company:"Adobe",role:"Software Development Intern",status:"Interview",deadline:dateOffset(4),link:"https://careers.adobe.com/",nextStep:"Practice project walkthrough",notes:"Prepare examples of debugging and teamwork.",createdAt:Date.now()-400000},
    {id:makeId(),company:"Atlassian",role:"Summer Intern",status:"Saved",deadline:dateOffset(10),link:"https://www.atlassian.com/company/careers",nextStep:"Check eligibility",notes:"Tailor resume before applying.",createdAt:Date.now()-300000},
    {id:makeId(),company:"Flipkart",role:"Grid / Technology",status:"Offer",deadline:"",link:"https://www.flipkartcareers.com/",nextStep:"Review offer details",notes:"Demo entry: replace with your own real data.",createdAt:Date.now()-200000}
  ];
  let applications = loadData();
  let calendarCursor = new Date(); calendarCursor.setDate(1);
  let toastTimer;
  function loadData(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw !== null){ const parsed = JSON.parse(raw); if(Array.isArray(parsed)) return parsed.filter(validApplication); }
    } catch(err){ console.warn("Could not read saved applications.",err); }
    const initial = sampleData();
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(initial)); } catch(err){ console.warn("Storage unavailable.",err); }
    return initial;
  }
  function validApplication(a){return a && typeof a==="object" && a.id && typeof a.company==="string" && typeof a.role==="string" && statuses.includes(a.status);}
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(applications));}catch(err){showToast("Could not save data. Check browser storage settings.");}}
  function esc(value){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function initials(company){return company.trim().split(/\s+/).slice(0,2).map(w=>w[0]||"").join("").toUpperCase()||"??";}
  function parseDate(date){if(!date)return null;const d=new Date(date+"T00:00:00");return Number.isNaN(d.getTime())?null:d;}
  function dayDiff(date){const d=parseDate(date);if(!d)return null;const now=new Date();now.setHours(0,0,0,0);return Math.round((d-now)/86400000);}
  function formatDate(date){const d=parseDate(date);return d?d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):"No deadline";}
  function deadlineText(a){
    if(!a.deadline)return {text:"Not set",cls:""};
    const diff=dayDiff(a.deadline);
    if(terminal.includes(a.status))return {text:formatDate(a.deadline),cls:"done"};
    if(diff<0)return {text:`${Math.abs(diff)}d overdue`,cls:"late"};
    if(diff===0)return {text:"Today",cls:"soon"};
    if(diff===1)return {text:"Tomorrow",cls:"soon"};
    if(diff<=3)return {text:`In ${diff} days`,cls:"soon"};
    return {text:formatDate(a.deadline),cls:""};
  }
  function statusClass(status){return "status-"+status.toLowerCase();}
  function showToast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600);}
  function renderStats(){
    $("totalStat").textContent=applications.length;
    $("assessmentStat").textContent=applications.filter(a=>a.status==="Assessment").length;
    $("interviewStat").textContent=applications.filter(a=>a.status==="Interview").length;
    $("offerStat").textContent=applications.filter(a=>a.status==="Offer").length;
    const active=applications.filter(a=>!terminal.includes(a.status)).length;
    $("totalFoot").textContent=`${active} active ${active===1?"opportunity":"opportunities"}`;
    $("offerFoot").textContent=applications.length?`${Math.round(applications.filter(a=>a.status==="Offer").length/applications.length*100)}% of tracked applications`:"Add your first opportunity";
  }
  function getFiltered(){
    const q=$("searchInput").value.trim().toLowerCase(),status=$("statusFilter").value,sort=$("sortSelect").value;
    let list=applications.filter(a=>(!q || `${a.company} ${a.role} ${a.nextStep||""}`.toLowerCase().includes(q)) && (status==="all"||a.status===status));
    list.sort((a,b)=>{
      if(sort==="company")return a.company.localeCompare(b.company);
      if(sort==="updated")return (b.createdAt||0)-(a.createdAt||0);
      const da=a.deadline||"9999-12-31",db=b.deadline||"9999-12-31";
      return da.localeCompare(db);
    });
    return list;
  }
  function renderApplications(){
    const list=getFiltered(),body=$("applicationsBody");
    body.innerHTML=list.map(a=>{
      const due=deadlineText(a);
      return `<tr>
        <td><div class="company-cell"><div class="company-logo">${esc(initials(a.company))}</div><div><div class="company-name">${esc(a.company)}</div><div class="role-name">${esc(a.role)}</div></div></div></td>
        <td><span class="status ${statusClass(a.status)}">${esc(a.status)}</span></td>
        <td><span class="next-step-cell" title="${esc(a.nextStep||"No next step added")}">${esc(a.nextStep||"—")}</span></td>
        <td><span class="deadline ${due.cls}">${esc(due.text)}</span></td>
        <td><div class="row-actions"><button class="icon-btn" data-action="edit" data-id="${esc(a.id)}" aria-label="Edit ${esc(a.company)}" title="Edit">✎</button><button class="icon-btn" data-action="delete" data-id="${esc(a.id)}" aria-label="Delete ${esc(a.company)}" title="Delete">×</button></div></td>
      </tr>`;
    }).join("");
    $("emptyState").hidden=list.length!==0;
    $("applicationsTable").hidden=list.length===0;
    $("tableSubtitle").textContent=`Showing ${list.length} of ${applications.length} ${applications.length===1?"opportunity":"opportunities"}`;
  }
  function renderDeadlines(){
    const list=applications.filter(a=>a.deadline&&!terminal.includes(a.status)&&dayDiff(a.deadline)!==null)
      .sort((a,b)=>a.deadline.localeCompare(b.deadline)).slice(0,4);
    $("deadlineList").innerHTML=list.map(a=>{
      const d=parseDate(a.deadline),diff=dayDiff(a.deadline);
      const urgency=diff<0?"Overdue":diff===0?"Due today":diff===1?"Due tomorrow":`In ${diff} days`;
      return `<div class="deadline-item"><div class="date-box"><span class="month">${d.toLocaleDateString("en-IN",{month:"short"})}</span><span class="day">${d.getDate()}</span></div><div class="deadline-info"><strong>${esc(a.company)}</strong><small>${esc(a.role)}</small></div><span class="due-tag">${esc(urgency)}</span></div>`;
    }).join("");
    $("deadlineEmpty").hidden=list.length!==0;
  }
  function renderProgress(){
    const total=applications.length||1;
    const stages=[["Saved","#8a93a5"],["Applied","#4786d4"],["Assessment","#8a70d9"],["Interview","#d49a36"],["Offer","#35a884"]];
    $("progressArea").innerHTML=stages.map(([name])=>{
      const count=applications.filter(a=>a.status===name).length,percent=Math.round(count/total*100);
      return `<div class="progress-row"><strong>${name}</strong><span>${count} · ${percent}%</span></div><div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>`;
    }).join("");
    const tips=[
      "After each assessment, write down what went well and what you'll improve next time.",
      "Try to spend a little time preparing before every deadline instead of cramming at the last minute.",
      "A rejected application is still useful data. Record what you learned and keep moving.",
      "Before an interview, practise explaining one project clearly from problem to implementation."
    ];
    const day=new Date().getDate();$("tipText").textContent=tips[day%tips.length];
  }
  function renderKanban(){
    const lanes=["Saved","Applied","Assessment","Interview","Offer","Rejected"];
    $("kanbanBoard").innerHTML=lanes.map(status=>{const items=applications.filter(a=>a.status===status);return `<div class="board-column" data-status="${status}" aria-label="${status} column"><div class="board-col-head"><span>${status}</span><span class="board-count">${items.length}</span></div>${items.map(a=>`<article class="board-card" draggable="true" data-card-id="${esc(a.id)}"><strong>${esc(a.company)}</strong><div class="board-role">${esc(a.role)}</div><div class="board-meta"><span>${esc(a.deadline?formatDate(a.deadline):"No deadline")}</span><button data-edit-note="${esc(a.id)}">Open ↗</button></div></article>`).join("")||'<div class="note-empty">Drop applications here</div>'}</div>`}).join("");
  }
  function renderCalendar(){
    const y=calendarCursor.getFullYear(),m=calendarCursor.getMonth();$("calendarMonth").textContent=calendarCursor.toLocaleDateString("en-IN",{month:"long",year:"numeric"});
    const first=new Date(y,m,1),start=new Date(y,m,1-first.getDay()),today=new Date();today.setHours(0,0,0,0);const days=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    let html=days.map(d=>`<div class="calendar-weekday">${d}</div>`).join("");
    for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;const events=applications.filter(a=>a.deadline===iso);const isToday=d.getTime()===today.getTime();html+=`<div class="calendar-day ${d.getMonth()!==m?"muted":""} ${isToday?"today":""}"><div class="calendar-num">${d.getDate()}</div>${events.slice(0,3).map(a=>`<button class="calendar-event ${a.status==="Interview"?"interview":a.status==="Offer"?"offer":""}" title="${esc(a.company)} — ${esc(a.role)}" data-calendar-edit="${esc(a.id)}">${esc(a.company)}</button>`).join("")}${events.length>3?`<small>+${events.length-3} more</small>`:""}</div>`}
    $("calendarGrid").innerHTML=html;
  }
  function renderCompanyNotes(){const items=applications.filter(a=>(a.notes||"").trim());$("companyNotesList").innerHTML=items.length?items.map(a=>`<article class="note-card"><div><strong>${esc(a.company)}</strong><div class="note-role">${esc(a.role)} · ${esc(a.status)}</div><p>${esc(a.notes)}</p>${a.nextStep?`<p><b>Next step:</b> ${esc(a.nextStep)}</p>`:""}</div><div class="note-actions"><button class="icon-btn" title="Edit notes" aria-label="Edit notes for ${esc(a.company)}" data-edit-note="${esc(a.id)}">✎</button></div></article>`).join(""):`<div class="note-empty">No company notes yet. Add notes while creating or editing an application.</div>`; }
  function renderAll(){renderStats();renderApplications();renderDeadlines();renderProgress();renderKanban();renderCalendar();renderCompanyNotes();}
  function setTheme(theme){
    document.body.classList.toggle("dark",theme==="dark");
    localStorage.setItem(THEME_KEY,theme);
    const dark=theme==="dark";
    $("themeBtn").innerHTML=dark?'☼ <span>Light mode</span>':'◐ <span>Dark mode</span>';
    $("themeBtn").setAttribute("aria-label",dark?"Switch to light theme":"Switch to dark theme");
  }
  function toggleTheme(){setTheme(document.body.classList.contains("dark")?"light":"dark");showToast(document.body.classList.contains("dark")?"Dark theme enabled.":"Light theme enabled.");}
  function openModal(app=null){
    $("applicationForm").reset();$("applicationId").value=app?.id||"";
    $("modalTitle").textContent=app?"Edit application":"Add an application";
    $("companyInput").value=app?.company||"";$("roleInput").value=app?.role||"";
    $("statusInput").value=app?.status||"Saved";$("deadlineInput").value=app?.deadline||"";
    $("linkInput").value=app?.link||"";$("nextStepInput").value=app?.nextStep||"";$("notesInput").value=app?.notes||"";
    $("modalBackdrop").classList.add("open");document.body.style.overflow="hidden";setTimeout(()=>$("companyInput").focus(),50);
  }
  function closeModal(){$("modalBackdrop").classList.remove("open");document.body.style.overflow="";}
  function saveApplication(event){
    event.preventDefault();
    const id=$("applicationId").value;
    const company=$("companyInput").value.trim(),role=$("roleInput").value.trim(),link=$("linkInput").value.trim();
    if(!company||!role){showToast("Please enter a company and role.");return;}
    if(link){try{const u=new URL(link);if(!["http:","https:"].includes(u.protocol))throw new Error();}catch{showToast("Enter a valid http or https link.");$("linkInput").focus();return;}}
    const old=applications.find(a=>a.id===id);
    const item={id:id||makeId(),company,role,status:$("statusInput").value,deadline:$("deadlineInput").value,link,nextStep:$("nextStepInput").value.trim(),notes:$("notesInput").value.trim(),createdAt:old?.createdAt||Date.now(),updatedAt:Date.now()};
    if(old)applications=applications.map(a=>a.id===id?item:a);else applications.unshift(item);
    persist();closeModal();renderAll();showToast(old?"Application updated.":"Application added.");
  }
  function deleteApplication(id){
    const app=applications.find(a=>a.id===id);if(!app)return;
    if(!confirm(`Delete the ${app.company} application? This cannot be undone.`))return;
    applications=applications.filter(a=>a.id!==id);persist();renderAll();showToast("Application deleted.");
  }
  function exportCSV(){
    if(!applications.length){showToast("There is no data to export yet.");return;}
    const columns=[["Company","company"],["Role","role"],["Status","status"],["Deadline","deadline"],["Application Link","link"],["Next Step","nextStep"],["Notes","notes"]];
    const cell=v=>`"${String(v??"").replace(/"/g,'""')}"`;
    const csv=[columns.map(c=>cell(c[0])).join(","),...applications.map(a=>columns.map(c=>cell(a[c[1]])).join(","))].join("\r\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="applywise-applications.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);showToast("Your CSV export is ready.");
  }
  function resetDemo(){
    if(!confirm("Replace your current applications with the original sample data? Export your data first if you want to keep it."))return;
    applications=sampleData();persist();renderAll();showToast("Demo data restored.");
  }
  function setPage(page){
    document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active"));
    ["boardPanel","calendarPanel","notesPanel"].forEach(id=>$(id).hidden=true);
    const featurePage=["board","calendar","notes"].includes(page);$("statsSection").hidden=featurePage;$("dashboardContent").hidden=featurePage;
    const headings={dashboard:["Make your next move count.","Every application. Every deadline. One focused view of your career journey."],applications:["My applications","Search, update and organize your opportunities."],deadlines:["Upcoming deadlines","Know what needs your attention next."],board:["Recruitment pipeline","Move opportunities through each stage of your placement journey."],calendar:["Application calendar","See assessment and interview deadlines at a glance."],notes:["Company notes","Keep your research, recruiter details and interview learnings together."]};
    const nav={dashboard:"navDashboard",applications:"navApplications",deadlines:"navDeadlines",board:"navBoard",calendar:"navCalendar",notes:"navNotes"};
    $(nav[page]||"navDashboard").classList.add("active");$("pageHeading").textContent=headings[page][0];$("pageSubtitle").textContent=headings[page][1];
    if(page==="board")$("boardPanel").hidden=false;else if(page==="calendar")$("calendarPanel").hidden=false;else if(page==="notes")$("notesPanel").hidden=false;else if(page==="applications")$("applicationsPanel").scrollIntoView({behavior:"smooth",block:"start"});else if(page==="deadlines")$("deadlinesPanel").scrollIntoView({behavior:"smooth",block:"start"});else window.scrollTo({top:0,behavior:"smooth"});
  }
  $("applicationForm").addEventListener("submit",saveApplication);
  $("addBtn").addEventListener("click",()=>openModal());$("sideAdd").addEventListener("click",()=>openModal());
  $("closeModal").addEventListener("click",closeModal);$("cancelModal").addEventListener("click",closeModal);
  $("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal();});
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape")closeModal();
    const target=e.target;
    const typing=target&&(target.matches("input,textarea,select")||target.isContentEditable);
    if(!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key==="/"){e.preventDefault();$("searchInput").focus();}
    if(!typing&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&e.key.toLowerCase()==="n"){e.preventDefault();openModal();}
  });
  $("applicationsBody").addEventListener("click",e=>{
    const btn=e.target.closest("button[data-action]");if(!btn)return;
    const app=applications.find(a=>a.id===btn.dataset.id);if(!app)return;
    if(btn.dataset.action==="edit")openModal(app);if(btn.dataset.action==="delete")deleteApplication(app.id);
  });
  ["searchInput","statusFilter","sortSelect"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",renderApplications));
  $("clearFilters").addEventListener("click",()=>{$("searchInput").value="";$("statusFilter").value="all";$("sortSelect").value="deadline";renderApplications();showToast("Filters cleared.");});
  ["navBoard","navCalendar","navNotes"].forEach((id,i)=>$(id).addEventListener("click",()=>setPage(["board","calendar","notes"][i])));
  $("addNoteBtn").addEventListener("click",()=>{const first=applications[0];if(first)openModal(first);else openModal();});
  $("prevMonth").addEventListener("click",()=>{calendarCursor.setMonth(calendarCursor.getMonth()-1);renderCalendar();});
  $("nextMonth").addEventListener("click",()=>{calendarCursor.setMonth(calendarCursor.getMonth()+1);renderCalendar();});
  $("kanbanBoard").addEventListener("dragstart",e=>{const card=e.target.closest("[data-card-id]");if(card){e.dataTransfer.setData("text/plain",card.dataset.cardId);e.dataTransfer.effectAllowed="move";}});
  $("kanbanBoard").addEventListener("dragover",e=>{const col=e.target.closest(".board-column");if(col){e.preventDefault();col.classList.add("drag-over");}});
  $("kanbanBoard").addEventListener("dragleave",e=>{const col=e.target.closest(".board-column");if(col&&!col.contains(e.relatedTarget))col.classList.remove("drag-over");});
  $("kanbanBoard").addEventListener("drop",e=>{const col=e.target.closest(".board-column");if(!col)return;e.preventDefault();col.classList.remove("drag-over");const id=e.dataTransfer.getData("text/plain"),app=applications.find(a=>a.id===id);if(!app||!statuses.includes(col.dataset.status)||app.status===col.dataset.status)return;app.status=col.dataset.status;app.updatedAt=Date.now();persist();renderAll();showToast(`${app.company} moved to ${app.status}.`);});
  document.addEventListener("click",e=>{const edit=e.target.closest("[data-edit-note],[data-calendar-edit]");if(!edit)return;const id=edit.dataset.editNote||edit.dataset.calendarEdit;const app=applications.find(a=>a.id===id);if(app)openModal(app);});
  $("themeBtn").addEventListener("click",toggleTheme);
  $("exportBtn").addEventListener("click",exportCSV);$("navExport").addEventListener("click",exportCSV);$("navReset").addEventListener("click",resetDemo);
  $("navDashboard").addEventListener("click",()=>setPage("dashboard"));$("navApplications").addEventListener("click",()=>setPage("applications"));$("navDeadlines").addEventListener("click",()=>setPage("deadlines"));
  $("todayLabel").textContent=new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"}).toUpperCase()+" · YOUR CAREER WORKSPACE";
  setTheme(localStorage.getItem(THEME_KEY)||"light");
  renderAll();
})();
