import type { ReactNode } from "react";

export function Btn({
  onClick,
  disabled,
  children,
  style,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px",
        borderRadius: "4px",
        border: "1px solid #4a4a4a",
        background: "#1a1a1a",
        color: "#fafafa",
        fontSize: "13px",
        cursor: "pointer",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}