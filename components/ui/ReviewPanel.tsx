"use client";

import { useState } from "react";

export default function ReviewPanel({ incidentId }: { incidentId: string }) {
  const [decision,   setDecision]   = useState("");
  const [rootCause,  setRootCause]  = useState("Accept");
  const [evidence,   setEvidence]   = useState("Accept");
  const [notes,      setNotes]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState("");

  const labelStyle = {
    fontSize: 11,
    fontWeight: 500 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#212B32",
    display: "block" as const,
    marginBottom: 6,
  };

  const inputStyle = {
    width: "100%",
    fontSize: 13,
    color: "#005EB8",
    backgroundColor: "#FAFBFC",
    border: "1px solid #ebebeb",
    borderRadius: 6,
    padding: "8px 10px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  async function handleSubmit() {
    if (!decision) { setError("Please select a decision before submitting."); return; }
    setError("");
    setLoading(true);
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, decision, rootCause, evidence, notes }),
      });
      setSubmitted(true);
    } catch {
      setError("Submission failed - please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          backgroundColor: "#E8F1FB",
          border: "0.5px solid #BFD6F0",
          borderRadius: 10,
          padding: "24px 18px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 8 }}>✓</div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#085040", margin: "0 0 6px 0" }}>
          Review submitted
        </p>
        <p style={{ fontSize: 12, color: "#212B32", margin: "0 0 12px 0" }}>
          Appended to Reasoning Ledger for {incidentId}.
        </p>
        <p style={{ fontSize: 11, color: "#212B32", margin: 0 }}>
          Check the Audit Log page - your entry is now live.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #ebebeb",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div style={{ backgroundColor: "#005EB8", padding: "14px 18px" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#FFFFFF", margin: "0 0 2px 0" }}>
          Supply Chain Lead Review
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Post-action governance · {incidentId}
        </p>
      </div>

      {/* Form body */}
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Reviewer */}
        <div>
          <span style={labelStyle}>Reviewer</span>
          <div style={{ ...inputStyle, color: "#212B32", backgroundColor: "#F8FAFC" }}>
            Sarah Mitchell · s.mitchell@arvion.com
          </div>
        </div>

        {/* Decision */}
        <div>
          <span style={labelStyle}>Your decision</span>
          <select
            value={decision}
            onChange={(e) => { setDecision(e.target.value); setError(""); }}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Select decision…</option>
            <option value="approve">Approve automated action</option>
            <option value="escalate">Escalate to clinical team</option>
            <option value="override">Override - manual action taken</option>
          </select>
        </div>

        {/* Root cause */}
        <div>
          <span style={labelStyle}>Root cause classification</span>
          <select
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="Accept">Accept - Courier / Traffic</option>
            <option value="Override">Override - different root cause</option>
          </select>
        </div>

        {/* Evidence level */}
        <div>
          <span style={labelStyle}>Evidence level</span>
          <select
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="Accept">Accept - Confirmed</option>
            <option value="Downgrade">Downgrade to Probable</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <span style={labelStyle}>Review notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add governance notes, context, or follow-up actions…"
            rows={4}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
          />
        </div>

        {/* Error */}
        {error && (
          <span style={{ fontSize: 12, color: "#005EB8" }}>{error}</span>
        )}

        {/* Post-action note */}
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#F8FAFC",
            border: "0.5px dashed #F0F4F5",
            borderRadius: 6,
          }}
        >
          <span style={{ fontSize: 11, color: "#212B32" }}>
            Human involvement - post-action only. The automated action has already executed. This review is for governance and audit purposes only.
          </span>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#212B32" : "#005EB8",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            borderRadius: 7,
            padding: "10px 16px",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
            textAlign: "center",
          }}
        >
          {loading ? "Submitting…" : "Submit Review and Approve →"}
        </button>
      </div>
    </div>
  );
}
