import type { ReactNode } from "react";
import { Focusable } from "@decky/ui";

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
        display: "inline-block",
        width: "auto",
        minWidth: 0,
        flex: "0 0 auto",
        flexShrink: 0,
        boxSizing: "border-box",
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

const btnBase: React.CSSProperties = {
  display: "inline-block",
  width: "auto",
  minWidth: 0,
  flex: "0 0 auto",
  flexShrink: 0,
  boxSizing: "border-box",
  padding: "6px 12px",
  borderRadius: "4px",
  border: "1px solid #4a4a4a",
  background: "#1a1a1a",
  color: "#fafafa",
  fontSize: "13px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function FocusBtn({
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
  const run = () => {
    if (!disabled && onClick) onClick();
  };
  return (
    <Focusable
      onActivate={run}
      onClick={run}
      style={{
        ...btnBase,
        ...(disabled ? { opacity: 0.4, cursor: "default" } : {}),
        ...style,
      }}
    >
      {children}
    </Focusable>
  );
}