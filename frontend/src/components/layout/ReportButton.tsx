import Icon from "@/components/ui/Icon";

/** The "Report an occurrence" button floating at the bottom of every page. */
export default function ReportButton({ onClick }: { onClick: () => void }) {
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: "var(--space-6)", display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 20 }}>
      <button className="btn btn-primary" onClick={onClick} style={{ pointerEvents: "auto", padding: "14px 28px", fontSize: 16, boxShadow: "var(--shadow-lg)", gap: 10, whiteSpace: "nowrap" }}>
        <Icon name="pin" />
        Report an occurrence
      </button>
    </div>
  );
}
