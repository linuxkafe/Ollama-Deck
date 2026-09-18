const manifest = {"name":"Ollama Deck"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const toaster = api.toaster;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaRobot (props) {
  return GenIcon({"attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z"},"child":[]}]})(props);
}function FaDownload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"},"child":[]}]})(props);
}

const getStatus = callable("get_status");
const setService = callable("set_service");
const setAutostart = callable("set_autostart");
const setKeepAwake = callable("set_keep_awake");
const updateAll = callable("update_all");
const pullModel = callable("pull_model");
const deleteModel = callable("delete_model");
const chat = callable("chat");
const lanInfo = callable("lan_info");
function formatSize(size) {
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
function StatusDot({ ok }) {
    return (SP_JSX.jsx("span", { style: {
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: ok ? "#22c55e" : "#f43f5e",
            marginRight: "8px",
            verticalAlign: "middle"
        } }));
}
function Content() {
    const [status, setStatus] = SP_REACT.useState(null);
    const [busy, setBusy] = SP_REACT.useState(false);
    const [pullModalOpen, setPullModalOpen] = SP_REACT.useState(false);
    const [pullModelName, setPullModelName] = SP_REACT.useState("");
    const [deleteConfirm, setDeleteConfirm] = SP_REACT.useState(null);
    const [chatMessages, setChatMessages] = SP_REACT.useState([]);
    const [chatInput, setChatInput] = SP_REACT.useState("");
    const [chatModel, setChatModel] = SP_REACT.useState("");
    const [chatBusy, setChatBusy] = SP_REACT.useState(false);
    const [lanInfoData, setLanInfoData] = SP_REACT.useState(null);
    const [lanInfoLoaded, setLanInfoLoaded] = SP_REACT.useState(false);
    const refresh = async () => {
        try {
            setStatus(await getStatus());
        }
        catch (err) {
            console.error("get_status failed", err);
        }
    };
    SP_REACT.useEffect(() => {
        refresh();
        const iv = setInterval(refresh, 5000);
        return () => clearInterval(iv);
    }, []);
    const run = async (op) => {
        setBusy(true);
        try {
            return await op();
        }
        finally {
            setBusy(false);
            await refresh();
        }
    };
    const doPull = async () => {
        if (!pullModelName.trim())
            return;
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
            }
            else {
                toaster.toast({
                    title: "Modelo instalado",
                    body: tag,
                });
            }
        }
        catch (err) {
            toaster.toast({
                title: "Pull falhou",
                body: String(err),
                critical: true,
            });
        }
        finally {
            setBusy(false);
            await refresh();
        }
    };
    const doDelete = async (tag) => {
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
            }
            else {
                toaster.toast({
                    title: "Modelo removido",
                    body: tag,
                });
            }
        }
        catch (err) {
            toaster.toast({
                title: "Remoção falhou",
                body: String(err),
                critical: true,
            });
        }
        finally {
            setBusy(false);
            await refresh();
        }
    };
    const loadLanInfo = async () => {
        if (lanInfoLoaded)
            return;
        try {
            const res = await lanInfo();
            setLanInfoData(res);
            setLanInfoLoaded(true);
        }
        catch (err) {
            console.error("lan_info failed", err);
        }
    };
    const doChat = async () => {
        if (!chatInput.trim() || !chatModel)
            return;
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
            }
            else {
                setChatMessages((prev) => [...prev, { role: "assistant", content: res.response || "" }]);
            }
        }
        catch (err) {
            toaster.toast({
                title: "Chat falhou",
                body: String(err),
                critical: true,
            });
            setChatMessages((prev) => [...prev, { role: "assistant", content: `Erro: ${err}` }]);
        }
        finally {
            setChatBusy(false);
        }
    };
    SP_REACT.useEffect(() => {
        if (status?.service_active) {
            loadLanInfo();
            if (status.models.length > 0 && !chatModel) {
                setChatModel(status.models[0].name);
            }
        }
    }, [status?.service_active, status?.models]);
    if (!status) {
        return (SP_JSX.jsx(DFL.PanelSection, { title: "Ollama Deck", children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", padding: "8px 0" }, children: "Loading\u2026" }) }) }));
    }
    // Pull model modal
    if (pullModalOpen) {
        return (SP_JSX.jsxs(DFL.PanelSection, { title: "Instalar modelo", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: "Nome do modelo (ex: llama3.2, mistral:7b, codellama:13b)" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("input", { type: "text", value: pullModelName, onChange: (e) => setPullModelName(e.target.value), placeholder: "llama3.2", style: {
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #4a4a4a",
                            background: "#1a1a1a",
                            color: "#fafafa",
                            fontSize: "14px",
                        }, autoFocus: true, onKeyDown: (e) => e.key === "Enter" && doPull() }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end" }, children: [SP_JSX.jsx(DFL.ButtonItem, { layout: "inline", onClick: () => setPullModalOpen(false), children: "Cancelar" }), SP_JSX.jsx(DFL.ButtonItem, { layout: "inline", onClick: doPull, disabled: busy || !pullModelName.trim(), children: "Instalar" })] }) })] }));
    }
    const doUpdate = async () => {
        setBusy(true);
        let res;
        try {
            res = await updateAll();
            const o = res.ollama;
            const body = o.before && o.after && o.before !== o.after
                ? `Ollama ${o.before} -> ${o.after}`
                : `Ollama ${o.after ?? "?"}`;
            const okModels = res.models.filter((m) => m.ok).length;
            const failed = res.models.filter((m) => !m.ok);
            const modelSummary = res.models.length
                ? `${okModels}/${res.models.length} modelos`
                : "sem modelos para atualizar";
            toaster.toast({
                title: res.ok ? "Update concluído" : "Update com falhas",
                body: `${body} · ${modelSummary}` +
                    (failed.length
                        ? ` · falhou: ${failed.map((m) => m.model).join(", ")}`
                        : ""),
                critical: !res.ok,
                duration: 8000
            });
        }
        catch (err) {
            console.error("update_all failed", err);
            toaster.toast({
                title: "Update falhou",
                body: String(err),
                critical: true
            });
        }
        finally {
            setBusy(false);
            await refresh();
        }
    };
    return (SP_JSX.jsxs(DFL.PanelSection, { title: "Ollama Deck", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", color: "#e6e6e6" }, children: [SP_JSX.jsx(StatusDot, { ok: status.service_active && status.api_reachable }), SP_JSX.jsxs("span", { children: [status.service_active
                                    ? status.api_reachable
                                        ? "Serving"
                                        : "Starting…"
                                    : "Stopped", status.version ? ` · Ollama ${status.version}` : ""] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Ollama Service", description: status.service_active
                        ? "Serviço ativo (start). Desliga on demand."
                        : "Serviço parado. Liga on demand.", checked: status.service_active, disabled: busy, onChange: (on) => run(() => setService(on)) }) }), status.keep_awake_locked ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", padding: "4px 0" }, children: "O Deck n\u00E3o suspende enquanto o servi\u00E7o estiver ativo." }) })) : null, SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Keep Deck Awake", description: status.service_active
                        ? status.keep_awake_locked
                            ? "Suspensão bloqueada durante inferências."
                            : "Ativar para impedir a suspensão do Deck."
                        : "Eficaz enquanto o serviço estiver ativo.", checked: status.keep_awake, disabled: busy, onChange: (on) => run(() => setKeepAwake(on)) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Start with Steam Deck", description: status.autostart
                        ? "O serviço arranca com a sessão do utilizador."
                        : "O serviço arranca apenas por pedido.", checked: status.autostart, disabled: busy, onChange: (on) => run(() => setAutostart(on)) }) }), status.api_url && status.service_active ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { color: "#8b8b8b", fontSize: "12px" }, children: ["API: ", status.api_url] }) })) : null, SP_JSX.jsxs(DFL.PanelSection, { title: "Updates", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", disabled: busy, onClick: doUpdate, description: status.service_active
                                ? "Atualiza o binário e faz pull dos modelos instalados."
                                : "Atualiza o binário; os modelos listados serão puxados.", children: [SP_JSX.jsx(FaDownload, { style: { marginRight: "8px", verticalAlign: "middle" } }), "Update Ollama & models"] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", disabled: busy || !status.service_active, onClick: () => setPullModalOpen(true), description: "Instala um novo modelo (ex: llama3.2, mistral:7b). Requer servi\u00E7o ativo.", children: [SP_JSX.jsx(FaDownload, { style: { marginRight: "8px", verticalAlign: "middle" } }), "Instalar modelo"] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px" }, children: busy
                                ? "A atualizar… a inferência fica em pausa."
                                : `Versão atual: ${status.version ?? "—"}. Modelos: ${status.models.length}.` }) })] }), status.service_active && status.models.length > 0 ? (SP_JSX.jsxs(DFL.PanelSection, { title: "Chat", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("select", { value: chatModel, onChange: (e) => setChatModel(e.target.value), disabled: chatBusy, style: {
                                width: "100%",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #4a4a4a",
                                background: "#1a1a1a",
                                color: "#fafafa",
                                fontSize: "14px",
                            }, children: status.models.map((m) => (SP_JSX.jsx("option", { value: m.name, children: m.name }, m.name))) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                maxHeight: "200px",
                                overflowY: "auto",
                                marginBottom: "8px",
                                padding: "8px",
                                background: "#1a1a1a",
                                borderRadius: "4px",
                                border: "1px solid #4a4a4a",
                            }, children: [chatMessages.map((msg, idx) => (SP_JSX.jsxs("div", { style: { marginBottom: "8px", padding: "8px", borderRadius: "4px", background: msg.role === "user" ? "#22c55e22" : "#22c55e11" }, children: [SP_JSX.jsx("div", { style: { fontSize: "11px", color: "#8b8b8b", marginBottom: "4px" }, children: msg.role === "user" ? "Você" : "Ollama" }), SP_JSX.jsx("div", { style: { color: "#fafafa", whiteSpace: "pre-wrap", wordBreak: "break-word" }, children: msg.content })] }, idx))), chatBusy && (SP_JSX.jsx("div", { style: { padding: "8px", color: "#22c55e" }, children: "\u22EE Ollama a pensar\u2026" }))] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px" }, children: [SP_JSX.jsx("input", { type: "text", value: chatInput, onChange: (e) => setChatInput(e.target.value), onKeyDown: (e) => e.key === "Enter" && !chatBusy && doChat(), placeholder: "Digite a sua pergunta\u2026", disabled: chatBusy || !chatModel, style: {
                                        flex: 1,
                                        padding: "8px",
                                        borderRadius: "4px",
                                        border: "1px solid #4a4a4a",
                                        background: "#1a1a1a",
                                        color: "#fafafa",
                                        fontSize: "14px",
                                    }, autoFocus: true }), SP_JSX.jsx(DFL.ButtonItem, { layout: "inline", onClick: doChat, disabled: chatBusy || !chatInput.trim() || !chatModel, children: "Enviar" })] }) })] })) : null, status.service_active ? (SP_JSX.jsxs(DFL.PanelSection, { title: "Conex\u00E3o LAN", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: "Informa\u00E7\u00E3o para ligar a partir de outros equipamentos na rede:" }) }), lanInfoData ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [lanInfoData.warning && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#f43f5e", fontSize: "11px", padding: "8px", background: "#f43f5e11", borderRadius: "4px", border: "1px solid #f43f5e33" }, children: lanInfoData.warning }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { color: "#e6e6e6", fontSize: "12px" }, children: [SP_JSX.jsx("strong", { children: "Endere\u00E7o:" }), " ", lanInfoData.base_url] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }, children: ["Modelos dispon\u00EDveis: ", lanInfoData.models?.join(", ") || "nenhum"] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }, children: "Exemplos de uso:" }) }), lanInfoData.examples && Object.entries(lanInfoData.examples).map(([lang, cmd]) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [SP_JSX.jsx("code", { style: { flex: 1, fontSize: "10px", background: "#1a1a1a", padding: "4px 8px", borderRadius: "4px", color: "#22c55e", whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: cmd }), SP_JSX.jsx(DFL.ButtonItem, { layout: "inline", onClick: () => navigator.clipboard.writeText(cmd), disabled: busy, children: "Copiar" })] }) }, lang)))] })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px" }, children: "A carregar informa\u00E7\u00E3o LAN\u2026" }) }))] })) : null, status.models.length > 0 ? (SP_JSX.jsx(DFL.PanelSection, { title: "Models", children: status.models.map((m) => (SP_JSX.jsxs(DFL.PanelSectionRow, { children: [SP_JSX.jsxs("div", { style: {
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                color: "#e6e6e6"
                            }, children: [SP_JSX.jsx("span", { children: m.name }), SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [SP_JSX.jsxs("span", { style: { color: "#8b8b8b" }, children: [m.family, " \u00B7 ", formatSize(m.size)] }), SP_JSX.jsx(DFL.ButtonItem, { layout: "inline", disabled: busy || deleteConfirm === m.name, onClick: () => setDeleteConfirm(m.name), description: "Remove este modelo permanentemente", children: "\uD83D\uDDD1" })] })] }), deleteConfirm === m.name && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px", justifyContent: "flex-end" }, children: [SP_JSX.jsx(DFL.ButtonItem, { layout: "inline", onClick: () => setDeleteConfirm(null), children: "Cancelar" }), SP_JSX.jsx(DFL.ButtonItem, { layout: "inline", onClick: () => doDelete(m.name), children: "Confirmar remo\u00E7\u00E3o" })] }) }))] }, m.name))) })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px" }, children: "Nenhum modelo \u2014 liga o servi\u00E7o para listar." }) })), status.error ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#f43f5e", fontSize: "12px" }, children: status.error }) })) : null] }));
}
var index = definePlugin(() => ({
    name: "Ollama Deck",
    titleView: (SP_JSX.jsxs("div", { className: DFL.staticClasses.Title, children: [SP_JSX.jsx(FaRobot, { style: { marginRight: "8px", verticalAlign: "middle" } }), "Ollama Deck"] })),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaRobot, {}),
    onDismount() {
        /* no-op: backend cleanup runs in _unload */
    }
}));

export { index as default };
//# sourceMappingURL=index.js.map
