"use client";

import React, { useState } from "react";

type VoicePreset = "Professional" | "Friendly Storyteller" | "Punchy Contrarian";
type AudiencePreset = "Wellness" | "Parenting" | "Personal growth";

type EpisodeOutline = {
  title: string;
  bullets: string[];
};

type PodPilotOutputs = {
  showDescription: string;
  trailerScript: string;
  episodeOutlines: EpisodeOutline[];
  tweets: string[];
  weekScheduleCsv: string;
  rssChecklist: string[];
};

type RunStatus = "idle" | "running" | "success" | "error";

const defaultOutputs: PodPilotOutputs = {
  showDescription: "",
  trailerScript: "",
  episodeOutlines: [],
  tweets: [],
  weekScheduleCsv: "",
  rssChecklist: [],
};

const voiceOptions: VoicePreset[] = [
  "Professional",
  "Friendly Storyteller",
  "Punchy Contrarian",
];

const audienceOptions: AudiencePreset[] = [
  "Wellness",
  "Parenting",
  "Personal growth",
];

type ActiveTab =
  | "description"
  | "trailer"
  | "episodes"
  | "tweets"
  | "schedule"
  | "checklist";

export default function PodPilotPage() {
  const [theme, setTheme] = useState("");
  const [audience, setAudience] = useState<AudiencePreset>("Wellness");
  const [voice, setVoice] = useState<VoicePreset>("Friendly Storyteller");
  const [primer, setPrimer] = useState("");
  const [status, setStatus] = useState<RunStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<PodPilotOutputs>(defaultOutputs);
  const [activeTab, setActiveTab] = useState<ActiveTab>("description");

  const [publishable, setPublishable] = useState<null | "yes" | "no">(null);
  const [voiceScore, setVoiceScore] = useState(3);
  const [clarityScore, setClarityScore] = useState(3);
  const [actionScore, setActionScore] = useState(3);
  const [evalNotes, setEvalNotes] = useState("");

  const hasOutputs =
    outputs.showDescription.trim().length > 0 ||
    outputs.trailerScript.trim().length > 0;

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setStatus("running");
    setError(null);

    try {
      const res = await fetch("/api/podpilot/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, audience, voice, primer }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to generate launch packet.");
      }

      const data = await res.json();
      setOutputs(data.outputs as PodPilotOutputs);
      setStatus("success");
      setActiveTab("description");

      setPublishable(null);
      setVoiceScore(3);
      setClarityScore(3);
      setActionScore(3);
      setEvalNotes("");
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setError(err?.message ?? "Unknown error");
    }
  }

  function prettyPrintCsv(csv: string) {
    if (!csv) return null;
    const lines = csv.trim().split("\n");
    if (lines.length === 0) return null;
    const [header, ...rows] = lines;
    const headers = header.split(",");

    return (
      <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700 text-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-900/40">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const cols = row.split(",");
              return (
                <tr key={idx} className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-900/40">
                  {cols.map((c, i) => (
                    <td
                      key={i}
                      className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function handleCopy(text: string) {
    if (!text) return;
    navigator.clipboard.writeText(text).catch(() => {
    });
  }

  function handleSaveEval() {
    console.log("Saved eval:", {
      publishable,
      voiceScore,
      clarityScore,
      actionScore,
      evalNotes,
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="hidden md:flex md:w-64 flex-col border-r border-slate-800 bg-slate-950/80">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center text-xs font-bold">
            CO
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">
              CreatorOS
            </div>
            <div className="text-xs text-slate-400">PodPilot Launch Studio</div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-4 text-sm space-y-1">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Workspace
          </div>
          <button
            className="w-full flex items-center justify-between rounded-lg px-3 py-2 bg-slate-900 text-slate-50 text-sm"
            disabled
          >
            <span>PodPilot</span>
            <span className="text-[10px] rounded-full bg-indigo-500/20 text-indigo-300 px-2 py-0.5">
              Free
            </span>
          </button>
          <button
            className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900/60"
            disabled
          >
            <span>ClipSmith</span>
            <span className="text-[10px] rounded-full border border-slate-700 px-2 py-0.5">
              Coming soon
            </span>
          </button>
          <button
            className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-900/60"
            disabled
          >
            <span>BrandSafe-Reads</span>
            <span className="text-[10px] rounded-full border border-slate-700 px-2 py-0.5">
              Coming soon
            </span>
          </button>
        </nav>
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="mb-1 font-medium text-slate-300">
            Demo environment
          </div>
          <p>Runs are stored locally for replay. Not for production use.</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="md:hidden h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center text-xs font-bold">
              CO
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight">
                PodPilot Launch Packet
              </h1>
              <p className="text-xs text-slate-400">
                Paste your theme, pick an audience & voice, and generate your
                week-one launch packet.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-slate-300">
              Status:{" "}
              <span
                className={
                  status === "running"
                    ? "text-amber-300"
                    : status === "error"
                    ? "text-red-300"
                    : status === "success"
                    ? "text-emerald-300"
                    : "text-slate-400"
                }
              >
                {status === "idle" && "Idle"}
                {status === "running" && "Generating"}
                {status === "success" && "Ready"}
                {status === "error" && "Error"}
              </span>
            </span>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(260px,1fr)]">
          <section className="border-b xl:border-b-0 xl:border-r border-slate-800 p-4 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              1 · Brief
            </h2>
            <form onSubmit={handleRun} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Show theme
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. Mindful Mornings for Busy Parents"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) =>
                      setAudience(e.target.value as AudiencePreset)
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {audienceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Voice
                  </label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value as VoicePreset)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {voiceOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Optional primer
                </label>
                <textarea
                  value={primer}
                  onChange={(e) => setPrimer(e.target.value)}
                  placeholder="Anything else we should know about tone, format, or your background?"
                  rows={4}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-500">
                  Short paragraph to help PodPilot match your style. Optional.
                </p>
              </div>

              {error && (
                <div className="text-xs text-red-300 bg-red-950/40 border border-red-800 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "running"}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60 disabled:hover:bg-indigo-500"
              >
                {status === "running" ? "Generating…" : "Generate launch packet"}
              </button>

              <p className="text-[11px] text-slate-500">
                Outputs: show description, trailer script, 3 episode outlines, 5
                tweets, week-one schedule, and RSS/hosting checklist.
              </p>
            </form>
          </section>

          <section className="border-b xl:border-b-0 xl:border-r border-slate-800 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                2 · Launch Packet
              </h2>
              <div className="flex gap-2">
                {hasOutputs && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          [
                            outputs.showDescription,
                            "",
                            outputs.trailerScript,
                          ].join("\n\n")
                        )
                      }
                      className="text-[11px] rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-900"
                    >
                      Copy desc + trailer
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(outputs.weekScheduleCsv || "")
                      }
                      className="text-[11px] rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-900"
                    >
                      Copy CSV
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex border-b border-slate-800 text-xs">
              {[
                { id: "description", label: "Show description" },
                { id: "trailer", label: "Trailer script" },
                { id: "episodes", label: "Episode outlines" },
                { id: "tweets", label: "Tweets" },
                { id: "schedule", label: "Week-one schedule" },
                { id: "checklist", label: "RSS checklist" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-3 py-2 border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-slate-50"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pt-3 text-sm">
              {!hasOutputs && (
                <div className="text-xs text-slate-500 mt-4">
                  No launch packet yet. Fill the brief on the left and click{" "}
                  <span className="font-medium text-slate-300">
                    Generate launch packet
                  </span>
                  .
                </div>
              )}

              {hasOutputs && activeTab === "description" && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400">
                    Show description
                  </h3>
                  <p className="whitespace-pre-wrap text-slate-100">
                    {outputs.showDescription}
                  </p>
                </div>
              )}

              {hasOutputs && activeTab === "trailer" && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400">
                    Trailer script
                  </h3>
                  <p className="whitespace-pre-wrap text-slate-100">
                    {outputs.trailerScript}
                  </p>
                </div>
              )}

              {hasOutputs && activeTab === "episodes" && (
                <div className="space-y-4">
                  {outputs.episodeOutlines.map((ep, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                    >
                      <div className="text-xs font-semibold text-slate-300 mb-1">
                        Episode {idx + 1}: {ep.title}
                      </div>
                      <ul className="list-disc list-inside text-slate-200 text-sm space-y-1">
                        {ep.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {outputs.episodeOutlines.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No episode outlines generated.
                    </p>
                  )}
                </div>
              )}

              {hasOutputs && activeTab === "tweets" && (
                <div className="space-y-3">
                  {outputs.tweets.map((tweet, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                    >
                      <div className="text-[11px] text-slate-500 mb-1">
                        Tweet {idx + 1}
                      </div>
                      <p className="whitespace-pre-wrap text-slate-100">
                        {tweet}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {hasOutputs && activeTab === "schedule" && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 mb-1">
                    Week-one schedule (Mon–Fri @ 10:00)
                  </h3>
                  {prettyPrintCsv(outputs.weekScheduleCsv)}
                </div>
              )}

              {hasOutputs && activeTab === "checklist" && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400">
                    RSS / hosting checklist
                  </h3>
                  <ul className="list-disc list-inside text-slate-200 text-sm space-y-1">
                    {outputs.rssChecklist.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <aside className="border-t xl:border-t-0 xl:border-l border-slate-800 p-4 flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              3 · Evaluation
            </h2>
            <p className="text-[11px] text-slate-500 mb-1">
              Use this rubric to score the current run. For the capstone, you
              can export or log these scores as part of your evaluation plan.
            </p>

            <div className="space-y-2 text-xs">
              <div className="space-y-1">
                <span className="font-medium text-slate-300">
                  Publishable?
                </span>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setPublishable("yes")}
                    className={`px-3 py-1 rounded-full border ${
                      publishable === "yes"
                        ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                        : "border-slate-700 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPublishable("no")}
                    className={`px-3 py-1 rounded-full border ${
                      publishable === "no"
                        ? "border-red-400 bg-red-500/10 text-red-200"
                        : "border-slate-700 text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    Needs work
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">
                  Voice adherence (1–5)
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={voiceScore}
                  onChange={(e) => setVoiceScore(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-[11px] text-slate-500">
                  Current: {voiceScore}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">
                  Clarity (1–5)
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={clarityScore}
                  onChange={(e) => setClarityScore(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-[11px] text-slate-500">
                  Current: {clarityScore}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">
                  Actionability (1–5)
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={actionScore}
                  onChange={(e) => setActionScore(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-[11px] text-slate-500">
                  Current: {actionScore}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300">
                  Notes (optional)
                </label>
                <textarea
                  value={evalNotes}
                  onChange={(e) => setEvalNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="What would you change before publishing?"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveEval}
              className="mt-auto inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-slate-50 hover:bg-slate-800 border border-slate-700"
            >
              Save evaluation (demo)
            </button>

            {publishable && (
              <div className="mt-2 text-[11px] rounded-md border px-3 py-2 border-slate-700 bg-slate-900/70">
                <div className="font-semibold text-slate-200 mb-1">
                  Overall badge
                </div>
                <p className="text-slate-400">
                  {publishable === "yes"
                    ? "✅ Ready-to-publish (with light edits)."
                    : "🛠 Needs edit before publishing."}
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
