import { useRef, useState } from "react";
import { ModalRoot, showModal } from "@decky/ui";
import { callable, toaster } from "@decky/api";
import { t } from "../i18n";
import { FocusBtn } from "./ui";
import { FaDownload, FaSave } from "react-icons/fa";

export type RagConfig = {
  rag_dir: string;
  installed_embedding_models: string[];
  current_embedding_model: string | null;
};

const ragDirSave = callable<[dir: string], { ok: boolean; error?: string }>("rag_dir_save");
const ragEmbeddingInstall = callable<[model: string], { ok: boolean; error?: string }>("rag_embedding_install");
const ragEmbeddingSet = callable<[model: string], { ok: boolean; error?: string }>("rag_embedding_set");

export function openRagModal(opts: { config: RagConfig }) {
  const screenW = window.screen?.width && window.screen.width > 0 ? window.screen.width : 1280;
  const screenH = window.screen?.height && window.screen.height > 0 ? window.screen.height : 800;
  let closeModal = () => {};
  const modal = showModal(
    <ModalRoot
      bAllowFullSize
      closeModal={() => closeModal()}
      onCancel={() => closeModal()}
      onEscKeypress={() => closeModal()}
    >
      <RagModal config={opts.config} />
    </ModalRoot>,
    undefined,
    {
      strTitle: t("rag.title"),
      bForcePopOut: true,
      bHideActionIcons: true,
      bHideMainWindowForPopouts: true,
      bNeverPopOut: false,
      popupWidth: screenW,
      popupHeight: screenH,
    }
  );
  closeModal = modal.Close;
}

function RagModal({ config: initialConfig }: { config: RagConfig }) {
  const [config, setConfig] = useState<RagConfig>(initialConfig);
  const [busy, setBusy] = useState(false);
  const [dir, setDir] = useState(initialConfig.rag_dir);
  const dirInputRef = useRef<HTMLInputElement>(null);

  const doRagDirSave = async () => {
    if (busy || !dir.trim()) return;
    setBusy(true);
    try {
      const res = await ragDirSave(dir.trim());
      if (!res.ok) {
        toaster.toast({ title: t("toast.rag.dir.saved"), body: res.error || t("chat.error.unknown"), critical: true });
      } else {
        toaster.toast({ title: t("toast.rag.dir.saved"), body: `${t("toast.rag.dir.saved")}: ${dir}` });
        setConfig(prev => ({ ...prev, rag_dir: dir.trim() }));
      }
    } catch (err) {
      toaster.toast({ title: t("chat.error.failed"), body: String(err), critical: true });
    } finally {
      setBusy(false);
    }
  };

  const doEmbeddingInstall = async (model: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await ragEmbeddingInstall(model);
      if (!res.ok) {
        toaster.toast({ title: t("toast.rag.embedding.installed"), body: res.error || t("chat.error.unknown"), critical: true });
      } else {
        toaster.toast({ title: t("toast.rag.embedding.installed"), body: `${t("toast.rag.embedding.installed")}: ${model}` });
        setConfig(prev => ({ ...prev, installed_embedding_models: [...prev.installed_embedding_models, model] }));
      }
    } catch (err) {
      toaster.toast({ title: t("chat.error.failed"), body: String(err), critical: true });
    } finally {
      setBusy(false);
    }
  };

  const doEmbeddingSet = async (model: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await ragEmbeddingSet(model);
      if (!res.ok) {
        toaster.toast({ title: t("toast.rag.embedding.set"), body: res.error || t("chat.error.unknown"), critical: true });
      } else {
        toaster.toast({ title: t("toast.rag.embedding.set"), body: `${t("toast.rag.embedding.set")}: ${model}` });
        setConfig(prev => ({ ...prev, current_embedding_model: model }));
      }
    } catch (err) {
      toaster.toast({ title: t("chat.error.failed"), body: String(err), critical: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: "70vh", width: "100%", boxSizing: "border-box", overflow: "hidden", background: "#0a0a0a" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #4a4a4a", background: "#1a1a1a" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", color: "#8b8b8b", fontSize: "12px", marginBottom: "6px" }}>
              {t("rag.dir.placeholder")}
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                ref={dirInputRef}
                type="text"
                value={dir}
                onChange={e => setDir(e.target.value)}
                placeholder={t("rag.dir.placeholder")}
                disabled={busy}
                style={{ flex: 1, padding: "10px 12px", borderRadius: "6px", border: "1px solid #4a4a4a", background: "#0a0a0a", color: "#fafafa", fontSize: "14px", boxSizing: "border-box" }}
              />
              <FocusBtn onClick={doRagDirSave} disabled={busy}>
                <FaSave style={{ marginRight: "6px", verticalAlign: "middle" }} />
                {t("rag.btn.save")}
              </FocusBtn>
            </div>
            {config.rag_dir && (
              <div style={{ color: "#8b8b8b", fontSize: "11px", marginTop: "4px" }}>
                {t("rag.current", { dir: config.rag_dir })}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
            {t("rag.embedding.title")}
          </div>
          {config.installed_embedding_models.length === 0 ? (
            <div style={{ color: "#8b8b8b", padding: "16px", background: "#1a1a1a", borderRadius: "8px", border: "1px solid #4a4a4a" }}>
              {t("rag.embedding.none")}
            </div>
          ) : (
            <>
              <div style={{ color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }}>
                {t("rag.embedding.installed", { models: config.installed_embedding_models.join(", ") })}
              </div>
              {config.current_embedding_model && (
                <div style={{ color: "#22c55e", fontSize: "11px", marginBottom: "8px" }}>
                  {t("rag.embedding.active", { model: config.current_embedding_model })}
                </div>
              )}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                {config.installed_embedding_models.map((m) => (
                  <FocusBtn
                    key={m}
                    onClick={() => doEmbeddingSet(m)}
                    disabled={busy || config.current_embedding_model === m}
                    style={{ background: config.current_embedding_model === m ? "#22c55e22" : "#1a1a1a", borderColor: config.current_embedding_model === m ? "#22c55e" : "#4a4a4a" }}
                  >
                    {t("rag.embedding.btn.use", { model: m })}
                  </FocusBtn>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: "16px" }}>
          <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
            {t("rag.embedding.btn.install", { model: "nomic-embed-text" })}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <FocusBtn onClick={() => doEmbeddingInstall("nomic-embed-text")} disabled={busy || config.installed_embedding_models.includes("nomic-embed-text")}>
              <FaDownload style={{ marginRight: "6px", verticalAlign: "middle" }} />
              {t("rag.embedding.btn.install", { model: "nomic-embed-text" })}
            </FocusBtn>
          </div>
        </div>
      </div>
    </div>
  );
}