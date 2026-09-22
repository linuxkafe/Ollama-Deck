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
function FaTrash (props) {
  return GenIcon({"attr":{"viewBox":"0 0 448 512"},"child":[{"tag":"path","attr":{"d":"M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"},"child":[]}]})(props);
}function FaRobot (props) {
  return GenIcon({"attr":{"viewBox":"0 0 640 512"},"child":[{"tag":"path","attr":{"d":"M32,224H64V416H32A31.96166,31.96166,0,0,1,0,384V256A31.96166,31.96166,0,0,1,32,224Zm512-48V448a64.06328,64.06328,0,0,1-64,64H160a64.06328,64.06328,0,0,1-64-64V176a79.974,79.974,0,0,1,80-80H288V32a32,32,0,0,1,64,0V96H464A79.974,79.974,0,0,1,544,176ZM264,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,264,256Zm-8,128H192v32h64Zm96,0H288v32h64ZM456,256a40,40,0,1,0-40,40A39.997,39.997,0,0,0,456,256Zm-8,128H384v32h64ZM640,256V384a31.96166,31.96166,0,0,1-32,32H576V224h32A31.96166,31.96166,0,0,1,640,256Z"},"child":[]}]})(props);
}function FaDownload (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"},"child":[]}]})(props);
}

const translations = {
    en: {
        'app.title': 'Ollama Deck',
        'app.loading': 'Loading…',
        'service.label': 'Ollama Service',
        'service.desc.active': 'Service active (start). Stops on demand.',
        'service.desc.inactive': 'Service stopped. Starts on demand.',
        'keepAwake.label': 'Keep Deck Awake',
        'keepAwake.desc.locked': 'Suspend blocked during inference.',
        'keepAwake.desc.active': 'Enable to prevent Deck suspend.',
        'keepAwake.desc.inactive': 'Effective while service is active.',
        'keepAwake.locked': 'Deck will not suspend while service is active.',
        'autostart.label': 'Start with Steam Deck',
        'autostart.desc.active': 'Service starts with user session.',
        'autostart.desc.inactive': 'Service starts only on demand.',
        'api.url': 'API: {url}',
        'updates.title': 'Updates',
        'updates.btn.update': 'Update Ollama & models',
        'updates.btn.update.desc.active': 'Updates binary and pulls installed models.',
        'updates.btn.update.desc.inactive': 'Updates binary; listed models will be pulled.',
        'updates.btn.install': 'Install model',
        'updates.btn.install.desc': 'Installs a new model (e.g., llama3.2, mistral:7b). Requires active service.',
        'updates.status.updating': 'Updating… inference paused.',
        'updates.status.idle': 'Current version: {version}. Models: {count}.',
        'chat.btn.open': 'Open Chat',
        'chat.btn.open.desc': 'Opens chat in full-screen window for better comfort.',
        'chat.modal.title': 'Chat Ollama',
        'chat.model.select': 'Select model',
        'chat.input.placeholder': 'Type your question…',
        'chat.btn.send': 'Send',
        'chat.thinking': 'Ollama is thinking…',
        'chat.role.user': 'You',
        'chat.role.assistant': 'Ollama',
        'chat.error.failed': 'Chat failed',
        'chat.error.unknown': 'Unknown error',
        'pull.modal.title': 'Install model',
        'pull.modal.hint': 'Model name (e.g., llama3.2, mistral:7b, codellama:13b)',
        'pull.modal.placeholder': 'llama3.2',
        'pull.modal.btn.cancel': 'Cancel',
        'pull.modal.btn.install': 'Install',
        'delete.btn.cancel': 'Cancel',
        'delete.btn.confirm': 'Confirm removal',
        'delete.desc': 'Removes this model permanently',
        'lan.title': 'LAN Connection',
        'lan.desc': 'Information to connect from other devices on the network:',
        'lan.address': 'Address: {url}',
        'lan.models': 'Available models: {models}',
        'lan.examples': 'Usage examples:',
        'lan.btn.copy': 'Copy',
        'lan.loading': 'Loading LAN info…',
        'models.title': 'Models',
        'models.empty': 'No models — start service to list.',
        'library.title': 'Model Library',
        'library.desc': 'Search and install models from Ollama library',
        'library.search.placeholder': 'Search by name or description…',
        'library.tags.all': 'All',
        'library.tags.chat': 'Chat',
        'library.tags.code': 'Code',
        'library.tags.embedding': 'Embedding',
        'library.tags.vision': 'Vision',
        'library.tags.tools': 'Tools',
        'library.loading': 'Searching…',
        'library.empty': 'No models found. Try adjusting search.',
        'library.btn.install': 'Install',
        'library.btn.install.desc': 'Install {name}',
        'library.hint': 'Not found? Use "Install model" above to install by exact tag (e.g., llama3.2:7b).',
        'rag.title': 'RAG Configuration',
        'rag.desc': 'Documents directory for RAG (Retrieval-Augmented Generation)',
        'rag.dir.placeholder': '~/Documents/ollama-rag',
        'rag.btn.save': 'Save',
        'rag.current': 'Current directory: {dir}',
        'rag.embedding.title': 'Embedding Model',
        'rag.embedding.installed': 'Installed: {models}',
        'rag.embedding.active': 'Active: {model}',
        'rag.embedding.btn.use': 'Use {model}',
        'rag.embedding.none': 'No embedding model installed. RAG requires an embedding model.',
        'rag.embedding.btn.install': 'Install recommended ({model})',
        'rag.embedding.installing': 'Installing…',
        'toast.model.installed': 'Model installed',
        'toast.model.removed': 'Model removed',
        'toast.rag.dir.saved': 'RAG directory saved',
        'toast.rag.embedding.installed': 'Embedding model installed',
        'toast.rag.embedding.set': 'Embedding model set',
        'toast.update.complete': 'Update complete',
        'toast.update.partial': 'Update with failures',
        'toast.pull.failed': 'Pull failed',
        'toast.pull.error': 'Could not install {model}',
        'toast.delete.failed': 'Removal failed',
        'toast.delete.error': 'Could not remove {model}',
        'toast.install.failed': 'Install failed',
        'toast.install.error': 'Could not install {model}',
        'toast.save.failed': 'Save failed',
        'toast.save.error': 'Unknown error',
        'toast.update.failed': 'Update failed',
        'toast.chat.failed': 'Chat failed',
        'toast.rag.install.failed': 'Install failed',
        'toast.rag.set.failed': 'Set failed',
        'toast.rag.install.error': 'Error',
        'toast.error.unknown': 'Unknown error',
        'update.body.ollama': 'Ollama {before} -> {after}',
        'update.body.ollama.single': 'Ollama {after}',
        'update.body.models': '{ok}/{total} models',
        'update.body.models.none': 'no models to update',
        'update.body.failed': 'failed: {models}',
        'network.label': 'Expose on LAN',
        'network.desc': 'Allow connections from other devices on the network (binds to 0.0.0.0).',
        'chat.web_search': 'Web Search',
        'chat.web_search.desc': 'Enable web search as RAG source for this chat.',
        'persona.title': 'Persona',
        'persona.desc': 'Configure the AI persona (system prompt, creativity, length).',
        'persona.name.placeholder': 'Persona name',
        'persona.system_prompt.placeholder': 'System prompt (instructions for the AI)',
        'persona.temperature': 'Temperature',
        'persona.max_tokens': 'Max Tokens',
        'persona.model.default': 'Use selected model in chat',
        'persona.btn.reset': 'Reset',
        'persona.btn.save': 'Save Persona',
        'toast.persona.saved': 'Persona saved',
        'toast.persona.save_failed': 'Failed to save persona',
        'plugins.title': 'Plugins & Personas',
        'plugins.desc': 'Manage plugins and download personas (coming soon).',
        'plugins.coming_soon': 'Plugin marketplace and persona downloads coming in future update.',
        'plugins.persona_marketplace': 'Persona marketplace: browse and install community personas.',
    },
    pt: {
        'app.title': 'Ollama Deck',
        'app.loading': 'A carregar…',
        'service.label': 'Serviço Ollama',
        'service.desc.active': 'Serviço ativo (start). Desliga on demand.',
        'service.desc.inactive': 'Serviço parado. Liga on demand.',
        'keepAwake.label': 'Manter Deck Acordado',
        'keepAwake.desc.locked': 'Suspensão bloqueada durante inferências.',
        'keepAwake.desc.active': 'Ativar para impedir a suspensão do Deck.',
        'keepAwake.desc.inactive': 'Eficaz enquanto o serviço estiver ativo.',
        'keepAwake.locked': 'O Deck não suspende enquanto o serviço estiver ativo.',
        'autostart.label': 'Arrancar com Steam Deck',
        'autostart.desc.active': 'O serviço arranca com a sessão do utilizador.',
        'autostart.desc.inactive': 'O serviço arranca apenas por pedido.',
        'api.url': 'API: {url}',
        'updates.title': 'Atualizações',
        'updates.btn.update': 'Atualizar Ollama e modelos',
        'updates.btn.update.desc.active': 'Atualiza o binário e faz pull dos modelos instalados.',
        'updates.btn.update.desc.inactive': 'Atualiza o binário; os modelos listados serão puxados.',
        'updates.btn.install': 'Instalar modelo',
        'updates.btn.install.desc': 'Instala um novo modelo (ex: llama3.2, mistral:7b). Requer serviço ativo.',
        'updates.status.updating': 'A atualizar… a inferência fica em pausa.',
        'updates.status.idle': 'Versão atual: {version}. Modelos: {count}.',
        'chat.btn.open': 'Abrir Chat',
        'chat.btn.open.desc': 'Abre o chat em janela completa para melhor conforto.',
        'chat.modal.title': 'Chat Ollama',
        'chat.model.select': 'Selecionar modelo',
        'chat.input.placeholder': 'Digite a sua pergunta…',
        'chat.btn.send': 'Enviar',
        'chat.thinking': 'Ollama a pensar…',
        'chat.role.user': 'Você',
        'chat.role.assistant': 'Ollama',
        'chat.error.failed': 'Chat falhou',
        'chat.error.unknown': 'Erro desconhecido',
        'pull.modal.title': 'Instalar modelo',
        'pull.modal.hint': 'Nome do modelo (ex: llama3.2, mistral:7b, codellama:13b)',
        'pull.modal.placeholder': 'llama3.2',
        'pull.modal.btn.cancel': 'Cancelar',
        'pull.modal.btn.install': 'Instalar',
        'delete.btn.cancel': 'Cancelar',
        'delete.btn.confirm': 'Confirmar remoção',
        'delete.desc': 'Remove este modelo permanentemente',
        'lan.title': 'Conexão LAN',
        'lan.desc': 'Informação para ligar a partir de outros equipamentos na rede:',
        'lan.address': 'Endereço: {url}',
        'lan.models': 'Modelos disponíveis: {models}',
        'lan.examples': 'Exemplos de uso:',
        'lan.btn.copy': 'Copiar',
        'lan.loading': 'A carregar informação LAN…',
        'models.title': 'Modelos',
        'models.empty': 'Nenhum modelo — liga o serviço para listar.',
        'library.title': 'Biblioteca de Modelos',
        'library.desc': 'Pesquisar e instalar modelos da biblioteca Ollama',
        'library.search.placeholder': 'Pesquisar por nome ou descrição…',
        'library.tags.all': 'Todos',
        'library.tags.chat': 'Chat',
        'library.tags.code': 'Código',
        'library.tags.embedding': 'Embedding',
        'library.tags.vision': 'Visão',
        'library.tags.tools': 'Ferramentas',
        'library.loading': 'A pesquisar…',
        'library.empty': 'Nenhum modelo encontrado. Tente ajustar a pesquisa.',
        'library.btn.install': 'Instalar',
        'library.btn.install.desc': 'Instalar {name}',
        'library.hint': 'Não encontrou? Use "Instalar modelo" acima para instalar por tag exata (ex: llama3.2:7b).',
        'rag.title': 'Configuração RAG',
        'rag.desc': 'Diretório de documentos para RAG (Retrieval-Augmented Generation)',
        'rag.dir.placeholder': '~/Documents/ollama-rag',
        'rag.btn.save': 'Salvar',
        'rag.current': 'Diretório atual: {dir}',
        'rag.embedding.title': 'Modelo de Embedding',
        'rag.embedding.installed': 'Instalados: {models}',
        'rag.embedding.active': 'Ativo: {model}',
        'rag.embedding.btn.use': 'Usar {model}',
        'rag.embedding.none': 'Nenhum modelo de embedding instalado. RAG requer um modelo de embedding.',
        'rag.embedding.btn.install': 'Instalar recomendado ({model})',
        'rag.embedding.installing': 'A instalar…',
        'toast.model.installed': 'Modelo instalado',
        'toast.model.removed': 'Modelo removido',
        'toast.rag.dir.saved': 'Diretório RAG salvo',
        'toast.rag.embedding.installed': 'Modelo de embedding instalado',
        'toast.rag.embedding.set': 'Modelo de embedding definido',
        'toast.update.complete': 'Update concluído',
        'toast.update.partial': 'Update com falhas',
        'toast.pull.failed': 'Pull falhou',
        'toast.pull.error': 'Não foi possível instalar {model}',
        'toast.delete.failed': 'Remoção falhou',
        'toast.delete.error': 'Não foi possível remover {model}',
        'toast.install.failed': 'Instalação falhou',
        'toast.install.error': 'Não foi possível instalar {model}',
        'toast.save.failed': 'Falha ao salvar',
        'toast.save.error': 'Erro desconhecido',
        'toast.update.failed': 'Update falhou',
        'toast.chat.failed': 'Chat falhou',
        'toast.rag.install.failed': 'Instalação falhou',
        'toast.rag.set.failed': 'Falha ao definir',
        'toast.rag.install.error': 'Erro',
        'toast.error.unknown': 'Erro desconhecido',
        'toast.persona.saved': 'Persona salva',
        'toast.persona.save_failed': 'Falha ao salvar persona',
        'update.body.ollama': 'Ollama {before} -> {after}',
        'update.body.ollama.single': 'Ollama {after}',
        'update.body.models': '{ok}/{total} modelos',
        'update.body.models.none': 'sem modelos para atualizar',
        'update.body.failed': 'falhou: {models}',
        'network.label': 'Expor na LAN',
        'network.desc': 'Permitir conexões de outros equipamentos na rede (liga a 0.0.0.0).',
        'chat.web_search': 'Pesquisa Web',
        'chat.web_search.desc': 'Ativar pesquisa web como fonte RAG para este chat.',
        'persona.title': 'Persona',
        'persona.desc': 'Configurar a persona da IA (prompt de sistema, criatividade, comprimento).',
        'persona.name.placeholder': 'Nome da persona',
        'persona.system_prompt.placeholder': 'Prompt de sistema (instruções para a IA)',
        'persona.temperature': 'Temperatura',
        'persona.max_tokens': 'Tokens máximos',
        'persona.model.default': 'Usar modelo selecionado no chat',
        'persona.btn.reset': 'Repor',
        'persona.btn.save': 'Salvar Persona',
        'plugins.title': 'Plugins e Personas',
        'plugins.desc': 'Gerir plugins e descarregar personas (em breve).',
        'plugins.coming_soon': 'Marketplace de plugins e download de personas em atualização futura.',
        'plugins.persona_marketplace': 'Marketplace de personas: navegar e instalar personas da comunidade.',
    },
};
let currentLang = 'en';
function detectLanguage() {
    if (typeof navigator !== 'undefined') {
        const lang = navigator.language || navigator.languages?.[0] || 'en';
        if (lang.toLowerCase().startsWith('pt')) {
            return 'pt';
        }
    }
    return 'en';
}
currentLang = detectLanguage();
function t(key, params) {
    const dict = translations[currentLang] || translations.en;
    let text = dict[key] || translations.en[key] || key;
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
    }
    return text;
}

function Btn({ onClick, disabled, children, style, }) {
    return (SP_JSX.jsx("button", { type: "button", onClick: onClick, disabled: disabled, style: {
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #4a4a4a",
            background: "#1a1a1a",
            color: "#fafafa",
            fontSize: "13px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            ...style,
        }, children: children }));
}

const chat = callable("chat");
function openChatModal(opts) {
    const screenW = window.screen?.width && window.screen.width > 0 ? window.screen.width : 1280;
    const screenH = window.screen?.height && window.screen.height > 0 ? window.screen.height : 800;
    let closeModal = () => { };
    const modal = DFL.showModal(SP_JSX.jsx(DFL.ModalRoot, { bAllowFullSize: true, closeModal: () => closeModal(), onCancel: () => closeModal(), onEscKeypress: () => closeModal(), children: SP_JSX.jsx(ChatModal, { models: opts.models, initialModel: opts.initialModel, initialPersona: opts.initialPersona, initialWebSearch: opts.initialWebSearch }) }), undefined, {
        strTitle: t("chat.modal.title"),
        bForcePopOut: true,
        bHideActionIcons: false,
        bHideMainWindowForPopouts: true,
        bNeverPopOut: false,
        popupWidth: screenW,
        popupHeight: screenH,
    });
    closeModal = modal.Close;
}
function ChatModal({ models, initialModel, initialPersona, initialWebSearch, }) {
    const [messages, setMessages] = SP_REACT.useState([]);
    const [input, setInput] = SP_REACT.useState("");
    const [model, setModel] = SP_REACT.useState(initialModel);
    const [busy, setBusy] = SP_REACT.useState(false);
    const [webSearch, setWebSearch] = SP_REACT.useState(initialWebSearch);
    const [persona] = SP_REACT.useState(initialPersona);
    const listEndRef = SP_REACT.useRef(null);
    const inputRef = SP_REACT.useRef(null);
    const scrollToBottom = () => {
        listEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    SP_REACT.useEffect(() => {
        scrollToBottom();
    }, [messages]);
    const resizeInput = () => {
        const el = inputRef.current;
        if (!el)
            return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    };
    SP_REACT.useEffect(() => {
        resizeInput();
    }, [input]);
    const handleSend = async () => {
        if (!input.trim() || !model || busy)
            return;
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
            }
            else {
                setMessages((prev) => [...prev, { role: "assistant", content: res.response || "" }]);
            }
        }
        catch (err) {
            toaster.toast({
                title: t("chat.error.failed"),
                body: String(err),
                critical: true,
            });
            setMessages((prev) => [...prev, { role: "assistant", content: `${t("chat.role.assistant")}: ${err}` }]);
        }
        finally {
            setBusy(false);
        }
    };
    return (SP_JSX.jsxs("div", { style: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: "70vh",
            width: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
            background: "#0a0a0a",
        }, children: [SP_JSX.jsx("div", { style: { padding: "12px 16px", borderBottom: "1px solid #4a4a4a", background: "#1a1a1a" }, children: SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: [SP_JSX.jsx("select", { value: model, onChange: (e) => setModel(e.target.value), disabled: busy, style: {
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "10px 12px",
                                borderRadius: "6px",
                                border: "1px solid #4a4a4a",
                                background: "#0a0a0a",
                                color: "#fafafa",
                                fontSize: "16px",
                            }, children: models.map((m) => (SP_JSX.jsx("option", { value: m.name, children: m.name }, m.name))) }), SP_JSX.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "8px", color: "#fafafa", fontSize: "14px", cursor: "pointer", userSelect: "none" }, children: [SP_JSX.jsx("input", { type: "checkbox", checked: webSearch, onChange: (e) => setWebSearch(e.target.checked), disabled: busy, style: { width: "18px", height: "18px", accentColor: "#22c55e" } }), t("chat.web_search")] })] }) }), SP_JSX.jsxs("div", { style: { flex: 1, minHeight: 0, overflowY: "auto", padding: "16px" }, children: [messages.length === 0 && (SP_JSX.jsx("div", { style: { color: "#8b8b8b", textAlign: "center", padding: "40px 16px" }, children: t("chat.input.placeholder") })), messages.map((msg, idx) => (SP_JSX.jsxs("div", { style: {
                            marginBottom: "16px",
                            padding: "12px",
                            borderRadius: "8px",
                            background: msg.role === "user" ? "#22c55e22" : "#1a1a1a",
                            border: msg.role === "user" ? "1px solid #22c55e44" : "1px solid #4a4a4a",
                        }, children: [SP_JSX.jsx("div", { style: { fontSize: "12px", color: "#8b8b8b", marginBottom: "8px", fontWeight: 500 }, children: msg.role === "user" ? t("chat.role.user") : t("chat.role.assistant") }), SP_JSX.jsx("div", { style: { color: "#fafafa", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: "1.5", fontSize: "15px" }, children: msg.content })] }, idx))), busy && (SP_JSX.jsx("div", { style: { padding: "12px", color: "#22c55e", fontStyle: "italic" }, children: t("chat.thinking") })), SP_JSX.jsx("div", { ref: listEndRef })] }), SP_JSX.jsx("div", { style: { padding: "16px", borderTop: "1px solid #4a4a4a", background: "#1a1a1a" }, children: SP_JSX.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "10px" }, children: [SP_JSX.jsx("textarea", { ref: inputRef, value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!busy)
                                        handleSend();
                                }
                            }, placeholder: t("chat.input.placeholder"), disabled: busy || !model, autoFocus: true, rows: 1, style: {
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
                            } }), SP_JSX.jsx(Btn, { onClick: () => handleSend(), disabled: busy || !input.trim() || !model, children: t("chat.btn.send") })] }) })] }));
}

const getStatus = callable("get_status");
const setService = callable("set_service");
const setAutostart = callable("set_autostart");
const setKeepAwake = callable("set_keep_awake");
const updateAll = callable("update_all");
const pullModel = callable("pull_model");
const deleteModel = callable("delete_model");
const lanInfo = callable("lan_info");
const searchModels = callable("search_models");
const getRagConfig = callable("get_rag_config");
const setRagConfig = callable("set_rag_config");
const setNetworkExposure = callable("set_network_exposure");
const getPersona = callable("get_persona");
const setPersona = callable("set_persona");
const DEFAULT_PERSONA = {
    name: "Default",
    system_prompt: "You are a helpful assistant.",
    temperature: 0.7,
    max_tokens: 2048,
    model: "",
};
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
    const [chatModel, setChatModel] = SP_REACT.useState("");
    const [lanInfoData, setLanInfoData] = SP_REACT.useState(null);
    const [lanInfoLoaded, setLanInfoLoaded] = SP_REACT.useState(false);
    const [librarySearch, setLibrarySearch] = SP_REACT.useState("");
    const [libraryTags, setLibraryTags] = SP_REACT.useState([]);
    const [libraryResults, setLibraryResults] = SP_REACT.useState([]);
    const [libraryLoading, setLibraryLoading] = SP_REACT.useState(false);
    const [ragConfig, setRagConfigState] = SP_REACT.useState(null);
    const [ragDirInput, setRagDirInput] = SP_REACT.useState("");
    const [ragModelInstalling, setRagModelInstalling] = SP_REACT.useState(false);
    const [networkExpose, setNetworkExpose] = SP_REACT.useState(false);
    const [webSearchEnabled] = SP_REACT.useState(true);
    const [persona, setPersonaState] = SP_REACT.useState(DEFAULT_PERSONA);
    const [personaName, setPersonaName] = SP_REACT.useState("");
    const [personaSystemPrompt, setPersonaSystemPrompt] = SP_REACT.useState("");
    const [personaTemperature, setPersonaTemperature] = SP_REACT.useState(0.7);
    const [personaMaxTokens, setPersonaMaxTokens] = SP_REACT.useState(2048);
    const [personaModel, setPersonaModel] = SP_REACT.useState("");
    const refresh = async () => {
        try {
            setStatus(await getStatus());
            const personaRes = await getPersona();
            if (personaRes.ok && personaRes.persona) {
                setPersonaState(personaRes.persona);
            }
        }
        catch (err) {
            console.error("get_status failed", err);
        }
    };
    const loadPersona = async () => {
        try {
            const res = await getPersona();
            if (res.ok && res.persona) {
                setPersonaState(res.persona);
            }
        }
        catch (err) {
            console.error("get_persona failed", err);
        }
    };
    const loadNetworkExpose = async () => {
        try {
            const res = await getStatus();
            const host = res.api_url?.includes("0.0.0.0") || res.api_url?.includes("LAN");
            setNetworkExpose(!!host);
        }
        catch (err) {
            console.error("load_network_expose failed", err);
        }
    };
    SP_REACT.useEffect(() => {
        refresh();
        loadPersona();
        loadNetworkExpose();
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
                    title: t('toast.pull.failed'),
                    body: res.error || t('toast.pull.error', { model: tag }),
                    critical: true,
                });
            }
            else {
                toaster.toast({
                    title: t('toast.model.installed'),
                    body: tag,
                });
            }
        }
        catch (err) {
            toaster.toast({
                title: t('toast.pull.failed'),
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
                    title: t('toast.delete.failed'),
                    body: res.error || t('toast.delete.error', { model: tag }),
                    critical: true,
                });
            }
            else {
                toaster.toast({
                    title: t('toast.model.removed'),
                    body: tag,
                });
            }
        }
        catch (err) {
            toaster.toast({
                title: t('toast.delete.failed'),
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
    const handleOpenChat = () => {
        if (!status?.service_active || status.models.length === 0)
            return;
        openChatModal({
            models: status.models,
            initialModel: chatModel || status.models[0].name,
            initialPersona: persona,
            initialWebSearch: webSearchEnabled,
        });
    };
    SP_REACT.useEffect(() => {
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
        }
        catch (err) {
            console.error("search_models failed", err);
        }
        finally {
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
        }
        catch (err) {
            console.error("get_rag_config failed", err);
        }
    };
    const doLibraryInstall = async (modelName) => {
        setBusy(true);
        try {
            const res = await pullModel(modelName);
            if (!res.ok) {
                toaster.toast({
                    title: t('toast.install.failed'),
                    body: res.error || t('toast.install.error', { model: modelName }),
                    critical: true,
                });
            }
            else {
                toaster.toast({
                    title: t('toast.model.installed'),
                    body: modelName,
                });
                await loadLibrarySearch();
            }
        }
        catch (err) {
            toaster.toast({
                title: t('toast.install.failed'),
                body: String(err),
                critical: true,
            });
        }
        finally {
            setBusy(false);
            await refresh();
        }
    };
    const doRagDirSave = async () => {
        setBusy(true);
        try {
            const res = await setRagConfig(ragDirInput.trim() || undefined, undefined);
            if (!res.ok) {
                toaster.toast({
                    title: t('toast.save.failed'),
                    body: res.error || t('toast.save.error'),
                    critical: true,
                });
            }
            else {
                toaster.toast({ title: t('toast.rag.dir.saved'), body: res.rag_documents_dir });
                setRagConfigState(res);
            }
        }
        catch (err) {
            toaster.toast({ title: t('toast.save.failed'), body: String(err), critical: true });
        }
        finally {
            setBusy(false);
        }
    };
    const doRagModelInstall = async () => {
        if (!ragConfig?.recommended_embedding_model)
            return;
        setRagModelInstalling(true);
        setBusy(true);
        try {
            const model = ragConfig.recommended_embedding_model;
            const res = await pullModel(model);
            if (!res.ok) {
                toaster.toast({ title: t('toast.rag.install.failed'), body: res.error || t('toast.rag.install.error'), critical: true });
            }
            else {
                toaster.toast({ title: t('toast.rag.embedding.installed'), body: model });
                await loadRagConfig();
            }
        }
        catch (err) {
            toaster.toast({ title: t('toast.rag.install.failed'), body: String(err), critical: true });
        }
        finally {
            setRagModelInstalling(false);
            setBusy(false);
        }
    };
    const doRagModelSet = async (model) => {
        setBusy(true);
        try {
            const res = await setRagConfig(undefined, model);
            if (!res.ok) {
                toaster.toast({ title: t('toast.rag.set.failed'), body: res.error || t('toast.rag.set.failed'), critical: true });
            }
            else {
                toaster.toast({ title: t('toast.rag.embedding.set'), body: model });
                setRagConfigState(res);
            }
        }
        catch (err) {
            toaster.toast({ title: t('toast.rag.set.failed'), body: String(err), critical: true });
        }
        finally {
            setBusy(false);
        }
    };
    const doUpdate = async () => {
        setBusy(true);
        let res;
        try {
            res = await updateAll();
            const o = res.ollama;
            const ollamaBody = o.before && o.after && o.before !== o.after
                ? t('update.body.ollama', { before: o.before, after: o.after })
                : t('update.body.ollama.single', { after: o.after ?? '?' });
            const okModels = res.models.filter((m) => m.ok).length;
            const failed = res.models.filter((m) => !m.ok);
            const modelSummary = res.models.length
                ? t('update.body.models', { ok: okModels, total: res.models.length })
                : t('update.body.models.none');
            toaster.toast({
                title: res.ok ? t('toast.update.complete') : t('toast.update.partial'),
                body: `${ollamaBody} · ${modelSummary}` +
                    (failed.length
                        ? ` · ${t('update.body.failed', { models: failed.map((m) => m.model).join(", ") })}`
                        : ""),
                critical: !res.ok,
                duration: 8000
            });
        }
        catch (err) {
            console.error("update_all failed", err);
            toaster.toast({
                title: t('toast.update.failed'),
                body: String(err),
                critical: true
            });
        }
        finally {
            setBusy(false);
            await refresh();
        }
    };
    if (!status) {
        return (SP_JSX.jsx(DFL.PanelSection, { title: t('app.title'), children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", padding: "8px 0" }, children: t('app.loading') }) }) }));
    }
    if (pullModalOpen) {
        return (SP_JSX.jsxs(DFL.PanelSection, { title: t('pull.modal.title'), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('pull.modal.hint') }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("input", { type: "text", value: pullModelName, onChange: (e) => setPullModelName(e.target.value), placeholder: t('pull.modal.placeholder'), style: {
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #4a4a4a",
                            background: "#1a1a1a",
                            color: "#fafafa",
                            fontSize: "14px",
                        }, autoFocus: true, onKeyDown: (e) => e.key === "Enter" && doPull() }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px" }, children: [SP_JSX.jsx(Btn, { onClick: () => setPullModalOpen(false), children: t('pull.modal.btn.cancel') }), SP_JSX.jsx(Btn, { onClick: doPull, disabled: busy || !pullModelName.trim(), children: t('pull.modal.btn.install') })] }) })] }));
    }
    return (SP_JSX.jsxs(DFL.PanelSection, { title: t('app.title'), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", alignItems: "center", color: "#e6e6e6", marginBottom: "8px" }, children: [SP_JSX.jsx(StatusDot, { ok: status.service_active && status.api_reachable }), SP_JSX.jsxs("span", { children: [status.service_active
                                    ? status.api_reachable
                                        ? "Serving"
                                        : "Starting…"
                                    : "Stopped", status.version ? ` · Ollama ${status.version}` : ""] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: t('service.label'), description: status.service_active
                        ? t('service.desc.active')
                        : t('service.desc.inactive'), checked: status.service_active, disabled: busy, onChange: (on) => run(() => setService(on)) }) }), status.keep_awake_locked ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", padding: "4px 0", marginBottom: "8px" }, children: t('keepAwake.locked') }) })) : null, SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: t('keepAwake.label'), description: status.service_active
                        ? status.keep_awake_locked
                            ? t('keepAwake.desc.locked')
                            : t('keepAwake.desc.active')
                        : t('keepAwake.desc.inactive'), checked: status.keep_awake, disabled: busy, onChange: (on) => run(() => setKeepAwake(on)) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: t('autostart.label'), description: status.autostart
                        ? t('autostart.desc.active')
                        : t('autostart.desc.inactive'), checked: status.autostart, disabled: busy, onChange: (on) => run(() => setAutostart(on)) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: t('network.label'), description: t('network.desc'), checked: networkExpose, disabled: busy || !status.service_active, onChange: (on) => run(() => setNetworkExposure(on)) }) }), status.api_url && status.service_active ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('api.url', { url: status.api_url }) }) })) : null, SP_JSX.jsxs(DFL.PanelSection, { title: t('updates.title'), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", disabled: busy, onClick: doUpdate, description: status.service_active
                                ? t('updates.btn.update.desc.active')
                                : t('updates.btn.update.desc.inactive'), children: [SP_JSX.jsx(FaDownload, { style: { marginRight: "8px", verticalAlign: "middle" } }), t('updates.btn.update')] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", disabled: busy || !status.service_active, onClick: () => setPullModalOpen(true), description: t('updates.btn.install.desc'), children: [SP_JSX.jsx(FaDownload, { style: { marginRight: "8px", verticalAlign: "middle" } }), t('updates.btn.install')] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px" }, children: busy
                                ? t('updates.status.updating')
                                : t('updates.status.idle', { version: status.version ?? "—", count: status.models.length }) }) })] }), status.service_active && status.models.length > 0 ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { marginBottom: "8px" }, children: SP_JSX.jsxs(DFL.ButtonItem, { layout: "below", disabled: busy, onClick: handleOpenChat, description: t('chat.btn.open.desc'), children: [SP_JSX.jsx(FaRobot, { style: { marginRight: "8px", verticalAlign: "middle" } }), t('chat.btn.open')] }) }) })) : null, status.service_active ? (SP_JSX.jsxs(DFL.PanelSection, { title: t('lan.title'), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('lan.desc') }) }), lanInfoData ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [lanInfoData.warning && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#f43f5e", fontSize: "11px", padding: "8px", background: "#f43f5e11", borderRadius: "4px", border: "1px solid #f43f5e33", marginBottom: "8px" }, children: lanInfoData.warning }) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#e6e6e6", fontSize: "12px", marginBottom: "8px" }, children: SP_JSX.jsx("strong", { children: t('lan.address', { url: lanInfoData.base_url ?? '' }) }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }, children: t('lan.models', { models: lanInfoData.models?.join(", ") || 'none' }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }, children: t('lan.examples') }) }), lanInfoData.examples && Object.entries(lanInfoData.examples).map(([lang, cmd]) => (SP_JSX.jsxs(SP_REACT.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("code", { style: { display: "block", width: "100%", boxSizing: "border-box", fontSize: "10px", background: "#1a1a1a", padding: "4px 8px", borderRadius: "4px", color: "#22c55e", whiteSpace: "pre-wrap", wordBreak: "break-all" }, children: cmd }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { marginBottom: "8px" }, children: SP_JSX.jsx(Btn, { onClick: () => navigator.clipboard.writeText(cmd), disabled: busy, children: t('lan.btn.copy') }) }) })] }, lang)))] })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('lan.loading') }) }))] })) : null, status.models.length > 0 ? (SP_JSX.jsx(DFL.PanelSection, { title: t('models.title'), children: status.models.map((m) => (SP_JSX.jsxs(SP_REACT.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: {
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    color: "#e6e6e6"
                                }, children: [SP_JSX.jsx("span", { children: m.name }), SP_JSX.jsxs("span", { style: { color: "#8b8b8b" }, children: [m.family, " \u00B7 ", formatSize(m.size)] })] }) }), deleteConfirm === m.name ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "8px" }, children: [SP_JSX.jsx(Btn, { onClick: () => setDeleteConfirm(null), children: t('delete.btn.cancel') }), SP_JSX.jsx(Btn, { onClick: () => doDelete(m.name), children: t('delete.btn.confirm') })] }) })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { marginBottom: "8px" }, children: SP_JSX.jsx(Btn, { disabled: busy, onClick: () => setDeleteConfirm(m.name), style: { color: "#f43f5e" }, children: SP_JSX.jsx(FaTrash, { style: { marginRight: "4px", verticalAlign: "middle" } }) }) }) }))] }, m.name))) })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('models.empty') }) })), status.error ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#f43f5e", fontSize: "12px", marginBottom: "8px" }, children: status.error }) })) : null, status.service_active && (SP_JSX.jsxs(DFL.PanelSection, { title: t('library.title'), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('library.desc') }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("input", { type: "text", value: librarySearch, onChange: (e) => setLibrarySearch(e.target.value), placeholder: t('library.search.placeholder'), style: {
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #4a4a4a",
                                background: "#1a1a1a",
                                color: "#fafafa",
                                fontSize: "14px",
                                marginBottom: "8px",
                            } }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" }, children: ["all", "chat", "code", "embedding", "vision", "tools"].map((tag) => {
                                const isActive = tag === "all" ? libraryTags.length === 0 : libraryTags.includes(tag);
                                const tagKey = `library.tags.${tag}`;
                                return (SP_JSX.jsx("button", { onClick: () => {
                                        if (tag === "all") {
                                            setLibraryTags([]);
                                        }
                                        else if (libraryTags.includes(tag)) {
                                            setLibraryTags(libraryTags.filter((t) => t !== tag));
                                        }
                                        else {
                                            setLibraryTags([...libraryTags, tag]);
                                        }
                                    }, style: {
                                        padding: "4px 10px",
                                        borderRadius: "4px",
                                        border: isActive ? "1px solid #22c55e" : "1px solid #4a4a4a",
                                        background: isActive ? "#22c55e22" : "#1a1a1a",
                                        color: isActive ? "#22c55e" : "#e6e6e6",
                                        fontSize: "12px",
                                        cursor: "pointer",
                                    }, children: t(tagKey) }, tag));
                            }) }) }), libraryLoading ? (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", textAlign: "center", padding: "16px" }, children: t('library.loading') }) })) : (SP_JSX.jsx(SP_JSX.Fragment, { children: libraryResults.length > 0 ? (libraryResults.map((m) => (SP_JSX.jsxs(SP_REACT.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { marginBottom: "8px" }, children: [SP_JSX.jsx("div", { style: { color: "#e6e6e6", fontWeight: 500 }, children: m.name }), SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "11px" }, children: m.description }), SP_JSX.jsx("div", { style: { display: "flex", gap: "4px", marginTop: "4px" }, children: m.tags.map((t) => (SP_JSX.jsx("span", { style: { fontSize: "10px", padding: "2px 6px", background: "#22c55e22", borderRadius: "3px", color: "#22c55e" }, children: t }, t))) })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { marginBottom: "8px" }, children: SP_JSX.jsx(Btn, { onClick: () => doLibraryInstall(m.name), disabled: busy, children: t('library.btn.install') }) }) })] }, m.name)))) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", textAlign: "center", padding: "16px" }, children: t('library.empty') }) })) })), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "11px", marginTop: "8px" }, children: t('library.hint') }) })] })), status.service_active && (SP_JSX.jsxs(DFL.PanelSection, { title: t('rag.title'), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('rag.desc') }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("input", { type: "text", value: ragDirInput, onChange: (e) => setRagDirInput(e.target.value), placeholder: t('rag.dir.placeholder'), style: {
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #4a4a4a",
                                background: "#1a1a1a",
                                color: "#fafafa",
                                fontSize: "14px",
                            } }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { marginBottom: "8px" }, children: SP_JSX.jsx(Btn, { onClick: doRagDirSave, disabled: busy, children: t('rag.btn.save') }) }) }), ragConfig && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "11px", marginBottom: "8px" }, children: t('rag.current', { dir: ragConfig.rag_documents_dir || 'not defined' }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px", marginTop: "8px" }, children: t('rag.embedding.title') }) }), ragConfig.installed_embedding_models.length > 0 ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#e6e6e6", fontSize: "12px", marginBottom: "4px" }, children: t('rag.embedding.installed', { models: ragConfig.installed_embedding_models.join(", ") }) }) }), ragConfig.rag_embedding_model ? (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#e6e6e6", fontSize: "12px", marginBottom: "4px" }, children: t('rag.embedding.active', { model: ragConfig.rag_embedding_model }) }) }), ragConfig.installed_embedding_models.filter((m) => m !== ragConfig.rag_embedding_model).map((m) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { marginBottom: "8px" }, children: SP_JSX.jsx(Btn, { onClick: () => doRagModelSet(m), disabled: busy, children: t('rag.embedding.btn.use', { model: m }) }) }) }, m)))] })) : (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }, children: ragConfig.installed_embedding_models.map((m) => (SP_JSX.jsx(Btn, { onClick: () => doRagModelSet(m), disabled: busy, children: t('rag.embedding.btn.use', { model: m }) }, m))) }) }))] })) : (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#f43f5e", fontSize: "11px", padding: "8px", background: "#f43f5e11", borderRadius: "4px", border: "1px solid #f43f5e33", marginBottom: "8px" }, children: t('rag.embedding.none') }) }), ragConfig.recommended_embedding_model && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { marginBottom: "8px" }, children: SP_JSX.jsx(Btn, { onClick: doRagModelInstall, disabled: busy || ragModelInstalling, children: ragModelInstalling ? t('rag.embedding.installing') : t('rag.embedding.btn.install', { model: ragConfig.recommended_embedding_model }) }) }) }))] }))] }))] })), status.service_active && (SP_JSX.jsxs(DFL.PanelSection, { title: t('persona.title'), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('persona.desc') }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("input", { type: "text", value: personaName || persona.name, onChange: (e) => setPersonaName(e.target.value), placeholder: t('persona.name.placeholder'), style: {
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #4a4a4a",
                                background: "#1a1a1a",
                                color: "#fafafa",
                                fontSize: "14px",
                                marginBottom: "8px",
                            } }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("textarea", { value: personaSystemPrompt || persona.system_prompt, onChange: (e) => setPersonaSystemPrompt(e.target.value), placeholder: t('persona.system_prompt.placeholder'), rows: 4, style: {
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
                            } }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "8px" }, children: [SP_JSX.jsxs("div", { style: { flex: 1, minWidth: "150px" }, children: [SP_JSX.jsxs("label", { style: { display: "block", color: "#8b8b8b", fontSize: "12px", marginBottom: "4px" }, children: [t('persona.temperature'), " (", personaTemperature.toFixed(1), ")"] }), SP_JSX.jsx("input", { type: "range", min: "0", max: "2", step: "0.1", value: personaTemperature, onChange: (e) => setPersonaTemperature(parseFloat(e.target.value)), style: { width: "100%", accentColor: "#22c55e" } })] }), SP_JSX.jsxs("div", { style: { flex: 1, minWidth: "150px" }, children: [SP_JSX.jsxs("label", { style: { display: "block", color: "#8b8b8b", fontSize: "12px", marginBottom: "4px" }, children: [t('persona.max_tokens'), " (", personaMaxTokens, ")"] }), SP_JSX.jsx("input", { type: "range", min: "1", max: "8192", step: "1", value: personaMaxTokens, onChange: (e) => setPersonaMaxTokens(parseInt(e.target.value)), style: { width: "100%", accentColor: "#22c55e" } })] })] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("select", { value: personaModel || persona.model, onChange: (e) => setPersonaModel(e.target.value), style: {
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "8px",
                                borderRadius: "4px",
                                border: "1px solid #4a4a4a",
                                background: "#1a1a1a",
                                color: "#fafafa",
                                fontSize: "14px",
                                marginBottom: "8px",
                            }, children: [SP_JSX.jsx("option", { value: "", children: t('persona.model.default') }), status?.models.map((m) => (SP_JSX.jsx("option", { value: m.name, children: m.name }, m.name)))] }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { style: { display: "flex", gap: "8px" }, children: [SP_JSX.jsx(Btn, { onClick: () => {
                                        setPersonaName(persona.name);
                                        setPersonaSystemPrompt(persona.system_prompt);
                                        setPersonaTemperature(persona.temperature);
                                        setPersonaMaxTokens(persona.max_tokens);
                                        setPersonaModel(persona.model);
                                    }, children: t('persona.btn.reset') }), SP_JSX.jsx(Btn, { onClick: async () => {
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
                                        }
                                        else {
                                            toaster.toast({ title: t('toast.persona.save_failed'), body: res.error || "", critical: true });
                                        }
                                    }, disabled: busy, children: t('persona.btn.save') })] }) })] })), status.service_active && (SP_JSX.jsxs(DFL.PanelSection, { title: t('plugins.title'), children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('plugins.desc') }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "12px", marginBottom: "8px" }, children: t('plugins.coming_soon') }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#8b8b8b", fontSize: "11px" }, children: t('plugins.persona_marketplace') }) })] }))] }));
}
var index = definePlugin(() => ({
    name: t('app.title'),
    titleView: (SP_JSX.jsxs("div", { className: DFL.staticClasses.Title, children: [SP_JSX.jsx(FaRobot, { style: { marginRight: "8px", verticalAlign: "middle" } }), t('app.title')] })),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaRobot, {}),
    onDismount() {
        /* no-op: backend cleanup runs in _unload */
    }
}));

export { index as default };
//# sourceMappingURL=index.js.map
