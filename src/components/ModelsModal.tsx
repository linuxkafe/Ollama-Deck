import { useEffect, useRef, useState } from "react";
import { ModalRoot, showModal } from "@decky/ui";
import { callable, toaster } from "@decky/api";
import { t } from "../i18n";
import { FocusBtn } from "./ui";
import { FaDownload, FaTrash } from "react-icons/fa";

type ModelInfo = {
  name: string;
  size: number;
  family: string;
  quant: string;
};

type ModelUpdate = {
  model: string;
  ok: boolean;
  detail: string;
};

const pullModel = callable<[name: string], ModelUpdate>("pull_model");
const deleteModel = callable<[name: string], ModelUpdate>("delete_model");

export function openModelsModal(opts: { models: ModelInfo[] }) {
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
      <ModelsModal models={opts.models} />
    </ModalRoot>,
    undefined,
    {
      strTitle: t("models.title"),
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

function ModelsModal({ models: initialModels }: { models: ModelInfo[] }) {
  const [models, setModels] = useState<ModelInfo[]>(initialModels);
  const [busy, setBusy] = useState(false);
  const [pullName, setPullName] = useState("");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<ModelInfo[]>(initialModels);
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFiltered(models.filter(m => m.name.toLowerCase().includes(search.toLowerCase())));
  }, [search, models]);

  const doPull = async () => {
    if (!pullName.trim() || busy) return;
    const name = pullName.trim();
    setBusy(true);
    setPullName("");
    try {
      const res = await pullModel(name);
      if (!res.ok) {
        toaster.toast({ title: t("toast.model.installed"), body: res.detail || t("chat.error.unknown"), critical: true });
      } else {
        toaster.toast({ title: t("toast.model.installed"), body: `${t("toast.model.installed")}: ${name}` });
        setModels(prev => [...prev, { name, size: 0, family: "", quant: "" }]);
      }
    } catch (err) {
      toaster.toast({ title: t("chat.error.failed"), body: String(err), critical: true });
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async (name: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await deleteModel(name);
      if (!res.ok) {
        toaster.toast({ title: t("toast.model.removed"), body: res.detail || t("chat.error.unknown"), critical: true });
      } else {
        toaster.toast({ title: t("toast.model.removed"), body: `${t("toast.model.removed")}: ${name}` });
        setModels(prev => prev.filter(m => m.name !== name));
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
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t("library.search.placeholder")}
              style={{ flex: 1, minWidth: "200px", padding: "10px 12px", borderRadius: "6px", border: "1px solid #4a4a4a", background: "#0a0a0a", color: "#fafafa", fontSize: "16px" }}
            />
            <FocusBtn onClick={doPull} disabled={busy || !pullName.trim()}>
              <FaDownload style={{ marginRight: "6px", verticalAlign: "middle" }} />
              {t("updates.btn.install")}
            </FocusBtn>
          </div>
          <input
            type="text"
            value={pullName}
            onChange={e => setPullName(e.target.value)}
            placeholder={t("updates.btn.install.desc")}
            disabled={busy}
            style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "6px", border: "1px solid #4a4a4a", background: "#0a0a0a", color: "#fafafa", fontSize: "16px" }}
          />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }}>
        {filtered.length === 0 && (
          <div style={{ color: "#8b8b8b", textAlign: "center", padding: "40px 16px" }}>
            {t("library.empty")}
          </div>
        )}
        {filtered.map((m) => (
          <div key={m.name} style={{ marginBottom: "12px", padding: "12px", borderRadius: "8px", background: "#1a1a1a", border: "1px solid #4a4a4a", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: "16px" }}>{m.name}</strong>
              <div style={{ display: "flex", gap: "8px" }}>
                <FocusBtn onClick={() => doDelete(m.name)} disabled={busy} style={{ color: "#f43f5e", borderColor: "#f43f5e" }}>
                  <FaTrash style={{ marginRight: "6px", verticalAlign: "middle" }} />
                  {t("delete.btn.confirm")}
                </FocusBtn>
              </div>
            </div>
            <div style={{ color: "#8b8b8b", fontSize: "12px" }}>
              {m.family} · {m.quant} · {(m.size / (1024*1024*1024)).toFixed(1)} GB
            </div>
          </div>
        ))}
        <div ref={listEndRef} />
      </div>
    </div>
  );
}