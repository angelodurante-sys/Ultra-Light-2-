import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from "recharts";
import { ArrowRight, ArrowLeft, RotateCcw, TrendingUp, TrendingDown, Compass, Pencil, Download, ShieldCheck, Check, Lock, Phone } from "lucide-react";

const BRAND = { name: "Adlatus", tagline: "Compass Ultra-Light" };

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
      { ccup: "29", text: "Wissen Sie, wohin Sie Ihr Unternehmen in den nächsten drei bis fünf Jahren entwickeln möchten?", explain: "Eine klare Richtung erleichtert langfristige Entscheidungen." },
      { ccup: "28", text: "Haben Sie die wichtigsten Ziele klar definiert und Ihren Führungskräften bzw. Schlüsselpersonen bekannt gemacht?", explain: "Bekannte Ziele richten alle Beteiligten auf dasselbe Ergebnis aus." },
      { ccup: "30", text: "Leiten Sie aus Ihren Zielen konkrete Massnahmen ab und überprüfen deren Umsetzung regelmässig?", explain: "Nur umgesetzte Ziele wirken – Absicht allein verändert nichts." },
    ],
    critical: { situation: "Es ist keine erkennbare Strategie vorhanden.", timeframe: "4 Wochen", actions: ["Strategie-Workshop mit der Geschäftsleitung durchführen", "Mindestens 3 schriftliche Ziele für die nächsten 3–5 Jahre festlegen"] },
    low: { situation: "Erste strategische Überlegungen bestehen, sind aber weder schriftlich festgehalten noch bekannt.", timeframe: "8 Wochen", actions: ["Ziele auf 1–2 Seiten schriftlich festhalten", "Ziele in der nächsten Kadersitzung kommunizieren"] },
    mid: { situation: "Eine Strategie besteht, wird aber nur unregelmässig überprüft.", timeframe: "3 Monate", actions: ["Fixen Review-Termin festlegen (z. B. quartalsweise)", "Wichtigste Mitarbeitende aktiv informieren"] },
    solid: { situation: "Ziele sind schriftlich festgehalten, bekannt und werden grösstenteils überprüft.", timeframe: "6 Monate", actions: ["Überprüfung zu festem, dokumentiertem Rhythmus schärfen", "Anpassungen schriftlich festhalten"] },
    high: { situation: "Strategie und Zielsetzung sind verankert, bekannt und werden konsequent überprüft.", timeframe: "laufend", actions: ["Review-Rhythmus beibehalten", "Strategie aktiv als Entscheidungsgrundlage im Tagesgeschäft nutzen"] },
  },
  {
    id: "fuehrung",
    name: "Führung & Organisation",
    short: "Führung / Organisation",
    questions: [
      { ccup: "36/39", text: "Wissen alle in Ihrem Unternehmen, wer wofür verantwortlich ist und wer welche Entscheidungen treffen darf?", explain: "Klare Rollen vermeiden Doppelspurigkeiten." },
      { ccup: "47/50", text: "Funktionieren Ihre wichtigsten Abläufe effizient und reibungslos?", explain: "Effiziente Abläufe sparen Zeit und Kosten." },
      { ccup: "54", text: "Könnte Ihr Unternehmen erfolgreich weitergeführt werden, wenn eine Schlüsselperson unerwartet ausfällt?", explain: "Stellvertretung sichert den Erfolg." },
    ],
    critical: { situation: "Aufgaben, Kompetenzen und Verantwortlichkeiten sind faktisch ungeregelt.", timeframe: "4 Wochen", actions: ["Einfaches Organigramm erstellen", "Notfall-Stellvertretung für die Geschäftsleitung benennen"] },
    low: { situation: "Zuständigkeiten sind teils informell geregelt, eine Nachfolgeplanung fehlt.", timeframe: "8 Wochen", actions: ["2–3 kritischste Prozesse dokumentieren", "Ersten, auch vorläufigen Nachfolgeplan erstellen"] },
    mid: { situation: "Struktur und Prozesse bestehen teilweise, sind aber nicht durchgängig dokumentiert.", timeframe: "3 Monate", actions: ["Nachfolgeplan schriftlich festhalten", "Fehlende Prozessdokumentationen ergänzen"] },
    solid: { situation: "Verantwortlichkeiten und Prozesse sind grösstenteils geregelt und dokumentiert.", timeframe: "6 Monate", actions: ["Nachfolgeplan mit konkretem Zeitpunkt formalisieren", "Übergabeschritte festlegen"] },
    high: { situation: "Verantwortlichkeiten, Prozesse und Nachfolge sind klar geregelt und dokumentiert.", timeframe: "jährlich", actions: ["Organigramm und Nachfolgeplan jährlich auf Aktualität prüfen"] },
  },
  {
    id: "markt",
    name: "Markt & Kunden",
    short: "Markt / Kunden",
    questions: [
      { ccup: "96", text: "Gewinnen Sie regelmässig neue Kunden und können Sie bestehende Kunden langfristig binden?", explain: "Neukunden und Stammkunden sichern Wachstum." },
      { ccup: "108", text: "Wissen Sie, wodurch sich Ihr Unternehmen von Ihren wichtigsten Mitbewerbern unterscheidet?", explain: "Klare Positionierung schafft Vorteile." },
      { ccup: "109", text: "Kennen Sie die heutigen und zukünftigen Bedürfnisse Ihrer Kunden und richten Sie Ihr Angebot danach aus?", explain: "Kundennähe schafft Erfolg." },
    ],
    critical: { situation: "Es fehlt eine erkennbare Auseinandersetzung mit Markt, Wettbewerb und Kundenbedürfnissen.", timeframe: "4 Wochen", actions: ["Erste Kundengespräche führen", "Grobübersicht der wichtigsten Mitbewerber erstellen"] },
    low: { situation: "Markt- und Kundenkenntnis ist punktuell vorhanden, aber nicht systematisch erfasst.", timeframe: "8 Wochen", actions: ["8–10 Kunden- bzw. Win-/Loss-Gespräche führen", "3–5 wichtigste Wettbewerber dokumentieren"] },
    mid: { situation: "Markt- und Kundenkenntnis ist vorhanden, aber nicht regelmässig aktualisiert.", timeframe: "3 Monate", actions: ["Wiederkehrende Kundenbefragung einführen (z. B. jährlich)", "Wettbewerbsübersicht aktualisieren"] },
    solid: { situation: "Markt und Kundenbedürfnisse sind gut bekannt, die Erhebung erfolgt aber nicht durchgängig strukturiert.", timeframe: "6 Monate", actions: ["Feste Feedback-Schlaufen institutionalisieren", "Wettbewerbs-Updates einplanen"] },
    high: { situation: "Markt-, Wettbewerbs- und Kundenkenntnis sind ausgeprägt und werden aktiv gepflegt.", timeframe: "laufend", actions: ["Wissen systematisch für Angebots- und Preisentscheide nutzen"] },
  },
  {
    id: "finanzen",
    name: "Unternehmungssteuerung",
    short: "Unternehmungssteuerung",
    questions: [
      { ccup: "118/119", text: "Unterstützen Sie Ihre täglichen Arbeitsabläufe wirksam mit IT und digitalen Lösungen?", explain: "Gute IT-Unterstützung spart täglich Zeit und reduziert Fehler." },
      { ccup: "157", text: "Verfügen Sie rechtzeitig über die wichtigsten Kennzahlen, um fundierte Entscheidungen treffen zu können?", explain: "Kennzahlen schaffen Transparenz." },
      { ccup: "158", text: "Überwachen Sie Budget, Liquidität und Geschäftsentwicklung regelmässig und leiten Sie bei Bedarf rechtzeitig Massnahmen ein?", explain: "Frühzeitige Steuerung erhöht Stabilität." },
    ],
    critical: { situation: "Es fehlen zeitnahe Kennzahlen, Liquiditätsplanung und wirksame digitale Unterstützung.", timeframe: "4 Wochen", actions: ["Einfaches Dashboard mit 5 Kernkennzahlen aufbauen", "Rollierende 12-Monats-Liquiditätsplanung einführen"] },
    low: { situation: "Kennzahlen und digitale Tools sind vorhanden, kommen aber verspätet bei der Geschäftsleitung an.", timeframe: "8 Wochen", actions: ["Reporting auf 5–8 Kennzahlen reduzieren", "Fixen monatlichen Liefertermin festlegen"] },
    mid: { situation: "Reporting und Liquiditätsplanung bestehen, sind aber nicht durchgängig zeitnah.", timeframe: "3 Monate", actions: ["Fixen Liefertermin nach Monatsabschluss definieren", "Fehlende Kennzahlen ergänzen"] },
    solid: { situation: "Kennzahlen und Liquiditätsplanung stehen weitgehend zeitnah zur Verfügung.", timeframe: "6 Monate", actions: ["Automatisierungspotenzial prüfen", "Erhebungsaufwand weiter senken"] },
    high: { situation: "Kennzahlen, Budgetkontrolle und Liquiditätsplanung stehen zeitnah und zuverlässig zur Verfügung.", timeframe: "jährlich", actions: ["Periodisch prüfen, ob IT-Tools noch zur Unternehmensgrösse passen"] },
  },
  {
    id: "zukunft",
    name: "Zukunft & Weiterentwicklung",
    short: "Zukunft / Weiterentwicklung",
    questions: [
      { ccup: "141", text: "Fördern Sie Ihre Mitarbeitenden gezielt, damit Ihr Unternehmen auch künftig erfolgreich bleibt?", explain: "Weiterbildung sichert Zukunft." },
      { ccup: "165", text: "Kennen Sie die wichtigsten Risiken Ihres Unternehmens und treffen Sie rechtzeitig geeignete Massnahmen?", explain: "Frühes Erkennen schützt." },
      { ccup: "99", text: "Entwickeln Sie Ihre Produkte, Dienstleistungen oder Ihr Geschäftsmodell laufend weiter, damit Ihr Unternehmen auch morgen erfolgreich bleibt?", explain: "Innovation sichert Wettbewerbsfähigkeit." },
    ],
    critical: { situation: "Risiken sind nicht erfasst, Weiterentwicklung von Mitarbeitenden und Angebot findet kaum statt.", timeframe: "4 Wochen", actions: ["Liste der 5 grössten Risiken erstellen", "Erste Weiterbildungsschritte definieren"] },
    low: { situation: "Einzelne Risiken sind bekannt, eine systematische Erfassung fehlt.", timeframe: "8 Wochen", actions: ["Liste der 10 wichtigsten Risiken mit Gegenmassnahmen erstellen", "Je einen Weiterbildungsschritt pro Mitarbeitendem definieren"] },
    mid: { situation: "Risiken und Weiterentwicklung werden teilweise, aber nicht systematisch angegangen.", timeframe: "3 Monate", actions: ["3–5 grösste Risiken schriftlich festhalten", "Jährliche Entwicklungsgespräche vereinbaren"] },
    solid: { situation: "Risikomanagement und Weiterentwicklung sind weitgehend etabliert.", timeframe: "6 Monate", actions: ["Risikoliste fest im jährlichen Strategie-Review verankern"] },
    high: { situation: "Risikomanagement, Weiterentwicklung von Mitarbeitenden und Angebot sind aktiv und systematisch verankert.", timeframe: "jährlich", actions: ["Jährlichen Review-Rhythmus beibehalten"] },
  },
];

const SCALE = [
  { v: 1, label: "Nein, gar nicht" },
  { v: 2, label: "Eher nein" },
  { v: 3, label: "Teils/teils" },
  { v: 4, label: "Eher ja" },
  { v: 5, label: "Ja, vollständig" },
];

const allQuestions = CATEGORIES.flatMap((c) =>
  c.questions.map((q, i) => ({ catId: c.id, catName: c.name, qIndex: i, ccup: q.ccup, text: q.text, explain: q.explain }))
);

const PROGRESS_KEY = "ccup-progress-v1";
const STRENGTH_THRESHOLD = 3.5;

// Hybrid-Speicher: nutzt window.storage, falls vorhanden (Claude-Artifact-
// Umgebung), fällt ausserhalb davon automatisch auf echtes localStorage
// zurück (z.B. auf der produktiven Website). Dadurch reicht eine einzige
// Datei für beide Umgebungen, ohne manuell umzuschalten.
const storage = (typeof window !== "undefined" && window.storage)
  ? {
      get: (key) => window.storage.get(key, false),
      set: (key, value) => window.storage.set(key, value, false),
      delete: (key) => window.storage.delete(key, false),
    }
  : {
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
// Immer abrunden auf eine Nachkommastelle statt kaufmännisch runden —
// so bleibt ein Wert im Zweifel in der kritischeren Stufe (bewusst konservativ).
function floor1(n) {
  return Math.floor(n * 10) / 10;
}

function tierFor(avgRaw) {
  const avg = floor1(avgRaw);
  if (avg <= 1.8) return { key: "critical", label: "Kritisch", color: "#C1392B" };
  if (avg <= 2.6) return { key: "low", label: "Basis", color: "#D9822B" };
  if (avg <= 3.4) return { key: "mid", label: "Fortgeschritten", color: "#C9A227" };
  if (avg <= 4.2) return { key: "solid", label: "Professionell", color: "#4C9A63" };
  return { key: "high", label: "Exzellent", color: "#1F6B3A" };
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
  const qualifiedStrengths = sorted.filter((c) => c.avg >= STRENGTH_THRESHOLD);
  const hasQualifiedStrengths = qualifiedStrengths.length > 0;
  const strengths = (hasQualifiedStrengths ? qualifiedStrengths : sorted).slice(0, 2);
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
          hasQualifiedStrengths={hasQualifiedStrengths}
          answers={answers}
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
        <div style={styles.eyebrow}>{BRAND.tagline}</div>
        <h1 style={{ ...styles.h1, fontSize: 23 }}>Wo steht Ihr Unternehmen heute – und wo liegen Ihre grössten Chancen?</h1>

        <p style={styles.pIntro}>
          Mit 15 sorgfältig ausgewählten Kernfragen erhalten Sie in rund 5 Minuten eine fundierte
          und kostenlose Standortbestimmung Ihres Unternehmens.
        </p>
        <p style={styles.pIntro}>
          Die Auswertung macht Ihre Stärken, Verbesserungspotenziale und Entwicklungschancen auf
          einen Blick sichtbar.
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
          Standortbestimmung starten
        </button>
        <div style={styles.btnFootnote}>Kostenlos · rund 5 Minuten · 15 Fragen</div>
        <div style={styles.catList}>
          {CATEGORIES.map((c, i) => (
            <div key={c.id} style={styles.catListRow}>
              <span style={styles.catListNum}>{i + 1}</span>
              <span style={styles.catListLabel}>{c.short}</span>
            </div>
          ))}
        </div>
        <div style={styles.copyrightLine}>
          <div>© 2026 ba-confisa</div>
          <div>Stutzring 6, 4107 Ettingen, Switzerland</div>
          <div>Version 1.0 · Alle Rechte vorbehalten</div>
        </div>
      </div>
    </div>
  );
}

function Quiz({ current, qi, total, selected, onSelect, onBack, editMode }) {
  const pct = Math.round(((qi + 1) / total) * 100);
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
          <span style={styles.ccupTag}>Nr. {current.ccup}</span>
        </div>
        <h2 style={styles.question}>{current.text}</h2>
        {current.explain && <p style={styles.questionExplain}>{current.explain}</p>}
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
            const answerColor = val ? tierFor(val).color : "#A44B3F";
            return (
              <div key={i} style={styles.reviewRow}>
                <div style={styles.reviewRowLeft}>
                  <div style={styles.reviewCatLine}>{q.catName}</div>
                  <div style={styles.reviewCcupLine}>Nr. {q.ccup}</div>
                  <div style={styles.reviewQText}>{q.text}</div>
                  <div style={{ ...styles.reviewAnswer, color: answerColor }}>
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

const RADAR_LABELS = {
  strategie: ["Strategie"],
  fuehrung: ["Führung", "Organisation"],
  markt: ["Markt", "Kunden"],
  finanzen: ["Unternehmens-", "steuerung"],
  zukunft: ["Zukunft", "Weiterentw."],
};

function RadarAngleTick({ x, y, cx, cy, payload }) {
  const lines = RADAR_LABELS[payload.value] || [payload.value];
  // Anchor text away from chart center so labels don't overlap the plot
  const textAnchor = x > cx + 5 ? "start" : x < cx - 5 ? "end" : "middle";
  const dy0 = lines.length > 1 ? -((lines.length - 1) * 6) : 0;
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="#1B2430" fontSize={11.5} fontFamily="Inter, sans-serif">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? dy0 : 13}>{line}</tspan>
      ))}
    </text>
  );
}

function TierBadge({ tier, size = "md" }) {
  const isSm = size === "sm";
  return (
    <span
      style={{
        display: "inline-block",
        background: tier.color,
        color: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        fontSize: isSm ? 11.5 : 14,
        padding: isSm ? "3px 9px" : "6px 14px",
        borderRadius: 6,
        lineHeight: 1.3,
        minWidth: isSm ? 108 : 132,
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      {tier.label}
    </span>
  );
}

const TIER_SCALE = [
  { range: "1.0 – 1.8", label: "Kritisch", color: "#C1392B" },
  { range: "1.9 – 2.6", label: "Basis", color: "#D9822B" },
  { range: "2.7 – 3.4", label: "Fortgeschritten", color: "#C9A227" },
  { range: "3.5 – 4.2", label: "Professionell", color: "#4C9A63" },
  { range: "4.3 – 5.0", label: "Exzellent", color: "#1F6B3A" },
];

// Priorisierung für Handlungsfelder, gekoppelt an die bestehenden 5 Stufen.
const PRIORITY_LABEL = {
  critical: "Sofort handeln",
  low: "Prioritär verbessern",
  mid: "Gezielt weiterentwickeln",
  solid: "Weiter optimieren",
  high: "Weiter optimieren",
};

// Lesbare Textfarbe je Stufenfarbe (WCAG AA >= 4.5:1 geprüft) — die hellen
// Stufenfarben (Basis/Fortgeschritten/Professionell) brauchen dunklen Text,
// die dunklen (Kritisch/Exzellent) brauchen hellen Text.
const SUMMARY_TEXT_COLOR = {
  critical: "#F1F0EA",
  low: "#1B2430",
  mid: "#1B2430",
  solid: "#1B2430",
  high: "#F1F0EA",
};

// Kurzer Eröffnungssatz je Gesamt-Stufe, für die dynamische Zusammenfassung.
const SUMMARY_OPENER = {
  critical: "Ihre Unternehmung steht an einem wichtigen Wendepunkt.",
  low: "Ihre Unternehmung verfügt über erste solide Grundlagen.",
  mid: "Ihre Unternehmung ist insgesamt gut aufgestellt.",
  solid: "Ihre Unternehmung ist bereits professionell aufgestellt.",
  high: "Ihre Unternehmung zeigt eine ausgezeichnete Gesamtaufstellung.",
};

const SUMMARY_CLOSER = {
  critical: "Mit ersten gezielten Massnahmen kann Ihre Unternehmung bereits kurzfristig spürbar vorankommen.",
  low: "Mit wenigen gezielten Massnahmen kann die Unternehmensführung deutlich gestärkt werden.",
  mid: "Mit wenigen gezielten Massnahmen kann die Unternehmensführung deutlich gestärkt werden.",
  solid: "Mit kontinuierlicher Weiterentwicklung lässt sich diese gute Position weiter ausbauen.",
  high: "Nutzen Sie diese starke Basis, um Ihre Position weiter auszubauen.",
};

// Setzt die Zusammenfassung dynamisch aus den tatsächlichen Stärken/Schwächen
// zusammen — nie aus statischem Text, damit sie für jedes Unternehmen stimmt.
function buildSummary(strengths, weaknesses, overallTier, hasQualifiedStrengths) {
  const opener = SUMMARY_OPENER[overallTier.key];
  const closer = SUMMARY_CLOSER[overallTier.key];

  // Sonderfall: Wenn selbst die "stärksten" Kapitel noch in der Stufe "Kritisch"
  // liegen, gibt es faktisch keine erkennbare Differenzierung — dann keine
  // Stärken/Schwächen-Sätze behaupten, sondern das ehrlich benennen.
  const topIsStillCritical = !hasQualifiedStrengths && tierFor(strengths[0].avg).key === "critical";
  if (topIsStillCritical) {
    return `${opener} In allen fünf Kapiteln zeigt sich aktuell vergleichbar hoher Handlungsbedarf – differenzierte Stärken sind noch nicht erkennbar. ${closer}`;
  }

  // Spiegelbildlicher Sonderfall: Wenn selbst das schwächste Kapitel noch
  // "Exzellent" ist, gibt es keine echten Handlungsfelder zu benennen.
  const bottomIsStillExcellent = tierFor(weaknesses[0].avg).key === "high";
  if (bottomIsStillExcellent) {
    return `${opener} Alle fünf Kapitel erreichen durchgehend ein exzellentes Niveau – nennenswerte Schwächen sind aktuell nicht erkennbar. ${closer}`;
  }

  const strengthNames = strengths.map((s) => s.name);
  const weaknessNames = weaknesses.map((s) => s.name);

  const strengthSentence = strengthNames.length > 1
    ? `Besonders positiv fallen ${strengthNames.join(" sowie ")} auf.`
    : `Besonders positiv fällt ${strengthNames[0]} auf.`;
  const strengthSentenceAlt = strengthNames.length > 1
    ? `Am weitesten fortgeschritten sind aktuell ${strengthNames.join(" sowie ")}.`
    : `Am weitesten fortgeschritten ist aktuell ${strengthNames[0]}.`;

  const weaknessSentence = `Die grössten Potenziale liegen in ${weaknessNames.join(" und ")}.`;

  return `${opener} ${hasQualifiedStrengths ? strengthSentence : strengthSentenceAlt} ${weaknessSentence} ${closer}`;
}

function ScaleLegend() {
  const row1 = TIER_SCALE.slice(0, 3);
  const row2 = TIER_SCALE.slice(3);
  return (
    <div style={styles.scaleLegendWrap}>
      <div style={styles.scaleLegendTitle}>Bewertungsskala</div>
      <div style={styles.scaleLegendRow3}>
        {row1.map((t) => (
          <div key={t.label} style={{ ...styles.scaleLegendBox, background: t.color }}>
            <div style={styles.scaleLegendLabel}>{t.label}</div>
            <div style={styles.scaleLegendRange}>{t.range}</div>
          </div>
        ))}
      </div>
      <div style={styles.scaleLegendRow2}>
        {row2.map((t) => (
          <div key={t.label} style={{ ...styles.scaleLegendBox, background: t.color }}>
            <div style={styles.scaleLegendLabel}>{t.label}</div>
            <div style={styles.scaleLegendRange}>{t.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Report({ company, catScores, overallPct, overallAvg, overallTier, strengths, weaknesses, hasQualifiedStrengths, answers, onRestart }) {
  const radarData = catScores.map((c) => ({ subject: c.id, value: c.avg, full: 5 }));
  const criticalAnswers = allQuestions
    .map((q) => ({ ...q, val: answers?.[`${q.catId}-${q.qIndex}`] }))
    .filter((q) => q.val === 1 || q.val === 2);
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
      fd.append("gesamtscore", `${floor1(overallAvg).toFixed(1)} / 5 (${overallTier.label})`);
      fd.append("kapitel", catScores.map((c) => `${c.name}: ${floor1(c.avg).toFixed(1)}/5`).join(" · "));
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
        <div style={styles.eyebrow}>{BRAND.tagline} Ergebnisbericht</div>
        <h1 style={styles.h1}>{company ? company : "Ihr Unternehmen"}</h1>
        <div style={styles.h1Sub}>Ergebnis Ihrer Selbsteinschätzung</div>
        <p style={styles.pIntro}>
          15 ausgewählte Kernfragen aus fünf Kapiteln des umfangreichen Bewertungsrasters
          geben Ihnen eine erste Standortbestimmung mit Score, Stärken und ersten Handlungsfeldern –
          sie ersetzen keine vertiefte Analyse vor{"\u00A0"}Ort.
        </p>

        <div style={styles.gaugeRow}>
          <Gauge pct={overallPct} label={floor1(overallAvg).toFixed(1)} color={overallTier.color} />
          <div style={styles.gaugeText}>
            <div style={{ marginBottom: 4 }}><TierBadge tier={overallTier} /></div>
            <div style={styles.gaugeSub}>
              Gesamtscore basierend auf 15 Kernfragen in 5 Kapiteln — Ø {floor1(overallAvg).toFixed(1)} / 5
            </div>
            <div style={styles.gaugeFootnote}>
              Basiert auf Ihrer Selbsteinschätzung und dient als erste Standortbestimmung.
            </div>
          </div>
        </div>

        <div className="print-avoid-break" style={{ ...styles.summaryBox, background: overallTier.color }}>
          <div style={{ ...styles.summaryLabel, color: SUMMARY_TEXT_COLOR[overallTier.key], opacity: 0.75 }}>Zusammenfassung</div>
          <p style={{ ...styles.summaryText, color: SUMMARY_TEXT_COLOR[overallTier.key] }}>
            {buildSummary(strengths, weaknesses, overallTier, hasQualifiedStrengths)}
          </p>
        </div>

        <div style={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius="58%" margin={{ top: 16, right: 28, bottom: 16, left: 28 }}>
              <PolarGrid stroke="#D9D6C9" />
              <PolarAngleAxis dataKey="subject" tick={<RadarAngleTick />} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fill: "#8B8B7A", fontSize: 10 }} />
              <Radar dataKey="value" stroke={overallTier.color} fill={overallTier.color} fillOpacity={0.28} strokeWidth={2} />
              <Tooltip
                contentStyle={{ fontFamily: "Inter, sans-serif", borderRadius: 8, border: "1px solid #D9D6C9" }}
                formatter={(value) => [`${floor1(Number(value)).toFixed(1)} / 5`, "Note"]}
                labelFormatter={(id) => catScores.find((c) => c.id === id)?.name || id}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.barsWrap}>
          {(() => {
            const ranked = [...catScores].sort((a, b) => b.avg - a.avg);
            return ranked.map((c) => {
              const t = tierFor(c.avg);
              return (
                <div key={c.id} style={styles.barRow}>
                  <div style={styles.barLabelRow}>
                    <span style={styles.barLabel}>
                      {c.id === "finanzen" ? <>Unternehmungs-<br />steuerung</> : c.id === "markt" ? <>Markt &<br />Kunden</> : c.name}
                    </span>
                    <span style={styles.barScoreGroup}>
                      <TierBadge tier={t} size="sm" />
                      <span style={{ ...styles.barPct, color: t.color }}>{floor1(c.avg).toFixed(1)} / 5</span>
                    </span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${c.pct}%`, background: t.color }} />
                  </div>
                </div>
              );
            });
          })()}
        </div>

        <ScaleLegend />

        <div style={styles.twoCol}>
          <div className="print-avoid-break" style={styles.colCard}>
            <div style={styles.colHeader}>
              <TrendingUp size={17} color="#21665A" />
              <span>{hasQualifiedStrengths ? "Stärken" : "Relativ stärkste Bereiche"}</span>
            </div>
            {!hasQualifiedStrengths && (
              <p style={styles.strengthsHint}>
                Kein Kapitel erreicht aktuell einen Wert ab {STRENGTH_THRESHOLD.toFixed(1)}/5 —
                gezeigt werden die im Vergleich stärksten Bereiche.
              </p>
            )}
            {strengths.map((s) => (
              <div key={s.id} style={styles.insightItem}>
                <div style={styles.insightName}>{s.name}</div>
                <div style={styles.insightScoreRow}>
                  <span style={styles.insightScore}>{floor1(s.avg).toFixed(1)} / 5</span>
                  <TierBadge tier={tierFor(s.avg)} size="sm" />
                </div>
                <div style={styles.insightText}>{s[tierFor(s.avg).key].situation}</div>
              </div>
            ))}
          </div>
          <div className="print-avoid-break" style={styles.colCard}>
            <div style={styles.colHeader}>
              <TrendingDown size={17} color="#A44B3F" />
              <span>Handlungsfelder</span>
            </div>
            {weaknesses.map((s) => (
              <div key={s.id} style={styles.insightItem}>
                <div style={styles.insightName}>{s.name}</div>
                <div style={styles.insightScoreRow}>
                  <span style={styles.insightScore}>{floor1(s.avg).toFixed(1)} / 5</span>
                  <TierBadge tier={tierFor(s.avg)} size="sm" />
                </div>
                <div style={{ ...styles.priorityTag, color: tierFor(s.avg).color }}>
                  {PRIORITY_LABEL[tierFor(s.avg).key]}
                </div>
                <div style={styles.insightText}>{s[tierFor(s.avg).key].situation}</div>
                <div style={styles.actionTimeframe}>Empfohlene Massnahmen — {s[tierFor(s.avg).key].timeframe}</div>
                <div style={styles.actionChecklist}>
                  {s[tierFor(s.avg).key].actions.map((a, i) => (
                    <div key={i} style={styles.actionItem}><Check size={13} color="#21665A" style={{ marginTop: 2, flexShrink: 0 }} /><span>{a}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {criticalAnswers.length > 0 && (
          <div className="print-avoid-break" style={styles.criticalBox}>
            <div style={styles.colHeader}>
              <TrendingDown size={17} color="#C1392B" />
              <span>Kritische Einzelantworten</span>
            </div>
            <p style={styles.strengthsHint}>
              Diese Einzelfragen wurden mit 1 oder 2 bewertet — unabhängig vom Kapiteldurchschnitt
              lohnt sich hier ein genauer Blick. Die Nummerierung bezieht sich auf unseren
              umfangreichen Fragenkatalog mit verschiedenen Kapiteln, aus dem diese 15 Fragen
              sorgfältig ausgewählt wurden.
            </p>
            {criticalAnswers.map((q) => (
              <div key={`${q.catId}-${q.qIndex}`} style={styles.criticalRowV2}>
                <div style={styles.criticalCatLine}>{q.catName} · Nr. {q.ccup}</div>
                <div style={styles.criticalQRow}>
                  <span style={styles.criticalQText}>{q.text}</span>
                  <span style={styles.criticalVal}>{q.val} / 5</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="print-avoid-break" style={styles.nextStepBox}>
          <div style={styles.colHeader}>
            <ArrowRight size={17} color="#21665A" />
            <span>Nächster Schritt</span>
          </div>
          <p style={styles.nextStepText}>
            Vereinbaren Sie ein kostenloses Erstgespräch mit einem Experten und
            entwickeln Sie gemeinsam einen konkreten Aktionsplan für Ihre grössten Handlungsfelder –
            per Videocall oder vor Ort.
          </p>
          <div style={styles.nextStepChecklist}>
            <div style={styles.nextStepCheckItem}><Check size={14} color="#21665A" style={{ marginTop: 2, flexShrink: 0 }} /><span>Besprechung Ihrer Resultate</span></div>
            <div style={styles.nextStepCheckItem}><Check size={14} color="#21665A" style={{ marginTop: 2, flexShrink: 0 }} /><span>Priorisierung der wichtigsten Handlungsfelder</span></div>
            <div style={styles.nextStepCheckItem}><Check size={14} color="#21665A" style={{ marginTop: 2, flexShrink: 0 }} /><span>Erste konkrete Massnahmen</span></div>
          </div>
          <div style={styles.nextStepDuration}>Dauer ca. 45 Minuten</div>
          <div style={styles.nextStepContactBox}>
            <div>rolf.wicki@adlatus-nwch.ch</div>
            <div>Tel. +41 (0)79 452 00 21</div>
          </div>
          <div style={styles.callPrompt}>
            <Phone size={13} style={{ marginRight: 6, flexShrink: 0 }} />
            Rufen Sie uns an, wir beraten Sie gerne.
          </div>
        </div>

        <div className="print-avoid-break" style={styles.closingBox}>
          <ArrowRight size={19} color="#21665A" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={styles.closingText}>
            Sie haben den ersten Schritt gemacht. Nutzen Sie die Ergebnisse jetzt als Grundlage,
            um gezielt Prioritäten zu setzen und Ihr Unternehmen Schritt für Schritt
            weiterzuentwickeln.
          </p>
        </div>

        <div className="print-footer" style={styles.printFooter}>
          <div>{BRAND.name} · {BRAND.tagline}</div>
          <div>© 2026 ba-confisa</div>
          <div>Stutzring 6, 4107 Ettingen, Switzerland</div>
          <div>Version 1.0 · Alle Rechte vorbehalten</div>
        </div>
      </div>

      <div className="no-print" style={{ ...styles.card, maxWidth: 760, marginTop: 20 }}>
        <div style={styles.colHeader}>
          <Download size={17} color="#1B2430" />
          <span>Analysebericht herunterladen</span>
        </div>

        <div style={styles.pdfContentsLabel}>Ihr PDF enthält:</div>
        <div style={styles.pdfContentsGrid}>
          <div style={styles.pdfContentsItem}>
            <TrendingUp size={18} color="#21665A" />
            <span>Gesamtauswertung</span>
          </div>
          <div style={styles.pdfContentsItem}>
            <Compass size={18} color="#21665A" />
            <span>Übersicht der 5 Themenbereiche</span>
          </div>
          <div style={styles.pdfContentsItem}>
            <ShieldCheck size={18} color="#21665A" />
            <span>Zusammenfassung & Interpretation</span>
          </div>
          <div style={styles.pdfContentsItem}>
            <ArrowRight size={18} color="#21665A" />
            <span>Handlungsempfehlungen</span>
          </div>
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
              Hinweis: Die Adresse wird bei Klick auf "Analysebericht herunterladen" an {BRAND.name}{" "}
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
            <span>Anfrage gesendet.</span>
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
          <Download size={16} style={{ marginRight: 8 }} /> {sendState === "sending" ? "Wird gesendet…" : "Analysebericht herunterladen"}
        </button>
        <div style={styles.trustLine}>
          <Lock size={12} style={{ marginRight: 5, flexShrink: 0 }} />
          Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.
        </div>

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
  const trackDash = `${circ * arcFrac} ${circ}`;
  const progressLen = circ * arcFrac * (pct / 100);
  const progressDash = `${progressLen} ${circ}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(135deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#E4E2D6" strokeWidth={stroke} fill="none"
        strokeDasharray={trackDash} strokeLinecap="round" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={progressDash} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        transform={`rotate(-135 ${size / 2} ${size / 2})`}
        style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 26, fill: "#1B2430", fontWeight: 600 }}>
        {label}
      </text>
    </svg>
  );
}

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
.print-footer { display: none; }
@media print {
  .no-print { display: none !important; }
  #printable-report { box-shadow: none !important; border: none !important; }
  .print-footer { display: block !important; margin-top: 24px; font-size: 11px; color: #8B8B7A; font-family: 'IBM Plex Mono', monospace; }
  .print-avoid-break { break-inside: avoid; page-break-inside: avoid; }
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
  h1Sub: {
    fontFamily: "Inter, sans-serif", fontSize: 14, color: "#6B6B5E", margin: "-6px 0 20px",
  },
  pIntro: { color: "#4B5563", fontSize: 15.5, lineHeight: 1.6, marginBottom: 20 },
  label: { display: "block", fontSize: 13, color: "#6B6B5E", marginBottom: 6, textAlign: "left" },
  pdfContentsLabel: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "#8B8B7A", margin: "16px 0 10px",
  },
  pdfContentsGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24,
  },
  pdfContentsItem: {
    display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#1B2430",
    fontFamily: "Inter, sans-serif", lineHeight: 1.3,
  },
  trustLine: {
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5,
    color: "#8B8B7A", fontFamily: "Inter, sans-serif", marginTop: 10, textAlign: "center",
  },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #D9D6C9",
    fontSize: 15, fontFamily: "'Inter', sans-serif", marginBottom: 16, boxSizing: "border-box",
    outline: "none",
  },
  primaryBtn: {
    background: "#21665A", color: "#F1F0EA", border: "none", borderRadius: 10,
    padding: "11px 26px", fontSize: 15, fontWeight: 600, cursor: "pointer",
    display: "inline-flex", alignItems: "center", fontFamily: "'Inter', sans-serif",
  },
  btnFootnote: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#8B8B7A",
    marginTop: 10,
  },
  secondaryBtn: {
    background: "transparent", color: "#1B2430", border: "1px solid #D9D6C9", borderRadius: 10,
    padding: "12px 22px", fontSize: 14.5, fontWeight: 500, cursor: "pointer",
    display: "inline-flex", alignItems: "center", fontFamily: "'Inter', sans-serif", marginTop: 14,
  },
  catList: { display: "flex", flexDirection: "column", gap: 10, marginTop: 26, alignItems: "flex-start" },
  catListRow: { display: "flex", alignItems: "center", gap: 12 },
  catListNum: {
    width: 22, height: 22, borderRadius: "50%", background: "#21665A", color: "#FFFFFF",
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  catListLabel: { fontSize: 14.5, color: "#1B2430", fontFamily: "Inter, sans-serif", lineHeight: 1.35 },
  copyrightLine: {
    marginTop: 6, fontSize: 10.5, color: "#B4B2A2", fontFamily: "'IBM Plex Mono', monospace",
    lineHeight: 1.5,
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
  question: { fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 23, lineHeight: 1.35, margin: "0 0 10px" },
  questionExplain: { fontFamily: "Inter, sans-serif", fontSize: 14.5, lineHeight: 1.5, color: "#6B6B5E", margin: "0 0 28px" },
  scaleWrap: { display: "flex", flexDirection: "column", gap: 10 },
  scaleBtn: {
    display: "flex", alignItems: "center", gap: 14, textAlign: "left",
    padding: "13px 16px", borderRadius: 10, border: "1px solid #E4E2D6", background: "#FBFAF7",
    cursor: "pointer", fontSize: 14.5, fontFamily: "'Inter', sans-serif", color: "#1B2430",
  },
  scaleBtnActive: { background: "#21665A", color: "#F1F0EA", border: "1px solid #21665A" },
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
  gaugeSub: { color: "#6B6B5E", fontSize: 14, lineHeight: 1.5 },
  gaugeFootnote: { color: "#9B9A8C", fontSize: 12, lineHeight: 1.5, marginTop: 4, fontStyle: "italic" },
  summaryBox: {
    background: "#1B2430", borderRadius: 12, padding: "18px 20px", margin: "0 0 26px",
  },
  summaryLabel: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "#9CA9A5", marginBottom: 8, fontWeight: 700,
  },
  summaryText: { color: "#F1F0EA", fontSize: 15, lineHeight: 1.6, margin: 0 },
  closingBox: {
    display: "flex", alignItems: "flex-start", gap: 12, margin: "28px 0 8px",
    padding: "18px 20px", background: "#F2F6F4", borderRadius: 12,
    borderLeft: "4px solid #21665A",
  },
  closingText: {
    fontSize: 14.5, lineHeight: 1.6, color: "#1B2430", fontWeight: 500, margin: 0,
  },
  chartWrap: { margin: "12px -8px 8px" },
  barsWrap: { display: "flex", flexDirection: "column", gap: 14, margin: "12px 0 32px" },
  barRow: {},
  barLabelRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, fontSize: 13.5, gap: 8 },
  barLabel: { color: "#1B2430", fontWeight: 500, lineHeight: 1.35, display: "block", minHeight: "2.7em" },
  barScoreGroup: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  barPct: { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, whiteSpace: "nowrap" },
  barTrack: { height: 8, background: "#EDEEE9", borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999, transition: "width 0.5s ease" },
  twoCol: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 8 },
  colCard: { background: "#FBFAF7", border: "1px solid #E4E2D6", borderRadius: 12, padding: "18px 18px 6px" },
  nextStepBox: { background: "#F2F6F4", border: "1px solid #CFE0DA", borderRadius: 12, padding: "18px 20px", marginTop: 24 },
  criticalBox: { background: "#FBF2F0", border: "1px solid #E9C9C2", borderRadius: 12, padding: "18px 20px", marginTop: 24 },
  criticalRowV2: {
    display: "flex", flexDirection: "column", gap: 3,
    padding: "8px 0", borderTop: "1px solid #EFDCD8", fontSize: 13,
  },
  criticalCatLine: { fontWeight: 700, color: "#1B2430", fontSize: 12.5 },
  criticalQRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  criticalQText: { color: "#4B5563", lineHeight: 1.5 },
  criticalVal: { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: "#C1392B", whiteSpace: "nowrap", flexShrink: 0 },
  nextStepText: { fontFamily: "Inter, sans-serif", fontSize: 14.5, lineHeight: 1.55, color: "#1B2430", margin: "8px 0 4px" },
  nextStepChecklist: { display: "flex", flexDirection: "column", gap: 6, margin: "10px 0 8px" },
  nextStepCheckItem: {
    display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13.5, color: "#1B2430",
    fontFamily: "Inter, sans-serif", lineHeight: 1.4,
  },
  nextStepDuration: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#6B6B5E", marginBottom: 10,
  },
  nextStepContactBox: {
    display: "inline-block", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#21665A",
    fontWeight: 600, marginTop: 10, padding: "10px 16px", border: "1.5px solid #21665A", borderRadius: 8,
    lineHeight: 1.6,
  },
  callPrompt: {
    display: "flex", alignItems: "center", fontSize: 12.5, color: "#4B5563",
    fontFamily: "Inter, sans-serif", marginTop: 10,
  },
  colHeader: {
    display: "flex", alignItems: "center", gap: 8, fontFamily: "'Fraunces', serif",
    fontWeight: 600, fontSize: 16, marginBottom: 14,
  },
  insightItem: { marginBottom: 16 },
  insightName: { fontSize: 13.5, fontWeight: 600, color: "#1B2430", marginBottom: 4 },
  insightScoreRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 4 },
  insightScore: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: "#1B2430" },
  insightText: { fontSize: 13, color: "#4B5563", lineHeight: 1.55 },
  strengthsHint: { fontSize: 12, color: "#8B8B7A", lineHeight: 1.5, margin: "-6px 0 14px", fontStyle: "italic" },
  priorityTag: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4,
  },
  actionTimeframe: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8B8B7A",
    marginTop: 8, marginBottom: 4,
  },
  actionChecklist: { display: "flex", flexDirection: "column", gap: 4 },
  actionItem: {
    display: "flex", alignItems: "flex-start", gap: 7, fontSize: 12.5, color: "#1B2430",
    fontFamily: "Inter, sans-serif", lineHeight: 1.4,
  },
  scaleLegendWrap: { margin: "20px 0 28px" },
  scaleLegendTitle: {
    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "#8B8B7A", marginBottom: 8,
  },
  scaleLegendRow3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 8 },
  scaleLegendRow2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 },
  scaleLegendBox: { borderRadius: 8, padding: "8px 10px" },
  scaleLegendLabel: { color: "#FFFFFF", fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif" },
  scaleLegendRange: { color: "#FFFFFF", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", opacity: 0.9, marginTop: 2 },
  printFooter: {},
  reviewList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 },
  reviewRow: {
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
    padding: "14px 16px", borderRadius: 10, border: "1px solid #E4E2D6", background: "#FBFAF7",
  },
  reviewRowLeft: { flex: 1, minWidth: 0 },
  reviewCatLine: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8B8B7A", marginBottom: 2 },
  reviewCcupLine: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#8B8B7A", marginBottom: 4 },
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
