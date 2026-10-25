// import { useMemo, useState } from "react";
// import { Activity, AlertTriangle, ArrowDownToLine, BookOpen, CheckCircle2, CircleHelp, Database, FileCheck2, FileUp, Gauge, LoaderCircle, RefreshCw, ScanSearch, ShieldCheck, Sparkles, Wrench, XCircle } from "lucide-react";
// import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// import { analyze, loadSample, repair, reportUrl, repairedUrl, uploadCsv } from "./api";

// const cx=(...v)=>v.filter(Boolean).join(" ");
// function Metric({icon:Icon,label,value,note}){return <div className="card p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><span className="rounded-xl bg-blue-50 p-2 text-blue-700"><Icon size={18}/></span></div><div className="mt-3 font-[Manrope] text-3xl font-extrabold text-slate-900">{value??"—"}</div>{note&&<div className="mt-1 text-xs text-slate-500">{note}</div>}</div>}
// function Table({rows,columns}){if(!rows?.length)return <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Nothing to show yet.</div>;return <div className="table-wrap"><table><thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{columns.map(c=><td key={c.key}>{c.render?c.render(r[c.key],r):String(r[c.key]??"—")}</td>)}</tr>)}</tbody></table></div>}
// export default function App(){
//  const [dataset,setDataset]=useState(null),[analysis,setAnalysis]=useState(null),[repairResult,setRepairResult]=useState(null),[file,setFile]=useState(null),[rules,setRules]=useState(""),[target,setTarget]=useState(""),[tab,setTab]=useState("Overview"),[busy,setBusy]=useState(""),[error,setError]=useState(""),[selected,setSelected]=useState([]),[investigationChoice,setInvestigationChoice]=useState("");
//  const profile=dataset?.profile,issues=analysis?.issues||[],plans=analysis?.repair_plan||[],safePlans=plans.filter(p=>p.automatic);
//  const missingChart=useMemo(()=>Object.entries(profile?.missing_by_column||{}).filter(([,v])=>v>0).map(([name,missing])=>({name,missing})),[profile]);
//  async function perform(label,fn){setBusy(label);setError("");try{return await fn()}catch(e){setError(e?.response?.data?.detail||e.message||"Something went wrong.")}finally{setBusy("")}}
//  async function useSample(){const d=await perform("Loading sample…",loadSample);if(d){setDataset(d);setAnalysis(null);setRepairResult(null);setSelected([]);setTab("Overview")}}
//  async function upload(){if(!file)return;const d=await perform("Uploading…",()=>uploadCsv(file));if(d){setDataset(d);setAnalysis(null);setRepairResult(null);setSelected([]);setTab("Overview")}}
//  async function runAnalysis(){const d=await perform("Analyzing…",()=>analyze({business_rules:rules,target_column:target||null}));if(d){setAnalysis(d);setRepairResult(null);setSelected([]);const first=d.issues?.[0];setInvestigationChoice(first?`${first.issue}::${first.column}`:"");setTab("Findings")}}
//  async function investigateSelected(){const finding=issues.find(i=>`${i.issue}::${i.column}`===investigationChoice);const d=await perform("Investigating…",()=>analyze({business_rules:rules,target_column:target||null,selected_issue:finding||null}));if(d){setAnalysis(d);setRepairResult(null);setTab("Investigation")}}
//  async function applyRepair(){const actions=safePlans.filter(p=>selected.includes(`${p.action}::${p.column}`));const d=await perform("Repairing…",()=>repair(actions));if(d){setRepairResult(d);setTab("Repair & verify")}}
//  const tabs=["Overview","Findings","Investigation","Repair & verify","ML readiness"];
//  const previewCols=Object.keys(dataset?.preview?.[0]||{}).slice(0,8).map(c=>({key:c,label:c}));
//  return <div className="min-h-screen">
//  <header className="bg-[#111b35] text-white"><div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-5 py-5 lg:px-8"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-500/20 p-3 text-blue-200"><ScanSearch size={25}/></div><div><div className="font-[Manrope] text-xl font-extrabold">DataSleuth</div><div className="text-xs text-slate-300">Agentic data quality workspace</div></div></div><div className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300 md:flex"><span className="h-2 w-2 rounded-full bg-emerald-400"/>{dataset?dataset.filename:"Ready for a dataset"}</div></div><div className="mx-auto max-w-[1480px] px-5 pb-7 lg:px-8"><div className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-blue-300">Detect · Investigate · Repair · Verify</div><h1 className="font-[Manrope] text-3xl font-extrabold md:text-4xl">Make your data trustworthy.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Find quality issues, understand likely causes, retrieve business rules, and approve safe repairs—with your original dataset preserved.</p></div></header>
//  <main className="mx-auto max-w-[1480px] px-5 py-6 lg:px-8"><div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
//  <aside className="space-y-4">
//  <section className="card p-5"><div className="mb-3 flex items-center gap-2 font-bold"><Database size={18} className="text-blue-700"/>Your dataset</div><label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center"><FileUp size={24} className="mb-2 text-blue-700"/><span className="text-sm font-bold">{file?.name||"Choose a CSV file"}</span><span className="mt-1 text-xs text-slate-500">CSV files only</span><input type="file" accept=".csv,text/csv" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button className="btn btn-primary mt-3 w-full" onClick={upload} disabled={!file||!!busy}>{busy==="Uploading…"?<LoaderCircle className="animate-spin" size={16}/>:<FileUp size={16}/>}Upload dataset</button><button className="btn btn-secondary mt-2 w-full" onClick={useSample} disabled={!!busy}><Sparkles size={16}/>Load sample dataset</button>{dataset&&<div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><b className="text-slate-800">{dataset.filename}</b><div className="mt-1">{profile?.rows?.toLocaleString()} rows · {profile?.columns} columns</div></div>}</section>
//  <section className="card p-5"><div className="mb-3 flex items-center gap-2 font-bold"><BookOpen size={18} className="text-blue-700"/>Business context</div><label className="mb-1 block text-xs font-semibold text-slate-600">Target column (optional)</label><select className="field mb-3" value={target} onChange={e=>setTarget(e.target.value)}><option value="">No target selected</option>{(dataset?.preview?.[0]?Object.keys(dataset.preview[0]):[]).map(c=><option key={c}>{c}</option>)}</select><label className="mb-1 block text-xs font-semibold text-slate-600">Extra rules (optional)</label><textarea className="field resize-y text-sm" rows="4" placeholder={"quantity must be positive\\norder_id should be unique"} value={rules} onChange={e=>setRules(e.target.value)}/><p className="mt-2 text-xs leading-5 text-slate-500">One rule per line. Used as guidance, not executed as code.</p><button className="btn btn-primary mt-3 w-full" onClick={runAnalysis} disabled={!dataset||!!busy}>{busy==="Analyzing…"?<LoaderCircle size={16} className="animate-spin"/>:<Activity size={16}/>}Analyze dataset</button></section>
//  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900"><ShieldCheck size={17} className="mb-2"/><b>Human-approved changes</b><br/>Repairs run on a copy. Ambiguous values are never guessed automatically.</div></aside>
//  <section className="min-w-0 space-y-5">{error&&<div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><XCircle size={18}/>{error}</div>}
//  {!dataset?<div className="card flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><div className="rounded-2xl bg-blue-50 p-4 text-blue-700"><Database size={34}/></div><h2 className="mt-5 font-[Manrope] text-2xl font-extrabold">Start with your data</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Upload a CSV or load sample data to explore profiling, agent investigation, repair approval, and ML-readiness checks.</p><button className="btn btn-primary mt-5" onClick={useSample} disabled={!!busy}><Sparkles size={16}/>Try sample dataset</button><div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">{[["01","Profile"],["02","Detect"],["03","Investigate"],["04","Verify"]].map(([n,t])=><div className="rounded-xl bg-slate-50 p-3" key={n}><div className="text-xs font-bold text-blue-700">{n}</div><div className="mt-1 text-sm font-bold">{t}</div></div>)}</div></div>:<>
//  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Database} label="Rows" value={profile?.rows?.toLocaleString()}/><Metric icon={Activity} label="Columns" value={profile?.columns}/><Metric icon={AlertTriangle} label="Missing cells" value={profile?.missing_cells?.toLocaleString()} note="Across all columns"/><Metric icon={RefreshCw} label="Exact duplicates" value={profile?.duplicate_rows?.toLocaleString()}/></div>
//  <div className="card p-2"><div className="flex gap-1 overflow-x-auto">{tabs.map(t=><button key={t} className={cx("tab",tab===t&&"tab-active")} onClick={()=>setTab(t)}>{t}</button>)}</div></div>
//  {tab==="Overview"&&<div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><section className="card p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Dataset preview</h3><span className="text-xs text-slate-500">First 100 rows</span></div><Table rows={dataset.preview} columns={previewCols}/></section><section className="card p-5"><h3 className="font-bold">Missing values by column</h3><p className="mb-3 mt-1 text-xs text-slate-500">A quick view of incomplete fields.</p>{missingChart.length?<ResponsiveContainer width="100%" height={280}><BarChart data={missingChart} layout="vertical" margin={{left:5,right:12}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis dataKey="name" type="category" width={95} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="missing" fill="#4168b2" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer>:<div className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-800">No missing values detected.</div>}</section><section className="card p-5 xl:col-span-2"><h3 className="mb-3 font-bold">Column profile</h3><Table rows={profile?.column_profile} columns={[{key:"column",label:"Column"},{key:"dtype",label:"Data type"},{key:"missing",label:"Missing"},{key:"unique",label:"Unique values"}]}/></section></div>}
//  {tab==="Findings"&&<section className="card p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Quality findings</h3><p className="mt-1 text-sm text-slate-500">Repeatable checks with evidence and severity.</p></div><button className="btn btn-primary" onClick={runAnalysis} disabled={!!busy}><RefreshCw size={15}/>Run analysis</button></div>{analysis?<><div className="mb-4 flex flex-wrap gap-2"><span className="pill bg-slate-100 text-slate-700">{issues.length} issue types</span><span className="pill pill-high">{issues.filter(i=>i.severity==="High").length} high</span><span className="pill pill-medium">{issues.filter(i=>i.severity==="Medium").length} medium</span><span className="pill pill-low">{issues.filter(i=>i.severity==="Low").length} low</span></div><Table rows={issues} columns={[{key:"issue",label:"Issue"},{key:"column",label:"Column"},{key:"count",label:"Count"},{key:"severity",label:"Severity",render:v=><span className={cx("pill",v==="High"?"pill-high":v==="Medium"?"pill-medium":"pill-low")}>{v}</span>},{key:"evidence",label:"Evidence"}]}/>{!issues.length&&<div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No issues detected by current checks.</div>}</>:<p className="text-sm text-slate-500">Click Analyze dataset to run the workflow.</p>}</section>}
//  {tab==="Investigation"&&<div className="space-y-5"><section className="card p-5"><div className="mb-4 flex items-center gap-2"><Sparkles className="text-blue-700" size={19}/><h3 className="font-bold">Investigation</h3></div>{analysis?<><div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><label className="mb-2 block text-sm font-bold" htmlFor="investigation-finding">Choose one finding to investigate</label><div className="flex flex-col gap-2 sm:flex-row"><select id="investigation-finding" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={investigationChoice} onChange={e=>setInvestigationChoice(e.target.value)}>{issues.map((issue,i)=><option key={`${issue.issue}::${issue.column}::${i}`} value={`${issue.issue}::${issue.column}`}>{issue.issue} · {issue.column} ({issue.severity})</option>)}</select><button className="btn btn-primary" onClick={investigateSelected} disabled={!investigationChoice||!!busy}><Sparkles size={15}/>Investigate finding</button></div><p className="mt-2 text-xs text-slate-500">Investigation explains one selected finding. The repair plan is separate, and no repair is selected automatically.</p></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</div><p className="mt-2 font-semibold">{analysis.investigation?.issue_summary}</p><p className="mt-2 text-xs text-slate-500">Confidence: {analysis.investigation?.confidence||"unknown"} · {analysis.investigation?.model_note}</p></div><div className="mt-4 grid gap-4 md:grid-cols-2"><div><h4 className="mb-2 font-bold">Confirmed evidence</h4>{(analysis.investigation?.confirmed_evidence||[]).map((v,i)=><div key={i} className="mb-2 rounded-lg border border-slate-100 p-3 text-sm">{v}</div>)}</div><div><h4 className="mb-2 font-bold">Possible root causes</h4>{(analysis.investigation?.possible_root_causes||[]).map((v,i)=><div key={i} className="mb-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-sm">{v}</div>)}</div></div><div className="mt-4"><h4 className="mb-2 font-bold">Recommended actions</h4>{(analysis.investigation?.recommended_actions||[]).map((v,i)=><p key={i} className="mb-2 text-sm">› {v}</p>)}</div></>:<p className="text-sm text-slate-500">Run analysis first.</p>}</section><section className="card p-5"><h3 className="mb-3 font-bold">Retrieved business rules</h3>{analysis?.retrieved_rules?.length?analysis.retrieved_rules.map((r,i)=><div key={i} className="mb-2 flex gap-3 rounded-xl border border-slate-100 p-3"><BookOpen size={17} className="mt-0.5 shrink-0 text-blue-700"/><div><p className="text-sm">{r.text}</p><p className="mt-1 text-xs text-slate-400">Source: {r.source}</p></div></div>):<p className="text-sm text-slate-500">Run analysis to retrieve guidance.</p>}</section></div>}
//  {tab==="Repair & verify"&&<div className="space-y-5"><section className="card p-5"><div className="mb-2 flex items-center gap-2"><Wrench size={19} className="text-blue-700"/><h3 className="font-bold">Review repair plan</h3></div><p className="mb-4 text-sm text-slate-500">Choose each repair deliberately. Nothing is preselected. Investigating a finding does not automatically approve or apply a repair.</p>{analysis?.investigation?.selected_finding&&<div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="text-xs font-bold uppercase tracking-wide text-blue-800">Finding you investigated</div><p className="mt-1 font-semibold">{analysis.investigation.selected_finding.issue} · {analysis.investigation.selected_finding.column}</p><p className="mt-1 text-sm text-slate-600">{analysis.investigation.selected_finding.evidence}</p><p className="mt-2 text-sm text-slate-700">This finding still needs a justified action. If it is marked for manual review below, DataSleuth will not guess a replacement value.</p></div>}{!analysis?<p className="text-sm text-slate-500">Run analysis first.</p>:<>{safePlans.length?safePlans.map((p,i)=>{const id=`${p.action}::${p.column}`;return <label key={id} className="mb-2 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50"><input type="checkbox" className="mt-1 accent-blue-700" checked={selected.includes(id)} onChange={e=>setSelected(old=>e.target.checked?[...old,id]:old.filter(x=>x!==id))}/><div className="flex-1"><div className="font-bold">{p.action} <span className="text-slate-400">· {p.column}</span></div><p className="mt-1 text-sm text-slate-500">{p.description}</p></div><span className={cx("pill",p.risk==="Low"?"pill-low":"pill-medium")}>{p.risk} risk</span></label>}):<div className="rounded-xl bg-slate-50 p-4 text-sm">No automatic repairs are available for the current findings. Review the manual-review guidance below; ambiguous values will not be guessed.</div>}{plans.filter(p=>!p.automatic).map((p,i)=><div key={i} className="mt-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm"><b>Manual review · {p.column}</b><p className="mt-1 text-slate-600">{p.description}</p></div>)}<button className="btn btn-primary mt-4" disabled={!selected.length||!!busy} onClick={applyRepair}>{busy==="Repairing…"?<LoaderCircle size={16} className="animate-spin"/>:<ShieldCheck size={16}/>}Approve and apply repairs</button></>}</section>{repairResult&&<section className="card p-5"><div className="mb-4 flex items-center gap-2">{repairResult.verification.passed?<CheckCircle2 className="text-emerald-600"/>:<AlertTriangle className="text-amber-600"/>}<h3 className="font-bold">Verification result</h3></div><div className="grid gap-3 sm:grid-cols-3"><Metric icon={Database} label="Rows after" value={repairResult.profile.rows}/><Metric icon={AlertTriangle} label="Issue types" value={`${repairResult.verification.issues_before} → ${repairResult.verification.issues_after}`}/><Metric icon={ShieldCheck} label="Status" value={repairResult.verification.passed?"No regression":"Rolled back"}/></div><div className="my-4 space-y-2">{repairResult.repair_log.map((line,i)=><p key={i} className="text-sm text-slate-600">✓ {line}</p>)}</div><p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">Verification checks whether the approved operation completed without increasing the number of detected issues. “No regression” does not mean every issue has been fixed.</p><h4 className="mb-2 font-bold">Remaining issues</h4><Table rows={repairResult.issues_after} columns={[{key:"issue",label:"Issue"},{key:"column",label:"Column"},{key:"count",label:"Count"},{key:"severity",label:"Severity"}]}/><h4 className="mb-2 mt-4 font-bold">Repaired data preview</h4><Table rows={repairResult.preview} columns={Object.keys(repairResult.preview?.[0]||{}).slice(0,8).map(c=>({key:c,label:c}))}/><div className="mt-4 flex flex-wrap gap-2"><a className="btn btn-primary no-underline" href={repairedUrl}><ArrowDownToLine size={16}/>Download repaired CSV</a><a className="btn btn-secondary no-underline" href={reportUrl}><FileCheck2 size={16}/>Download report</a></div></section>}</div>}
//  {tab==="ML readiness"&&<section className="card p-5"><div className="mb-4 flex items-center gap-2"><Gauge className="text-blue-700"/><h3 className="font-bold">ML-readiness assessment</h3></div>{analysis?<><div className="grid gap-3 sm:grid-cols-2"><Metric icon={AlertTriangle} label="Missing cell percentage" value={`${analysis.ml_readiness?.missing_cell_percent}%`}/><Metric icon={Database} label="Exact duplicate rows" value={analysis.ml_readiness?.duplicate_rows}/></div><h4 className="mb-3 mt-5 font-bold">Readiness warnings</h4>{analysis.ml_readiness?.warnings?.map((w,i)=><div key={i} className="mb-2 flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm"><CircleHelp size={17} className="shrink-0 text-amber-700"/>{w}</div>)}<p className="mt-3 text-xs text-slate-500">{analysis.ml_readiness?.note}</p></>:<p className="text-sm text-slate-500">Run analysis to assess basic ML-readiness risks.</p>}</section>}
//  </>}</section></div><footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500"><span>DataSleuth · Transparent checks · Human-approved repairs</span><span className="flex items-center gap-1"><ShieldCheck size={14}/>Original dataset preserved</span></footer></main></div>
// }



// import { useMemo, useState } from "react";
// import {
//   Activity,
//   AlertTriangle,
//   ArrowDownToLine,
//   BookOpen,
//   CheckCircle2,
//   Database,
//   FileCheck2,
//   FileUp,
//   Gauge,
//   LoaderCircle,
//   RefreshCw,
//   ScanSearch,
//   ShieldCheck,
//   Sparkles,
//   Wrench,
//   XCircle,
// } from "lucide-react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// import {
//   analyze,
//   loadSample,
//   repair,
//   reportUrl,
//   repairedUrl,
//   uploadCsv,
// } from "./api";

// const cx = (...values) => values.filter(Boolean).join(" ");

// function Metric({ icon: Icon, label, value, note }) {
//   return (
//     <div className="card p-5">
//       <div className="flex items-center justify-between">
//         <span className="text-sm text-slate-500">{label}</span>
//         <span className="rounded-xl bg-blue-50 p-2 text-blue-700">
//           <Icon size={18} />
//         </span>
//       </div>
//       <div className="mt-3 text-3xl font-extrabold text-slate-900">
//         {value ?? "—"}
//       </div>
//       {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
//     </div>
//   );
// }

// function Table({ rows, columns }) {
//   if (!rows?.length) {
//     return (
//       <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
//         Nothing to show yet.
//       </div>
//     );
//   }

//   return (
//     <div className="table-wrap">
//       <table>
//         <thead>
//           <tr>
//             {columns.map((column) => (
//               <th key={column.key}>{column.label}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row, index) => (
//             <tr key={index}>
//               {columns.map((column) => (
//                 <td key={column.key}>
//                   {column.render
//                     ? column.render(row[column.key], row)
//                     : String(row[column.key] ?? "—")}
//                 </td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default function App() {
//   const [dataset, setDataset] = useState(null);
//   const [analysis, setAnalysis] = useState(null);
//   const [repairResult, setRepairResult] = useState(null);

//   const [file, setFile] = useState(null);
//   const [rules, setRules] = useState("");
//   const [target, setTarget] = useState("");

//   const [tab, setTab] = useState("Overview");
//   const [busy, setBusy] = useState("");
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");

//   const [selected, setSelected] = useState([]);
//   const [investigationChoice, setInvestigationChoice] = useState("");

//   // Manual repair state
//   const [manualChoices, setManualChoices] = useState({});
//   const [manualValues, setManualValues] = useState({});
//   const [manualConfirmed, setManualConfirmed] = useState({});

//   const profile = dataset?.profile;
//   const issues = analysis?.issues || [];
//   const plans = analysis?.repair_plan || [];

//   const safePlans = plans.filter(
//     (plan) => plan.automatic === true
//   );

//   const missingChart = useMemo(
//     () =>
//       Object.entries(profile?.missing_by_column || {})
//         .filter(([, count]) => count > 0)
//         .map(([name, missing]) => ({ name, missing })),
//     [profile]
//   );

//   async function perform(label, action) {
//     setBusy(label);
//     setError("");
//     setNotice("");

//     try {
//       return await action();
//     } catch (exception) {
//       setError(
//         exception?.response?.data?.detail ||
//           exception.message ||
//           "Something went wrong."
//       );
//       return null;
//     } finally {
//       setBusy("");
//     }
//   }

//   function resetRepairDecisions() {
//     setSelected([]);
//     setManualChoices({});
//     setManualValues({});
//     setManualConfirmed({});
//     setRepairResult(null);
//   }

//   async function useSample() {
//     const result = await perform("Loading sample…", loadSample);

//     if (result) {
//       setDataset(result);
//       setAnalysis(null);
//       resetRepairDecisions();
//       setInvestigationChoice("");
//       setTab("Overview");
//     }
//   }

//   async function upload() {
//     if (!file) return;

//     const result = await perform(
//       "Uploading…",
//       () => uploadCsv(file)
//     );

//     if (result) {
//       setDataset(result);
//       setAnalysis(null);
//       resetRepairDecisions();
//       setInvestigationChoice("");
//       setTab("Overview");
//     }
//   }

//   async function runAnalysis() {
//     const result = await perform("Analyzing…", () =>
//       analyze({
//         business_rules: rules,
//         target_column: target || null,
//       })
//     );

//     if (result) {
//       setAnalysis(result);
//       resetRepairDecisions();

//       const first = result.issues?.[0];
//       setInvestigationChoice(
//         first ? `${first.issue}::${first.column}` : ""
//       );

//       setTab("Findings");
//     }
//   }

//   async function investigateSelected() {
//     const finding = issues.find(
//       (issue) =>
//         `${issue.issue}::${issue.column}` === investigationChoice
//     );

//     if (!finding) {
//       setError("Select a valid finding to investigate.");
//       return;
//     }

//     const result = await perform("Investigating…", () =>
//       analyze({
//         business_rules: rules,
//         target_column: target || null,
//         selected_issue: finding,
//       })
//     );

//     if (result?.investigation) {
//       setAnalysis(result);
//       setRepairResult(null);
//       setTab("Investigation");

//       setNotice(
//         result.investigation.model_note ||
//           "Investigation completed."
//       );
//     } else if (result) {
//       setError("The response did not contain an investigation result.");
//     }
//   }

//   function chooseManualAction(column, action) {
//     setManualChoices((old) => ({
//       ...old,
//       [column]: action,
//     }));

//     setManualConfirmed((old) => ({
//       ...old,
//       [column]: false,
//     }));

//     setError("");
//   }

//   async function applyRepair() {
//     const automaticActions = safePlans
//       .filter((plan) =>
//         selected.includes(`${plan.action}::${plan.column}`)
//       )
//       .map((plan) => ({
//         action: plan.action,
//         column: plan.column,
//         confirmed: true,
//       }));

//     const manualActions = [];

//     for (const [column, action] of Object.entries(manualChoices)) {
//       if (!action || !manualConfirmed[column]) continue;

//       const payload = {
//         action,
//         column,
//         confirmed: true,
//       };

//       if (
//         action === "Fill missing with business value" ||
//         action === "Correct negative quantity"
//       ) {
//         const rawValue = manualValues[column]?.trim();

//         if (!rawValue) {
//           setError(
//             `Enter a verified replacement value for '${column}'.`
//           );
//           return;
//         }

//         payload.value = rawValue;
//       }

//       manualActions.push(payload);
//     }

//     const actions = [
//       ...automaticActions,
//       ...manualActions,
//     ];

//     if (!actions.length) {
//       setError(
//         "Select an automatic repair or choose and confirm a manual decision."
//       );
//       return;
//     }

//     // Do not apply conflicting decisions to the same column.
//     const columns = actions.map((action) => action.column);
//     if (new Set(columns).size !== columns.length) {
//       setError(
//         "Choose only one repair action per column in each batch."
//       );
//       return;
//     }

//     const result = await perform(
//       "Repairing…",
//       () => repair(actions)
//     );

//     if (result) {
//       setRepairResult(result);
//       setTab("Repair & verify");
//       setNotice("Repair request completed. Review the verification results.");
//     }
//   }

//   const tabs = [
//     "Overview",
//     "Findings",
//     "Investigation",
//     "Repair & verify",
//     "ML readiness",
//   ];

//   const previewCols = Object.keys(
//     dataset?.preview?.[0] || {}
//   )
//     .slice(0, 8)
//     .map((column) => ({
//       key: column,
//       label: column,
//     }));

//   // Build one manual-decision control per affected column.
//   const manualGroups = useMemo(() => {
//     const groups = new Map();

//     for (const plan of plans) {
//       if (plan.automatic || plan.action === "Manual review") continue;

//       if (!groups.has(plan.column)) {
//         groups.set(plan.column, []);
//       }

//       groups.get(plan.column).push(plan);
//     }

//     return Array.from(groups.entries()).map(
//       ([column, options]) => ({
//         column,
//         options,
//       })
//     );
//   }, [plans]);

//   return (
//     <div className="min-h-screen">
//       <header className="bg-[#111b35] text-white">
//         <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-5 py-5 lg:px-8">
//           <div className="flex items-center gap-3">
//             <div className="rounded-2xl bg-blue-500/20 p-3 text-blue-200">
//               <ScanSearch size={25} />
//             </div>
//             <div>
//               <div className="text-xl font-extrabold">DataSleuth</div>
//               <div className="text-xs text-slate-300">
//                 Agentic data quality workspace
//               </div>
//             </div>
//           </div>

//           <div className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300 md:flex">
//             <span className="h-2 w-2 rounded-full bg-emerald-400" />
//             {dataset ? dataset.filename : "Ready for a dataset"}
//           </div>
//         </div>

//         <div className="mx-auto max-w-[1480px] px-5 pb-7 lg:px-8">
//           <div className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-blue-300">
//             Detect · Investigate · Repair · Verify
//           </div>
//           <h1 className="text-3xl font-extrabold md:text-4xl">
//             Make your data trustworthy.
//           </h1>
//           <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
//             Find quality issues, investigate likely causes, apply approved
//             repairs, and verify the result without overwriting the original dataset.
//           </p>
//         </div>
//       </header>

//       <main className="mx-auto max-w-[1480px] px-5 py-6 lg:px-8">
//         <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
//           <aside className="space-y-4">
//             <section className="card p-5">
//               <div className="mb-3 flex items-center gap-2 font-bold">
//                 <Database size={18} className="text-blue-700" />
//                 Your dataset
//               </div>

//               <label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center">
//                 <FileUp size={24} className="mb-2 text-blue-700" />
//                 <span className="text-sm font-bold">
//                   {file?.name || "Choose a CSV file"}
//                 </span>
//                 <span className="mt-1 text-xs text-slate-500">
//                   CSV files only
//                 </span>
//                 <input
//                   type="file"
//                   accept=".csv,text/csv"
//                   className="hidden"
//                   onChange={(event) =>
//                     setFile(event.target.files?.[0] || null)
//                   }
//                 />
//               </label>

//               <button
//                 className="btn btn-primary mt-3 w-full"
//                 onClick={upload}
//                 disabled={!file || !!busy}
//               >
//                 {busy === "Uploading…" ? (
//                   <LoaderCircle size={16} className="animate-spin" />
//                 ) : (
//                   <FileUp size={16} />
//                 )}
//                 Upload dataset
//               </button>

//               <button
//                 className="btn btn-secondary mt-2 w-full"
//                 onClick={useSample}
//                 disabled={!!busy}
//               >
//                 <Sparkles size={16} />
//                 Load sample dataset
//               </button>

//               {dataset && (
//                 <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
//                   <b className="text-slate-800">{dataset.filename}</b>
//                   <div className="mt-1">
//                     {profile?.rows?.toLocaleString()} rows · {profile?.columns} columns
//                   </div>
//                 </div>
//               )}
//             </section>

//             <section className="card p-5">
//               <div className="mb-3 flex items-center gap-2 font-bold">
//                 <BookOpen size={18} className="text-blue-700" />
//                 Business context
//               </div>

//               <label className="mb-1 block text-xs font-semibold text-slate-600">
//                 Target column (optional)
//               </label>

//               <select
//                 className="field mb-3"
//                 value={target}
//                 onChange={(event) => setTarget(event.target.value)}
//               >
//                 <option value="">No target selected</option>
//                 {(dataset?.preview?.[0]
//                   ? Object.keys(dataset.preview[0])
//                   : []
//                 ).map((column) => (
//                   <option key={column} value={column}>
//                     {column}
//                   </option>
//                 ))}
//               </select>

//               <label className="mb-1 block text-xs font-semibold text-slate-600">
//                 Extra rules (optional)
//               </label>

//               <textarea
//                 className="field resize-y text-sm"
//                 rows="4"
//                 placeholder={"quantity must be positive\norder_id should be unique"}
//                 value={rules}
//                 onChange={(event) => setRules(event.target.value)}
//               />

//               <p className="mt-2 text-xs leading-5 text-slate-500">
//                 One rule per line. Rules provide guidance and are not executed as code.
//               </p>

//               <button
//                 className="btn btn-primary mt-3 w-full"
//                 onClick={runAnalysis}
//                 disabled={!dataset || !!busy}
//               >
//                 {busy === "Analyzing…" ? (
//                   <LoaderCircle size={16} className="animate-spin" />
//                 ) : (
//                   <Activity size={16} />
//                 )}
//                 Analyze dataset
//               </button>
//             </section>

//             <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900">
//               <ShieldCheck size={17} className="mb-2" />
//               <b>Human-approved changes</b>
//               <br />
//               Repairs operate on a separate working copy. Ambiguous values are not guessed automatically.
//             </div>
//           </aside>

//           <section className="min-w-0 space-y-5">
//             {error && (
//               <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
//                 <XCircle size={18} className="shrink-0" />
//                 <span>{error}</span>
//               </div>
//             )}

//             {notice && !error && (
//               <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
//                 <CheckCircle2 size={18} className="shrink-0" />
//                 <span>{notice}</span>
//               </div>
//             )}

//             {!dataset ? (
//               <div className="card flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
//                 <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
//                   <Database size={34} />
//                 </div>
//                 <h2 className="mt-5 text-2xl font-extrabold">
//                   Start with your data
//                 </h2>
//                 <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
//                   Upload a CSV or load sample data to explore profiling,
//                   investigation, repairs, and ML-readiness checks.
//                 </p>
//                 <button
//                   className="btn btn-primary mt-5"
//                   onClick={useSample}
//                   disabled={!!busy}
//                 >
//                   <Sparkles size={16} />
//                   Try sample dataset
//                 </button>
//               </div>
//             ) : (
//               <>
//                 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
//                   <Metric icon={Database} label="Rows" value={profile?.rows?.toLocaleString()} />
//                   <Metric icon={Activity} label="Columns" value={profile?.columns} />
//                   <Metric icon={AlertTriangle} label="Missing cells" value={profile?.missing_cells?.toLocaleString()} />
//                   <Metric icon={RefreshCw} label="Exact duplicates" value={profile?.duplicate_rows?.toLocaleString()} />
//                 </div>

//                 <div className="card p-2">
//                   <div className="flex gap-1 overflow-x-auto">
//                     {tabs.map((name) => (
//                       <button
//                         key={name}
//                         className={cx("tab", tab === name && "tab-active")}
//                         onClick={() => setTab(name)}
//                       >
//                         {name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {tab === "Overview" && (
//                   <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
//                     <section className="card p-5">
//                       <div className="mb-4 flex items-center justify-between">
//                         <h3 className="font-bold">Dataset preview</h3>
//                         <span className="text-xs text-slate-500">First 100 rows</span>
//                       </div>
//                       <Table rows={dataset.preview} columns={previewCols} />
//                     </section>

//                     <section className="card p-5">
//                       <h3 className="font-bold">Missing values by column</h3>
//                       <p className="mb-3 mt-1 text-xs text-slate-500">
//                         A quick view of incomplete fields.
//                       </p>
//                       {missingChart.length ? (
//                         <ResponsiveContainer width="100%" height={280}>
//                           <BarChart data={missingChart} layout="vertical" margin={{ left: 5, right: 12 }}>
//                             <CartesianGrid strokeDasharray="3 3" horizontal={false} />
//                             <XAxis type="number" allowDecimals={false} />
//                             <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 11 }} />
//                             <Tooltip />
//                             <Bar dataKey="missing" fill="#4168b2" radius={[0, 6, 6, 0]} />
//                           </BarChart>
//                         </ResponsiveContainer>
//                       ) : (
//                         <div className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-800">
//                           No missing values detected.
//                         </div>
//                       )}
//                     </section>

//                     <section className="card p-5 xl:col-span-2">
//                       <h3 className="mb-3 font-bold">Column profile</h3>
//                       <Table
//                         rows={profile?.column_profile}
//                         columns={[
//                           { key: "column", label: "Column" },
//                           { key: "dtype", label: "Data type" },
//                           { key: "missing", label: "Missing" },
//                           { key: "unique", label: "Unique values" },
//                         ]}
//                       />
//                     </section>
//                   </div>
//                 )}

//                 {tab === "Findings" && (
//                   <section className="card p-5">
//                     <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//                       <div>
//                         <h3 className="font-bold">Quality findings</h3>
//                         <p className="mt-1 text-sm text-slate-500">
//                           Findings include evidence and severity.
//                         </p>
//                       </div>
//                       <button
//                         className="btn btn-primary"
//                         onClick={runAnalysis}
//                         disabled={!!busy}
//                       >
//                         <RefreshCw size={15} />
//                         Run analysis
//                       </button>
//                     </div>

//                     {analysis ? (
//                       <>
//                         <div className="mb-4 flex flex-wrap gap-2">
//                           <span className="pill bg-slate-100 text-slate-700">
//                             {issues.length} findings
//                           </span>
//                           <span className="pill pill-high">
//                             {issues.filter((item) => item.severity === "High").length} high
//                           </span>
//                           <span className="pill pill-medium">
//                             {issues.filter((item) => item.severity === "Medium").length} medium
//                           </span>
//                           <span className="pill pill-low">
//                             {issues.filter((item) => item.severity === "Low").length} low
//                           </span>
//                         </div>

//                         <Table
//                           rows={issues}
//                           columns={[
//                             { key: "issue", label: "Issue" },
//                             { key: "column", label: "Column" },
//                             { key: "count", label: "Count" },
//                             {
//                               key: "severity",
//                               label: "Severity",
//                               render: (value) => (
//                                 <span className={cx("pill", value === "High" ? "pill-high" : value === "Medium" ? "pill-medium" : "pill-low")}>
//                                   {value}
//                                 </span>
//                               ),
//                             },
//                             { key: "evidence", label: "Evidence" },
//                           ]}
//                         />

//                         {!issues.length && (
//                           <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
//                             No issues detected by current checks.
//                           </div>
//                         )}
//                       </>
//                     ) : (
//                       <p className="text-sm text-slate-500">
//                         Click Analyze dataset to run the workflow.
//                       </p>
//                     )}
//                   </section>
//                 )}

//                 {tab === "Investigation" && (
//                   <div className="space-y-5">
//                     <section className="card p-5">
//                       <div className="mb-4 flex items-center gap-2">
//                         <Sparkles className="text-blue-700" size={19} />
//                         <h3 className="font-bold">Investigation</h3>
//                       </div>

//                       {analysis ? (
//                         <>
//                           <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
//                             <label className="mb-2 block text-sm font-bold">
//                               Choose a finding
//                             </label>

//                             <div className="flex flex-col gap-2 sm:flex-row">
//                               <select
//                                 className="field min-w-0 flex-1"
//                                 value={investigationChoice}
//                                 onChange={(event) => setInvestigationChoice(event.target.value)}
//                                 disabled={!!busy}
//                               >
//                                 {issues.map((issue, index) => (
//                                   <option
//                                     key={`${issue.issue}::${issue.column}::${index}`}
//                                     value={`${issue.issue}::${issue.column}`}
//                                   >
//                                     {issue.issue} · {issue.column} ({issue.severity})
//                                   </option>
//                                 ))}
//                               </select>

//                               <button
//                                 className="btn btn-primary"
//                                 onClick={investigateSelected}
//                                 disabled={!investigationChoice || !!busy}
//                               >
//                                 {busy === "Investigating…" ? (
//                                   <LoaderCircle size={16} className="animate-spin" />
//                                 ) : (
//                                   <Sparkles size={15} />
//                                 )}
//                                 {busy === "Investigating…" ? "Investigating…" : "Investigate finding"}
//                               </button>
//                             </div>
//                           </div>

//                           <div className="rounded-xl bg-slate-50 p-4">
//                             <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
//                               Summary
//                             </div>
//                             <p className="mt-2 font-semibold">
//                               {analysis.investigation?.issue_summary || "No investigation result yet."}
//                             </p>
//                             <p className="mt-2 text-xs text-slate-500">
//                               Confidence: {analysis.investigation?.confidence || "unknown"} · {analysis.investigation?.model_note || ""}
//                             </p>
//                           </div>

//                           <div className="mt-4 grid gap-4 md:grid-cols-2">
//                             <div>
//                               <h4 className="mb-2 font-bold">Confirmed evidence</h4>
//                               {(analysis.investigation?.confirmed_evidence || []).map((value, index) => (
//                                 <div key={index} className="mb-2 rounded-lg border border-slate-100 p-3 text-sm">
//                                   {value}
//                                 </div>
//                               ))}
//                             </div>
//                             <div>
//                               <h4 className="mb-2 font-bold">Possible root causes</h4>
//                               {(analysis.investigation?.possible_root_causes || []).map((value, index) => (
//                                 <div key={index} className="mb-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-sm">
//                                   {value}
//                                 </div>
//                               ))}
//                             </div>
//                           </div>

//                           <div className="mt-4">
//                             <h4 className="mb-2 font-bold">Recommended actions</h4>
//                             {(analysis.investigation?.recommended_actions || []).map((value, index) => (
//                               <p key={index} className="mb-2 text-sm">
//                                 › {value}
//                               </p>
//                             ))}
//                           </div>
//                         </>
//                       ) : (
//                         <p className="text-sm text-slate-500">Run analysis first.</p>
//                       )}
//                     </section>

//                     <section className="card p-5">
//                       <h3 className="mb-3 font-bold">Retrieved business rules</h3>
//                       {analysis?.retrieved_rules?.length ? (
//                         analysis.retrieved_rules.map((rule, index) => (
//                           <div key={index} className="mb-2 flex gap-3 rounded-xl border border-slate-100 p-3">
//                             <BookOpen size={17} className="mt-0.5 shrink-0 text-blue-700" />
//                             <div>
//                               <p className="text-sm">{rule.text}</p>
//                               <p className="mt-1 text-xs text-slate-400">
//                                 Source: {rule.source}
//                               </p>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <p className="text-sm text-slate-500">
//                           No rules retrieved.
//                         </p>
//                       )}
//                     </section>
//                   </div>
//                 )}

//                 {tab === "Repair & verify" && (
//                   <div className="space-y-5">
//                     <section className="card p-5">
//                       <div className="mb-2 flex items-center gap-2">
//                         <Wrench size={19} className="text-blue-700" />
//                         <h3 className="font-bold">Review repair plan</h3>
//                       </div>

//                       <p className="mb-4 text-sm text-slate-500">
//                         Select automatic repairs or choose one manual decision per column. Confirm each manual decision before applying it.
//                       </p>

//                       {!analysis ? (
//                         <p className="text-sm text-slate-500">Run analysis first.</p>
//                       ) : (
//                         <>
//                           {safePlans.length > 0 && (
//                             <div className="mb-5">
//                               <h4 className="mb-3 font-bold">Automatic repairs</h4>

//                               {safePlans.map((plan) => {
//                                 const id = `${plan.action}::${plan.column}`;

//                                 return (
//                                   <label
//                                     key={id}
//                                     className="mb-2 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
//                                   >
//                                     <input
//                                       type="checkbox"
//                                       className="mt-1 accent-blue-700"
//                                       checked={selected.includes(id)}
//                                       onChange={(event) =>
//                                         setSelected((old) =>
//                                           event.target.checked
//                                             ? [...old, id]
//                                             : old.filter((item) => item !== id)
//                                         )
//                                       }
//                                     />
//                                     <div className="flex-1">
//                                       <div className="font-bold">
//                                         {plan.action} · {plan.column}
//                                       </div>
//                                       <p className="mt-1 text-sm text-slate-500">
//                                         {plan.description}
//                                       </p>
//                                     </div>
//                                     <span className="pill pill-low">{plan.risk}</span>
//                                   </label>
//                                 );
//                               })}
//                             </div>
//                           )}

//                           {manualGroups.length > 0 && (
//                             <div className="space-y-4">
//                               <h4 className="font-bold">Manual decisions</h4>

//                               {manualGroups.map(({ column, options }) => {
//                                 const choice =
//                                   manualChoices[column] || "";

//                                 const needsValue = [
//                                   "Fill missing with business value",
//                                   "Correct negative quantity",
//                                 ].includes(choice);

//                                 return (
//                                   <div
//                                     key={column}
//                                     className="rounded-xl border border-amber-200 bg-amber-50 p-4"
//                                   >
//                                     <h5 className="font-bold">
//                                       Review · {column}
//                                     </h5>

//                                     <p className="mt-1 text-sm text-slate-600">
//                                       {options.find((item) => item.action === choice)?.description ||
//                                         options[0]?.description}
//                                     </p>

//                                     <label className="mt-3 block text-sm font-semibold">
//                                       Choose an action
//                                     </label>

//                                     <select
//                                       className="field mt-1"
//                                       value={choice}
//                                       onChange={(event) =>
//                                         chooseManualAction(column, event.target.value)
//                                       }
//                                       disabled={!!busy}
//                                     >
//                                       <option value="">Select a decision</option>
//                                       {options.map((option) => (
//                                         <option
//                                           key={option.action}
//                                           value={option.action}
//                                         >
//                                           {option.action}
//                                         </option>
//                                       ))}
//                                     </select>

//                                     {needsValue && (
//                                       <>
//                                         <label className="mt-3 block text-sm font-semibold">
//                                           Verified replacement value
//                                         </label>
//                                         <input
//                                           className="field mt-1"
//                                           value={manualValues[column] ?? ""}
//                                           onChange={(event) =>
//                                             setManualValues((old) => ({
//                                               ...old,
//                                               [column]: event.target.value,
//                                             }))
//                                           }
//                                           placeholder="Enter a justified value"
//                                         />
//                                         <p className="mt-1 text-xs text-slate-500">
//                                           Use a verified value, not a guess. Numeric columns require numeric values.
//                                         </p>
//                                       </>
//                                     )}

//                                     <label className="mt-3 flex items-start gap-2 text-sm">
//                                       <input
//                                         type="checkbox"
//                                         className="mt-1"
//                                         checked={!!manualConfirmed[column]}
//                                         onChange={(event) =>
//                                           setManualConfirmed((old) => ({
//                                             ...old,
//                                             [column]: event.target.checked,
//                                           }))
//                                         }
//                                         disabled={!choice || !!busy}
//                                       />
//                                       I reviewed this decision and approve it.
//                                     </label>
//                                   </div>
//                                 );
//                               })}
//                             </div>
//                           )}

//                           {!safePlans.length && !manualGroups.length && (
//                             <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
//                               No repair actions are available for the current findings.
//                             </p>
//                           )}

//                           <button
//                             className="btn btn-primary mt-5"
//                             disabled={!!busy}
//                             onClick={applyRepair}
//                           >
//                             {busy === "Repairing…" ? (
//                               <LoaderCircle size={16} className="animate-spin" />
//                             ) : (
//                               <ShieldCheck size={16} />
//                             )}
//                             Approve and apply selected repairs
//                           </button>
//                         </>
//                       )}
//                     </section>

//                     {repairResult && (
//                       <section className="card p-5">
//                         <div className="mb-4 flex items-center gap-2">
//                           {repairResult.verification?.passed ? (
//                             <CheckCircle2 className="text-emerald-600" />
//                           ) : (
//                             <AlertTriangle className="text-amber-600" />
//                           )}
//                           <h3 className="font-bold">Verification result</h3>
//                         </div>

//                         <div className="grid gap-3 sm:grid-cols-3">
//                           <Metric
//                             icon={Database}
//                             label="Rows after"
//                             value={repairResult.profile?.rows}
//                           />
//                           <Metric
//                             icon={AlertTriangle}
//                             label="Issue types"
//                             value={`${repairResult.verification?.issues_before ?? "—"} → ${repairResult.verification?.issues_after ?? "—"}`}
//                           />
//                           <Metric
//                             icon={ShieldCheck}
//                             label="Execution status"
//                             value={repairResult.verification?.passed ? "Completed" : "Review"}
//                           />
//                         </div>

//                         <div className="my-4 space-y-2">
//                           {(repairResult.repair_log || []).map((line, index) => (
//                             <p key={index} className="text-sm text-slate-600">
//                               • {line}
//                             </p>
//                           ))}
//                         </div>

//                         <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
//                           Completion does not guarantee that every issue is resolved. Review the remaining findings and compare the data before and after repair.
//                         </p>

//                         <h4 className="mb-2 font-bold">Remaining issues</h4>
//                         <Table
//                           rows={repairResult.issues_after}
//                           columns={[
//                             { key: "issue", label: "Issue" },
//                             { key: "column", label: "Column" },
//                             { key: "count", label: "Count" },
//                             { key: "severity", label: "Severity" },
//                           ]}
//                         />

//                         <h4 className="mb-2 mt-4 font-bold">Repaired data preview</h4>
//                         <Table
//                           rows={repairResult.preview}
//                           columns={Object.keys(repairResult.preview?.[0] || {})
//                             .slice(0, 8)
//                             .map((column) => ({
//                               key: column,
//                               label: column,
//                             }))}
//                         />

//                         <div className="mt-4 flex flex-wrap gap-2">
//                           <a className="btn btn-primary no-underline" href={repairedUrl}>
//                             <ArrowDownToLine size={16} />
//                             Download repaired CSV
//                           </a>
//                           <a className="btn btn-secondary no-underline" href={reportUrl}>
//                             <FileCheck2 size={16} />
//                             Download report
//                           </a>
//                         </div>
//                       </section>
//                     )}
//                   </div>
//                 )}

//                 {tab === "ML readiness" && (
//                   <section className="card p-5">
//                     <div className="mb-4 flex items-center gap-2">
//                       <Gauge className="text-blue-700" />
//                       <h3 className="font-bold">ML-readiness assessment</h3>
//                     </div>

//                     {analysis ? (
//                       <>
//                         <div className="grid gap-3 sm:grid-cols-2">
//                           <Metric
//                             icon={AlertTriangle}
//                             label="Missing cell percentage"
//                             value={`${analysis.ml_readiness?.missing_percent ?? 0}%`}
//                           />
//                           <Metric
//                             icon={Database}
//                             label="Exact duplicate rows"
//                             value={analysis.ml_readiness?.duplicate_rows ?? 0}
//                           />
//                         </div>

//                         <h4 className="mb-3 mt-5 font-bold">Readiness warnings</h4>
//                         {(analysis.ml_readiness?.issues || []).map((warning, index) => (
//                           <div key={index} className="mb-2 flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm">
//                             <AlertTriangle size={17} className="shrink-0 text-amber-700" />
//                             {warning}
//                           </div>
//                         ))}

//                         <div className="mt-3 text-xs text-slate-500">
//                           Readiness score: {analysis.ml_readiness?.score ?? "—"} · {analysis.ml_readiness?.status ?? "Not assessed"}
//                         </div>
//                       </>
//                     ) : (
//                       <p className="text-sm text-slate-500">
//                         Run analysis to assess ML readiness.
//                       </p>
//                     )}
//                   </section>
//                 )}
//               </>
//             )}
//           </section>
//         </div>

//         <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500">
//           <span>DataSleuth · Transparent checks · Human-approved repairs</span>
//           <span className="flex items-center gap-1">
//             <ShieldCheck size={14} />
//             Original dataset preserved
//           </span>
//         </footer>
//       </main>
//     </div>
//   );
// }


// import { useMemo, useState } from "react";
// import { Activity, AlertTriangle, ArrowDownToLine, BookOpen, CheckCircle2, CircleHelp, Database, FileCheck2, FileUp, Gauge, LoaderCircle, RefreshCw, ScanSearch, ShieldCheck, Sparkles, Wrench, XCircle } from "lucide-react";
// import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
// import { analyze, loadSample, repair, reportUrl, repairedUrl, uploadCsv } from "./api";

// const cx=(...v)=>v.filter(Boolean).join(" ");
// function Metric({icon:Icon,label,value,note}){return <div className="card p-5"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><span className="rounded-xl bg-blue-50 p-2 text-blue-700"><Icon size={18}/></span></div><div className="mt-3 font-[Manrope] text-3xl font-extrabold text-slate-900">{value??"—"}</div>{note&&<div className="mt-1 text-xs text-slate-500">{note}</div>}</div>}
// function Table({rows,columns}){if(!rows?.length)return <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Nothing to show yet.</div>;return <div className="table-wrap"><table><thead><tr>{columns.map(c=><th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{columns.map(c=><td key={c.key}>{c.render?c.render(r[c.key],r):String(r[c.key]??"—")}</td>)}</tr>)}</tbody></table></div>}
// export default function App(){
//  const [dataset,setDataset]=useState(null),[analysis,setAnalysis]=useState(null),[repairResult,setRepairResult]=useState(null),[file,setFile]=useState(null),[rules,setRules]=useState(""),[target,setTarget]=useState(""),[tab,setTab]=useState("Overview"),[busy,setBusy]=useState(""),[error,setError]=useState(""),[selected,setSelected]=useState([]),[investigationChoice,setInvestigationChoice]=useState("");
//  const profile=dataset?.profile,issues=analysis?.issues||[],plans=analysis?.repair_plan||[],safePlans=plans.filter(p=>p.automatic);
//  const missingChart=useMemo(()=>Object.entries(profile?.missing_by_column||{}).filter(([,v])=>v>0).map(([name,missing])=>({name,missing})),[profile]);
//  async function perform(label,fn){setBusy(label);setError("");try{return await fn()}catch(e){setError(e?.response?.data?.detail||e.message||"Something went wrong.")}finally{setBusy("")}}
//  async function useSample(){const d=await perform("Loading sample…",loadSample);if(d){setDataset(d);setAnalysis(null);setRepairResult(null);setSelected([]);setTab("Overview")}}
//  async function upload(){if(!file)return;const d=await perform("Uploading…",()=>uploadCsv(file));if(d){setDataset(d);setAnalysis(null);setRepairResult(null);setSelected([]);setTab("Overview")}}
//  async function runAnalysis(){const d=await perform("Analyzing…",()=>analyze({business_rules:rules,target_column:target||null}));if(d){setAnalysis(d);setRepairResult(null);setSelected([]);const first=d.issues?.[0];setInvestigationChoice(first?`${first.issue}::${first.column}`:"");setTab("Findings")}}
//  async function investigateSelected(){const finding=issues.find(i=>`${i.issue}::${i.column}`===investigationChoice);const d=await perform("Investigating…",()=>analyze({business_rules:rules,target_column:target||null,selected_issue:finding||null}));if(d){setAnalysis(d);setRepairResult(null);setTab("Investigation")}}
//  async function applyRepair(){const actions=safePlans.filter(p=>selected.includes(`${p.action}::${p.column}`));const d=await perform("Repairing…",()=>repair(actions));if(d){setRepairResult(d);setTab("Repair & verify")}}
//  const tabs=["Overview","Findings","Investigation","Repair & verify","ML readiness"];
//  const previewCols=Object.keys(dataset?.preview?.[0]||{}).slice(0,8).map(c=>({key:c,label:c}));
//  return <div className="min-h-screen">
//  <header className="bg-[#111b35] text-white"><div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-5 py-5 lg:px-8"><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-500/20 p-3 text-blue-200"><ScanSearch size={25}/></div><div><div className="font-[Manrope] text-xl font-extrabold">DataSleuth</div><div className="text-xs text-slate-300">Agentic data quality workspace</div></div></div><div className="hidden items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs text-slate-300 md:flex"><span className="h-2 w-2 rounded-full bg-emerald-400"/>{dataset?dataset.filename:"Ready for a dataset"}</div></div><div className="mx-auto max-w-[1480px] px-5 pb-7 lg:px-8"><div className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-blue-300">Detect · Investigate · Repair · Verify</div><h1 className="font-[Manrope] text-3xl font-extrabold md:text-4xl">Make your data trustworthy.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Find quality issues, understand likely causes, retrieve business rules, and approve safe repairs—with your original dataset preserved.</p></div></header>
//  <main className="mx-auto max-w-[1480px] px-5 py-6 lg:px-8"><div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
//  <aside className="space-y-4">
//  <section className="card p-5"><div className="mb-3 flex items-center gap-2 font-bold"><Database size={18} className="text-blue-700"/>Your dataset</div><label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center"><FileUp size={24} className="mb-2 text-blue-700"/><span className="text-sm font-bold">{file?.name||"Choose a CSV file"}</span><span className="mt-1 text-xs text-slate-500">CSV files only</span><input type="file" accept=".csv,text/csv" className="hidden" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button className="btn btn-primary mt-3 w-full" onClick={upload} disabled={!file||!!busy}>{busy==="Uploading…"?<LoaderCircle className="animate-spin" size={16}/>:<FileUp size={16}/>}Upload dataset</button><button className="btn btn-secondary mt-2 w-full" onClick={useSample} disabled={!!busy}><Sparkles size={16}/>Load sample dataset</button>{dataset&&<div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600"><b className="text-slate-800">{dataset.filename}</b><div className="mt-1">{profile?.rows?.toLocaleString()} rows · {profile?.columns} columns</div></div>}</section>
//  <section className="card p-5"><div className="mb-3 flex items-center gap-2 font-bold"><BookOpen size={18} className="text-blue-700"/>Business context</div><label className="mb-1 block text-xs font-semibold text-slate-600">Target column (optional)</label><select className="field mb-3" value={target} onChange={e=>setTarget(e.target.value)}><option value="">No target selected</option>{(dataset?.preview?.[0]?Object.keys(dataset.preview[0]):[]).map(c=><option key={c}>{c}</option>)}</select><label className="mb-1 block text-xs font-semibold text-slate-600">Extra rules (optional)</label><textarea className="field resize-y text-sm" rows="4" placeholder={"quantity must be positive\\norder_id should be unique"} value={rules} onChange={e=>setRules(e.target.value)}/><p className="mt-2 text-xs leading-5 text-slate-500">One rule per line. Used as guidance, not executed as code.</p><button className="btn btn-primary mt-3 w-full" onClick={runAnalysis} disabled={!dataset||!!busy}>{busy==="Analyzing…"?<LoaderCircle size={16} className="animate-spin"/>:<Activity size={16}/>}Analyze dataset</button></section>
//  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900"><ShieldCheck size={17} className="mb-2"/><b>Human-approved changes</b><br/>Repairs run on a copy. Ambiguous values are never guessed automatically.</div></aside>
//  <section className="min-w-0 space-y-5">{error&&<div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><XCircle size={18}/>{error}</div>}
//  {!dataset?<div className="card flex min-h-[420px] flex-col items-center justify-center p-8 text-center"><div className="rounded-2xl bg-blue-50 p-4 text-blue-700"><Database size={34}/></div><h2 className="mt-5 font-[Manrope] text-2xl font-extrabold">Start with your data</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Upload a CSV or load sample data to explore profiling, agent investigation, repair approval, and ML-readiness checks.</p><button className="btn btn-primary mt-5" onClick={useSample} disabled={!!busy}><Sparkles size={16}/>Try sample dataset</button><div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">{[["01","Profile"],["02","Detect"],["03","Investigate"],["04","Verify"]].map(([n,t])=><div className="rounded-xl bg-slate-50 p-3" key={n}><div className="text-xs font-bold text-blue-700">{n}</div><div className="mt-1 text-sm font-bold">{t}</div></div>)}</div></div>:<>
//  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Database} label="Rows" value={profile?.rows?.toLocaleString()}/><Metric icon={Activity} label="Columns" value={profile?.columns}/><Metric icon={AlertTriangle} label="Missing cells" value={profile?.missing_cells?.toLocaleString()} note="Across all columns"/><Metric icon={RefreshCw} label="Exact duplicates" value={profile?.duplicate_rows?.toLocaleString()}/></div>
//  <div className="card p-2"><div className="flex gap-1 overflow-x-auto">{tabs.map(t=><button key={t} className={cx("tab",tab===t&&"tab-active")} onClick={()=>setTab(t)}>{t}</button>)}</div></div>
//  {tab==="Overview"&&<div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><section className="card p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Dataset preview</h3><span className="text-xs text-slate-500">First 100 rows</span></div><Table rows={dataset.preview} columns={previewCols}/></section><section className="card p-5"><h3 className="font-bold">Missing values by column</h3><p className="mb-3 mt-1 text-xs text-slate-500">A quick view of incomplete fields.</p>{missingChart.length?<ResponsiveContainer width="100%" height={280}><BarChart data={missingChart} layout="vertical" margin={{left:5,right:12}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" allowDecimals={false}/><YAxis dataKey="name" type="category" width={95} tick={{fontSize:11}}/><Tooltip/><Bar dataKey="missing" fill="#4168b2" radius={[0,6,6,0]}/></BarChart></ResponsiveContainer>:<div className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-800">No missing values detected.</div>}</section><section className="card p-5 xl:col-span-2"><h3 className="mb-3 font-bold">Column profile</h3><Table rows={profile?.column_profile} columns={[{key:"column",label:"Column"},{key:"dtype",label:"Data type"},{key:"missing",label:"Missing"},{key:"unique",label:"Unique values"}]}/></section></div>}
//  {tab==="Findings"&&<section className="card p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Quality findings</h3><p className="mt-1 text-sm text-slate-500">Repeatable checks with evidence and severity.</p></div><button className="btn btn-primary" onClick={runAnalysis} disabled={!!busy}><RefreshCw size={15}/>Run analysis</button></div>{analysis?<><div className="mb-4 flex flex-wrap gap-2"><span className="pill bg-slate-100 text-slate-700">{issues.length} issue types</span><span className="pill pill-high">{issues.filter(i=>i.severity==="High").length} high</span><span className="pill pill-medium">{issues.filter(i=>i.severity==="Medium").length} medium</span><span className="pill pill-low">{issues.filter(i=>i.severity==="Low").length} low</span></div><Table rows={issues} columns={[{key:"issue",label:"Issue"},{key:"column",label:"Column"},{key:"count",label:"Count"},{key:"severity",label:"Severity",render:v=><span className={cx("pill",v==="High"?"pill-high":v==="Medium"?"pill-medium":"pill-low")}>{v}</span>},{key:"evidence",label:"Evidence"}]}/>{!issues.length&&<div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">No issues detected by current checks.</div>}</>:<p className="text-sm text-slate-500">Click Analyze dataset to run the workflow.</p>}</section>}
//  {tab==="Investigation"&&<div className="space-y-5"><section className="card p-5"><div className="mb-4 flex items-center gap-2"><Sparkles className="text-blue-700" size={19}/><h3 className="font-bold">Investigation</h3></div>{analysis?<><div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><label className="mb-2 block text-sm font-bold" htmlFor="investigation-finding">Choose one finding to investigate</label><div className="flex flex-col gap-2 sm:flex-row"><select id="investigation-finding" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" value={investigationChoice} onChange={e=>setInvestigationChoice(e.target.value)}>{issues.map((issue,i)=><option key={`${issue.issue}::${issue.column}::${i}`} value={`${issue.issue}::${issue.column}`}>{issue.issue} · {issue.column} ({issue.severity})</option>)}</select><button className="btn btn-primary" onClick={investigateSelected} disabled={!investigationChoice||!!busy}><Sparkles size={15}/>Investigate finding</button></div><p className="mt-2 text-xs text-slate-500">Investigation explains one selected finding. The repair plan is separate, and no repair is selected automatically.</p></div><div className="rounded-xl bg-slate-50 p-4"><div className="text-xs font-bold uppercase tracking-wider text-slate-500">Summary</div><p className="mt-2 font-semibold">{analysis.investigation?.issue_summary}</p><p className="mt-2 text-xs text-slate-500">Confidence: {analysis.investigation?.confidence||"unknown"} · {analysis.investigation?.model_note}</p></div><div className="mt-4 grid gap-4 md:grid-cols-2"><div><h4 className="mb-2 font-bold">Confirmed evidence</h4>{(analysis.investigation?.confirmed_evidence||[]).map((v,i)=><div key={i} className="mb-2 rounded-lg border border-slate-100 p-3 text-sm">{v}</div>)}</div><div><h4 className="mb-2 font-bold">Possible root causes</h4>{(analysis.investigation?.possible_root_causes||[]).map((v,i)=><div key={i} className="mb-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-sm">{v}</div>)}</div></div><div className="mt-4"><h4 className="mb-2 font-bold">Recommended actions</h4>{(analysis.investigation?.recommended_actions||[]).map((v,i)=><p key={i} className="mb-2 text-sm">› {v}</p>)}</div></>:<p className="text-sm text-slate-500">Run analysis first.</p>}</section><section className="card p-5"><h3 className="mb-3 font-bold">Retrieved business rules</h3>{analysis?.retrieved_rules?.length?analysis.retrieved_rules.map((r,i)=><div key={i} className="mb-2 flex gap-3 rounded-xl border border-slate-100 p-3"><BookOpen size={17} className="mt-0.5 shrink-0 text-blue-700"/><div><p className="text-sm">{r.text}</p><p className="mt-1 text-xs text-slate-400">Source: {r.source}</p></div></div>):<p className="text-sm text-slate-500">Run analysis to retrieve guidance.</p>}</section></div>}
//  {tab==="Repair & verify"&&<div className="space-y-5"><section className="card p-5"><div className="mb-2 flex items-center gap-2"><Wrench size={19} className="text-blue-700"/><h3 className="font-bold">Review repair plan</h3></div><p className="mb-4 text-sm text-slate-500">Choose each repair deliberately. Nothing is preselected. Investigating a finding does not automatically approve or apply a repair.</p>{analysis?.investigation?.selected_finding&&<div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><div className="text-xs font-bold uppercase tracking-wide text-blue-800">Finding you investigated</div><p className="mt-1 font-semibold">{analysis.investigation.selected_finding.issue} · {analysis.investigation.selected_finding.column}</p><p className="mt-1 text-sm text-slate-600">{analysis.investigation.selected_finding.evidence}</p><p className="mt-2 text-sm text-slate-700">This finding still needs a justified action. If it is marked for manual review below, DataSleuth will not guess a replacement value.</p></div>}{!analysis?<p className="text-sm text-slate-500">Run analysis first.</p>:<>{safePlans.length?safePlans.map((p,i)=>{const id=`${p.action}::${p.column}`;return <label key={id} className="mb-2 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50"><input type="checkbox" className="mt-1 accent-blue-700" checked={selected.includes(id)} onChange={e=>setSelected(old=>e.target.checked?[...old,id]:old.filter(x=>x!==id))}/><div className="flex-1"><div className="font-bold">{p.action} <span className="text-slate-400">· {p.column}</span></div><p className="mt-1 text-sm text-slate-500">{p.description}</p></div><span className={cx("pill",p.risk==="Low"?"pill-low":"pill-medium")}>{p.risk} risk</span></label>}):<div className="rounded-xl bg-slate-50 p-4 text-sm">No automatic repairs are available for the current findings. Review the manual-review guidance below; ambiguous values will not be guessed.</div>}{plans.filter(p=>!p.automatic).map((p,i)=><div key={i} className="mt-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm"><b>Manual review · {p.column}</b><p className="mt-1 text-slate-600">{p.description}</p></div>)}<button className="btn btn-primary mt-4" disabled={!selected.length||!!busy} onClick={applyRepair}>{busy==="Repairing…"?<LoaderCircle size={16} className="animate-spin"/>:<ShieldCheck size={16}/>}Approve and apply repairs</button></>}</section>{repairResult&&<section className="card p-5"><div className="mb-4 flex items-center gap-2">{repairResult.verification.passed?<CheckCircle2 className="text-emerald-600"/>:<AlertTriangle className="text-amber-600"/>}<h3 className="font-bold">Verification result</h3></div><div className="grid gap-3 sm:grid-cols-3"><Metric icon={Database} label="Rows after" value={repairResult.profile.rows}/><Metric icon={AlertTriangle} label="Issue types" value={`${repairResult.verification.issues_before} → ${repairResult.verification.issues_after}`}/><Metric icon={ShieldCheck} label="Status" value={repairResult.verification.passed?"No regression":"Rolled back"}/></div><div className="my-4 space-y-2">{repairResult.repair_log.map((line,i)=><p key={i} className="text-sm text-slate-600">✓ {line}</p>)}</div><p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">Verification checks whether the approved operation completed without increasing the number of detected issues. “No regression” does not mean every issue has been fixed.</p><h4 className="mb-2 font-bold">Remaining issues</h4><Table rows={repairResult.issues_after} columns={[{key:"issue",label:"Issue"},{key:"column",label:"Column"},{key:"count",label:"Count"},{key:"severity",label:"Severity"}]}/><h4 className="mb-2 mt-4 font-bold">Repaired data preview</h4><Table rows={repairResult.preview} columns={Object.keys(repairResult.preview?.[0]||{}).slice(0,8).map(c=>({key:c,label:c}))}/><div className="mt-4 flex flex-wrap gap-2"><a className="btn btn-primary no-underline" href={repairedUrl}><ArrowDownToLine size={16}/>Download repaired CSV</a><a className="btn btn-secondary no-underline" href={reportUrl}><FileCheck2 size={16}/>Download report</a></div></section>}</div>}
//  {tab==="ML readiness"&&<section className="card p-5"><div className="mb-4 flex items-center gap-2"><Gauge className="text-blue-700"/><h3 className="font-bold">ML-readiness assessment</h3></div>{analysis?<><div className="grid gap-3 sm:grid-cols-2"><Metric icon={AlertTriangle} label="Missing cell percentage" value={`${analysis.ml_readiness?.missing_cell_percent}%`}/><Metric icon={Database} label="Exact duplicate rows" value={analysis.ml_readiness?.duplicate_rows}/></div><h4 className="mb-3 mt-5 font-bold">Readiness warnings</h4>{analysis.ml_readiness?.warnings?.map((w,i)=><div key={i} className="mb-2 flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm"><CircleHelp size={17} className="shrink-0 text-amber-700"/>{w}</div>)}<p className="mt-3 text-xs text-slate-500">{analysis.ml_readiness?.note}</p></>:<p className="text-sm text-slate-500">Run analysis to assess basic ML-readiness risks.</p>}</section>}
//  </>}</section></div><footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500"><span>DataSleuth · Transparent checks · Human-approved repairs</span><span className="flex items-center gap-1"><ShieldCheck size={14}/>Original dataset preserved</span></footer></main></div>
// }



import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  SearchCheck,
  ArrowDownToLine,
  BookOpen,
  CheckCircle2,
  Database,
  FileCheck2,
  FileUp,
  Gauge,
  LoaderCircle,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  analyze,
  loadSample,
  repair,
  reportUrl,
  repairedUrl,
  uploadCsv,
} from "./api";

const cx = (...values) => values.filter(Boolean).join(" ");

function Metric({ icon: Icon, label, value, note }) {
  return (
    <div className="card ds-metric-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="rounded-xl bg-blue-50 p-2 text-blue-700">
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-3 text-3xl font-extrabold text-slate-900">
        {value ?? "—"}
      </div>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
    </div>
  );
}

function Table({ rows, columns }) {
  if (!rows?.length) {
    return (
      <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
        Nothing to show yet.
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [dataset, setDataset] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [repairResult, setRepairResult] = useState(null);

  const [file, setFile] = useState(null);
  const [rules, setRules] = useState("");
  const [target, setTarget] = useState("");

  const [tab, setTab] = useState("Overview");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selected, setSelected] = useState([]);
  const [investigationChoice, setInvestigationChoice] = useState("");

  // Manual repair state
  const [manualChoices, setManualChoices] = useState({});
  const [manualValues, setManualValues] = useState({});
  const [manualConfirmed, setManualConfirmed] = useState({});

  const profile = dataset?.profile;
  const issues = analysis?.issues || [];
  const plans = analysis?.repair_plan || [];

  const safePlans = plans.filter(
    (plan) => plan.automatic === true
  );

  const missingChart = useMemo(
    () =>
      Object.entries(profile?.missing_by_column || {})
        .filter(([, count]) => count > 0)
        .map(([name, missing]) => ({ name, missing })),
    [profile]
  );

  const severityChart = useMemo(() => [
    { name: "High", value: issues.filter((item) => item.severity === "High").length, color: "#ff6b8a" },
    { name: "Medium", value: issues.filter((item) => item.severity === "Medium").length, color: "#f4bd62" },
    { name: "Low", value: issues.filter((item) => item.severity === "Low").length, color: "#4fd1c5" },
  ].filter((item) => item.value > 0), [issues]);

  const qualityScore = useMemo(() => {
    if (!profile || !profile.rows || !profile.columns) return null;
    const totalCells = profile.rows * profile.columns;
    const missingRatio = totalCells ? (profile.missing_cells || 0) / totalCells : 0;
    const duplicateRatio = profile.rows ? (profile.duplicate_rows || 0) / profile.rows : 0;
    return Math.max(0, Math.round(100 * (1 - Math.min(1, missingRatio + duplicateRatio))));
  }, [profile]);

  async function perform(label, action) {
    setBusy(label);
    setError("");
    setNotice("");

    try {
      return await action();
    } catch (exception) {
      setError(
        exception?.response?.data?.detail ||
          exception.message ||
          "Something went wrong."
      );
      return null;
    } finally {
      setBusy("");
    }
  }

  function resetRepairDecisions() {
    setSelected([]);
    setManualChoices({});
    setManualValues({});
    setManualConfirmed({});
    setRepairResult(null);
  }

  async function useSample() {
    const result = await perform("Loading sample…", loadSample);

    if (result) {
      setDataset(result);
      setAnalysis(null);
      resetRepairDecisions();
      setInvestigationChoice("");
      setTab("Overview");
    }
  }

  async function upload() {
    if (!file) return;

    const result = await perform(
      "Uploading…",
      () => uploadCsv(file)
    );

    if (result) {
      setDataset(result);
      setAnalysis(null);
      resetRepairDecisions();
      setInvestigationChoice("");
      setTab("Overview");
    }
  }

  async function runAnalysis() {
    const result = await perform("Analyzing…", () =>
      analyze({
        business_rules: rules,
        target_column: target || null,
      })
    );

    if (result) {
      setAnalysis(result);
      resetRepairDecisions();

      const first = result.issues?.[0];
      setInvestigationChoice(
        first ? `${first.issue}::${first.column}` : ""
      );

      setTab("Findings");
    }
  }

  async function investigateSelected() {
    const finding = issues.find(
      (issue) =>
        `${issue.issue}::${issue.column}` === investigationChoice
    );

    if (!finding) {
      setError("Select a valid finding to investigate.");
      return;
    }

    const result = await perform("Investigating…", () =>
      analyze({
        business_rules: rules,
        target_column: target || null,
        selected_issue: finding,
      })
    );

    if (result?.investigation) {
      setAnalysis(result);
      setRepairResult(null);
      setTab("Investigation");

      setNotice(
        result.investigation.model_note ||
          "Investigation completed."
      );
    } else if (result) {
      setError("The response did not contain an investigation result.");
    }
  }

  function chooseManualAction(column, action) {
    setManualChoices((old) => ({
      ...old,
      [column]: action,
    }));

    setManualConfirmed((old) => ({
      ...old,
      [column]: false,
    }));

    setError("");
  }

  async function applyRepair() {
    const automaticActions = safePlans
      .filter((plan) =>
        selected.includes(`${plan.action}::${plan.column}`)
      )
      .map((plan) => ({
        action: plan.action,
        column: plan.column,
        confirmed: true,
      }));

    const manualActions = [];

    for (const [column, action] of Object.entries(manualChoices)) {
      if (!action || !manualConfirmed[column]) continue;

      const payload = {
        action,
        column,
        confirmed: true,
      };

      if (
        action === "Fill missing with business value" ||
        action === "Correct negative quantity"
      ) {
        const rawValue = manualValues[column]?.trim();

        if (!rawValue) {
          setError(
            `Enter a verified replacement value for '${column}'.`
          );
          return;
        }

        payload.value = rawValue;
      }

      manualActions.push(payload);
    }

    const actions = [
      ...automaticActions,
      ...manualActions,
    ];

    if (!actions.length) {
      setError(
        "Select an automatic repair or choose and confirm a manual decision."
      );
      return;
    }

    // Do not apply conflicting decisions to the same column.
    const columns = actions.map((action) => action.column);
    if (new Set(columns).size !== columns.length) {
      setError(
        "Choose only one repair action per column in each batch."
      );
      return;
    }

    const result = await perform(
      "Repairing…",
      () => repair(actions)
    );

    if (result) {
      setRepairResult(result);
      setTab("Repair & verify");
      setNotice("Repair request completed. Review the verification results.");
    }
  }

  const tabs = [
    "Overview",
    "Findings",
    "Investigation",
    "Repair & verify",
    "ML readiness",
  ];

  const previewCols = Object.keys(
    dataset?.preview?.[0] || {}
  )
    .slice(0, 8)
    .map((column) => ({
      key: column,
      label: column,
    }));

  // Build one manual-decision control per affected column.
  const manualGroups = useMemo(() => {
    const groups = new Map();

    for (const plan of plans) {
      if (plan.automatic || plan.action === "Manual review") continue;

      if (!groups.has(plan.column)) {
        groups.set(plan.column, []);
      }

      groups.get(plan.column).push(plan);
    }

    return Array.from(groups.entries()).map(
      ([column, options]) => ({
        column,
        options,
      })
    );
  }, [plans]);

  return (
    <div className="min-h-screen">
      <header className="ds-topbar">
        <div className="ds-brand">
          <div className="ds-brand-mark"><ScanSearch size={21} /></div>
          <div>
            <div className="ds-brand-name">DataSleuth</div>
            <div className="ds-brand-subtitle">Data quality intelligence</div>
          </div>
        </div>
        <div className="ds-topbar-right">
          <span className="ds-live-dot" />
          <span>{dataset ? dataset.filename : "Workspace ready"}</span>
          <span className="ds-topbar-divider" />
          <span className="ds-workspace-label">LOCAL WORKSPACE</span>
        </div>
      </header>

      <main className="ds-main mx-auto max-w-[1600px] px-5 py-5 lg:px-7">
        <div className="grid gap-5 lg:grid-cols-[238px_minmax(0,1fr)]">
          <aside className="ds-sidebar space-y-4">
            <section className="card ds-nav-card p-3">
              <div className="ds-section-label">WORKSPACE</div>
              {[
                { name: "Overview", icon: LayoutDashboard },
                { name: "Findings", icon: SearchCheck },
                { name: "Investigation", icon: Sparkles },
                { name: "Repair & verify", icon: Wrench },
                { name: "ML readiness", icon: Gauge },
              ].map(({ name, icon: NavIcon }) => (
                <button
                  key={name}
                  className={cx("ds-nav-item", tab === name && "ds-nav-active")}
                  onClick={() => setTab(name)}
                  disabled={!dataset}
                  title={!dataset ? "Load a dataset first" : name}
                >
                  <NavIcon size={17} />
                  <span>{name}</span>
                  {tab === name && <span className="ds-nav-indicator" />}
                </button>
              ))}
              <div className="ds-nav-footnote"><Activity size={14} /> Detect · Investigate · Repair</div>
            </section>
            <section className="card p-5">
              <div className="mb-3 flex items-center gap-2 font-bold">
                <Database size={18} className="text-blue-700" />
                Your dataset
              </div>

              <label className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-blue-200 bg-blue-50/60 p-5 text-center">
                <FileUp size={24} className="mb-2 text-blue-700" />
                <span className="text-sm font-bold">
                  {file?.name || "Choose a CSV file"}
                </span>
                <span className="mt-1 text-xs text-slate-500">
                  CSV files only
                </span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) =>
                    setFile(event.target.files?.[0] || null)
                  }
                />
              </label>

              <button
                className="btn btn-primary mt-3 w-full"
                onClick={upload}
                disabled={!file || !!busy}
              >
                {busy === "Uploading…" ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <FileUp size={16} />
                )}
                Upload dataset
              </button>

              <button
                className="btn btn-secondary mt-2 w-full"
                onClick={useSample}
                disabled={!!busy}
              >
                <Sparkles size={16} />
                Load sample dataset
              </button>

              {dataset && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <b className="text-slate-800">{dataset.filename}</b>
                  <div className="mt-1">
                    {profile?.rows?.toLocaleString()} rows · {profile?.columns} columns
                  </div>
                </div>
              )}
            </section>

            <section className="card p-5">
              <div className="mb-3 flex items-center gap-2 font-bold">
                <BookOpen size={18} className="text-blue-700" />
                Business context
              </div>

              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Target column (optional)
              </label>

              <select
                className="field mb-3"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              >
                <option value="">No target selected</option>
                {(dataset?.preview?.[0]
                  ? Object.keys(dataset.preview[0])
                  : []
                ).map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>

              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Extra rules (optional)
              </label>

              <textarea
                className="field resize-y text-sm"
                rows="4"
                placeholder={"quantity must be positive\norder_id should be unique"}
                value={rules}
                onChange={(event) => setRules(event.target.value)}
              />

              <p className="mt-2 text-xs leading-5 text-slate-500">
                One rule per line. Rules provide guidance and are not executed as code.
              </p>

              <button
                className="btn btn-primary mt-3 w-full"
                onClick={runAnalysis}
                disabled={!dataset || !!busy}
              >
                {busy === "Analyzing…" ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Activity size={16} />
                )}
                Analyze dataset
              </button>
            </section>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900">
              <ShieldCheck size={17} className="mb-2" />
              <b>Human-approved changes</b>
              <br />
              Repairs operate on a separate working copy. Ambiguous values are not guessed automatically.
            </div>
          </aside>

          <section className="min-w-0 space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <XCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {notice && !error && (
              <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{notice}</span>
              </div>
            )}

            {!dataset ? (
              <div className="card ds-empty-state flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
                <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
                  <Database size={34} />
                </div>
                <h2 className="mt-5 text-2xl font-extrabold">
                  Start with your data
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Upload a CSV or load sample data to explore profiling,
                  investigation, repairs, and ML-readiness checks.
                </p>
                <button
                  className="btn btn-primary mt-5"
                  onClick={useSample}
                  disabled={!!busy}
                >
                  <Sparkles size={16} />
                  Try sample dataset
                </button>
              </div>
            ) : (
              <>
                <div className="ds-page-heading">
                  <div>
                    <div className="ds-eyebrow">DATA QUALITY WORKSPACE</div>
                    <h1>{tab === "Overview" ? "Analytics overview" : tab}</h1>
                    <p>{dataset.filename} <span>·</span> {profile?.rows?.toLocaleString()} rows <span>·</span> {profile?.columns} columns</p>
                  </div>
                  <div className="ds-score-card">
                    <div className="ds-score-ring" style={{ "--score": `${qualityScore ?? 0}%` }}>
                      <span>{qualityScore === null ? "—" : qualityScore}</span>
                    </div>
                    <div><b>Data health</b><small>Indicative profile score</small></div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric icon={Database} label="Rows" value={profile?.rows?.toLocaleString()} />
                  <Metric icon={Activity} label="Columns" value={profile?.columns} />
                  <Metric icon={AlertTriangle} label="Missing cells" value={profile?.missing_cells?.toLocaleString()} />
                  <Metric icon={RefreshCw} label="Exact duplicates" value={profile?.duplicate_rows?.toLocaleString()} />
                </div>

                <div className="card p-2">
                  <div className="flex gap-1 overflow-x-auto">
                    {tabs.map((name) => (
                      <button
                        key={name}
                        className={cx("tab", tab === name && "tab-active")}
                        onClick={() => setTab(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {tab === "Overview" && (
                  <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
                    <section className="card p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold">Dataset preview</h3>
                        <span className="text-xs text-slate-500">First 100 rows</span>
                      </div>
                      <Table rows={dataset.preview} columns={previewCols} />
                    </section>

                    <section className="card p-5">
                      <h3 className="font-bold">Missing values by column</h3>
                      <p className="mb-3 mt-1 text-xs text-slate-500">
                        A quick view of incomplete fields.
                      </p>
                      {missingChart.length ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <BarChart data={missingChart} layout="vertical" margin={{ left: 5, right: 12 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="missing" fill="#4168b2" radius={[0, 6, 6, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-800">
                          No missing values detected.
                        </div>
                      )}
                    </section>

                    <section className="card ds-chart-card p-5">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">Issue severity</h3>
                          <p className="mt-1 text-xs text-slate-500">Distribution from the latest analysis</p>
                        </div>
                        <span className="ds-chart-icon"><Activity size={17}/></span>
                      </div>
                      {analysis && severityChart.length ? (
                        <>
                          <ResponsiveContainer width="100%" height={190}>
                            <PieChart>
                              <Pie data={severityChart} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={4} stroke="none">
                                {severityChart.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="ds-legend">
                            {severityChart.map((entry) => <span key={entry.name}><i style={{background: entry.color}} />{entry.name}<b>{entry.value}</b></span>)}
                          </div>
                        </>
                      ) : (
                        <div className="ds-chart-empty"><Activity size={22}/><span>{analysis ? "No severity issues found" : "Run analysis to populate issue analytics"}</span></div>
                      )}
                    </section>

                    <section className="card p-5 xl:col-span-2">
                      <h3 className="mb-3 font-bold">Column profile</h3>
                      <Table
                        rows={profile?.column_profile}
                        columns={[
                          { key: "column", label: "Column" },
                          { key: "dtype", label: "Data type" },
                          { key: "missing", label: "Missing" },
                          { key: "unique", label: "Unique values" },
                        ]}
                      />
                    </section>
                  </div>
                )}

                {tab === "Findings" && (
                  <section className="card p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold">Quality findings</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Findings include evidence and severity.
                        </p>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={runAnalysis}
                        disabled={!!busy}
                      >
                        <RefreshCw size={15} />
                        Run analysis
                      </button>
                    </div>

                    {analysis ? (
                      <>
                        <div className="mb-4 flex flex-wrap gap-2">
                          <span className="pill bg-slate-100 text-slate-700">
                            {issues.length} findings
                          </span>
                          <span className="pill pill-high">
                            {issues.filter((item) => item.severity === "High").length} high
                          </span>
                          <span className="pill pill-medium">
                            {issues.filter((item) => item.severity === "Medium").length} medium
                          </span>
                          <span className="pill pill-low">
                            {issues.filter((item) => item.severity === "Low").length} low
                          </span>
                        </div>

                        <Table
                          rows={issues}
                          columns={[
                            { key: "issue", label: "Issue" },
                            { key: "column", label: "Column" },
                            { key: "count", label: "Count" },
                            {
                              key: "severity",
                              label: "Severity",
                              render: (value) => (
                                <span className={cx("pill", value === "High" ? "pill-high" : value === "Medium" ? "pill-medium" : "pill-low")}>
                                  {value}
                                </span>
                              ),
                            },
                            { key: "evidence", label: "Evidence" },
                          ]}
                        />

                        {!issues.length && (
                          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                            No issues detected by current checks.
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Click Analyze dataset to run the workflow.
                      </p>
                    )}
                  </section>
                )}

                {tab === "Investigation" && (
                  <div className="space-y-5">
                    <section className="card p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="text-blue-700" size={19} />
                        <h3 className="font-bold">Investigation</h3>
                      </div>

                      {analysis ? (
                        <>
                          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                            <label className="mb-2 block text-sm font-bold">
                              Choose a finding
                            </label>

                            <div className="flex flex-col gap-2 sm:flex-row">
                              <select
                                className="field min-w-0 flex-1"
                                value={investigationChoice}
                                onChange={(event) => setInvestigationChoice(event.target.value)}
                                disabled={!!busy}
                              >
                                {issues.map((issue, index) => (
                                  <option
                                    key={`${issue.issue}::${issue.column}::${index}`}
                                    value={`${issue.issue}::${issue.column}`}
                                  >
                                    {issue.issue} · {issue.column} ({issue.severity})
                                  </option>
                                ))}
                              </select>

                              <button
                                className="btn btn-primary"
                                onClick={investigateSelected}
                                disabled={!investigationChoice || !!busy}
                              >
                                {busy === "Investigating…" ? (
                                  <LoaderCircle size={16} className="animate-spin" />
                                ) : (
                                  <Sparkles size={15} />
                                )}
                                {busy === "Investigating…" ? "Investigating…" : "Investigate finding"}
                              </button>
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-4">
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Summary
                            </div>
                            <p className="mt-2 font-semibold">
                              {analysis.investigation?.issue_summary || "No investigation result yet."}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                              Confidence: {analysis.investigation?.confidence || "unknown"} · {analysis.investigation?.model_note || ""}
                            </p>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div>
                              <h4 className="mb-2 font-bold">Confirmed evidence</h4>
                              {(analysis.investigation?.confirmed_evidence || []).map((value, index) => (
                                <div key={index} className="mb-2 rounded-lg border border-slate-100 p-3 text-sm">
                                  {value}
                                </div>
                              ))}
                            </div>
                            <div>
                              <h4 className="mb-2 font-bold">Possible root causes</h4>
                              {(analysis.investigation?.possible_root_causes || []).map((value, index) => (
                                <div key={index} className="mb-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-sm">
                                  {value}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mt-4">
                            <h4 className="mb-2 font-bold">Recommended actions</h4>
                            {(analysis.investigation?.recommended_actions || []).map((value, index) => (
                              <p key={index} className="mb-2 text-sm">
                                › {value}
                              </p>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">Run analysis first.</p>
                      )}
                    </section>

                    <section className="card p-5">
                      <h3 className="mb-3 font-bold">Retrieved business rules</h3>
                      {analysis?.retrieved_rules?.length ? (
                        analysis.retrieved_rules.map((rule, index) => (
                          <div key={index} className="mb-2 flex gap-3 rounded-xl border border-slate-100 p-3">
                            <BookOpen size={17} className="mt-0.5 shrink-0 text-blue-700" />
                            <div>
                              <p className="text-sm">{rule.text}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                Source: {rule.source}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          No rules retrieved.
                        </p>
                      )}
                    </section>
                  </div>
                )}

                {tab === "Repair & verify" && (
                  <div className="space-y-5">
                    <section className="card p-5">
                      <div className="mb-2 flex items-center gap-2">
                        <Wrench size={19} className="text-blue-700" />
                        <h3 className="font-bold">Review repair plan</h3>
                      </div>

                      <p className="mb-4 text-sm text-slate-500">
                        Select automatic repairs or choose one manual decision per column. Confirm each manual decision before applying it.
                      </p>

                      {!analysis ? (
                        <p className="text-sm text-slate-500">Run analysis first.</p>
                      ) : (
                        <>
                          {safePlans.length > 0 && (
                            <div className="mb-5">
                              <h4 className="mb-3 font-bold">Automatic repairs</h4>

                              {safePlans.map((plan) => {
                                const id = `${plan.action}::${plan.column}`;

                                return (
                                  <label
                                    key={id}
                                    className="mb-2 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-1 accent-blue-700"
                                      checked={selected.includes(id)}
                                      onChange={(event) =>
                                        setSelected((old) =>
                                          event.target.checked
                                            ? [...old, id]
                                            : old.filter((item) => item !== id)
                                        )
                                      }
                                    />
                                    <div className="flex-1">
                                      <div className="font-bold">
                                        {plan.action} · {plan.column}
                                      </div>
                                      <p className="mt-1 text-sm text-slate-500">
                                        {plan.description}
                                      </p>
                                    </div>
                                    <span className="pill pill-low">{plan.risk}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {manualGroups.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="font-bold">Manual decisions</h4>

                              {manualGroups.map(({ column, options }) => {
                                const choice =
                                  manualChoices[column] || "";

                                const needsValue = [
                                  "Fill missing with business value",
                                  "Correct negative quantity",
                                ].includes(choice);

                                return (
                                  <div
                                    key={column}
                                    className="rounded-xl border border-amber-200 bg-amber-50 p-4"
                                  >
                                    <h5 className="font-bold">
                                      Review · {column}
                                    </h5>

                                    <p className="mt-1 text-sm text-slate-600">
                                      {options.find((item) => item.action === choice)?.description ||
                                        options[0]?.description}
                                    </p>

                                    <label className="mt-3 block text-sm font-semibold">
                                      Choose an action
                                    </label>

                                    <select
                                      className="field mt-1"
                                      value={choice}
                                      onChange={(event) =>
                                        chooseManualAction(column, event.target.value)
                                      }
                                      disabled={!!busy}
                                    >
                                      <option value="">Select a decision</option>
                                      {options.map((option) => (
                                        <option
                                          key={option.action}
                                          value={option.action}
                                        >
                                          {option.action}
                                        </option>
                                      ))}
                                    </select>

                                    {needsValue && (
                                      <>
                                        <label className="mt-3 block text-sm font-semibold">
                                          Verified replacement value
                                        </label>
                                        <input
                                          className="field mt-1"
                                          value={manualValues[column] ?? ""}
                                          onChange={(event) =>
                                            setManualValues((old) => ({
                                              ...old,
                                              [column]: event.target.value,
                                            }))
                                          }
                                          placeholder="Enter a justified value"
                                        />
                                        <p className="mt-1 text-xs text-slate-500">
                                          Use a verified value, not a guess. Numeric columns require numeric values.
                                        </p>
                                      </>
                                    )}

                                    <label className="mt-3 flex items-start gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        className="mt-1"
                                        checked={!!manualConfirmed[column]}
                                        onChange={(event) =>
                                          setManualConfirmed((old) => ({
                                            ...old,
                                            [column]: event.target.checked,
                                          }))
                                        }
                                        disabled={!choice || !!busy}
                                      />
                                      I reviewed this decision and approve it.
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {!safePlans.length && !manualGroups.length && (
                            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                              No repair actions are available for the current findings.
                            </p>
                          )}

                          <button
                            className="btn btn-primary mt-5"
                            disabled={!!busy}
                            onClick={applyRepair}
                          >
                            {busy === "Repairing…" ? (
                              <LoaderCircle size={16} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                            Approve and apply selected repairs
                          </button>
                        </>
                      )}
                    </section>

                    {repairResult && (
                      <section className="card p-5">
                        <div className="mb-4 flex items-center gap-2">
                          {repairResult.verification?.passed ? (
                            <CheckCircle2 className="text-emerald-600" />
                          ) : (
                            <AlertTriangle className="text-amber-600" />
                          )}
                          <h3 className="font-bold">Verification result</h3>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <Metric
                            icon={Database}
                            label="Rows after"
                            value={repairResult.profile?.rows}
                          />
                          <Metric
                            icon={AlertTriangle}
                            label="Issue types"
                            value={`${repairResult.verification?.issues_before ?? "—"} → ${repairResult.verification?.issues_after ?? "—"}`}
                          />
                          <Metric
                            icon={ShieldCheck}
                            label="Execution status"
                            value={repairResult.verification?.passed ? "Completed" : "Review"}
                          />
                        </div>

                        <div className="my-4 space-y-2">
                          {(repairResult.repair_log || []).map((line, index) => (
                            <p key={index} className="text-sm text-slate-600">
                              • {line}
                            </p>
                          ))}
                        </div>

                        <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                          Completion does not guarantee that every issue is resolved. Review the remaining findings and compare the data before and after repair.
                        </p>

                        <h4 className="mb-2 font-bold">Remaining issues</h4>
                        <Table
                          rows={repairResult.issues_after}
                          columns={[
                            { key: "issue", label: "Issue" },
                            { key: "column", label: "Column" },
                            { key: "count", label: "Count" },
                            { key: "severity", label: "Severity" },
                          ]}
                        />

                        <h4 className="mb-2 mt-4 font-bold">Repaired data preview</h4>
                        <Table
                          rows={repairResult.preview}
                          columns={Object.keys(repairResult.preview?.[0] || {})
                            .slice(0, 8)
                            .map((column) => ({
                              key: column,
                              label: column,
                            }))}
                        />

                        <div className="mt-4 flex flex-wrap gap-2">
                          <a className="btn btn-primary no-underline" href={repairedUrl}>
                            <ArrowDownToLine size={16} />
                            Download repaired CSV
                          </a>
                          <a className="btn btn-secondary no-underline" href={reportUrl}>
                            <FileCheck2 size={16} />
                            Download report
                          </a>
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {tab === "ML readiness" && (
                  <section className="card p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Gauge className="text-blue-700" />
                      <h3 className="font-bold">ML-readiness assessment</h3>
                    </div>

                    {analysis ? (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Metric
                            icon={AlertTriangle}
                            label="Missing cell percentage"
                            value={`${analysis.ml_readiness?.missing_percent ?? 0}%`}
                          />
                          <Metric
                            icon={Database}
                            label="Exact duplicate rows"
                            value={analysis.ml_readiness?.duplicate_rows ?? 0}
                          />
                        </div>

                        <h4 className="mb-3 mt-5 font-bold">Readiness warnings</h4>
                        {(analysis.ml_readiness?.issues || []).map((warning, index) => (
                          <div key={index} className="mb-2 flex gap-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm">
                            <AlertTriangle size={17} className="shrink-0 text-amber-700" />
                            {warning}
                          </div>
                        ))}

                        <div className="mt-3 text-xs text-slate-500">
                          Readiness score: {analysis.ml_readiness?.score ?? "—"} · {analysis.ml_readiness?.status ?? "Not assessed"}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">
                        Run analysis to assess ML readiness.
                      </p>
                    )}
                  </section>
                )}
              </>
            )}
          </section>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-500">
          <span>DataSleuth · Transparent checks · Human-approved repairs</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} />
            Original dataset preserved
          </span>
        </footer>
      </main>
    </div>
  );
}
