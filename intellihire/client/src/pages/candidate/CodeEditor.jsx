import { useState, useEffect } from "react";
import api from "../../api/axios";
import { problems } from "../../data/problems";

const LANGS = [
 { v: "javascript", l: "JavaScript" },
 { v: "python", l: "Python" },
 { v: "java", l: "Java" },
 { v: "cpp", l: "C++" }
];

const STARTER = {
 javascript: "// Write code\nconsole.log('Hello IntelliHire');",
 python: "# Write code\nprint('Hello IntelliHire')",
 java: `public class Main {
 public static void main(String[] args){
  System.out.println("Hello IntelliHire");
 }
}`,
 cpp: `#include<iostream>
 using namespace std;
 int main(){
 cout<<"Hello IntelliHire";
 return 0;
 }`
};

export default function CodeEditor() {

 const [lang,setLang] = useState("javascript");
 const [code,setCode] = useState(STARTER.javascript);
 const [result,setResult] = useState(null);
 const [error,setError] = useState("");
 const [activeTC,setActiveTC] = useState(0);
 const [submitting,setSubmitting] = useState(false);

 const problem = problems[0];
 const tc = problem.testCases;

 useEffect(()=>{
  setCode(STARTER[lang]);
 },[lang]);

 /* RUN SINGLE TEST CASE */

 const handleRun = async ()=>{

  if(!code.trim()){
   setError("Write code before running");
   return;
  }

  setSubmitting(true);
  setError("");
  setResult(null);

  try{

   const stdin = tc[activeTC]?.input || "";

   const res = await api.post("/code/submit",{
    language:lang,
    sourceCode:code,
    stdin
   });

   const token = res.data.data.judge0Token;

   const r = await api.get(`/code/result/${token}`);

   setResult(r.data.data);

  }catch(err){

   setError("Run failed");

  }

  setSubmitting(false);
 };

 /* SUBMIT ALL TEST CASES */

 const handleSubmit = async ()=>{

  if(!code.trim()){
   setError("Please write code before submitting");
   return;
  }

  setSubmitting(true);
  setError("");
  setResult(null);

  try{

   let passed = 0;
   let total = tc.length;

   for(let i=0;i<tc.length;i++){

    const stdin = tc[i].input;
    const expected = tc[i].expected;

    const res = await api.post("/code/submit",{
     language:lang,
     sourceCode:code,
     stdin,
     expectedOutput:expected
    });

    const token = res.data.data.judge0Token;

    const r = await api.get(`/code/result/${token}`);

    const data = r.data.data;

    if(data.status === "accepted"){
     passed++;
    }

   }

   const score = Math.round((passed/total)*100);

   setResult({
    status: passed===total ? "accepted" : "wrong answer",
    score,
    passed,
    total
   });

  }catch(err){

   setError("Submission failed");

  }

  setSubmitting(false);
 };

 return (

 <div style={{display:"flex",height:"100vh"}}>

 {/* LEFT SIDE PROBLEM */}

 <div style={{width:"40%",padding:"20px",overflow:"auto"}}>

 <h2>{problem.title}</h2>

 <p>{problem.desc}</p>

 <h4>Test Cases</h4>

 {tc.map((t,i)=>(
  <button
  key={i}
  onClick={()=>setActiveTC(i)}
  style={{
   padding:"6px",
   margin:"5px",
   background:activeTC===i?"#4f46e5":"#ddd"
  }}
  >
  Case {i+1}
  </button>
 ))}

 <pre>Input: {tc[activeTC].input}</pre>
 <pre>Expected: {tc[activeTC].expected}</pre>

 </div>

 {/* RIGHT SIDE EDITOR */}

 <div style={{width:"60%",display:"flex",flexDirection:"column"}}>

 <div style={{padding:"10px"}}>

 <select
 value={lang}
 onChange={(e)=>setLang(e.target.value)}
 >
 {LANGS.map(l=>(
  <option key={l.v} value={l.v}>
   {l.l}
  </option>
 ))}
 </select>

 <button onClick={handleRun} disabled={submitting}>
 Run
 </button>

 <button onClick={handleSubmit} disabled={submitting}>
 Submit
 </button>

 </div>

 {/* EDITOR */}

 <textarea
 value={code}
 onChange={(e)=>setCode(e.target.value)}
 style={{
  flex:1,
  fontFamily:"monospace",
  fontSize:"14px",
  padding:"10px"
 }}
 />

 {/* RESULT */}

 <div style={{padding:"10px",background:"#111",color:"#0f0"}}>

 {error && <p style={{color:"red"}}>{error}</p>}

 {result && (

 <>
 <p>Status: {result.status}</p>

 {result.score !== undefined && (
 <p>
 Passed {result.passed}/{result.total}
 Score {result.score}%
 </p>
 )}

 {result.stdout && <pre>{result.stdout}</pre>}
 {result.stderr && <pre>{result.stderr}</pre>}
 </>

 )}

 </div>

 </div>

 </div>
 );
}
