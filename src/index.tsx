import {
  PanelSection,
  PanelSectionRow,
  ToggleField,
  staticClasses
} from "@decky/ui";
import { callable, definePlugin } from "@decky/api";
import { useEffect, useState } from "react";
import { FaRobot } from "react-icons/fa";

type ModelInfo = {
  name: string;
  size: number;
  family: string;
  quant: string;
};

type Status = {
  service_active: boolean;
  autostart: boolean;
  keep_awake: boolean;
  keep_awake_locked: boolean;
  version: string | null;
  api_reachable: boolean;
  models: ModelInfo[];
  api_url: string;
  error: string;
};

const getStatus = callable<[], Status>("get_status");
const setService = callable<[on: boolean], { ok: boolean }>("set_service");
const setAutostart = callable<[on: boolean], { ok: boolean }>("set_autostart");
const setKeepAwake = callable<[on: boolean], { ok: boolean }>("set_keep_awake");

function formatSize(size: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = size;
  for (let i = 0; i < units.length; i++) {
    if (value < 1024 || i === units.length - 1) {
      return `${value.toFixed(1)} ${units[i]}`;
    }
    value /= 1024;
  }
  return `${value.toFixed(1)} TB`;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: ok ? "#22c55e" : "#f43f5e",
        marginRight: "8px",
        verticalAlign: "middle"
      }}
    />
  );
}

function Content() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      setStatus(await getStatus());
    } catch (err) {
      console.error("get_status failed", err);
    }
  };

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 5000);
    return () => clearInterval(iv);
  }, []);

  const run = async (op: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await op();
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  if (!status) {
    return (
      <PanelSection title="Ollama Deck">
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", padding: "8px 0" }}>Loading…</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return (
    <PanelSection title="Ollama Deck">
      <PanelSectionRow>
        <div style={{ display: "flex", alignItems: "center", color: "#e6e6e6" }}>
          <StatusDot ok={status.service_active && status.api_reachable} />
          <span>
            {status.service_active
              ? status.api_reachable
                ? "Serving"
                : "Starting…"
              : "Stopped"}
            {status.version ? ` · Ollama ${status.version}` : ""}
          </span>
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ToggleField
          label="Ollama Service"
          description={
            status.service_active
              ? "Serviço ativo (start). Desliga on demand."
              : "Serviço parado. Liga on demand."
          }
          checked={status.service_active}
          disabled={busy}
          onChange={(on) => run(() => setService(on))}
        />
      </PanelSectionRow>

      {status.keep_awake_locked ? (
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px", padding: "4px 0" }}>
            O Deck não suspende enquanto o serviço estiver ativo.
          </div>
        </PanelSectionRow>
      ) : null}

      <PanelSectionRow>
        <ToggleField
          label="Keep Deck Awake"
          description={
            status.service_active
              ? status.keep_awake_locked
                ? "Suspensão bloqueada durante inferências."
                : "Ativar para impedir a suspensão do Deck."
              : "Eficaz enquanto o serviço estiver ativo."
          }
          checked={status.keep_awake}
          disabled={busy}
          onChange={(on) => run(() => setKeepAwake(on))}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <ToggleField
          label="Start with Steam Deck"
          description={
            status.autostart
              ? "O serviço arranca com a sessão do utilizador."
              : "O serviço arranca apenas por pedido."
          }
          checked={status.autostart}
          disabled={busy}
          onChange={(on) => run(() => setAutostart(on))}
        />
      </PanelSectionRow>

      {status.api_url && status.service_active ? (
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px" }}>
            API: {status.api_url}
          </div>
        </PanelSectionRow>
      ) : null}

      {status.models.length > 0 ? (
        <PanelSection title="Models">
          {status.models.map((m) => (
            <PanelSectionRow key={m.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#e6e6e6"
                }}
              >
                <span>{m.name}</span>
                <span style={{ color: "#8b8b8b" }}>
                  {m.family} · {formatSize(m.size)}
                </span>
              </div>
            </PanelSectionRow>
          ))}
        </PanelSection>
      ) : (
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px" }}>
            Nenhum modelo — liga o serviço para listar.
          </div>
        </PanelSectionRow>
      )}

      {status.error ? (
        <PanelSectionRow>
          <div style={{ color: "#f43f5e", fontSize: "12px" }}>{status.error}</div>
        </PanelSectionRow>
      ) : null}
    </PanelSection>
  );
}

export default definePlugin(() => ({
  name: "Ollama Deck",
  titleView: (
    <div className={staticClasses.Title}>
      <FaRobot style={{ marginRight: "8px", verticalAlign: "middle" }} />
      Ollama Deck
    </div>
  ),
  content: <Content />,
  icon: <FaRobot />,
  onDismount() {
    /* no-op: backend cleanup runs in _unload */
  }
}));