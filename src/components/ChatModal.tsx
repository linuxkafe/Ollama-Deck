import { useEffect, useRef, useState } from "react";
import { ModalRoot, showModal } from "@decky/ui";
import { callable, toaster } from "@decky/api";
import { t } from "../i18n";
import { Btn } from "./ui";

type ModelInfo = {
  name: string;
  size: number;
  family: string;
  quant: string;
};

type Persona = {
  name: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  model: string;
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

const chat = callable<[model: string, prompt: string, use_web_search?: boolean, persona?: Persona], ChatResult>("chat");

export function openChatModal(opts: {
  models: ModelInfo[];
  initialModel: string;
  initialPersona: Persona;
  initialWebSearch: boolean;
}) {
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
      <ChatModal
        models={opts.models}
        initialModel={opts.initialModel}
        initialPersona={opts.initialPersona}
        initialWebSearch={opts.initialWebSearch}
      />
    </ModalRoot>,
    undefined,
    {
      strTitle: t("chat.modal.title"),
      bForcePopOut: true,
      bHideActionIcons: false,
      bHideMainWindowForPopouts: true,
      bNeverPopOut: false,
      popupWidth: screenW,
      popupHeight: screenH,
    }
  );
  closeModal = modal.Close;
}

function ChatModal({
  models,
  initialModel,
  initialPersona,
  initialWebSearch,
}: {
  models: ModelInfo[];
  initialModel: string;
  initialPersona: Persona;
  initialWebSearch: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(initialModel);
  const [busy, setBusy] = useState(false);
  const [webSearch, setWebSearch] = useState(initialWebSearch);
  const [persona] = useState<Persona>(initialPersona);
  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  useEffect(() => {
    resizeInput();
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || !model || busy) return;
    const prompt = input.trim();
    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    try {
      const res = await chat(model, prompt, webSearch, persona);
      if (!res.ok) {
        toaster.toast({
          title: t("chat.error.failed"),
          body: res.error || t("chat.error.unknown"),
          critical: true,
        });
        setMessages((prev) => [...prev, { role: "assistant", content: `${t("chat.role.assistant")}: ${res.error || t("chat.error.unknown")}` }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: res.response || "" }]);
      }
    } catch (err) {
      toaster.toast({
        title: t("chat.error.failed"),
        body: String(err),
        critical: true,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: `${t("chat.role.assistant")}: ${err}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "70vh",
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        background: "#0a0a0a",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #4a4a4a", background: "#1a1a1a" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={busy}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #4a4a4a",
              background: "#0a0a0a",
              color: "#fafafa",
              fontSize: "16px",
            }}
          >
            {models.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fafafa", fontSize: "14px", cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={webSearch}
              onChange={(e) => setWebSearch(e.target.checked)}
              disabled={busy}
              style={{ width: "18px", height: "18px", accentColor: "#22c55e" }}
            />
            {t("chat.web_search")}
          </label>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }}>
        {messages.length === 0 && (
          <div style={{ color: "#8b8b8b", textAlign: "center", padding: "40px 16px" }}>
            {t("chat.input.placeholder")}
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: "16px",
              padding: "12px",
              borderRadius: "8px",
              background: msg.role === "user" ? "#22c55e22" : "#1a1a1a",
              border: msg.role === "user" ? "1px solid #22c55e44" : "1px solid #4a4a4a",
            }}
          >
            <div style={{ fontSize: "12px", color: "#8b8b8b", marginBottom: "8px", fontWeight: 500 }}>
              {msg.role === "user" ? t("chat.role.user") : t("chat.role.assistant")}
            </div>
            <div style={{ color: "#fafafa", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: "1.5", fontSize: "15px" }}>
              {msg.content}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ padding: "12px", color: "#22c55e", fontStyle: "italic" }}>
            {t("chat.thinking")}
          </div>
        )}
        <div ref={listEndRef} />
      </div>
      <div style={{ padding: "16px", borderTop: "1px solid #4a4a4a", background: "#1a1a1a" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!busy) handleSend();
              }
            }}
            placeholder={t("chat.input.placeholder")}
            disabled={busy || !model}
            autoFocus
            rows={1}
            style={{
              width: "100%",
              boxSizing: "border-box",
              resize: "none",
              overflow: "hidden",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #4a4a4a",
              background: "#0a0a0a",
              color: "#fafafa",
              fontSize: "16px",
              lineHeight: "1.4",
              maxHeight: "140px",
            }}
          />
          <Btn onClick={() => handleSend()} disabled={busy || !input.trim() || !model}>
            {t("chat.btn.send")}
          </Btn>
        </div>
      </div>
    </div>
  );
}