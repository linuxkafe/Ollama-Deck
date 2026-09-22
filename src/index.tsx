import {
  PanelSection,
  PanelSectionRow,
  ToggleField,
  ButtonItem,
  staticClasses
} from "@decky/ui";
import { callable, definePlugin, toaster } from "@decky/api";
import { Fragment, useEffect, useState } from "react";
import { FaRobot, FaDownload, FaTrash } from "react-icons/fa";
import { t } from "./i18n";
import { openRagModal } from "./components/RagModal";
import { openModelsModal } from "./components/ModelsModal";
import { openChatModal } from "./components/ChatModal";
import { FocusBtn } from "./components/ui";

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

type LibraryModel = {
  name: string;
  tags: string[];
  sizes: string[];
  description: string;
};

type SearchModelsResult = {
  ok: boolean;
  models: LibraryModel[];
  total: number;
  error?: string;
};

type RagConfigResult = {
  ok: boolean;
  rag_documents_dir: string;
  rag_embedding_model?: string;
  installed_embedding_models: string[];
  recommended_embedding_model?: string;
  error?: string;
};

type Persona = {
  name: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  model: string;
};

type PersonaResult = {
  ok: boolean;
  persona?: Persona;
  error?: string;
};

type NetworkExposureResult = {
  ok: boolean;
  expose?: boolean;
  bind_address?: string;
  error?: string;
};

const getStatus = callable<[], Status>("get_status");
const setService = callable<[on: boolean], { ok: boolean }>("set_service");
const setAutostart = callable<[on: boolean], { ok: boolean }>("set_autostart");
const setKeepAwake = callable<[on: boolean], { ok: boolean }>("set_keep_awake");
const updateAll = callable<[], UpdateResult>("update_all");
const pullModel = callable<[tag: string], { ok: boolean; error?: string }>("pull_model");
const lanInfo = callable<[], LanInfoResult>("lan_info");
const searchModels = callable<[query?: string, tags?: string[]], SearchModelsResult>("search_models");
const getRagConfig = callable<[], RagConfigResult>("get_rag_config");
const setNetworkExposure = callable<[expose: boolean], NetworkExposureResult>("set_network_exposure");
const getPersona = callable<[], PersonaResult>("get_persona");
const setPersona = callable<[persona: Persona], PersonaResult>("set_persona");

const DEFAULT_PERSONA: Persona = {
  name: "Default",
  system_prompt: "You are a helpful assistant.",
  temperature: 0.7,
  max_tokens: 2048,
  model: "",
};



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
  const [chatModel, setChatModel] = useState("");
  const [lanInfoData, setLanInfoData] = useState<LanInfoResult | null>(null);
  const [lanInfoLoaded, setLanInfoLoaded] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [libraryTags, setLibraryTags] = useState<string[]>([]);
  const [libraryResults, setLibraryResults] = useState<LibraryModel[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [ragConfig, setRagConfigState] = useState<RagConfigResult | null>(null);
  const [ragDirInput, setRagDirInput] = useState("");
  const [networkExpose, setNetworkExpose] = useState(false);
  const [webSearchEnabled] = useState(true);
  const [persona, setPersonaState] = useState<Persona>(DEFAULT_PERSONA);
  const [personaName, setPersonaName] = useState("");
  const [personaSystemPrompt, setPersonaSystemPrompt] = useState("");
  const [personaTemperature, setPersonaTemperature] = useState(0.7);
  const [personaMaxTokens, setPersonaMaxTokens] = useState(2048);
  const [personaModel, setPersonaModel] = useState("");

  const refresh = async () => {
    try {
      setStatus(await getStatus());
      const personaRes = await getPersona();
      if (personaRes.ok && personaRes.persona) {
        setPersonaState(personaRes.persona);
      }
    } catch (err) {
      console.error("get_status failed", err);
    }
  };

  const loadPersona = async () => {
    try {
      const res = await getPersona();
      if (res.ok && res.persona) {
        setPersonaState(res.persona);
      }
    } catch (err) {
      console.error("get_persona failed", err);
    }
  };

  const loadNetworkExpose = async () => {
    try {
      const res = await getStatus();
      const host = res.api_url?.includes("0.0.0.0") || res.api_url?.includes("LAN");
      setNetworkExpose(!!host);
    } catch (err) {
      console.error("load_network_expose failed", err);
    }
  };

  useEffect(() => {
    refresh();
    loadPersona();
    loadNetworkExpose();
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
          title: t('toast.pull.failed'),
          body: res.error || t('toast.pull.error', { model: tag }),
          critical: true,
        });
      } else {
        toaster.toast({
          title: t('toast.model.installed'),
          body: tag,
        });
      }
    } catch (err) {
      toaster.toast({
        title: t('toast.pull.failed'),
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

  const handleOpenChat = () => {
    if (!status?.service_active || status.models.length === 0) return;
    openChatModal({
      models: status.models,
      initialModel: chatModel || status.models[0].name,
      initialPersona: persona,
      initialWebSearch: webSearchEnabled,
    });
  };

  useEffect(() => {
    if (status?.service_active) {
      loadLanInfo();
      if (status.models.length > 0 && !chatModel) {
        setChatModel(status.models[0].name);
      }
      loadLibrarySearch();
      loadRagConfig();
    }
  }, [status?.service_active, status?.models]);

  const loadLibrarySearch = async () => {
    setLibraryLoading(true);
    try {
      const res = await searchModels(librarySearch, libraryTags.length > 0 ? libraryTags : undefined);
      if (res.ok) {
        setLibraryResults(res.models);
      }
    } catch (err) {
      console.error("search_models failed", err);
    } finally {
      setLibraryLoading(false);
    }
  };

  const loadRagConfig = async () => {
    try {
      const res = await getRagConfig();
      if (res.ok) {
        setRagConfigState(res);
        setRagDirInput(res.rag_documents_dir || "");
      }
    } catch (err) {
      console.error("get_rag_config failed", err);
    }
  };

  const doLibraryInstall = async (modelName: string) => {
    setBusy(true);
    try {
      const res = await pullModel(modelName);
      if (!res.ok) {
        toaster.toast({
          title: t('toast.install.failed'),
          body: res.error || t('toast.install.error', { model: modelName }),
          critical: true,
        });
      } else {
        toaster.toast({
          title: t('toast.model.installed'),
          body: modelName,
        });
        await loadLibrarySearch();
      }
    } catch (err) {
      toaster.toast({
        title: t('toast.install.failed'),
        body: String(err),
        critical: true,
      });
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  const doUpdate = async () => {
    setBusy(true);
    let res: UpdateResult | undefined;
    try {
      res = await updateAll();
      const o = res.ollama;
      const ollamaBody =
        o.before && o.after && o.before !== o.after
          ? t('update.body.ollama', { before: o.before, after: o.after })
          : t('update.body.ollama.single', { after: o.after ?? '?' });
      const okModels = res.models.filter((m) => m.ok).length;
      const failed = res.models.filter((m) => !m.ok);
      const modelSummary = res.models.length
        ? t('update.body.models', { ok: okModels, total: res.models.length })
        : t('update.body.models.none');
      toaster.toast({
        title: res.ok ? t('toast.update.complete') : t('toast.update.partial'),
        body:
          `${ollamaBody} · ${modelSummary}` +
          (failed.length
            ? ` · ${t('update.body.failed', { models: failed.map((m) => m.model).join(", ") })}`
            : ""),
        critical: !res.ok,
        duration: 8000
      });
    } catch (err) {
      console.error("update_all failed", err);
      toaster.toast({
        title: t('toast.update.failed'),
        body: String(err),
        critical: true
      });
    } finally {
      setBusy(false);
      await refresh();
    }
  };

  if (!status) {
    return (
      <PanelSection title={t('app.title')}>
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", padding: "8px 0" }}>{t('app.loading')}</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (pullModalOpen) {
    return (
      <PanelSection title={t('pull.modal.title')}>
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
            {t('pull.modal.hint')}
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <input
            type="text"
            value={pullModelName}
            onChange={(e) => setPullModelName(e.target.value)}
            placeholder={t('pull.modal.placeholder')}
            style={{
              width: "100%",
              boxSizing: "border-box",
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
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <FocusBtn
              onClick={() => setPullModalOpen(false)}
            >
              {t('pull.modal.btn.cancel')}
            </FocusBtn>
            <FocusBtn
              onClick={doPull}
              disabled={busy || !pullModelName.trim()}
            >
              {t('pull.modal.btn.install')}
            </FocusBtn>
          </div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return (
    <PanelSection title={t('app.title')}>
      <PanelSectionRow>
        <div style={{ display: "flex", alignItems: "center", color: "#e6e6e6", marginBottom: "8px" }}>
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
          label={t('service.label')}
          description={
            status.service_active
              ? t('service.desc.active')
              : t('service.desc.inactive')
          }
          checked={status.service_active}
          disabled={busy}
          onChange={(on) => run(() => setService(on))}
        />
      </PanelSectionRow>

      {status.keep_awake_locked ? (
<PanelSectionRow>
        <div style={{ color: "#8b8b8b", fontSize: "12px", padding: "4px 0", marginBottom: "8px" }}>
          {t('keepAwake.locked')}
        </div>
      </PanelSectionRow>
      ) : null}

      <PanelSectionRow>
        <ToggleField
          label={t('keepAwake.label')}
          description={
            status.service_active
              ? status.keep_awake_locked
                ? t('keepAwake.desc.locked')
                : t('keepAwake.desc.active')
              : t('keepAwake.desc.inactive')
          }
          checked={status.keep_awake}
          disabled={busy}
          onChange={(on) => run(() => setKeepAwake(on))}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <ToggleField
          label={t('autostart.label')}
          description={
            status.autostart
              ? t('autostart.desc.active')
              : t('autostart.desc.inactive')
          }
          checked={status.autostart}
          disabled={busy}
          onChange={(on) => run(() => setAutostart(on))}
        />
      </PanelSectionRow>

      <PanelSectionRow>
        <ToggleField
          label={t('network.label')}
          description={t('network.desc')}
          checked={networkExpose}
          disabled={busy || !status.service_active}
          onChange={(on) => run(() => setNetworkExposure(on))}
        />
      </PanelSectionRow>

      {status.api_url && status.service_active ? (
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
            {t('api.url', { url: status.api_url })}
          </div>
        </PanelSectionRow>
      ) : null}

<PanelSection title={t('updates.title')}>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={busy}
            onClick={doUpdate}
            description={
              status.service_active
                ? t('updates.btn.update.desc.active')
                : t('updates.btn.update.desc.inactive')
            }
          >
            <FaDownload style={{ marginRight: "8px", verticalAlign: "middle" }} />
            {t('updates.btn.update')}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={busy || !status.service_active}
            onClick={() => setPullModalOpen(true)}
            description={t('updates.btn.install.desc')}
          >
            <FaDownload style={{ marginRight: "8px", verticalAlign: "middle" }} />
            {t('updates.btn.install')}
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px" }}>
            {busy
              ? t('updates.status.updating')
              : t('updates.status.idle', { version: status.version ?? "—", count: status.models.length })}
          </div>
        </PanelSectionRow>
      </PanelSection>

      {status.service_active && status.models.length > 0 ? (
        <PanelSectionRow>
          <div style={{ marginBottom: "8px" }}>
            <ButtonItem
              layout="below"
              disabled={busy}
              onClick={handleOpenChat}
              description={t('chat.btn.open.desc')}
            >
              <FaRobot style={{ marginRight: "8px", verticalAlign: "middle" }} />
              {t('chat.btn.open')}
            </ButtonItem>
          </div>
        </PanelSectionRow>
      ) : null}

      {status.service_active ? (
        <PanelSection title={t('lan.title')}>
          <PanelSectionRow>
            <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
              {t('lan.desc')}
            </div>
          </PanelSectionRow>
          {lanInfoData ? (
            <>
              {lanInfoData.warning && (
                <PanelSectionRow>
                  <div style={{ color: "#f43f5e", fontSize: "11px", padding: "8px", background: "#f43f5e11", borderRadius: "4px", border: "1px solid #f43f5e33", marginBottom: "8px" }}>
                    {lanInfoData.warning}
                  </div>
                </PanelSectionRow>
              )}
              <PanelSectionRow>
                <div style={{ color: "#e6e6e6", fontSize: "12px", marginBottom: "8px" }}>
                  <strong>{t('lan.address', { url: lanInfoData.base_url ?? '' })}</strong>
                </div>
              </PanelSectionRow>
              <PanelSectionRow>
                <div style={{ color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }}>
                  {t('lan.models', { models: lanInfoData.models?.join(", ") || 'none' })}
                </div>
              </PanelSectionRow>
              <PanelSectionRow>
                <div style={{ color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }}>
                  {t('lan.examples')}
                </div>
              </PanelSectionRow>
              {lanInfoData.examples && Object.entries(lanInfoData.examples).map(([lang, cmd]) => (
                <Fragment key={lang}>
                  <PanelSectionRow>
                    <code style={{ display: "block", width: "100%", boxSizing: "border-box", fontSize: "10px", background: "#1a1a1a", padding: "4px 8px", borderRadius: "4px", color: "#22c55e", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                      {cmd}
                    </code>
                  </PanelSectionRow>
                  <PanelSectionRow>
                    <div style={{ marginBottom: "8px" }}>
                      <FocusBtn onClick={() => navigator.clipboard.writeText(cmd)} disabled={busy}>
                        {t('lan.btn.copy')}
                      </FocusBtn>
                    </div>
                  </PanelSectionRow>
                </Fragment>
              ))}
            </>
          ) : (
            <PanelSectionRow>
              <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>{t('lan.loading')}</div>
            </PanelSectionRow>
          )}
        </PanelSection>
      ) : null}

      {status.models.length > 0 ? (
        <PanelSectionRow>
          <div style={{ marginBottom: "8px" }}>
            <FocusBtn onClick={() => openModelsModal({ models: status.models })}>
              <FaTrash style={{ marginRight: "6px", verticalAlign: "middle" }} />
              {t('models.manage')}
            </FocusBtn>
          </div>
        </PanelSectionRow>
      ) : (
        <PanelSectionRow>
          <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
            {t('models.empty')}
          </div>
        </PanelSectionRow>
      )}

      {status.error ? (
        <PanelSectionRow>
          <div style={{ color: "#f43f5e", fontSize: "12px", marginBottom: "8px" }}>{status.error}</div>
        </PanelSectionRow>
      ) : null}

      {status.service_active && (
        <PanelSection title={t('library.title')}>
          <PanelSectionRow>
            <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
              {t('library.desc')}
            </div>
          </PanelSectionRow>
          <PanelSectionRow>
            <input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder={t('library.search.placeholder')}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #4a4a4a",
                background: "#1a1a1a",
                color: "#fafafa",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }}>
              {["all", "chat", "code", "embedding", "vision", "tools"].map((tag) => {
                const isActive = tag === "all" ? libraryTags.length === 0 : libraryTags.includes(tag);
                const tagKey = `library.tags.${tag}` as string;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (tag === "all") {
                        setLibraryTags([]);
                      } else if (libraryTags.includes(tag)) {
                        setLibraryTags(libraryTags.filter((t) => t !== tag));
                      } else {
                        setLibraryTags([...libraryTags, tag]);
                      }
                    }}
                    style={{
                      display: "inline-block",
                      width: "auto",
                      minWidth: 0,
                      flex: "0 0 auto",
                      flexShrink: 0,
                      boxSizing: "border-box",
                      padding: "4px 10px",
                      borderRadius: "4px",
                      border: isActive ? "1px solid #22c55e" : "1px solid #4a4a4a",
                      background: isActive ? "#22c55e22" : "#1a1a1a",
                      color: isActive ? "#22c55e" : "#e6e6e6",
                      fontSize: "12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t(tagKey)}
                  </button>
                );
              })}
            </div>
          </PanelSectionRow>
          {libraryLoading ? (
            <PanelSectionRow>
              <div style={{ color: "#8b8b8b", fontSize: "12px", textAlign: "center", padding: "16px" }}>
                {t('library.loading')}
              </div>
            </PanelSectionRow>
          ) : (
            <>
              {libraryResults.length > 0 ? (
                libraryResults.map((m) => (
                  <Fragment key={m.name}>
                    <PanelSectionRow>
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ color: "#e6e6e6", fontWeight: 500 }}>{m.name}</div>
                        <div style={{ color: "#8b8b8b", fontSize: "11px" }}>
                          {m.description}
                        </div>
                        <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                          {m.tags.map((t) => (
                            <span key={t} style={{ fontSize: "10px", padding: "2px 6px", background: "#22c55e22", borderRadius: "3px", color: "#22c55e" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </PanelSectionRow>
                    <PanelSectionRow>
                      <div style={{ marginBottom: "8px" }}>
                        <FocusBtn
                          onClick={() => doLibraryInstall(m.name)}
                          disabled={busy}
                        >
                          {t('library.btn.install')}
                        </FocusBtn>
                      </div>
                    </PanelSectionRow>
                  </Fragment>
                ))
              ) : (
                <PanelSectionRow>
                  <div style={{ color: "#8b8b8b", fontSize: "12px", textAlign: "center", padding: "16px" }}>
                    {t('library.empty')}
                  </div>
                </PanelSectionRow>
              )}
            </>
          )}
          <PanelSectionRow>
            <div style={{ color: "#8b8b8b", fontSize: "11px", marginTop: "8px" }}>
              {t('library.hint')}
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {status.service_active && (
        <PanelSectionRow>
          <div style={{ marginBottom: "8px" }}>
            <FocusBtn onClick={() => openRagModal({ config: ragConfig ? { rag_dir: ragConfig.rag_documents_dir, installed_embedding_models: ragConfig.installed_embedding_models, current_embedding_model: ragConfig.rag_embedding_model ?? null } : { rag_dir: ragDirInput, installed_embedding_models: [], current_embedding_model: null } })}>
              <FaDownload style={{ marginRight: "6px", verticalAlign: "middle" }} />
              {t('rag.title')}
            </FocusBtn>
          </div>
        </PanelSectionRow>
      )}

      {status.service_active && (
        <PanelSection title={t('persona.title')}>
          <PanelSectionRow>
            <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
              {t('persona.desc')}
            </div>
          </PanelSectionRow>
          <PanelSectionRow>
            <input
              type="text"
              value={personaName || persona.name}
              onChange={(e) => setPersonaName(e.target.value)}
              placeholder={t('persona.name.placeholder')}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #4a4a4a",
                background: "#1a1a1a",
                color: "#fafafa",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <textarea
              value={personaSystemPrompt || persona.system_prompt}
              onChange={(e) => setPersonaSystemPrompt(e.target.value)}
              placeholder={t('persona.system_prompt.placeholder')}
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #4a4a4a",
                background: "#1a1a1a",
                color: "#fafafa",
                fontSize: "14px",
                marginBottom: "8px",
                resize: "vertical",
              }}
            />
          </PanelSectionRow>
          <PanelSectionRow>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }}>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <label style={{ display: "block", color: "#8b8b8b", fontSize: "12px", marginBottom: "4px" }}>
                  {t('persona.temperature')} ({personaTemperature.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={personaTemperature}
                  onChange={(e) => setPersonaTemperature(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "#22c55e" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: "150px" }}>
                <label style={{ display: "block", color: "#8b8b8b", fontSize: "12px", marginBottom: "4px" }}>
                  {t('persona.max_tokens')} ({personaMaxTokens})
                </label>
                <input
                  type="range"
                  min="1"
                  max="8192"
                  step="1"
                  value={personaMaxTokens}
                  onChange={(e) => setPersonaMaxTokens(parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "#22c55e" }}
                />
              </div>
            </div>
          </PanelSectionRow>
          <PanelSectionRow>
            <select
              value={personaModel || persona.model}
              onChange={(e) => setPersonaModel(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #4a4a4a",
                background: "#1a1a1a",
                color: "#fafafa",
                fontSize: "14px",
                marginBottom: "8px",
              }}
            >
              <option value="">{t('persona.model.default')}</option>
              {status?.models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </PanelSectionRow>
          <PanelSectionRow>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <FocusBtn
                onClick={() => {
                  setPersonaName(persona.name);
                  setPersonaSystemPrompt(persona.system_prompt);
                  setPersonaTemperature(persona.temperature);
                  setPersonaMaxTokens(persona.max_tokens);
                  setPersonaModel(persona.model);
                }}
              >
                {t('persona.btn.reset')}
              </FocusBtn>
              <FocusBtn
                onClick={async () => {
                  const p = {
                    name: personaName || persona.name,
                    system_prompt: personaSystemPrompt || persona.system_prompt,
                    temperature: personaTemperature,
                    max_tokens: personaMaxTokens,
                    model: personaModel || persona.model,
                  };
                  const res = await setPersona(p);
                  if (res.ok) {
                    setPersonaState(p);
                    toaster.toast({ title: t('toast.persona.saved'), body: p.name });
                  } else {
                    toaster.toast({ title: t('toast.persona.save_failed'), body: res.error || "", critical: true });
                  }
                }}
                disabled={busy}
              >
                {t('persona.btn.save')}
              </FocusBtn>
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {status.service_active && (
        <PanelSection title={t('plugins.title')}>
          <PanelSectionRow>
            <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
              {t('plugins.desc')}
            </div>
          </PanelSectionRow>
          <PanelSectionRow>
            <div style={{ color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }}>
              {t('plugins.coming_soon')}
            </div>
          </PanelSectionRow>
          <PanelSectionRow>
            <div style={{ color: "#8b8b8b", fontSize: "11px" }}>
              {t('plugins.persona_marketplace')}
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

    </PanelSection>
  );
}

export default definePlugin(() => ({
  name: t('app.title'),
  titleView: (
    <div className={staticClasses.Title}>
      <FaRobot style={{ marginRight: "8px", verticalAlign: "middle" }} />
      {t('app.title')}
    </div>
  ),
  content: <Content />,
  icon: <FaRobot />,
  onDismount() {
    /* no-op: backend cleanup runs in _unload */
  }
}));