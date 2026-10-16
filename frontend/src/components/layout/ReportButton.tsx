import Icon from "@/components/ui/Icon";

/**
 * The "Registar ocorrência" button floating at the bottom centre of every page: reporting is what
 * guardians come to do, so it's always one tap away. On a plant's page it names that plant.
 */
export default function ReportButton({ onClick, species }: { onClick: () => void; species?: string }) {
  return (
    <div className="report-fab">
      <button className="btn btn-primary report-fab-btn" onClick={onClick}>
        <Icon name="pin" size={22} />
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.15 }}>
          Registar ocorrência
          {species && <small style={{ fontSize: 13, fontWeight: 400, opacity: 0.92 }}>{species}</small>}
        </span>
      </button>
    </div>
  );
}
