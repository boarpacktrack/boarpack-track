"use client";

import { toPng } from "html-to-image";

export default function PrintReportButton({ playerName = "player" }) {
  async function downloadReport() {
    const report = document.getElementById("player-development-report");

    if (!report) {
      alert("The player report could not be found.");
      return;
    }

    try {
      const safePlayerName = playerName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const dataUrl = await toPng(report, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${safePlayerName || "player"}-development-report.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Report image download failed:", error);
      alert("The report image could not be downloaded. Please try again.");
    }
  }

  return (
    <button
      type="button"
      onClick={downloadReport}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "12px 18px",
        background: "linear-gradient(135deg, #f5b51b, #ffd84d)",
        color: "#081426",
        border: "1px solid #f5b51b",
        borderRadius: "10px",
        fontWeight: "800",
        fontSize: "14px",
        fontFamily: "inherit",
        cursor: "pointer",
        boxShadow: "0 8px 20px rgba(245, 181, 27, 0.2)",
      }}
    >
      📱 Download Development Report
    </button>
  );
}