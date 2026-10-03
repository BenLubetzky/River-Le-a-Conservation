import type { CSSProperties, ReactNode } from "react";

export default function Field({ label, htmlFor, children, style }: { label: ReactNode; htmlFor?: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="field" style={style}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
