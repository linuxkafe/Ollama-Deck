type Translations = Record<string, string>;

const translations: Record<string, Translations> = {
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

    'update.body.ollama': 'Ollama {before} -> {after}',
    'update.body.ollama.single': 'Ollama {after}',
    'update.body.models': '{ok}/{total} modelos',
    'update.body.models.none': 'sem modelos para atualizar',
    'update.body.failed': 'falhou: {models}',
  },
};

let currentLang: 'en' | 'pt' = 'en';

function detectLanguage(): 'en' | 'pt' {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language || navigator.languages?.[0] || 'en';
    if (lang.toLowerCase().startsWith('pt')) {
      return 'pt';
    }
  }
  return 'en';
}

currentLang = detectLanguage();

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = translations[currentLang] || translations.en;
  let text = dict[key] || translations.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return text;
}

export function getLanguage(): 'en' | 'pt' {
  return currentLang;
}

export function setLanguage(lang: 'en' | 'pt'): void {
  currentLang = lang;
}