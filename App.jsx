import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from "recharts";
import { ArrowRight, ArrowLeft, RotateCcw, TrendingUp, TrendingDown, Compass, Pencil, Download, ShieldCheck } from "lucide-react";

const BRAND = { name: "Adlatus", tagline: "CCUP Ultra Light" };

// Formspree-Endpoint für die echte Erfassung der E-Mail-Adressen.
// 1) Auf https://formspree.io kostenloses Konto erstellen
// 2) Neues Formular anlegen, die eigene Zieladresse (z.B. deine Adlatus-Mailadresse) hinterlegen
// 3) Die Formular-ID (Format "xxxxaaaa") unten anstelle von "YOUR_FORM_ID" eintragen
// Solange hier "YOUR_FORM_ID" steht, wird der Versand übersprungen und nur lokal geloggt.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xaewwree";

const CATEGORIES = [
  {
    id: "strategie",
    name: "Strategie",
    short: "Strategie",
    questions: [
      { ccup: 29, text: "Hat das Unternehmen eine klare Strategie für die nächsten 3–5 Jahre?" },
      { ccup: 28, text: "Sind die Unternehmensziele schriftlich festgelegt und den wichtigsten Mitarbeitenden bekannt?" },
      { ccup: 33, text: "Werden die strategischen Ziele regelmässig überprüft und bei Bedarf angepasst?" },
    ],
    critical: "Es ist keine erkennbare Strategie vorhanden. Setzen Sie umgehend (innert 4 Wochen) einen Strategie-Workshop mit der Geschäftsleitung an, um mindestens 3 schriftliche Ziele für die nächsten 3–5 Jahre festzulegen.",
    low: "Erste strategische Überlegungen bestehen, sind aber weder schriftlich festgehalten noch den wichtigsten Mitarbeitenden bekannt. Halten Sie die Ziele auf 1–2 Seiten schriftlich fest und kommunizieren Sie sie in der nächsten Kadersitzung.",
    mid: "Eine Strategie besteht, wird aber nur unregelmässig überprüft oder ist nicht allen relevanten Personen bekannt. Legen Sie einen fixen Review-Termin (z. B. quartalsweise) fest und informieren Sie die wichtigsten Mitarbeitenden aktiv.",
    solid: "Ziele sind schriftlich festgehalten, bekannt und werden grösstenteils überprüft. Schärfen Sie die Überprüfung zu einem festen, dokumentierten Rhythmus und halten Sie Anpassungen schriftlich fest.",
    high: "Strategie und Zielsetzung sind verankert, bekannt und werden konsequent überprüft. Halten Sie den Review-Rhythmus bei und nutzen Sie die Strategie aktiv als Entscheidungsgrundlage im Tagesgeschäft.",
  },
  {
    id: "fuehrung",
    name: "Führung & Organisation",
    short: "Führung",
    questions: [
      { ccup: 36, text: "Sind Aufgaben, Kompetenzen und Verantwortlichkeiten klar geregelt?" },
      { ccup: 47, text: "Sind die wichtigsten Geschäftsprozesse dokumentiert und funktionieren sie zuverlässig?" },
      { ccup: 54, text: "Ist die Nachfolge der Geschäftsleitung bzw. von Schlüsselpersonen geregelt?" },
    ],
    critical: "Aufgaben, Kompetenzen und Verantwortlichkeiten sind faktisch ungeregelt, ebenso die Nachfolge von Schlüsselpersonen. Erstellen Sie umgehend ein einfaches Organigramm und benennen Sie für die Geschäftsleitung mindestens eine Notfall-Stellvertretung.",
    low: "Zuständigkeiten sind teils informell geregelt, aber nicht dokumentiert; eine Nachfolgeplanung fehlt. Dokumentieren Sie die 2–3 kritischsten Prozesse und beginnen Sie mit einem ersten, auch vorläufigen Nachfolgeplan.",
    mid: "Struktur und Prozesse bestehen teilweise, sind aber nicht durchgängig dokumentiert oder die Nachfolge ist erst informell geklärt. Halten Sie den Nachfolgeplan schriftlich fest und ergänzen Sie fehlende Prozessdokumentationen.",
    solid: "Verantwortlichkeiten und Prozesse sind grösstenteils geregelt und dokumentiert, die Nachfolge ist angedacht. Formalisieren Sie den Nachfolgeplan mit konkretem Zeitpunkt und Übergabeschritten.",
    high: "Verantwortlichkeiten, Prozesse und Nachfolge sind klar geregelt und dokumentiert. Prüfen Sie jährlich, ob Organigramm und Nachfolgeplan noch zur aktuellen Unternehmensgrösse passen.",
  },
  {
    id: "markt",
    name: "Markt & Kunden",
    short: "Markt",
    questions: [
      { ccup: 96, text: "Gewinnt das Unternehmen regelmässig neue Kunden?" },
      { ccup: 108, text: "Kennt das Unternehmen seine Marktposition und die wichtigsten Wettbewerber?" },
      { ccup: 109, text: "Kennt das Unternehmen die heutigen und zukünftigen Bedürfnisse seiner Kunden?" },
    ],
    critical: "Es fehlt eine erkennbare Auseinandersetzung mit Markt, Wettbewerb und Kundenbedürfnissen. Führen Sie innert 4 Wochen erste Kundengespräche und erstellen Sie eine Grobübersicht der wichtigsten Mitbewerber.",
    low: "Markt- und Kundenkenntnis ist punktuell vorhanden, aber nicht systematisch erfasst. Führen Sie 8–10 Kunden- bzw. Win-/Loss-Gespräche und dokumentieren Sie die 3–5 wichtigsten Wettbewerber.",
    mid: "Markt- und Kundenkenntnis ist vorhanden, aber nicht regelmässig aktualisiert. Führen Sie eine wiederkehrende Kundenbefragung (z. B. 1× jährlich) ein und aktualisieren Sie die Wettbewerbsübersicht.",
    solid: "Markt und Kundenbedürfnisse sind gut bekannt, die Erhebung erfolgt aber nicht durchgängig strukturiert. Institutionalisieren Sie feste Feedback-Schlaufen und Wettbewerbs-Updates.",
    high: "Markt-, Wettbewerbs- und Kundenkenntnis sind ausgeprägt und werden aktiv gepflegt. Nutzen Sie dieses Wissen systematisch für Angebots- und Preisentscheide.",
  },
  {
    id: "finanzen",
    name: "Finanzen & Digitalisierung",
    short: "Finanzen",
    questions: [
      { ccup: 118, text: "Unterstützt die Informatik bzw. Digitalisierung die Geschäftsprozesse wirksam?" },
      { ccup: 126, text: "Stehen der Geschäftsleitung die wichtigsten Führungskennzahlen rechtzeitig zur Verfügung?" },
      { ccup: 158, text: "Werden Budget, Soll-Ist-Vergleiche und Liquidität regelmässig überwacht?" },
    ],
    critical: "Es fehlen zeitnahe Kennzahlen, Liquiditätsplanung und eine wirksame digitale Unterstützung. Bauen Sie umgehend ein einfaches Dashboard mit 5 Kernkennzahlen und eine rollierende 12-Monats-Liquiditätsplanung auf.",
    low: "Kennzahlen und digitale Tools sind vorhanden, kommen aber verspätet oder unvollständig bei der Geschäftsleitung an. Reduzieren Sie das Reporting auf 5–8 Kennzahlen mit fixem monatlichem Liefertermin.",
    mid: "Reporting und Liquiditätsplanung bestehen, sind aber nicht durchgängig zeitnah oder vollständig. Definieren Sie einen fixen Liefertermin nach Monatsabschluss und ergänzen Sie fehlende Kennzahlen.",
    solid: "Kennzahlen und Liquiditätsplanung stehen weitgehend zeitnah zur Verfügung. Prüfen Sie Automatisierungspotenzial, um den Erhebungsaufwand weiter zu senken.",
    high: "Kennzahlen, Budgetkontrolle und Liquiditätsplanung stehen zeitnah und zuverlässig zur Verfügung. Prüfen Sie periodisch, ob die eingesetzten IT-Tools noch zur Unternehmensgrösse passen.",
  },
  {
    id: "zukunft",
    name: "Zukunft & Risiken",
    short: "Zukunft",
    questions: [
      { ccup: 137, text: "Entwickelt das Unternehmen seine Mitarbeitenden gezielt weiter?" },
      { ccup: 165, text: "Sind die wichtigsten Unternehmensrisiken bekannt und werden sie aktiv gesteuert?" },
      { ccup: 91, text: "Entwickelt das Unternehmen seine Produkte, Dienstleistungen oder Geschäftsmodelle kontinuierlich weiter?" },
    ],
    critical: "Risiken sind nicht erfasst, Weiterentwicklung von Mitarbeitenden und Angebot findet kaum statt. Erstellen Sie umgehend eine Liste der 5 grössten Risiken und definieren Sie erste Weiterbildungsschritte.",
    low: "Einzelne Risiken sind bekannt, eine systematische Erfassung sowie Weiterbildungsplanung fehlen. Erstellen Sie eine Liste der 10 wichtigsten Risiken mit Gegenmassnahme und definieren Sie je einen Weiterbildungsschritt pro Mitarbeitendem.",
    mid: "Risiken und Weiterentwicklung werden teilweise, aber nicht systematisch angegangen. Halten Sie die 3–5 grössten Risiken schriftlich fest und vereinbaren Sie jährliche Entwicklungsgespräche.",
    solid: "Risikomanagement und Weiterentwicklung sind weitgehend etabliert. Verankern Sie die Risikoliste fest im jährlichen Strategie-Review.",
    high: "Risikomanagement, Weiterentwicklung von Mitarbeitenden und Angebot sind aktiv und systematisch verankert. Halten Sie den jährlichen Review-Rhythmus bei, um am Ball zu bleiben.",
  },
];

const SCALE = [
  { v: 1, label: "Trifft gar nicht zu" },
  { v: 2, label: "Trifft eher nicht zu" },
  { v: 3, label: "Teils/teils" },
  { v: 4, label: "Trifft eher zu" },
  { v: 5, label: "Trifft voll zu" },
];

const allQuestions = CATEGORIES.flatMap((c) =>
  c.questions.map((q, i) => ({ catId: c.id, catName: c.name, qIndex: i, ccup: q.ccup, text: q.text }))
);

const PROGRESS_KEY = "ccup-progress-v1";

// Ausserhalb von Claude-Artifacts gibt es kein window.storage — echtes
// localStorage übernimmt hier dieselbe Rolle (Browser-lokal, pro Gerät).
const storage = {
  async get(key) {
    const v = localStorage.getItem(key);
    if (v === null) throw new Error("not found");
    return { key, value: v };
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
};

// Bewertungsspanne auf Basis der 1–5-Notenskala (nicht Prozent).
// Skala 1–5 gleichmässig in 5 Bänder à 0.8 Punkte unterteilt.
function tierFor(avg) {
  if (avg <= 1.8) return { key: "critical", label: "Erheblicher Handlungsbedarf", color: "#8C3B30" };
  if (avg <= 2.6) return { key: "low", label: "Handlungsbedarf", color: "#A44B3F" };
  if (avg <= 3.4) return { key: "mid", label: "Ausbaufähig", color: "#B8863D" };
  if (avg <= 4.2) return { key: "solid", label: "Solide Aufstellung", color: "#4C8577" };
  return { key: "high", label: "Starke Aufstellung", color: "#21665A" };
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function App() {
  const [stage, setStage] = useState("intro"); // intro | quiz | review | report
  const [company, setCompany] = useState("");
  const [answers, setAnswers] = useState({});
  const [qi, setQi] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [resumeAvailable, setResumeAvailable] = useState(false);
  const savedRef = useRef(null);

  // Check for saved progress on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await storage.get(PROGRESS_KEY);
        if (res && res.value) {
          const data = JSON.parse(res.value);
          if (data && data.answers && Object.keys(data.answers).length > 0) {
            savedRef.current = data;
            setResumeAvailable(true);
          }
        }
      } catch (e) {
        // no saved progress, ignore
      }
    })();
  }, []);

  // Autosave progress while filling out the questionnaire
  useEffect(() => {
    if (stage !== "quiz" && stage !== "review") return;
    if (Object.keys(answers).length === 0) return;
    (async () => {
      try {
        await storage.set(PROGRESS_KEY, JSON.stringify({ company, answers, qi }));
      } catch (e) {
        // saving is best-effort
      }
    })();
  }, [answers, qi, company, stage]);

  // Scroll to top whenever the stage changes (e.g. Übersicht -> Bericht),
  // so the report always opens at the name/diagram, not wherever the user last scrolled to.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [stage]);

  const current = allQuestions[qi];
  const key = current ? `${current.catId}-${current.qIndex}` : null;

  const catScores = useMemo(() => {
    return CATEGORIES.map((c) => {
      const vals = c.questions.map((_, i) => answers[`${c.id}-${i}`]).filter(Boolean);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      return { ...c, avg, pct: Math.round((avg / 5) * 100) };
    });
  }, [answers]);

  const overallPct = useMemo(() => {
    const vals = Object.values(answers);
    if (!vals.length) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length / 5) * 100);
  }, [answers]);

  const overallAvg = useMemo(() => {
    const vals = Object.values(answers);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [answers]);

  const overallTier = tierFor(overallAvg);
  const sorted = [...catScores].sort((a, b) => b.avg - a.avg);
  const strengths = sorted.slice(0, 2);
  const weaknesses = [...sorted].reverse().slice(0, 2);

  function selectAnswer(v) {
    const next = { ...answers, [key]: v };
    setAnswers(next);
    setTimeout(() => {
      if (editMode) {
        setEditMode(false);
        setStage("review");
      } else if (qi < allQuestions.length - 1) {
        setQi(qi + 1);
      } else {
        setStage("review");
      }
    }, 180);
  }

  async function reset() {
    setAnswers({});
    setQi(0);
    setEditMode(false);
    setCompany("");
    setStage("intro");
    setResumeAvailable(false);
    try { await storage.delete(PROGRESS_KEY); } catch (e) {}
  }

  function resumeProgress() {
    if (savedRef.current) {
      setCompany(savedRef.current.company || "");
      setAnswers(savedRef.current.answers || {});
      setQi(savedRef.current.qi || 0);
    }
    setResumeAvailable(false);
    setStage("quiz");
  }

  function discardProgress() {
    setResumeAvailable(false);
    storage.delete(PROGRESS_KEY).catch(() => {});
  }

  return (
    <div style={styles.page}>
      <style>{globalStyles}</style>
      {stage === "intro" && (
        <Intro
          company={company}
          setCompany={setCompany}
          onStart={() => setStage("quiz")}
          resumeAvailable={resumeAvailable}
          onResume={resumeProgress}
          onDiscard={discardProgress}
        />
      )}
      {stage === "quiz" && current && (
        <Quiz
          current={current}
          qi={qi}
          total={allQuestions.length}
          selected={answers[key]}
          onSelect={selectAnswer}
          onBack={() => {
            if (editMode) {
              setEditMode(false);
              setStage("review");
            } else if (qi > 0) {
              setQi(qi - 1);
            }
          }}
          editMode={editMode}
        />
      )}
      {stage === "review" && (
        <Review
          answers={answers}
          onEdit={(i) => { setQi(i); setEditMode(true); setStage("quiz"); }}
          onConfirm={() => setStage("report")}
        />
      )}
      {stage === "report" && (
        <Report
          company={company}
          catScores={catScores}
          overallPct={overallPct}
          overallAvg={overallAvg}
          overallTier={overallTier}
          strengths={strengths}
          weaknesses={weaknesses}
          onRestart={reset}
        />
      )}
    </div>
  );
}

function Intro({ company, setCompany, onStart, resumeAvailable, onResume, onDiscard }) {
  return (
    <div style={styles.centerWrap}>
      <div style={{ ...styles.card, maxWidth: 560, textAlign: "center" }}>
        <div style={styles.gaugeIconWrap}>
          <Compass size={30} color="#F1F0EA" strokeWidth={1.6} />
        </div>
        <div style={styles.eyebrow}>{BRAND.tagline} · Unternehmensanalyse</div>
        <h1 style={styles.h1}>Wo steht Ihr Unternehmen heute?</h1>
        <p style={styles.pIntro}>
          15 Kernfragen aus fünf Kapiteln des CCUP-Bewertungsrasters. Am Ende erhalten Sie
          einen Bericht mit Score, Stärken und konkreten Handlungsfeldern.
        </p>

        {resumeAvailable && (
          <div style={styles.resumeBox}>
            <span style={styles.resumeText}>Es liegt eine unvollständige Analyse vor.</span>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 10 }}>
              <button style={styles.resumeBtn} onClick={onResume}>Fortsetzen</button>
              <button style={styles.resumeBtnGhost} onClick={onDiscard}>Neu beginnen</button>
            </div>
          </div>
        )}

        <label style={styles.label}>Name des Unternehmens (optional)</label>
        <input
          style={styles.input}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="z. B. Muster AG"
        />
        <button style={styles.primaryBtn} onClick={onStart}>
          Analyse starten <ArrowRight size={17} style={{ marginLeft: 8 }} />
        </button>
        <div style={styles.catStrip}>
          {CATEGORIES.map((c) => (
            <span key={c.id} style={styles.catChip}>{c.short}</span>
          ))}
        </div>
        <div style={styles.brandFooter}>{BRAND.name}</div>
      </div>
    </div>
  );
}

function Quiz({ current, qi, total, selected, onSelect, onBack, editMode }) {
  const pct = Math.round(((qi) / total) * 100);
  return (
    <div style={styles.centerWrap}>
      <div style={{ ...styles.card, maxWidth: 620 }}>
        {editMode ? (
          <div style={styles.editModeBadge}>
            <Pencil size={13} style={{ marginRight: 6 }} /> Einzelne Antwort bearbeiten
          </div>
        ) : (
          <div style={styles.progressRow}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${pct}%` }} />
            </div>
            <span style={styles.progressLabel}>{qi + 1} / {total}</span>
          </div>
        )}
        <div style={styles.catTagRow}>
          <span style={styles.catTag}>{current.catName}</span>
          <span style={styles.ccupTag}>CCUP {current.ccup}</span>
        </div>
        <h2 style={styles.question}>{current.text}</h2>
        <div style={styles.scaleWrap}>
          {SCALE.map((s) => (
            <button
              key={s.v}
              onClick={() => onSelect(s.v)}
              style={{
                ...styles.scaleBtn,
                ...(selected === s.v ? styles.scaleBtnActive : {}),
              }}
            >
              <span style={styles.scaleNum}>{s.v}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        {(editMode || qi > 0) && (
          <button style={styles.backBtn} onClick={onBack}>
            <ArrowLeft size={15} style={{ marginRight: 6 }} /> {editMode ? "Zurück zur Übersicht" : "Zurück"}
          </button>
        )}
      </div>
    </div>
  );
}

function Review({ answers, onEdit, onConfirm }) {
  const answeredCount = allQuestions.filter((q) => answers[`${q.catId}-${q.qIndex}`]).length;
  const allAnswered = answeredCount === allQuestions.length;
  return (
    <div style={{ ...styles.centerWrap, alignItems: "flex-start", paddingTop: 48 }}>
      <div style={{ ...styles.card, maxWidth: 680 }}>
        <div style={styles.eyebrow}>Überprüfung</div>
        <h1 style={styles.h1}>Ihre Antworten im Überblick</h1>
        <p style={styles.pIntro}>
          Kontrollieren Sie Ihre Angaben. Mit "Bearbeiten" können Sie einzelne Antworten korrigieren.
        </p>
        <div style={styles.reviewList}>
          {allQuestions.map((q, i) => {
            const val = answers[`${q.catId}-${q.qIndex}`];
            const label = SCALE.find((s) => s.v === val)?.label || "Nicht beantwortet";
            return (
              <div key={i} style={styles.reviewRow}>
                <div style={styles.reviewRowLeft}>
                  <div style={styles.reviewCatLine}>{q.catName} · CCUP {q.ccup}</div>
                  <div style={styles.reviewQText}>{q.text}</div>
                  <div style={{ ...styles.reviewAnswer, color: val ? "#21665A" : "#A44B3F" }}>
                    {val ? `${val} — ${label}` : "Nicht beantwortet"}
                  </div>
                </div>
                <button style={styles.editBtn} onClick={() => onEdit(i)}>
                  <Pencil size={14} style={{ marginRight: 5 }} /> Bearbeiten
                </button>
              </div>
            );
          })}
        </div>
        <button
          style={{ ...styles.primaryBtn, opacity: allAnswered ? 1 : 0.5, cursor: allAnswered ? "pointer" : "not-allowed" }}
          onClick={() => allAnswered && onConfirm()}
          disabled={!allAnswered}
        >
          Bericht erstellen <ArrowRight size={17} style={{ marginLeft: 8 }} />
        </button>
        {!allAnswered && (
          <div style={styles.reviewWarning}>Bitte beantworten Sie zuerst alle Fragen.</div>
        )}
      </div>
    </div>
  );
}

function Report({ company, catScores, overallPct, overallAvg, overallTier, strengths, weaknesses, onRestart }) {
  const radarData = catScores.map((c) => ({ subject: c.short, value: c.avg, full: 5 }));
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [sendState, setSendState] = useState("idle"); // idle | sending | sent | error
  const canDownload = isValidEmail(email) && consent && sendState !== "sending";
  const formspreeConfigured = FORMSPREE_ENDPOINT.indexOf("YOUR_FORM_ID") === -1;

  function handleDownload() {
    if (!isValidEmail(email) || !consent || sendState === "sending") return;

    // window.print() muss synchron im Klick-Handler ausgelöst werden, sonst
    // blockieren manche mobilen Browser (v.a. iOS Safari) den Druckdialog,
    // wenn zuvor auf ein fetch() gewartet wurde. Deshalb zuerst drucken,
    // der Formspree-Versand läuft parallel im Hintergrund.
    window.print();

    if (formspreeConfigured) {
      setSendState("sending");
      const fd = new FormData();
      fd.append("email", email);
      fd.append("unternehmen", company || "(nicht angegeben)");
      fd.append("gesamtscore", `${overallAvg.toFixed(1)} / 5 (${overallTier.label})`);
      fd.append("kapitel", catScores.map((c) => `${c.name}: ${c.avg.toFixed(1)}/5`).join(" · "));
      // mode: "no-cors" + FormData vermeidet CORS-Preflight und das (in Sandbox-/
      // In-App-Vorschauen oft blockierte) Lesen der Server-Antwort. Wir können den
      // Erfolg dadurch nicht mehr zu 100% verifizieren, aber der Request kommt zuverlässig an.
      fetch(FORMSPREE_ENDPOINT, { method: "POST", mode: "no-cors", body: fd })
        .then(() => setSendState("sent"))
        .catch(() => setSendState("error"));
    }
  }

  return (
    <div style={{ ...styles.centerWrap, alignItems: "flex-start", paddingTop: 48 }}>
      <div id="printable-report" style={{ ...styles.card, maxWidth: 760 }}>
        <div style={styles.eyebrow}>{BRAND.tagline} · Ergebnisbericht</div>
        <h1 style={styles.h1}>{company ? company : "Ihr Unternehmen"}</h1>

        <div style={styles.gaugeRow}>
          <Gauge pct={overallPct} label={overallAvg.toFixed(1)} color={overallTier.color} />
          <div style={styles.gaugeText}>
            <div style={{ ...styles.tierLabel, color: overallTier.color }}>{overallTier.label}</div>
            <div style={styles.gaugeSub}>
              Gesamtscore basierend auf 15 CCUP-Kernfragen in 5 Kapiteln — Ø {overallAvg.toFixed(1)} / 5
            </div>
          </div>
        </div>

        <div style={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="#D9D6C9" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#1B2430", fontSize: 13, fontFamily: "Inter, sans-serif" }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fill: "#8B8B7A", fontSize: 10 }} />
              <Radar dataKey="value" stroke="#21665A" fill="#21665A" fillOpacity={0.28} strokeWidth={2} />
              <Tooltip
                contentStyle={{ fontFamily: "Inter, sans-serif", borderRadius: 8, border: "1px solid #D9D6C9" }}
                formatter={(value) => [`${Number(value).toFixed(1)} / 5`, "Note"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.barsWrap}>
          {catScores.map((c) => {
            const t = tierFor(c.avg);
            return (
              <div key={c.id} style={styles.barRow}>
                <div style={styles.barLabelRow}>
                  <span style={styles.barLabel}>{c.name}</span>
                  <span style={{ ...styles.barPct, color: t.color }}>{c.avg.toFixed(1)} / 5</span>
                </div>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${c.pct}%`, background: t.color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.twoCol}>
          <div style={styles.colCard}>
            <div style={styles.colHeader}>
              <TrendingUp size={17} color="#21665A" />
              <span>Stärken</span>
            </div>
            {strengths.map((s) => (
              <div key={s.id} style={styles.insightItem}>
                <div style={styles.insightTitle}>{s.name} — {s.avg.toFixed(1)} / 5</div>
                <div style={styles.insightText}>{s[tierFor(s.avg).key]}</div>
              </div>
            ))}
          </div>
          <div style={styles.colCard}>
            <div style={styles.colHeader}>
              <TrendingDown size={17} color="#A44B3F" />
              <span>Handlungsfelder</span>
            </div>
            {weaknesses.map((s) => (
              <div key={s.id} style={styles.insightItem}>
                <div style={styles.insightTitle}>{s.name} — {s.avg.toFixed(1)} / 5</div>
                <div style={styles.insightText}>{s[tierFor(s.avg).key]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="print-footer" style={styles.printFooter}>{BRAND.name} · {BRAND.tagline}</div>
      </div>

      <div className="no-print" style={{ ...styles.card, maxWidth: 760, marginTop: 20 }}>
        <div style={styles.colHeader}>
          <Download size={17} color="#1B2430" />
          <span>Bericht als PDF herunterladen</span>
        </div>
        <label style={styles.label}>E-Mail-Adresse</label>
        <input
          style={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@firma.ch"
        />
        <label style={styles.consentRow}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
          <span style={styles.consentText}>
            Ich bin einverstanden, dass meine E-Mail-Adresse zusammen mit dem Analyseergebnis an
            {" "}{BRAND.name} übermittelt wird, um den PDF-Download freizuschalten. Es erfolgt keine
            Weitergabe an Dritte.
          </span>
        </label>
        {formspreeConfigured ? (
          <div style={styles.privacyNote}>
            <ShieldCheck size={14} style={{ marginRight: 6, flexShrink: 0, marginTop: 2 }} />
            <span>
              Hinweis: Die Adresse wird bei Klick auf "PDF herunterladen" über Formspree an {BRAND.name}{" "}
              übermittelt. Der PDF-Download selbst erfolgt weiterhin über die Druckfunktion Ihres
              Browsers ("Als PDF speichern").
            </span>
          </div>
        ) : (
          <div style={styles.privacyNote}>
            <ShieldCheck size={14} style={{ marginRight: 6, flexShrink: 0, marginTop: 2 }} />
            <span>
              Hinweis: Die Erfassung ist noch nicht aktiv konfiguriert (Formspree-Endpoint fehlt im
              Code). Es wird aktuell keine E-Mail übermittelt oder gespeichert.
            </span>
          </div>
        )}
        {sendState === "sent" && (
          <div style={{ ...styles.privacyNote, color: "#21665A" }}>
            <ShieldCheck size={14} style={{ marginRight: 6, flexShrink: 0, marginTop: 2 }} />
            <span>Adresse übermittelt.</span>
          </div>
        )}
        {sendState === "error" && (
          <div style={{ ...styles.privacyNote, color: "#A44B3F" }}>
            <ShieldCheck size={14} style={{ marginRight: 6, flexShrink: 0, marginTop: 2 }} />
            <span>Übermittlung fehlgeschlagen (z.B. keine Internetverbindung). Der PDF-Download funktioniert trotzdem.</span>
          </div>
        )}
        <button
          style={{ ...styles.primaryBtn, opacity: canDownload ? 1 : 0.5, cursor: canDownload ? "pointer" : "not-allowed" }}
          onClick={handleDownload}
          disabled={!canDownload}
        >
          <Download size={16} style={{ marginRight: 8 }} /> {sendState === "sending" ? "Wird gesendet…" : "PDF herunterladen"}
        </button>

        <button style={styles.secondaryBtn} onClick={onRestart}>
          <RotateCcw size={15} style={{ marginRight: 8 }} /> Neue Analyse starten
        </button>
      </div>
    </div>
  );
}

function Gauge({ pct, label, color }) {
  const size = 132;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const arcFrac = 0.75;
  const offset = circ * (1 - arcFrac * (pct / 100));
  const dashArray = `${circ * arcFrac} ${circ}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(135deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E4E2D6" strokeWidth={stroke} fill="none"
        strokeDasharray={dashArray} strokeLinecap="round" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={dashArray} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(-135 ${size / 2} ${size / 2})`}
        style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 26, fill: "#1B2430", fontWeight: 600 }}>
        {label}
      </text>
    </svg>
  );
}

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
.print-footer { display: none; }
@media print {
  .no-print { display: none !important; }
  #printable-report { box-shadow: none !important; border: none !important; }
  .print-footer { display: block !important; margin-top: 24px; font-size: 11px; color: #8B8B7A; font-family: 'IBM Plex Mono', monospace; }
}
`;

const styles = {
  page: {
    minHeight: "100vh",
    background: "#EDEEE9",
    color: "#1B2430",
    fontFamily: "'Inter', sans-serif",
    display: "flex",
    justifyContent: "center",
  },
  centerWrap: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 16px 64px",
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    boxShadow: "0 1px 2px rgba(27,36,48,0.06), 0 8px 24px rgba(27,36,48,0.06)",
    border: "1px solid #E4E2D6",
    boxSizing: "border-box",
  },
  gaugeIconWrap: {
    width: 52, height: 52, borderRadius: "50%", background: "#21665A",
    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
  },
  eyebrow: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "#8B8B7A", marginBottom: 8,
  },
  h1: {
    fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30,
    margin: "0 0 12px", lineHeight: 1.15,
  },
  pIntro: { color: "#4B5563", fontSize: 15.5, lineHeight: 1.6, marginBottom: 28 },
  label: { display: "block", fontSize: 13, color: "#6B6B5E", marginBottom: 6, textAlign: "left" },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #D9D6C9",
    fontSize: 15, fontFamily: "'Inter', sans-serif", marginBottom: 16, boxSizing: "border-box",
    outline: "none",
  },
  primaryBtn: {
    background: "#1B2430", color: "#F1F0EA", border: "none", borderRadius: 10,
    padding: "13px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer",
    display: "inline-flex", alignItems: "center", fontFamily: "'Inter', sans-serif",
  },
  secondaryBtn: {
    background: "transparent", color: "#1B2430", border: "1px solid #D9D6C9", borderRadius: 10,
    padding: "12px 22px", fontSize: 14.5, fontWeight: 500, cursor: "pointer",
    display: "inline-flex", alignItems: "center", fontFamily: "'Inter', sans-serif", marginTop: 14,
  },
  catStrip: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 26 },
  catChip: {
    fontSize: 12, color: "#4B5563", background: "#EDEEE9", padding: "5px 12px",
    borderRadius: 999, fontFamily: "'IBM Plex Mono', monospace",
  },
  brandFooter: {
    marginTop: 28, fontSize: 11.5, color: "#B4B2A2", fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: "0.05em", textTransform: "uppercase",
  },
  resumeBox: {
    background: "#F4F0E3", border: "1px solid #E4DABF", borderRadius: 10,
    padding: "14px 16px", marginBottom: 22,
  },
  resumeText: { fontSize: 13.5, color: "#6B5B2E" },
  resumeBtn: {
    background: "#1B2430", color: "#F1F0EA", border: "none", borderRadius: 8,
    padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif",
  },
  resumeBtnGhost: {
    background: "transparent", color: "#6B6B5E", border: "1px solid #D9D6C9", borderRadius: 8,
    padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif",
  },
  progressRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 },
  progressTrack: { flex: 1, height: 6, background: "#EDEEE9", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", background: "#21665A", transition: "width 0.3s ease" },
  progressLabel: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, color: "#8B8B7A" },
  editModeBadge: {
    display: "inline-flex", alignItems: "center", fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12, fontWeight: 600, color: "#B8863D", background: "#F5EDE0",
    border: "1px solid #E3D4B0", borderRadius: 20, padding: "6px 14px", marginBottom: 24,
  },
  catTagRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
  catTag: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "#21665A",
  },
  ccupTag: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, color: "#8B8B7A",
    background: "#EDEEE9", padding: "2px 8px", borderRadius: 999,
  },
  question: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 23, lineHeight: 1.35, margin: "0 0 28px" },
  scaleWrap: { display: "flex", flexDirection: "column", gap: 10 },
  scaleBtn: {
    display: "flex", alignItems: "center", gap: 14, textAlign: "left",
    padding: "13px 16px", borderRadius: 10, border: "1px solid #E4E2D6", background: "#FBFAF7",
    cursor: "pointer", fontSize: 14.5, fontFamily: "'Inter', sans-serif", color: "#1B2430",
  },
  scaleBtnActive: { background: "#21665A", color: "#FFFFFF", border: "1px solid #21665A" },
  scaleNum: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, width: 22, height: 22,
    borderRadius: "50%", background: "rgba(27,36,48,0.08)", display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  backBtn: {
    marginTop: 22, background: "none", border: "none", color: "#8B8B7A", cursor: "pointer",
    fontSize: 13.5, display: "inline-flex", alignItems: "center", fontFamily: "'Inter', sans-serif",
  },
  gaugeRow: { display: "flex", alignItems: "center", gap: 24, margin: "24px 0 8px", flexWrap: "wrap" },
  gaugeText: { flex: 1, minWidth: 200 },
  tierLabel: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 20, marginBottom: 6 },
  gaugeSub: { color: "#6B6B5E", fontSize: 14, lineHeight: 1.5 },
  chartWrap: { margin: "12px -8px 8px" },
  barsWrap: { display: "flex", flexDirection: "column", gap: 14, margin: "12px 0 32px" },
  barRow: {},
  barLabelRow: { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13.5, gap: 8 },
  barLabel: { color: "#1B2430", fontWeight: 500 },
  barPct: { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, whiteSpace: "nowrap" },
  barTrack: { height: 8, background: "#EDEEE9", borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 8 },
  colCard: { background: "#FBFAF7", border: "1px solid #E4E2D6", borderRadius: 12, padding: "18px 18px 6px" },
  colHeader: {
    display: "flex", alignItems: "center", gap: 8, fontFamily: "'Fraunces', serif",
    fontWeight: 600, fontSize: 16, marginBottom: 14,
  },
  insightItem: { marginBottom: 16 },
  insightTitle: { fontSize: 13.5, fontWeight: 600, marginBottom: 4 },
  insightText: { fontSize: 13, color: "#4B5563", lineHeight: 1.55 },
  printFooter: {},
  reviewList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 },
  reviewRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
    padding: "14px 16px", borderRadius: 10, border: "1px solid #E4E2D6", background: "#FBFAF7",
  },
  reviewRowLeft: { flex: 1, minWidth: 0 },
  reviewCatLine: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8B8B7A", marginBottom: 4 },
  reviewQText: { fontSize: 14, color: "#1B2430", marginBottom: 4, lineHeight: 1.4 },
  reviewAnswer: { fontSize: 13, fontWeight: 600 },
  editBtn: {
    background: "transparent", border: "1px solid #D9D6C9", borderRadius: 8, padding: "8px 12px",
    fontSize: 12.5, cursor: "pointer", display: "inline-flex", alignItems: "center",
    fontFamily: "'Inter', sans-serif", color: "#1B2430", flexShrink: 0,
  },
  reviewWarning: { color: "#A44B3F", fontSize: 13, marginTop: 12 },
  consentRow: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16, cursor: "pointer" },
  consentText: { fontSize: 12.5, color: "#4B5563", lineHeight: 1.5 },
  privacyNote: {
    display: "flex", alignItems: "flex-start", background: "#EDEEE9", borderRadius: 8,
    padding: "10px 12px", fontSize: 12, color: "#6B6B5E", lineHeight: 1.5, marginBottom: 18,
  },
};
