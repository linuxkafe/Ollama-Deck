import {
  PanelSection,
  PanelSectionRow,
  ToggleField,
  ButtonItem,
  staticClasses
} from "@decky/ui";
import { callable, definePlugin, toaster } from "@decky/api";
import { useEffect, useState } from "react";
import { FaRobot, FaDownload } from "react-icons/fa";

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

type ModelUpdate = {
  model: string;
  ok: boolean;
  detail: string;
};

type OllamaUpdate = {
  ok: boolean;
  before: string | null;
  after: string | null;
  error: string;
};

type UpdateResult = {
  ok: boolean;
  service_active: boolean;
  was_active: boolean;
  ollama: OllamaUpdate;
  models: ModelUpdate[];
  error: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatResult = {
  ok: boolean;
  response?: string;
  model?: string;
  error?: string;
};

type LanInfoResult = {
  ok: boolean;
  bind_address?: string;
  port?: number;
  base_url?: string;
  examples?: Record<string, string>;
  warning?: string;
  models?: string[];
  error?: string;
};

const getStatus = callable<[], Status>("get_status");
const setService = callable<[on: boolean], { ok: boolean }>("set_service");
const setAutostart = callable<[on: boolean], { ok: boolean }>("set_autostart");
const setKeepAwake = callable<[on: boolean], { ok: boolean }>("set_keep_awake");
const updateAll = callable<[], UpdateResult>("update_all");
const pullModel = callable<[tag: string], { ok: boolean; error?: string }>("pull_model");
const deleteModel = callable<[tag: string], { ok: boolean; error?: string }>("delete_model");
const chat = callable<[model: string, prompt: string], ChatResult>("chat");
const lanInfo = callable<[], LanInfoResult>("lan_info");

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
  const [pullModalOpen, setPullModalOpen] = useState(false);
  const [pullModelName, setPullModelName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatModel, setChatModel] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [lanInfoData, setLanInfoData] = useState<LanInfoResult | null>(null);
  const [lanInfoLoaded, setLanInfoLoaded] = useState(false);

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
      return await op();
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  const doPull = async () => {
    if (!pullModelName.trim()) return;
    const tag = pullModelName.trim();
    setPullModalOpen(false);
    setPullModelName("");
    setBusy(true);
    try {
      const res = await pullModel(tag);
      if (!res.ok) {
        toaster.toast({
          title: "Pull falhou",
          body: res.error || `Não foi possível instalar ${tag}`,
          critical: true,
        });
      } else {
        toaster.toast({
          title: "Modelo instalado",
          body: tag,
        });
      }
    } catch (err) {
      toaster.toast({
        title: "Pull falhou",
        body: String(err),
        critical: true,
      });
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  const doDelete = async (tag: string) => {
    setDeleteConfirm(null);
    setBusy(true);
    try {
      const res = await deleteModel(tag);
      if (!res.ok) {
        toaster.toast({
          title: "Remoção falhou",
          body: res.error || `Não foi possível remover ${tag}`,
          critical: true,
        });
      } else {
        toaster.toast({
          title: "Modelo removido",
          body: tag,
        });
      }
    } catch (err) {
      toaster.toast({
        title: "Remoção falhou",
        body: String(err),
        critical: true,
      });
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  const loadLanInfo = async () => {
    if (lanInfoLoaded) return;
    try {
      const res = await lanInfo();
      setLanInfoData(res);
      setLanInfoLoaded(true);
    } catch (err) {
      console.error("lan_info failed", err);
    }
  };

  const doChat = async () => {
    if (!chatInput.trim() || !chatModel) return;
    const prompt = chatInput.trim();
    setChatInput("");
    setChatBusy(true);
    setChatMessages((prev) => [...prev, { role: "user", content: prompt }]);
    try {
      const res = await chat(chatModel, prompt);
      if (!res.ok) {
        toaster.toast({
          title: "Chat falhou",
          body: res.error || "Erro desconhecido",
          critical: true,
        });
        setChatMessages((prev) => [...prev, { role: "assistant", content: `Erro: ${res.error}` }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "assistant", content: res.response || "" }]);
      }
    } catch (err) {
      toaster.toast({
        title: "Chat falhou",
        body: String(err),
        critical: true,
      });
      setChatMessages((prev) => [...prev, { role: "assistant", content: `Erro: ${err}` }]);
    } finally {
      setChatBusy(false);
    }
  };

  useEffect(() => {
    if (status?.service_active) {
      loadLanInfo();
      if (status.models.length > 0 && !chatModel) {
        setChatModel(status.models[0].name);
      }
    }
  }, [status?.service_active, status?.models]);

  if (!status) {
    return (
      <PanelSection title="Ollama Deck">
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", padding: "8px 0" }}>Loading…</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  // Pull model modal
  if (pullModalOpen) {
    return (
      <PanelSection title="Instalar modelo">
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
            Nome do modelo (ex: llama3.2, mistral:7b, codellama:13b)
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <input
            type="text"
            value={pullModelName}
            onChange={(e) => setPullModelName(e.target.value)}
            placeholder="llama3.2"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #4a4a4a",
              background: "#1a1a1a",
              color: "#fafafa",
              fontSize: "14px",
            }}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && doPull()}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <ButtonItem
              layout="inline"
              onClick={() => setPullModalOpen(false)}
            >
              Cancelar
            </ButtonItem>
            <ButtonItem
              layout="inline"
              onClick={doPull}
              disabled={busy || !pullModelName.trim()}
            >
              Instalar
            </ButtonItem>
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  const doUpdate = async () => {
    setBusy(true);
    let res: UpdateResult | undefined;
    try {
      res = await updateAll();
      const o = res.ollama;
      const body =
        o.before && o.after && o.before !== o.after
          ? `Ollama ${o.before} -> ${o.after}`
          : `Ollama ${o.after ?? "?"}`;
      const okModels = res.models.filter((m) => m.ok).length;
      const failed = res.models.filter((m) => !m.ok);
      const modelSummary = res.models.length
        ? `${okModels}/${res.models.length} modelos`
        : "sem modelos para atualizar";
      toaster.toast({
        title: res.ok ? "Update concluído" : "Update com falhas",
        body:
          `${body} · ${modelSummary}` +
          (failed.length
            ? ` · falhou: ${failed.map((m) => m.model).join(", ")}`
            : ""),
        critical: !res.ok,
        duration: 8000
      });
    } catch (err) {
      console.error("update_all failed", err);
      toaster.toast({
        title: "Update falhou",
        body: String(err),
        critical: true
      });
    } finally {
      setBusy(false);
      await refresh();
    }
  };

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

<PanelSection title="Updates">
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={busy}
            onClick={doUpdate}
            description={
              status.service_active
                ? "Atualiza o binário e faz pull dos modelos instalados."
                : "Atualiza o binário; os modelos listados serão puxados."
            }
          >
            <FaDownload style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Update Ollama & models
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={busy || !status.service_active}
            onClick={() => setPullModalOpen(true)}
            description="Instala um novo modelo (ex: llama3.2, mistral:7b). Requer serviço ativo."
          >
            <FaDownload style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Instalar modelo
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px" }}>
            {busy
              ? "A atualizar… a inferência fica em pausa."
              : `Versão atual: ${status.version ?? "—"}. Modelos: ${status.models.length}.`}
          </div>
        </PanelSectionRow>
      </PanelSection>

      {status.service_active && status.models.length > 0 ? (
        <PanelSection title="Chat">
          <PanelSectionRow>
            <select
              value={chatModel}
              onChange={(e) => setChatModel(e.target.value)}
              disabled={chatBusy}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #4a4a4a",
                background: "#1a1a1a",
                color: "#fafafa",
                fontSize: "14px",
              }}
            >
              {status.models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </PanelSectionRow>
          <PanelSectionRow>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                marginBottom: "8px",
                padding: "8px",
                background: "#1a1a1a",
                borderRadius: "4px",
                border: "1px solid #4a4a4a",
              }}
            >
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: "8px", padding: "8px", borderRadius: "4px", background: msg.role === "user" ? "#22c55e22" : "#22c55e11" }}>
                  <div style={{ fontSize: "11px", color: "#8b8b8b", marginBottom: "4px" }}>
                    {msg.role === "user" ? "Você" : "Ollama"}
                  </div>
                  <div style={{ color: "#fafafa", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatBusy && (
                <div style={{ padding: "8px", color: "#22c55e" }}>
                  ⋮ Ollama a pensar…
                </div>
              )}
            </div>
          </PanelSectionRow>
          <PanelSectionRow>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !chatBusy && doChat()}
                placeholder="Digite a sua pergunta…"
                disabled={chatBusy || !chatModel}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #4a4a4a",
                  background: "#1a1a1a",
                  color: "#fafafa",
                  fontSize: "14px",
                }}
                autoFocus
              />
              <ButtonItem layout="inline" onClick={doChat} disabled={chatBusy || !chatInput.trim() || !chatModel}>
                Enviar
              </ButtonItem>
            </div>
          </PanelSectionRow>
        </PanelSection>
      ) : null}

      {status.service_active ? (
        <PanelSection title="Conexão LAN">
          <PanelSectionRow>
            <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
              Informação para ligar a partir de outros equipamentos na rede:
            </div>
          </PanelSectionRow>
          {lanInfoData ? (
            <>
              {lanInfoData.warning && (
                <PanelSectionRow>
                  <div style={{ color: "#f43f5e", fontSize: "11px", padding: "8px", background: "#f43f5e11", borderRadius: "4px", border: "1px solid #f43f5e33" }}>
                    {lanInfoData.warning}
                  </div>
                </PanelSectionRow>
              )}
              <PanelSectionRow>
                <div style={{ color: "#e6e6e6", fontSize: "12px" }}>
                  <strong>Endereço:</strong> {lanInfoData.base_url}
                </div>
              </PanelSectionRow>
              <PanelSectionRow>
                <div style={{ color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }}>
                  Modelos disponíveis: {lanInfoData.models?.join(", ") || "nenhum"}
                </div>
              </PanelSectionRow>
              <PanelSectionRow>
                <div style={{ color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }}>
                  Exemplos de uso:
                </div>
              </PanelSectionRow>
              {lanInfoData.examples && Object.entries(lanInfoData.examples).map(([lang, cmd]) => (
                <PanelSectionRow key={lang}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <code style={{ flex: 1, fontSize: "10px", background: "#1a1a1a", padding: "4px 8px", borderRadius: "4px", color: "#22c55e", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                      {cmd}
                    </code>
                    <ButtonItem layout="inline" onClick={() => navigator.clipboard.writeText(cmd)} disabled={busy}>
                      Copiar
                    </ButtonItem>
                  </div>
                </PanelSectionRow>
              ))}
            </>
          ) : (
            <PanelSectionRow>
              <div style={{ color: "#8b8b8b", fontSize: "12px" }}>A carregar informação LAN…</div>
            </PanelSectionRow>
          )}
        </PanelSection>
      ) : null}

      {status.models.length > 0 ? (
        <PanelSection title="Models">
          {status.models.map((m) => (
            <PanelSectionRow key={m.name}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#e6e6e6"
                }}
              >
                <span>{m.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#8b8b8b" }}>
                    {m.family} · {formatSize(m.size)}
                  </span>
                  <ButtonItem
                    layout="inline"
                    disabled={busy || deleteConfirm === m.name}
                    onClick={() => setDeleteConfirm(m.name)}
                    description="Remove este modelo permanentemente"
                  >
                    🗑
                  </ButtonItem>
                </div>
              </div>
              {deleteConfirm === m.name && (
                <PanelSectionRow>
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <ButtonItem
                      layout="inline"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancelar
                    </ButtonItem>
                    <ButtonItem
                      layout="inline"
                      onClick={() => doDelete(m.name)}
                    >
                      Confirmar remoção
                    </ButtonItem>
                  </div>
                </PanelSectionRow>
              )}
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