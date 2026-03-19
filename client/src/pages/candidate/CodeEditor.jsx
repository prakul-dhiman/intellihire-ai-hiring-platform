import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineChevronLeft, HiOutlinePlay, HiOutlineShieldCheck, HiOutlineTerminal, HiOutlineInformationCircle, HiOutlineChevronRight } from "react-icons/hi";
import api from "../../api/axios";
import { problems } from "../../data/problems";
import { PageTransition } from "../../components/Motion";

const LANG_CONFIGS = {
  javascript: { label: "JavaScript", monaco: "javascript", id: 63, starter: "// Two Sum Example\nfunction solve(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n}" },
  python: { label: "Python 3", monaco: "python", id: 71, starter: "# Two Sum Example\ndef solve(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i" },
  java: { label: "Java 17", monaco: "java", id: 91, starter: "import java.util.*;\n\npublic class Solution {\n    public int[] solve(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) return new int[] { map.get(diff), i };\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}" }
};

const THEME = {
  bg: "#0a0c10",
  sidebar: "#0d1117",
  border: "rgba(255,255,255,0.08)",
  accent: "#6366f1",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b"
};

export default function CodeEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find problem or default to first
  const problem = problems.find(p => p.id === parseInt(id)) || problems[0];
  const [lang, setLang] = useState("javascript");
  const [code, setCode] = useState(LANG_CONFIGS.javascript.starter);
  const [activeTab, setActiveTab] = useState("description"); // description, console
  const [activeCase, setActiveCase] = useState(0);
  const [results, setResults] = useState([]); // Array of results for test cases
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalStatus, setGlobalStatus] = useState(null); // 'running', 'success', 'failed'
  
  const timerRef = useRef(null);

  useEffect(() => {
    setCode(LANG_CONFIGS[lang].starter);
  }, [lang]);

  const pollForResult = async (token, index) => {
    try {
      const res = await api.get(`/code/result/${token}`);
      const data = res.data.data;

      if (data.status === "pending") {
        // Still processing, check again in 1s
        return new Promise(resolve => {
          setTimeout(() => resolve(pollForResult(token, index)), 1500);
        });
      }

      return { ...data, index };
    } catch (err) {
      return { status: "error", error: "System check failed", index };
    }
  };

  const handleRun = async (isFinalSubmit = false) => {
    setIsSubmitting(true);
    setGlobalStatus("running");
    setActiveTab("console");
    
    // Reset individual results
    const initialResults = problem.testCases.map((_, i) => ({ status: "pending", index: i }));
    setResults(initialResults);

    try {
      // Step 1: Submit all test cases in parallel
      const submissionPromises = problem.testCases.map(async (tc, i) => {
        const res = await api.post("/code/submit", {
          language: lang,
          sourceCode: code,
          stdin: tc.input,
          questionId: problem.id
        });
        return { token: res.data.data.judge0Token, index: i };
      });

      const tokens = await Promise.all(submissionPromises);

      // Step 2: Poll for all results in parallel
      const resultPromises = tokens.map(t => pollForResult(t.token, t.index));
      const finalResults = await Promise.all(resultPromises);

      setResults(finalResults);
      
      const allPassed = finalResults.every(r => r.status === "accepted");
      setGlobalStatus(allPassed ? "success" : "failed");

    } catch (err) {
      setGlobalStatus("failed");
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div style={{ display: "flex", height: "100vh", backgroundColor: THEME.bg, color: "#e6edf3", overflow: "hidden" }}>
        
        {/* LEFT SIDEBAR - PROBLEM DESC */}
        <div style={{ width: "450px", borderRight: `1px solid ${THEME.border}`, background: THEME.sidebar, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${THEME.border}` }}>
            <Link to="/candidate/code" style={{ color: "#8b949e", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
              <HiOutlineChevronLeft size={18} /> Problem List
            </Link>
            <div style={{ fontSize: "12px", fontWeight: 600, color: problem.d === 'Easy' ? THEME.success : problem.d === 'Medium' ? THEME.warning : THEME.error, backgroundColor: `${problem.d === 'Easy' ? THEME.success : problem.d === 'Medium' ? THEME.warning : THEME.error}15`, padding: "2px 8px", borderRadius: "10px" }}>
              {problem.d}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: "flex", padding: "8px 20px", borderBottom: `1px solid ${THEME.border}`, gap: "24px" }}>
            {["description", "console"].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                style={{ background: "none", border: "none", color: activeTab === tab ? "#fff" : "#8b949e", padding: "8px 0", fontSize: "14px", fontWeight: 600, cursor: "pointer", borderBottom: activeTab === tab ? `2px solid ${THEME.accent}` : "2px solid transparent", transition: "all 0.2s" }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>
            <AnimatePresence mode="wait">
              {activeTab === "description" ? (
                <motion.div key="desc" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px" }}>{problem.id}. {problem.title}</h1>
                  <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#d1d5db" }}>
                    <p style={{ whiteSpace: "pre-wrap" }}>{problem.desc}</p>
                    
                    <h4 style={{ marginTop: "24px", color: "#fff" }}>Examples</h4>
                    {problem.examples && problem.examples.map((ex, i) => (
                      <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "8px", marginTop: "12px", border: `1px solid ${THEME.border}` }}>
                        <div style={{ fontSize: "13px", color: "#8b949e", marginBottom: "4px" }}>Input:</div>
                        <code style={{ fontSize: "14px", color: THEME.accent }}>{ex.input}</code>
                        <div style={{ fontSize: "13px", color: "#8b949e", marginTop: "8px", marginBottom: "4px" }}>Output:</div>
                        <code style={{ fontSize: "14px", color: THEME.success }}>{ex.output}</code>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="console" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <HiOutlineTerminal size={20} /> Test Results
                  </h3>
                  
                  {results.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b" }}>
                      <HiOutlineInformationCircle size={32} style={{ marginBottom: "12px" }} />
                      <p>Run your code to see results here</p>
                    </div>
                  ) : (
                    <div>
                      {/* Case Tabs */}
                      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                        {results.map((r, i) => (
                          <button key={i} onClick={() => setActiveCase(i)} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: "1px solid", cursor: "pointer", transition: "all 0.2s", borderColor: activeCase === i ? (r.status === 'accepted' ? THEME.success : r.status === 'pending' ? THEME.accent : THEME.error) : THEME.border, background: activeCase === i ? (r.status === 'accepted' ? `${THEME.success}20` : r.status === 'pending' ? `${THEME.accent}20` : `${THEME.error}20`) : "transparent", color: r.status === 'accepted' ? THEME.success : r.status === 'pending' ? "#fff" : THEME.error }}>
                            Case {i + 1}
                          </button>
                        ))}
                      </div>

                      {/* Case Detail */}
                      <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${THEME.border}`, borderRadius: "10px", padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                          <span style={{ fontSize: "13px", color: "#8b949e" }}>Status:</span>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: results[activeCase].status === 'accepted' ? THEME.success : THEME.error, textTransform: "uppercase" }}>{results[activeCase].status}</span>
                        </div>
                        
                        <div style={{ marginBottom: "12px" }}>
                          <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Input</label>
                          <pre style={{ margin: 0, padding: "8px", background: "#000", borderRadius: "6px", fontSize: "13px", color: "#d1d5db" }}>{problem.testCases[activeCase].input}</pre>
                        </div>

                        {results[activeCase].actualOutput !== undefined && (
                          <div style={{ marginBottom: "12px" }}>
                            <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Output</label>
                            <pre style={{ margin: 0, padding: "8px", background: "#1a1c23", borderRadius: "6px", fontSize: "13px", color: results[activeCase].status === 'accepted' ? THEME.success : THEME.error }}>
                              {results[activeCase].actualOutput || "no output"}
                            </pre>
                          </div>
                        )}

                        <div>
                          <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "4px" }}>Expected</label>
                          <pre style={{ margin: 0, padding: "8px", background: "#000", borderRadius: "6px", fontSize: "13px", color: THEME.success }}>{problem.testCases[activeCase].expected}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT EDITOR PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Editor Header */}
          <div style={{ height: "55px", borderBottom: `1px solid ${THEME.border}`, background: THEME.bg, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                style={{ background: "#1a1d23", border: `1px solid ${THEME.border}`, color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", outline: "none" }}
              >
                {Object.keys(LANG_CONFIGS).map(k => <option key={k} value={k}>{LANG_CONFIGS[k].label}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => handleRun(false)} 
                disabled={isSubmitting} 
                className="btn-secondary" 
                style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", padding: "8px 16px", borderRadius: "8px" }}
              >
                {isSubmitting && globalStatus === 'running' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 14, height: 14, border: "2px solid #ccc", borderTopColor: "transparent", borderRadius: "50%" }} /> : <HiOutlinePlay size={18} />}
                Run Code
              </button>
              <button 
                onClick={() => handleRun(true)} 
                disabled={isSubmitting} 
                className="btn-primary" 
                style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", padding: "8px 20px", borderRadius: "8px" }}
              >
                <HiOutlineShieldCheck size={18} />
                Submit Solution
              </button>
            </div>
          </div>

          {/* MONACO EDITOR */}
          <div style={{ flex: 1, position: "relative" }}>
            <Editor
              height="100%"
              language={LANG_CONFIGS[lang].monaco}
              value={code}
              theme="vs-dark"
              onChange={(v) => setCode(v)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 },
                fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
                lineNumbers: "on",
                guides: { indentation: true },
                bracketPairColorization: { enabled: true }
              }}
            />
            
            {/* Overlay for Global Status */}
            <AnimatePresence>
              {globalStatus && globalStatus !== 'running' && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                  style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: "12px", background: globalStatus === 'success' ? THEME.success : THEME.error, color: "#fff", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", zIndex: 10 }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>
                    {globalStatus === 'success' ? "All Test Cases Passed! 🎉" : "Some Test Cases Failed. Keep refining!"}
                  </span>
                  <button onClick={() => setGlobalStatus(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "12px", opacity: 0.8 }}>Dismiss</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
