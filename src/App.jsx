import { useState, useEffect, useCallback, useRef } from "react";

// ─── Color Palette ───────────────────────────────────────────────────
const C = { primary: "#2C4A44", secondary: "#99A799", bg: "#FAF9F6", accent: "#C27B66", surface: "#F1EFE7", success: "#708238", alert: "#D6AD60", textPrimary: "#1E2322", textSecondary: "#6B7270" };

// ─── Constants ───────────────────────────────────────────────────────
const DEFAULT_BUDGET = 0;
const DEFAULT_INCOME = 0;
const TODAY = new Date();
const DAYS_IN_MONTH = new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, 0).getDate();
const CURRENT_DAY = TODAY.getDate();
const REMAINING_DAYS = DAYS_IN_MONTH - CURRENT_DAY + 1;
const MONTH_NAME = TODAY.toLocaleString("default", { month: "long" });
const RECURRING_OPTIONS = ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Yearly", "Custom"];
const CATEGORY_COLORS = [C.accent, C.primary, C.secondary, C.success, C.alert, "#8B6B5B", "#5B7B6B", "#7B6B8B", "#6B8B7B", C.textSecondary];
const CATEGORY_ICONS = ["🍜","🚗","🛍","🎬","💪","📦","🏠","🎓","💼","🎮","✈️","🐾","💊","🎁","☕"];

const INIT = {
  categories: [{ name:"Food & Drink",icon:"🍜",color:"#C27B66",budget:0 },{ name:"Transport",icon:"🚗",color:"#2C4A44",budget:0 },{ name:"Shopping",icon:"🛍",color:"#99A799",budget:0 },{ name:"Entertainment",icon:"🎬",color:"#708238",budget:0 },{ name:"Health",icon:"💪",color:"#D6AD60",budget:0 },{ name:"Other",icon:"📦",color:"#6B7270",budget:0 }],
  bills: [],
  events: [],
  transactions: [],
  incomeEntries: [],
  recurringIncome: [],
};

const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const getCatMeta = (name, cats) => cats.find((c) => c.name === name) || cats[cats.length - 1] || { name: "Other", icon: "📦", color: C.textSecondary };

// ─── localStorage helpers ────────────────────────────────────────────
const LS_KEY = "fluid_app_data";
const loadState = () => { try { const d = JSON.parse(localStorage.getItem(LS_KEY)); return d || null; } catch { return null; } };
const saveState = (data) => { try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {} };
const LS_AUTH = "fluid_auth";
const loadAuth = () => { try { return JSON.parse(localStorage.getItem(LS_AUTH)); } catch { return null; } };
const saveAuth = (d) => { try { localStorage.setItem(LS_AUTH, JSON.stringify(d)); } catch {} };

// ═════════════════════════════════════════════════════════════════════
// ROOT APP
// ═════════════════════════════════════════════════════════════════════
export default function FluidRoot() {
  const [auth, setAuth] = useState(() => loadAuth());
  const handleLogin = (user) => { saveAuth(user); setAuth(user); };
  const handleLogout = () => { localStorage.removeItem(LS_AUTH); setAuth(null); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{globalCSS}</style>
      {auth ? <FluidApp user={auth} onLogout={handleLogout} onUpdateUser={(u) => { saveAuth(u); setAuth(u); }} /> : <AuthScreen onLogin={handleLogin} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// AUTH SCREENS (Mocked)
// ═════════════════════════════════════════════════════════════════════
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const inputStyle = { width: "100%", background: C.surface, border: `1px solid ${C.secondary}25`, borderRadius: 12, padding: "14px 16px", color: C.textPrimary, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 12 };
  const btnStyle = (active) => ({ width: "100%", padding: "15px", borderRadius: 12, border: "none", cursor: "pointer", background: active ? C.accent : `${C.secondary}20`, color: active ? "#fff" : C.textSecondary, fontSize: 15, fontWeight: 700, letterSpacing: .3 });

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "60px 24px 40px", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: C.primary, fontFamily: "'DM Serif Display', Georgia, serif", letterSpacing: -1 }}>Fluid</div>
        <div style={{ fontSize: 14, color: C.textSecondary, marginTop: 4 }}>Mindful Spending</div>
      </div>

      {mode === "login" && (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" style={inputStyle} />
          <button onClick={() => { if (email && pass) onLogin({ email, name: email.split("@")[0], createdAt: new Date().toISOString() }); }} style={btnStyle(email && pass)}>
            Sign In
          </button>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.textSecondary }}>
            <span onClick={() => setMode("forgot")} style={{ color: C.accent, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: C.textSecondary }}>
            Don't have an account? <span onClick={() => setMode("signup")} style={{ color: C.primary, cursor: "pointer", fontWeight: 600 }}>Sign Up</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 20, padding: "10px 16px", borderRadius: 10, background: `${C.alert}10`, border: `1px solid ${C.alert}20`, fontSize: 11, color: C.alert }}>
            Authentication coming soon. Enter any email & password to preview the app.
          </div>
        </div>
      )}

      {mode === "signup" && (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={inputStyle} />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
          <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" type="password" style={inputStyle} />
          <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm Password" type="password" style={inputStyle} />
          <button onClick={() => { if (name && email && pass && pass === confirmPass) onLogin({ email, name, createdAt: new Date().toISOString() }); }} style={btnStyle(name && email && pass && pass === confirmPass)}>
            Create Account
          </button>
          {pass && confirmPass && pass !== confirmPass && <div style={{ fontSize: 11, color: C.accent, marginTop: 8 }}>Passwords do not match</div>}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.textSecondary }}>
            Already have an account? <span onClick={() => setMode("login")} style={{ color: C.primary, cursor: "pointer", fontWeight: 600 }}>Sign In</span>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, padding: "10px 16px", borderRadius: 10, background: `${C.alert}10`, border: `1px solid ${C.alert}20`, fontSize: 11, color: C.alert }}>
            Account creation coming soon. This is a preview.
          </div>
        </div>
      )}

      {mode === "forgot" && (
        <div style={{ animation: "fadeIn .3s ease" }}>
          {!resetSent ? (
            <>
              <div style={{ fontSize: 13, color: C.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>Enter your email and we'll send you a link to reset your password.</div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
              <button onClick={() => { if (email) setResetSent(true); }} style={btnStyle(!!email)}>Send Reset Link</button>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📧</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, marginBottom: 8, fontFamily: "'DM Serif Display', Georgia, serif" }}>Check Your Email</div>
              <div style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.5 }}>We sent a password reset link to <strong>{email}</strong>. This feature is coming soon.</div>
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: C.textSecondary }}>
            <span onClick={() => { setMode("login"); setResetSent(false); }} style={{ color: C.primary, cursor: "pointer", fontWeight: 600 }}>Back to Sign In</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// ACCOUNT SCREEN
// ═════════════════════════════════════════════════════════════════════
function AccountScreen({ user, onClose, onLogout, onUpdateUser }) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassChange, setShowPassChange] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; setDeferredPrompt(null); }
  };

  const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.secondary}25`, borderRadius: 10, padding: "12px 14px", color: C.textPrimary, fontSize: 13, outline: "none", boxSizing: "border-box", marginBottom: 10 };

  return (
    <div style={{ position: "fixed", inset: 0, background: C.bg, zIndex: 300, overflow: "auto", animation: "fadeIn .2s ease" }}>
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "20px 20px 40px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: C.textSecondary, padding: "4px 0" }}>←</button>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, fontFamily: "'DM Serif Display', Georgia, serif" }}>Account</div>
        </div>

        {/* Profile Card */}
        <div style={{ padding: 20, borderRadius: 16, background: C.surface, border: `1px solid ${C.secondary}20`, marginBottom: 16, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: C.bg, margin: "0 auto 10px" }}>
            {(user.name || "U")[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{user.name}</div>
          <div style={{ fontSize: 12, color: C.textSecondary }}>{user.email}</div>
          <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 4 }}>Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
        </div>

        {/* Install App */}
        <button onClick={handleInstall} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: `${C.primary}10`, border: `1px solid ${C.primary}20`, color: C.primary, fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>📲</span> Add to Home Screen
        </button>
        <div style={{ fontSize: 10, color: C.textSecondary, textAlign: "center", marginBottom: 16 }}>
          Install Fluid for a full-screen app experience
        </div>

        {/* Change Password */}
        <div style={{ padding: 16, borderRadius: 14, background: C.surface, border: `1px solid ${C.secondary}20`, marginBottom: 12 }}>
          <button onClick={() => { setShowPassChange(!showPassChange); setPassSaved(false); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Change Password</span>
            <span style={{ fontSize: 14, color: C.textSecondary, transform: showPassChange ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s ease" }}>▸</span>
          </button>
          {showPassChange && (
            <div style={{ marginTop: 12, animation: "fadeIn .2s ease" }}>
              <input value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="Current password" type="password" style={inputStyle} />
              <input value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password" type="password" style={inputStyle} />
              <input value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm new password" type="password" style={inputStyle} />
              {newPass && confirmPass && newPass !== confirmPass && <div style={{ fontSize: 11, color: C.accent, marginBottom: 8 }}>Passwords do not match</div>}
              <button onClick={() => { if (currentPass && newPass && newPass === confirmPass) { setPassSaved(true); setCurrentPass(""); setNewPass(""); setConfirmPass(""); } }}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", cursor: "pointer", background: (currentPass && newPass && newPass === confirmPass) ? C.accent : `${C.secondary}20`, color: (currentPass && newPass && newPass === confirmPass) ? "#fff" : C.textSecondary, fontSize: 13, fontWeight: 700 }}>
                Update Password
              </button>
              {passSaved && <div style={{ fontSize: 11, color: C.success, marginTop: 8, textAlign: "center" }}>Password updated (coming soon — this is a preview)</div>}
              <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 8, textAlign: "center" }}>Password management coming soon with cloud accounts.</div>
            </div>
          )}
        </div>

        {/* Account Type */}
        <div style={{ padding: 16, borderRadius: 14, background: C.surface, border: `1px solid ${C.secondary}20`, marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 8 }}>Account Type</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Individual</div>
          <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 4 }}>Household accounts coming soon — share expense tracking with family members.</div>
        </div>

        {/* Data Management */}
        <div style={{ padding: 16, borderRadius: 14, background: C.surface, border: `1px solid ${C.secondary}20`, marginBottom: 12 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 8 }}>Data</div>
          <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>Your data is stored locally on this device. Cloud sync will be available when accounts go live.</div>
          <button onClick={() => { if (confirm("Reset all data to defaults? This cannot be undone.")) { localStorage.removeItem(LS_KEY); window.location.reload(); } }}
            style={{ marginTop: 10, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", background: `${C.accent}12`, color: C.accent, fontSize: 11, fontWeight: 600 }}>
            Reset All Data
          </button>
        </div>

        {/* Sign Out */}
        <button onClick={onLogout} style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer", background: `${C.accent}10`, border: `1px solid ${C.accent}20`, color: C.accent, fontSize: 14, fontWeight: 700, marginTop: 8 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN APP (v4 with localStorage + account)
// ═════════════════════════════════════════════════════════════════════
function FluidApp({ user, onLogout, onUpdateUser }) {
  const saved = loadState();
  const [tab, setTab] = useState("home");
  const [transactions, setTransactions] = useState(saved?.transactions || INIT.transactions);
  const [zeroSpendToday, setZeroSpendToday] = useState(saved?.zeroSpendToday || false);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [streak, setStreak] = useState(saved?.streak ?? 0);
  const [freezes, setFreezes] = useState(saved?.freezes ?? 5);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [events, setEvents] = useState(saved?.events || INIT.events);
  const [bills, setBills] = useState(saved?.bills || INIT.bills);
  const [categories, setCategories] = useState(saved?.categories || INIT.categories);
  const [swipedId, setSwipedId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [reallocationPrompt, setReallocationPrompt] = useState(null);
  const [monthlyBudget, setMonthlyBudget] = useState(saved?.monthlyBudget ?? DEFAULT_BUDGET);
  const [monthlyIncome, setMonthlyIncome] = useState(saved?.monthlyIncome ?? DEFAULT_INCOME);
  const [incomeEntries, setIncomeEntries] = useState(saved?.incomeEntries || INIT.incomeEntries);
  const [recurringIncome, setRecurringIncome] = useState(saved?.recurringIncome || INIT.recurringIncome);

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    saveState({ transactions, zeroSpendToday, streak, freezes, events, bills, categories, monthlyBudget, monthlyIncome, incomeEntries, recurringIncome });
  }, [transactions, zeroSpendToday, streak, freezes, events, bills, categories, monthlyBudget, monthlyIncome, incomeEntries, recurringIncome]);

  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const totalEvents = events.reduce((s, e) => s + e.amount, 0);
  const totalSpent = transactions.filter(t => !t.excluded).reduce((s, t) => s + t.amount, 0);
  const remaining = monthlyBudget - totalBills - totalEvents - totalSpent;
  const dailySafe = remaining / REMAINING_DAYS;
  const isRed = dailySafe < 0;
  const budgetUsed = monthlyBudget > 0 ? ((totalBills + totalEvents + totalSpent) / monthlyBudget) * 100 : 0;
  const savingsVault = 0;
  const monthlySavings = monthlyIncome - monthlyBudget;

  const handleZeroSpend = () => { if (!zeroSpendToday) { setZeroSpendToday(true); setShowCoinAnim(true); setStreak(s => s + 1); setTimeout(() => setShowCoinAnim(false), 2200); } };

  const handleLogEntry = (entry) => {
    const parsed = parseFloat(entry.amount);
    if (entry.dateType === "future") {
      const ev = { id: Date.now(), name: entry.note || entry.category, amount: parsed, date: entry.dateLabel, icon: getCatMeta(entry.category, categories).icon };
      if (!entry.excludeFromSafeSpend && parsed > dailySafe) setReallocationPrompt({ event: ev });
      else setEvents(p => [...p, ev]);
    } else if (entry.isRecurring) {
      setBills(p => [...p, { id: Date.now(), name: entry.note || entry.category, amount: parsed, day: TODAY.getDate(), category: entry.category, recurring: entry.recurringSchedule === "Custom" ? `Every ${entry.customDays} days` : entry.recurringSchedule }]);
    } else {
      setTransactions(p => [{ id: Date.now(), amount: parsed, category: entry.category, note: entry.note, date: entry.dateType === "prior" ? entry.dateLabel : "Today", time: entry.dateType === "prior" ? "Logged" : new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), excluded: entry.excludeFromSafeSpend || false }, ...p]);
      if (entry.dateType !== "prior" && zeroSpendToday && !entry.excludeFromSafeSpend) setZeroSpendToday(false);
    }
    setShowEntryModal(false);
  };

  const handleLogIncome = (entry) => {
    const parsed = parseFloat(entry.amount);
    if (entry.isRecurring) setRecurringIncome(p => [...p, { id: Date.now(), name: entry.note || "Income", amount: parsed, day: TODAY.getDate(), recurring: entry.recurringSchedule === "Custom" ? `Every ${entry.customDays} days` : entry.recurringSchedule }]);
    setIncomeEntries(p => [{ id: Date.now(), amount: parsed, note: entry.note, date: entry.dateType === "prior" ? entry.dateLabel : entry.dateType === "future" ? entry.dateLabel : "Today", time: entry.dateType === "today" ? new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Logged", isRecurring: entry.isRecurring, recurring: entry.recurringSchedule }, ...p]);
    setShowIncomeModal(false);
  };

  const handleReallocation = () => { if (reallocationPrompt) { setEvents(p => [...p, reallocationPrompt.event]); setReallocationPrompt(null); } };

  return (
    <div style={S.phone}>
      {showAccount && <AccountScreen user={user} onClose={() => setShowAccount(false)} onLogout={onLogout} onUpdateUser={onUpdateUser} />}

      <div style={S.statusBar}>
        <span style={{ fontSize: 11, fontWeight: 600 }}>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <svg width="16" height="11" viewBox="0 0 16 11"><rect x="0" y="3" width="3" height="8" rx="1" fill="currentColor" opacity=".4"/><rect x="4.5" y="2" width="3" height="9" rx="1" fill="currentColor" opacity=".6"/><rect x="9" y="0" width="3" height="11" rx="1" fill="currentColor" opacity=".8"/><rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor"/></svg>
          <svg width="24" height="12" viewBox="0 0 24 12"><rect x="0" y="0" width="21" height="12" rx="3" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="2" y="2" width="15" height="8" rx="1.5" fill={C.success}/><rect x="22" y="3.5" width="2" height="5" rx="1" fill="currentColor" opacity=".4"/></svg>
        </div>
      </div>

      <div style={S.content}>
        {tab === "home" && <DashboardScreen dailySafe={dailySafe} isRed={isRed} budgetUsed={budgetUsed} transactions={transactions} zeroSpendToday={zeroSpendToday} onZeroSpend={handleZeroSpend} showCoinAnim={showCoinAnim} onOpenEntry={() => setShowEntryModal(true)} mounted={mounted} streak={streak} swipedId={swipedId} setSwipedId={setSwipedId} onRefund={(id) => { setTransactions(p => p.filter(t => t.id !== id)); setSwipedId(null); }} remaining={remaining} categories={categories} monthlyBudget={monthlyBudget} totalSpent={totalSpent} totalBills={totalBills} totalEvents={totalEvents} onAvatarTap={() => setShowAccount(true)} user={user} />}
        {tab === "horizon" && <HorizonScreen events={events} bills={bills} dailySafe={dailySafe} onOpenEntry={() => setShowEntryModal(true)} mounted={mounted} monthlyBudget={monthlyBudget} />}
        {tab === "vault" && <VaultScreen savingsVault={savingsVault} streak={streak} freezes={freezes} totalSpent={totalSpent} budget={monthlyBudget} mounted={mounted} bills={bills} />}
        {tab === "planning" && <PlanningScreen mounted={mounted} categories={categories} onAddCategory={(cat) => setCategories(p => [...p, cat])} bills={bills} onDeleteBill={(id) => setBills(p => p.filter(b => b.id !== id))} monthlyBudget={monthlyBudget} onBudgetChange={(v) => { const n = parseFloat(v); setMonthlyBudget(isNaN(n) ? 0 : n); }} monthlyIncome={monthlyIncome} onIncomeChange={(v) => { const n = parseFloat(v); setMonthlyIncome(isNaN(n) ? 0 : n); }} monthlySavings={monthlySavings} onCategoryBudgetChange={(name, v) => { const n = parseFloat(v); setCategories(p => p.map(c => c.name === name ? { ...c, budget: isNaN(n) ? 0 : n } : c)); }} onOpenIncomeModal={() => setShowIncomeModal(true)} recurringIncome={recurringIncome} onDeleteRecurringIncome={(id) => setRecurringIncome(p => p.filter(r => r.id !== id))} />}
      </div>

      <div style={S.tabBar}>
        {[{ key: "home", label: "Dashboard", icon: "◉" }, { key: "horizon", label: "Horizon", icon: "⟡" }, { key: "vault", label: "Vault", icon: "◈" }, { key: "planning", label: "Planning", icon: "⚙" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ ...S.tabBtn, color: tab === t.key ? C.primary : C.secondary }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 600 }}>{t.label}</span>
          </button>
        ))}
      </div>
      <div style={S.homeIndicator}><div style={S.homeBar} /></div>

      {showEntryModal && <UniversalEntryModal onClose={() => setShowEntryModal(false)} onSubmit={handleLogEntry} categories={categories} />}
      {showIncomeModal && <IncomeModal onClose={() => setShowIncomeModal(false)} onSubmit={handleLogIncome} />}
      {reallocationPrompt && <ReallocationPrompt event={reallocationPrompt.event} dailySafe={dailySafe} onSmooth={handleReallocation} onManual={handleReallocation} onCancel={() => setReallocationPrompt(null)} />}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────
function DashboardScreen({ dailySafe, isRed, budgetUsed, transactions, zeroSpendToday, onZeroSpend, showCoinAnim, onOpenEntry, mounted, streak, swipedId, setSwipedId, onRefund, remaining, categories, monthlyBudget, totalSpent, totalBills, totalEvents, onAvatarTap, user }) {
  const spent = totalSpent + totalBills + totalEvents;
  return (
    <div style={S.screen}>
      <div style={{ padding: "8px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600 }}>{MONTH_NAME} {TODAY.getDate()}, {TODAY.getFullYear()}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginTop: 2, fontFamily: "'DM Serif Display', Georgia, serif" }}>Fluid</div>
        </div>
        <div onClick={onAvatarTap} style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: C.bg, cursor: "pointer" }}>
          {(user?.name || "U")[0].toUpperCase()}
        </div>
      </div>

      <div style={{ ...S.heroCard, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "all .6s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 4 }}>Daily Safe-Spend</div>
        <div style={{ fontSize: 52, fontWeight: 300, fontFamily: "'DM Serif Display', Georgia, serif", color: isRed ? C.alert : C.primary, lineHeight: 1.1, letterSpacing: -1 }}>{isRed ? "−" : ""}${fmt(Math.abs(dailySafe))}</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, padding: "12px 0 0", borderTop: `1px solid ${C.secondary}30` }}>
          {[{ val: `$${fmt(monthlyBudget)}`, label: "Total Budget", col: C.textPrimary }, { val: `$${fmt(spent)}`, label: "Spent", col: C.accent }, { val: REMAINING_DAYS, label: "Days Left", col: C.primary }].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: 1, background: `${C.secondary}30` }} />}
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.col, fontFamily: "'DM Serif Display', Georgia, serif" }}>{s.val}</div>
                <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textSecondary, marginBottom: 6 }}><span>Budget Used</span><span>{Math.min(100, budgetUsed).toFixed(0)}%</span></div>
          <div style={S.progressTrack}><div style={{ ...S.progressFill, width: `${Math.min(100, budgetUsed)}%`, background: budgetUsed > 90 ? `linear-gradient(90deg, ${C.alert}, ${C.accent})` : budgetUsed > 70 ? `linear-gradient(90deg, ${C.primary}, ${C.alert})` : `linear-gradient(90deg, ${C.primary}, ${C.secondary})` }} /></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, padding: "0 20px", marginTop: 14, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(15px)", transition: "all .6s cubic-bezier(.16,1,.3,1) .15s" }}>
        <button onClick={onOpenEntry} style={S.actionBtn}><span style={{ fontSize: 18 }}>+</span><span>Log Entry</span></button>
        <button onClick={onZeroSpend} style={{ ...S.actionBtn, background: zeroSpendToday ? `${C.primary}18` : `${C.primary}10`, border: zeroSpendToday ? `1px solid ${C.primary}40` : `1px solid ${C.primary}25` }}>
          <span style={{ fontSize: 18 }}>{zeroSpendToday ? "🪙" : "○"}</span><span>{zeroSpendToday ? "Earned!" : "$0 Day"}</span>
        </button>
      </div>

      {streak > 0 && <div style={{ margin: "12px 20px 0", padding: "10px 14px", borderRadius: 12, background: `${C.success}10`, border: `1px solid ${C.success}25`, display: "flex", alignItems: "center", gap: 10, opacity: mounted ? 1 : 0, transition: "all .5s ease .25s" }}><span style={{ fontSize: 20 }}>🔥</span><div><div style={{ fontSize: 12, fontWeight: 700, color: C.success }}>{streak}-Day Streak</div><div style={{ fontSize: 10, color: C.textSecondary }}>Keep it going — you're building momentum</div></div></div>}

      {showCoinAnim && <div style={S.coinOverlay}><div style={S.coinAnim}><div style={{ fontSize: 64, animation: "coinSpin 1s ease-out" }}>🪙</div><div style={{ color: C.primary, fontWeight: 700, fontSize: 18, marginTop: 8, fontFamily: "'DM Serif Display', Georgia, serif" }}>$0 Spend Day!</div><div style={{ color: C.textSecondary, fontSize: 12, marginTop: 4 }}>Day {streak} · Gold earned</div></div></div>}

      <div style={{ padding: "16px 20px 8px", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, opacity: mounted ? 1 : 0, transition: "all .5s ease .3s" }}>Recent Activity</div>
      <div style={{ padding: "0 20px", paddingBottom: 20 }}>
        {transactions.map((tx, i) => {
          const cat = getCatMeta(tx.category, categories);
          const sw = swipedId === tx.id;
          return (
            <div key={tx.id} onClick={() => setSwipedId(sw ? null : tx.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < transactions.length - 1 ? `1px solid ${C.secondary}18` : "none", cursor: "pointer", opacity: mounted ? 1 : 0, transition: `all .4s ease ${.35 + i * .06}s` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, position: "relative" }}>
                {cat.icon}
                {tx.excluded && <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: C.alert, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700, border: `1.5px solid ${C.bg}` }}>✕</div>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{tx.note || tx.category}</span>
                  {tx.excluded && <span style={{ fontSize: 8, fontWeight: 700, color: C.alert, background: `${C.alert}15`, padding: "1px 5px", borderRadius: 4, letterSpacing: .5, textTransform: "uppercase" }}>Excluded</span>}
                </div>
                <div style={{ fontSize: 10, color: C.textSecondary }}>{tx.date} · {tx.time}</div>
              </div>
              {sw ? <button onClick={e => { e.stopPropagation(); onRefund(tx.id); }} style={{ background: `${C.accent}18`, border: `1px solid ${C.accent}40`, borderRadius: 8, padding: "5px 12px", color: C.accent, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Refund</button>
                : <div style={{ fontSize: 14, fontWeight: 600, color: tx.excluded ? C.textSecondary : C.textPrimary, textDecoration: tx.excluded ? "line-through" : "none" }}>−${fmt(tx.amount)}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Horizon (unchanged from v4) ─────────────────────────────────────
function HorizonScreen({ events, bills, dailySafe, onOpenEntry, mounted, monthlyBudget }) {
  return (
    <div style={S.screen}>
      <div style={{ padding: "8px 20px 16px" }}><div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600 }}>Planning</div><div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, marginTop: 2, fontFamily: "'DM Serif Display', Georgia, serif" }}>The Horizon</div></div>
      <div style={{ margin: "0 20px 16px", padding: 16, borderRadius: 14, background: `${C.primary}08`, border: `1px solid ${C.primary}18`, opacity: mounted ? 1 : 0, transition: "all .5s ease .1s" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.primary, fontWeight: 600, opacity: .6 }}>Impact on Daily Limit</div>
        <div style={{ fontSize: 28, fontWeight: 300, color: C.primary, fontFamily: "'DM Serif Display', Georgia, serif", marginTop: 4 }}>${fmt(dailySafe)}<span style={{ fontSize: 12, color: C.textSecondary }}> /day after commitments</span></div>
        <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 6 }}>Based on ${fmt(monthlyBudget)} monthly budget</div>
      </div>
      <div style={{ padding: "0 20px 12px", opacity: mounted ? 1 : 0, transition: "all .5s ease .12s" }}><button onClick={onOpenEntry} style={{ width: "100%", padding: "13px 8px", borderRadius: 14, border: "none", cursor: "pointer", background: `${C.accent}15`, border: `1px solid ${C.accent}30`, color: C.accent, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ fontSize: 18 }}>+</span><span>Log Entry</span></button></div>
      <div style={{ padding: "0 20px" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 10 }}>Recurring Bills</div>
        {bills.map((b, i) => <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", marginBottom: 8, borderRadius: 12, background: C.surface, border: `1px solid ${C.secondary}20`, opacity: mounted ? 1 : 0, transition: `all .4s ease ${.2 + i * .05}s` }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: `${C.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📋</div><div><div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{b.name}</div><div style={{ fontSize: 10, color: C.textSecondary }}>{b.recurring} · Day {b.day}{b.category ? ` · ${b.category}` : ""}</div></div></div><div style={{ fontSize: 14, fontWeight: 600, color: C.textSecondary }}>−${fmt(b.amount)}</div></div>)}
      </div>
      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 10 }}>Planned Events</div>
        {events.map((e, i) => <div key={e.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", marginBottom: 8, borderRadius: 12, background: `${C.alert}08`, border: `1px solid ${C.alert}18`, opacity: mounted ? 1 : 0, transition: `all .4s ease ${.3 + i * .05}s` }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: 8, background: `${C.alert}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{e.icon}</div><div><div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{e.name}</div><div style={{ fontSize: 10, color: C.textSecondary }}>{e.date}</div></div></div><div style={{ fontSize: 14, fontWeight: 600, color: C.alert }}>−${fmt(e.amount)}</div></div>)}
      </div>
    </div>
  );
}

// ─── Vault (unchanged from v4) ───────────────────────────────────────
function VaultScreen({ savingsVault, streak, freezes, totalSpent, budget, mounted, bills }) {
  const saved = Math.max(0, budget - totalSpent - bills.reduce((s, b) => s + b.amount, 0));
  return (
    <div style={S.screen}>
      <div style={{ padding: "8px 20px 16px" }}><div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600 }}>Wealth</div><div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, marginTop: 2, fontFamily: "'DM Serif Display', Georgia, serif" }}>Savings Vault</div></div>
      <div style={{ margin: "0 20px 16px", padding: 24, borderRadius: 18, background: `linear-gradient(145deg, ${C.primary}12, ${C.primary}04)`, border: `1px solid ${C.primary}20`, textAlign: "center", opacity: mounted ? 1 : 0, transform: mounted ? "scale(1)" : "scale(.95)", transition: "all .6s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: C.primary, fontWeight: 600, opacity: .5 }}>Total Vault Balance</div>
        <div style={{ fontSize: 44, fontWeight: 300, color: C.primary, fontFamily: "'DM Serif Display', Georgia, serif", marginTop: 6, letterSpacing: -1 }}>${fmt(savingsVault)}</div>
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>Prior month profits + refunds</div>
      </div>
      <div style={{ display: "flex", gap: 10, padding: "0 20px", marginBottom: 16 }}>
        <div style={{ flex: 1, padding: 16, borderRadius: 14, background: C.surface, border: `1px solid ${C.secondary}20`, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 300, color: C.accent, fontFamily: "'DM Serif Display', Georgia, serif" }}>{streak}</div><div style={{ fontSize: 10, color: C.textSecondary, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginTop: 2 }}>Day Streak 🔥</div></div>
        <div style={{ flex: 1, padding: 16, borderRadius: 14, background: C.surface, border: `1px solid ${C.secondary}20`, textAlign: "center" }}><div style={{ fontSize: 28, fontWeight: 300, color: C.primary, fontFamily: "'DM Serif Display', Georgia, serif" }}>{freezes}</div><div style={{ fontSize: 10, color: C.textSecondary, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, marginTop: 2 }}>Freezes ❄️</div></div>
      </div>
      <div style={{ margin: "0 20px", padding: 16, borderRadius: 14, background: C.surface, border: `1px solid ${C.secondary}20` }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 10 }}>{MONTH_NAME} On-Track Savings</div>
        <div style={{ fontSize: 24, fontWeight: 300, color: C.success, fontFamily: "'DM Serif Display', Georgia, serif" }}>+${fmt(saved)}</div>
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 4 }}>Projected addition to vault at month end</div>
      </div>
      <div style={{ padding: "16px 20px 0" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 10 }}>Milestones</div>
        {[{ at: 25, label: "Quarter Century", reward: "+4 Freezes", done: streak >= 25 }, { at: 50, label: "Half Century", reward: "+4 Freezes", done: streak >= 50 }, { at: 75, label: "Diamond Streak", reward: "+4 Freezes", done: streak >= 75 }].map((m, i) => (
          <div key={m.at} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.secondary}18` : "none", opacity: mounted ? (m.done ? 1 : .4) : 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.done ? `${C.success}15` : C.surface, border: `1px solid ${m.done ? `${C.success}30` : `${C.secondary}20`}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{m.done ? "🏆" : "🔒"}</div>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{m.at}-Day: {m.label}</div><div style={{ fontSize: 10, color: C.textSecondary }}>{m.reward}</div></div>
            {m.done && <span style={{ fontSize: 11, color: C.success, fontWeight: 600 }}>Done</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Planning (unchanged from v4) ────────────────────────────────────
function PlanningScreen({ mounted, categories, onAddCategory, bills, onDeleteBill, monthlyBudget, onBudgetChange, monthlyIncome, onIncomeChange, monthlySavings, onCategoryBudgetChange, onOpenIncomeModal, recurringIncome, onDeleteRecurringIncome }) {
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);
  const [budgetPeriod, setBudgetPeriod] = useState("month");
  const [showCatBudgets, setShowCatBudgets] = useState(false);

  const handleCreateCategory = () => { if (newCatName.trim()) { onAddCategory({ name: newCatName.trim(), icon: newCatIcon, color: newCatColor, budget: 0 }); setNewCatName(""); setNewCatIcon("📦"); setNewCatColor(CATEGORY_COLORS[0]); setShowNewCat(false); } };
  const pm = budgetPeriod === "week" ? 12 / 52 : budgetPeriod === "year" ? 12 : 1;
  const pLabel = budgetPeriod === "week" ? "Weekly" : budgetPeriod === "year" ? "Yearly" : "Monthly";
  const totalCatBudgets = categories.reduce((s, c) => s + (c.budget || 0), 0);
  const uncat = Math.max(0, monthlyBudget - totalCatBudgets);

  return (
    <div style={S.screen}>
      <div style={{ padding: "8px 20px 12px" }}><div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600 }}>Configuration</div><div style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, marginTop: 2, fontFamily: "'DM Serif Display', Georgia, serif" }}>Planning</div></div>
      <div style={{ padding: "0 20px" }}>
        {/* Monthly Savings */}
        <div style={{ padding: 14, borderRadius: 14, marginBottom: 12, background: `${monthlySavings >= 0 ? C.success : C.alert}08`, border: `1px solid ${monthlySavings >= 0 ? C.success : C.alert}18`, opacity: mounted ? 1 : 0, transition: "all .5s ease .05s" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 4 }}>Monthly Savings</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 300, color: monthlySavings >= 0 ? C.success : C.alert, fontFamily: "'DM Serif Display', Georgia, serif" }}>{monthlySavings >= 0 ? "+" : "−"}${fmt(Math.abs(monthlySavings))}</div>
            <div style={{ fontSize: 10, color: C.textSecondary, textAlign: "right" }}>Income ${fmt(monthlyIncome)}<br/>Budget ${fmt(monthlyBudget)}</div>
          </div>
        </div>

        {/* Income */}
        <div style={{ padding: 16, borderRadius: 14, marginBottom: 12, background: C.surface, border: `1px solid ${C.secondary}20`, opacity: mounted ? 1 : 0, transition: "all .5s ease .08s" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 8 }}>Monthly Income</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20, color: C.success, fontFamily: "'DM Serif Display', Georgia, serif" }}>$</span>
            <input value={incomeInput} onChange={e => { setIncomeInput(e.target.value); onIncomeChange(e.target.value); }} type="number" style={{ background: C.bg, border: `1px solid ${C.secondary}30`, borderRadius: 8, padding: "8px 12px", color: C.textPrimary, fontSize: 18, fontFamily: "'DM Serif Display', Georgia, serif", width: "100%", outline: "none" }} />
          </div>
          <button onClick={onOpenIncomeModal} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", background: `${C.success}12`, border: `1px solid ${C.success}25`, color: C.success, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><span style={{ fontSize: 14 }}>+</span> Log Income</button>
          <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 6 }}>Income does not affect your Daily Safe-Spend.</div>
          {recurringIncome.length > 0 && <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 6 }}>Recurring Income</div>
            {recurringIncome.map(r => <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", marginBottom: 4, borderRadius: 8, background: C.bg, border: `1px solid ${C.secondary}15` }}><div><div style={{ fontSize: 12, fontWeight: 600, color: C.textPrimary }}>{r.name}</div><div style={{ fontSize: 9, color: C.textSecondary }}>{r.recurring} · Day {r.day}</div></div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12, fontWeight: 600, color: C.success }}>${fmt(r.amount)}</span><button onClick={() => onDeleteRecurringIncome(r.id)} style={{ width: 20, height: 20, borderRadius: 5, border: "none", cursor: "pointer", background: `${C.accent}15`, color: C.accent, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button></div></div>)}
          </div>}
        </div>

        {/* Budget */}
        <div style={{ padding: 16, borderRadius: 14, marginBottom: 12, background: C.surface, border: `1px solid ${C.secondary}20`, opacity: mounted ? 1 : 0, transition: "all .5s ease .1s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600 }}>Monthly Budget</div>
            <div style={{ display: "flex", gap: 2, background: C.bg, borderRadius: 8, padding: 2, border: `1px solid ${C.secondary}15` }}>
              {["week", "month", "year"].map(p => <button key={p} onClick={() => setBudgetPeriod(p)} style={{ padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, background: budgetPeriod === p ? C.primary : "transparent", color: budgetPeriod === p ? "#fff" : C.textSecondary, transition: "all .15s ease" }}>{p === "week" ? "Wk" : p === "month" ? "Mo" : "Yr"}</button>)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20, color: C.primary, fontFamily: "'DM Serif Display', Georgia, serif" }}>$</span>
            {budgetPeriod === "month" ? <input value={budgetInput} onChange={e => { setBudgetInput(e.target.value); onBudgetChange(e.target.value); }} type="number" style={{ background: C.bg, border: `1px solid ${C.secondary}30`, borderRadius: 8, padding: "8px 12px", color: C.textPrimary, fontSize: 18, fontFamily: "'DM Serif Display', Georgia, serif", width: "100%", outline: "none" }} />
              : <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', Georgia, serif", color: C.textPrimary, padding: "8px 12px" }}>{fmt(monthlyBudget * pm)}</div>}
          </div>
          <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 6 }}>{budgetPeriod === "month" ? "Changes here update your Daily Safe-Spend in real time." : `${pLabel} view extrapolated from your $${fmt(monthlyBudget)}/mo plan.`}</div>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setShowCatBudgets(!showCatBudgets)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, color: C.primary, fontSize: 11, fontWeight: 600 }}>
              <span style={{ transform: showCatBudgets ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .2s ease", display: "inline-block" }}>▸</span> Category Budgets
            </button>
            {showCatBudgets && <div style={{ marginTop: 10, animation: "fadeIn .2s ease" }}>
              {categories.map(c => <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}><span style={{ fontSize: 14, width: 22, textAlign: "center" }}>{c.icon}</span><span style={{ fontSize: 11, fontWeight: 600, color: c.color, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span><div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}><span style={{ fontSize: 11, color: C.textSecondary }}>$</span>{budgetPeriod === "month" ? <input value={c.budget || ""} onChange={e => onCategoryBudgetChange(c.name, e.target.value)} type="number" placeholder="0" style={{ width: 60, background: C.bg, border: `1px solid ${C.secondary}20`, borderRadius: 6, padding: "4px 6px", color: C.textPrimary, fontSize: 11, outline: "none", textAlign: "right" }} /> : <span style={{ fontSize: 11, color: C.textPrimary, fontWeight: 600, width: 60, textAlign: "right" }}>{fmt((c.budget || 0) * pm)}</span>}</div></div>)}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.secondary}15` }}><span style={{ fontSize: 14, width: 22, textAlign: "center" }}>💰</span><span style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary, flex: 1 }}>Uncategorized</span><span style={{ fontSize: 11, fontWeight: 700, color: uncat > 0 ? C.primary : C.alert }}>${fmt(uncat * pm)}</span></div>
              {totalCatBudgets > monthlyBudget && <div style={{ fontSize: 10, color: C.alert, marginTop: 6 }}>Category budgets exceed your total budget by ${fmt(totalCatBudgets - monthlyBudget)}</div>}
            </div>}
          </div>
        </div>

        {/* Categories */}
        <div style={{ padding: 16, borderRadius: 14, marginBottom: 12, background: C.surface, border: `1px solid ${C.secondary}20`, opacity: mounted ? 1 : 0, transition: "all .5s ease .15s" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 12 }}>Categories</div>
          <button onClick={() => setShowNewCat(!showNewCat)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: .3 }}><span style={{ fontSize: 16 }}>+</span> Create New Category</button>
          {showNewCat && <div style={{ padding: 14, borderRadius: 12, marginBottom: 12, background: `${C.primary}06`, border: `1px solid ${C.primary}15`, animation: "fadeIn .2s ease" }}>
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name..." autoFocus style={{ ...S.modalInput, marginBottom: 10, fontSize: 14, fontWeight: 600 }} />
            <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 6 }}>Icon</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>{CATEGORY_ICONS.map(ic => <button key={ic} onClick={() => setNewCatIcon(ic)} style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 16, background: newCatIcon === ic ? `${C.primary}15` : C.surface, border: `1px solid ${newCatIcon === ic ? `${C.primary}35` : `${C.secondary}20`}` }}>{ic}</button>)}</div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 6 }}>Color</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>{CATEGORY_COLORS.map(col => <button key={col} onClick={() => setNewCatColor(col)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer", background: col, opacity: newCatColor === col ? 1 : .35, border: `2px solid ${newCatColor === col ? C.textPrimary : "transparent"}` }} />)}</div>
            <div style={{ display: "flex", gap: 8 }}><button onClick={() => setShowNewCat(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", background: `${C.secondary}25`, color: C.textSecondary, fontSize: 12, fontWeight: 600 }}>Cancel</button><button onClick={handleCreateCategory} disabled={!newCatName.trim()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", background: newCatName.trim() ? C.accent : `${C.secondary}20`, color: newCatName.trim() ? "#fff" : C.textSecondary, fontSize: 12, fontWeight: 700 }}>Add</button></div>
          </div>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{categories.map(c => <div key={c.name} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, background: `${c.color}12`, border: `1px solid ${c.color}28`, color: c.color, fontWeight: 600 }}>{c.icon} {c.name}</div>)}</div>
        </div>

        {/* Recurring Bills */}
        <div style={{ padding: 16, borderRadius: 14, marginBottom: 12, background: C.surface, border: `1px solid ${C.secondary}20`, opacity: mounted ? 1 : 0, transition: "all .5s ease .2s" }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 12 }}>Recurring Bills</div>
          {bills.map(b => <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", marginBottom: 6, borderRadius: 10, background: C.bg, border: `1px solid ${C.secondary}15` }}><div><div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{b.name}</div><div style={{ fontSize: 10, color: C.textSecondary }}>{b.recurring} · Day {b.day}{b.category ? ` · ${b.category}` : ""}</div></div><div style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary }}>${fmt(b.amount)}</span><button onClick={() => onDeleteBill(b.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "none", cursor: "pointer", background: `${C.accent}15`, color: C.accent, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button></div></div>)}
          <div style={{ fontSize: 10, color: C.textSecondary, marginTop: 6 }}>Tip: Use the Log Entry flow with the Recurring toggle to add new bills.</div>
        </div>

        {["Biometric Lock", "iCloud Sync", "Notifications"].map((label, i) => <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 14, marginBottom: 8, background: C.surface, border: `1px solid ${C.secondary}20`, opacity: mounted ? 1 : 0, transition: `all .5s ease ${.25 + i * .05}s` }}><span style={{ fontSize: 13, color: C.textPrimary, fontWeight: 500 }}>{label}</span><ToggleSwitch defaultOn={i === 0} /></div>)}
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return <div onClick={() => setOn(!on)} style={{ width: 44, height: 26, borderRadius: 13, cursor: "pointer", background: on ? C.primary : `${C.secondary}40`, position: "relative", transition: "background .25s ease" }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 21 : 3, transition: "left .25s ease" }} /></div>;
}

// ─── Universal Entry Modal (unchanged from v4) ───────────────────────
function UniversalEntryModal({ onClose, onSubmit, categories }) {
  const [amount, setAmount] = useState(""); const [category, setCategory] = useState(null); const [note, setNote] = useState(""); const [dateType, setDateType] = useState("today"); const [dateValue, setDateValue] = useState(""); const [isRecurring, setIsRecurring] = useState(false); const [recurringSchedule, setRecurringSchedule] = useState("Monthly"); const [customDays, setCustomDays] = useState(""); const [excludeFromSafeSpend, setExcludeFromSafeSpend] = useState(false); const [step, setStep] = useState(1);
  const dateLabel = dateType === "today" ? "Today" : dateType === "prior" ? (dateValue || "Prior") : (dateValue || "Future");
  const canProceed1 = amount && parseFloat(amount) > 0; const canSubmit = canProceed1 && category;

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modalSheet, maxHeight: "85%", overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHandle} /><div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, textAlign: "center", fontFamily: "'DM Serif Display', Georgia, serif" }}>Log Entry</div>
        {step === 1 && <div style={{ animation: "fadeIn .2s ease" }}>
          <div style={{ textAlign: "center", margin: "16px 0 14px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><span style={{ fontSize: 32, color: C.secondary, fontFamily: "'DM Serif Display', Georgia, serif" }}>$</span><input autoFocus value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" step="0.01" style={{ background: "transparent", border: "none", color: C.textPrimary, fontSize: 42, fontFamily: "'DM Serif Display', Georgia, serif", textAlign: "center", width: 180, outline: "none" }} /></div></div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 8 }}>Date</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>{[{ key: "today", label: "Today" }, { key: "prior", label: "Prior Date" }, { key: "future", label: "Future Date" }].map(d => <button key={d.key} onClick={() => setDateType(d.key)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: dateType === d.key ? `${C.primary}12` : C.bg, border: `1px solid ${dateType === d.key ? `${C.primary}35` : `${C.secondary}20`}`, color: dateType === d.key ? C.primary : C.textSecondary, fontSize: 11, fontWeight: 600 }}>{d.label}</button>)}</div>
          {dateType !== "today" && <div style={{ marginBottom: 10, animation: "fadeIn .2s ease" }}><input type="date" value={dateValue} onChange={e => setDateValue(e.target.value)} style={{ ...S.modalInput, colorScheme: "light" }} /></div>}
          {dateType === "future" && <div style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 10, background: `${C.alert}10`, border: `1px solid ${C.alert}20`, fontSize: 11, color: C.alert, lineHeight: 1.4 }}>Future dates create a Planned Event on the Horizon.</div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, marginBottom: 8, background: C.bg, border: `1px solid ${C.secondary}20` }}><div><div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Recurring</div><div style={{ fontSize: 10, color: C.textSecondary }}>Repeat this expense on a schedule</div></div><div onClick={() => setIsRecurring(!isRecurring)} style={{ width: 44, height: 26, borderRadius: 13, cursor: "pointer", background: isRecurring ? C.primary : `${C.secondary}40`, position: "relative", transition: "background .25s ease", flexShrink: 0 }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: isRecurring ? 21 : 3, transition: "left .25s ease" }} /></div></div>
          {isRecurring && <div style={{ animation: "fadeIn .2s ease", marginBottom: 8 }}><div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 8 }}>Schedule</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>{RECURRING_OPTIONS.map(opt => <button key={opt} onClick={() => setRecurringSchedule(opt)} style={{ padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: recurringSchedule === opt ? `${C.primary}12` : C.bg, border: `1px solid ${recurringSchedule === opt ? `${C.primary}35` : `${C.secondary}20`}`, color: recurringSchedule === opt ? C.primary : C.textSecondary, fontSize: 11, fontWeight: 600 }}>{opt}</button>)}</div>{recurringSchedule === "Custom" && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12, color: C.textSecondary }}>Every</span><input value={customDays} onChange={e => setCustomDays(e.target.value)} type="number" placeholder="X" min="1" style={{ ...S.modalInput, width: 60, textAlign: "center" }} /><span style={{ fontSize: 12, color: C.textSecondary }}>days</span></div>}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, marginBottom: 8, background: excludeFromSafeSpend ? `${C.alert}08` : C.bg, border: `1px solid ${excludeFromSafeSpend ? `${C.alert}20` : `${C.secondary}20`}`, transition: "all .2s ease" }}><div><div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Exclude from Safe-Spend</div><div style={{ fontSize: 10, color: C.textSecondary }}>Track this expense without affecting your budget</div></div><div onClick={() => setExcludeFromSafeSpend(!excludeFromSafeSpend)} style={{ width: 44, height: 26, borderRadius: 13, cursor: "pointer", background: excludeFromSafeSpend ? C.alert : `${C.secondary}40`, position: "relative", transition: "background .25s ease", flexShrink: 0 }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: excludeFromSafeSpend ? 21 : 3, transition: "left .25s ease" }} /></div></div>
          <button onClick={() => canProceed1 && setStep(2)} disabled={!canProceed1} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", background: canProceed1 ? C.accent : `${C.secondary}20`, color: canProceed1 ? "#fff" : C.textSecondary, fontSize: 14, fontWeight: 700, letterSpacing: .5, marginTop: 6 }}>Next — Select Category</button>
        </div>}
        {step === 2 && <div style={{ animation: "fadeIn .2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, margin: "14px 0", padding: "8px 14px", borderRadius: 20, background: `${C.primary}08`, border: `1px solid ${C.primary}15`, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.primary, fontFamily: "'DM Serif Display', Georgia, serif" }}>${parseFloat(amount).toFixed(2)}</span><span style={{ fontSize: 10, color: C.textSecondary }}>·</span><span style={{ fontSize: 11, color: C.textSecondary }}>{dateLabel}</span>
            {isRecurring && <><span style={{ fontSize: 10, color: C.textSecondary }}>·</span><span style={{ fontSize: 10, color: C.primary, fontWeight: 600 }}>↻ {recurringSchedule === "Custom" ? `Every ${customDays}d` : recurringSchedule}</span></>}
            {excludeFromSafeSpend && <><span style={{ fontSize: 10, color: C.textSecondary }}>·</span><span style={{ fontSize: 9, color: C.alert, fontWeight: 700, background: `${C.alert}15`, padding: "1px 5px", borderRadius: 4 }}>EXCLUDED</span></>}
          </div>
          <button onClick={() => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, fontSize: 12, fontWeight: 600, padding: "0 0 10px", display: "flex", alignItems: "center", gap: 4 }}>← Back</button>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 10 }}>Category</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>{categories.map(c => <button key={c.name} onClick={() => setCategory(c.name)} style={{ padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: category === c.name ? `${c.color}18` : C.bg, border: `1px solid ${category === c.name ? `${c.color}40` : `${C.secondary}20`}`, color: category === c.name ? c.color : C.textSecondary, fontSize: 11, fontWeight: 600, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><span style={{ fontSize: 18 }}>{c.icon}</span><span style={{ lineHeight: 1.2, textAlign: "center" }}>{c.name.length > 10 ? c.name.split(" ")[0] : c.name}</span></button>)}</div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..." style={{ width: "100%", background: C.bg, border: `1px solid ${C.secondary}25`, borderRadius: 10, padding: "10px 14px", color: C.textPrimary, fontSize: 13, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
          <button onClick={() => { if (canSubmit) onSubmit({ amount, category, note, dateType, dateLabel, isRecurring, recurringSchedule, customDays, excludeFromSafeSpend }); }} disabled={!canSubmit} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", background: canSubmit ? C.accent : `${C.secondary}20`, color: canSubmit ? "#fff" : C.textSecondary, fontSize: 14, fontWeight: 700, letterSpacing: .5 }}>Confirm</button>
        </div>}
      </div>
    </div>
  );
}

// ─── Income Modal (unchanged from v4) ────────────────────────────────
function IncomeModal({ onClose, onSubmit }) {
  const [amount, setAmount] = useState(""); const [note, setNote] = useState(""); const [dateType, setDateType] = useState("today"); const [dateValue, setDateValue] = useState(""); const [isRecurring, setIsRecurring] = useState(false); const [recurringSchedule, setRecurringSchedule] = useState("Monthly"); const [customDays, setCustomDays] = useState("");
  const dateLabel = dateType === "today" ? "Today" : dateType === "prior" ? (dateValue || "Prior") : (dateValue || "Future");
  const canSubmit = amount && parseFloat(amount) > 0;

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modalSheet, maxHeight: "85%", overflow: "auto" }} onClick={e => e.stopPropagation()}>
        <div style={S.modalHandle} /><div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, textAlign: "center", fontFamily: "'DM Serif Display', Georgia, serif" }}>Log Income</div>
        <div style={{ textAlign: "center", margin: "16px 0 14px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><span style={{ fontSize: 32, color: C.success, fontFamily: "'DM Serif Display', Georgia, serif" }}>$</span><input autoFocus value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" step="0.01" style={{ background: "transparent", border: "none", color: C.textPrimary, fontSize: 42, fontFamily: "'DM Serif Display', Georgia, serif", textAlign: "center", width: 180, outline: "none" }} /></div></div>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 8 }}>Date</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>{[{ key: "today", label: "Today" }, { key: "prior", label: "Prior Date" }, { key: "future", label: "Future Date" }].map(d => <button key={d.key} onClick={() => setDateType(d.key)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: dateType === d.key ? `${C.primary}12` : C.bg, border: `1px solid ${dateType === d.key ? `${C.primary}35` : `${C.secondary}20`}`, color: dateType === d.key ? C.primary : C.textSecondary, fontSize: 11, fontWeight: 600 }}>{d.label}</button>)}</div>
        {dateType !== "today" && <div style={{ marginBottom: 10 }}><input type="date" value={dateValue} onChange={e => setDateValue(e.target.value)} style={{ ...S.modalInput, colorScheme: "light" }} /></div>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, marginBottom: 8, background: C.bg, border: `1px solid ${C.secondary}20` }}><div><div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Recurring</div><div style={{ fontSize: 10, color: C.textSecondary }}>Repeat this income on a schedule</div></div><div onClick={() => setIsRecurring(!isRecurring)} style={{ width: 44, height: 26, borderRadius: 13, cursor: "pointer", background: isRecurring ? C.primary : `${C.secondary}40`, position: "relative", transition: "background .25s ease", flexShrink: 0 }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: isRecurring ? 21 : 3, transition: "left .25s ease" }} /></div></div>
        {isRecurring && <div style={{ animation: "fadeIn .2s ease", marginBottom: 8 }}><div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.textSecondary, fontWeight: 600, marginBottom: 8 }}>Schedule</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>{RECURRING_OPTIONS.map(opt => <button key={opt} onClick={() => setRecurringSchedule(opt)} style={{ padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: recurringSchedule === opt ? `${C.primary}12` : C.bg, border: `1px solid ${recurringSchedule === opt ? `${C.primary}35` : `${C.secondary}20`}`, color: recurringSchedule === opt ? C.primary : C.textSecondary, fontSize: 11, fontWeight: 600 }}>{opt}</button>)}</div>{recurringSchedule === "Custom" && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12, color: C.textSecondary }}>Every</span><input value={customDays} onChange={e => setCustomDays(e.target.value)} type="number" placeholder="X" min="1" style={{ ...S.modalInput, width: 60, textAlign: "center" }} /><span style={{ fontSize: 12, color: C.textSecondary }}>days</span></div>}</div>}
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (e.g., Salary, Freelance)..." style={{ width: "100%", background: C.bg, border: `1px solid ${C.secondary}25`, borderRadius: 10, padding: "10px 14px", color: C.textPrimary, fontSize: 13, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />
        <button onClick={() => { if (canSubmit) onSubmit({ amount, note, dateType, dateLabel, isRecurring, recurringSchedule, customDays }); }} disabled={!canSubmit} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", background: canSubmit ? C.success : `${C.secondary}20`, color: canSubmit ? "#fff" : C.textSecondary, fontSize: 14, fontWeight: 700, letterSpacing: .5 }}>Confirm Income</button>
      </div>
    </div>
  );
}

function ReallocationPrompt({ event, dailySafe, onSmooth, onManual, onCancel }) {
  return <div style={S.modalOverlay} onClick={onCancel}><div style={{ ...S.modalSheet, textAlign: "center" }} onClick={e => e.stopPropagation()}><div style={S.modalHandle} /><div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div><div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, fontFamily: "'DM Serif Display', Georgia, serif" }}>Reallocation Needed</div><div style={{ fontSize: 12, color: C.textSecondary, margin: "8px 0 20px", lineHeight: 1.5 }}>"{event.name}" (${fmt(event.amount)}) exceeds your daily limit of ${fmt(dailySafe)}. How would you like to cover it?</div><button onClick={onSmooth} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Smooth It — Reduce all future days</button><button onClick={onManual} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", background: C.surface, color: C.textPrimary, fontSize: 13, fontWeight: 600, marginBottom: 8, border: `1px solid ${C.secondary}25` }}>Manual Cut — Choose where to reduce</button><button onClick={onCancel} style={{ width: "100%", padding: "10px", background: "transparent", border: "none", color: C.textSecondary, fontSize: 12, cursor: "pointer" }}>Cancel</button></div></div>;
}

// ─── Styles ──────────────────────────────────────────────────────────
const S = {
  phone: { width: 375, maxWidth: "100%", height: "100vh", margin: "0 auto", background: C.bg, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', -apple-system, sans-serif" },
  statusBar: { height: 44, padding: "14px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", color: C.textPrimary, flexShrink: 0 },
  content: { flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch" },
  screen: { minHeight: "100%", paddingBottom: 20 },
  tabBar: { display: "flex", justifyContent: "space-around", padding: "8px 8px 2px", background: C.surface, backdropFilter: "blur(20px)", borderTop: `1px solid ${C.secondary}20`, flexShrink: 0 },
  tabBtn: { background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 8px", transition: "color .2s ease" },
  homeIndicator: { height: 20, display: "flex", justifyContent: "center", alignItems: "center", background: C.surface, flexShrink: 0 },
  homeBar: { width: 134, height: 4, borderRadius: 2, background: `${C.secondary}40` },
  heroCard: { margin: "8px 20px 0", padding: "20px 20px 18px", borderRadius: 20, background: C.surface, border: `1px solid ${C.secondary}20` },
  progressTrack: { height: 4, borderRadius: 2, background: `${C.secondary}20`, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2, transition: "width .8s cubic-bezier(.16,1,.3,1)" },
  actionBtn: { flex: 1, padding: "13px 8px", borderRadius: 14, border: "none", cursor: "pointer", background: C.surface, border: `1px solid ${C.secondary}20`, color: C.textPrimary, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all .2s ease" },
  coinOverlay: { position: "absolute", inset: 0, background: `${C.bg}E8`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(10px)", animation: "fadeIn .3s ease" },
  coinAnim: { textAlign: "center", animation: "scaleIn .5s cubic-bezier(.16,1,.3,1)" },
  modalOverlay: { position: "absolute", inset: 0, background: "rgba(30,35,34,.35)", display: "flex", alignItems: "flex-end", zIndex: 200, backdropFilter: "blur(5px)", animation: "fadeIn .2s ease" },
  modalSheet: { width: "100%", padding: "12px 24px 32px", background: `linear-gradient(180deg, ${C.surface}, ${C.bg})`, borderRadius: "20px 20px 0 0", border: `1px solid ${C.secondary}20`, borderBottom: "none", animation: "slideUp .3s cubic-bezier(.16,1,.3,1)" },
  modalHandle: { width: 36, height: 4, borderRadius: 2, background: `${C.secondary}40`, margin: "4px auto 16px" },
  modalInput: { width: "100%", background: C.bg, border: `1px solid ${C.secondary}25`, borderRadius: 10, padding: "10px 14px", color: C.textPrimary, fontSize: 13, outline: "none", boxSizing: "border-box" },
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes scaleIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
  @keyframes coinSpin { 0% { transform: rotateY(0deg) scale(0.5); opacity: 0 } 50% { transform: rotateY(360deg) scale(1.2) } 100% { transform: rotateY(720deg) scale(1); opacity: 1 } }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }
  body { background: ${C.bg}; }
  input::placeholder { color: #99A79980; }
  input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
  ::-webkit-scrollbar { width: 0; }
`;
