import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Plus, ChevronRight, X, Image as ImageIcon,
  BookOpen, Edit2, Trash2, ChevronLeft, Settings,
  Calendar, TrendingUp, Brain, Award, AlertCircle,
  Bold, Italic, Strikethrough, Highlighter, Type, Palette, Underline as UnderlineIcon,
  Puzzle, Eye, EyeOff
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { toast } from 'sonner';
import { schedule, formatInterval } from '../utils/fsrs.js';

const API = '/api';
const getSessionId = () => {
  let id = localStorage.getItem('fc_session_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('fc_session_id', id); }
  return id;
};

const MAX_CHARS = 1000;

// ─── Plugin toggle (localStorage) ─────────────────────────────────────────────
const PLUGIN_DEFAULTS = { heatmap: true, trueRetention: true, imageOcclusion: true, dueOverview: true };
const getPlugins = () => {
  try { return { ...PLUGIN_DEFAULTS, ...JSON.parse(localStorage.getItem('fc_plugins') || '{}') }; }
  catch { return { ...PLUGIN_DEFAULTS }; }
};
const savePlugins = (p) => localStorage.setItem('fc_plugins', JSON.stringify(p));

// Extrai texto puro do HTML para contar caracteres
const htmlTextLength = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent.length;
};

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichEditor({ content, onChange, placeholder }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHlPicker, setShowHlPicker] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TiptapImage.configure({ inline: false }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Bloqueia digitação além do limite (imagens não contam)
      if (htmlTextLength(html) > MAX_CHARS) {
        editor.commands.undo();
        return;
      }
      onChange(html);
    },
    editorProps: {
      attributes: { class: 'min-h-[80px] px-3 py-2 text-sm text-text focus:outline-none' },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      const cur = editor.getHTML();
      if (cur !== content && (content === '' || content === '<p></p>')) {
        editor.commands.setContent(content || '');
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  const charCount = htmlTextLength(editor.getHTML());
  const COLORS = ['#202124','#d32f2f','#1976d2','#388e3c','#f57c00','#7b1fa2','#00796b'];
  const HIGHLIGHTS = ['#fff176','#a5d6a7','#90caf9','#f48fb1','#ffe0b2','#b39ddb','transparent'];

  // Upload de arquivo → base64 → inserir no editor
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setImageError('Arquivo deve ser uma imagem.'); return; }
    if (file.size > 3 * 1024 * 1024) { setImageError('Tamanho máximo: 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      editor.chain().focus().setImage({ src: ev.target.result }).run();
      setShowImagePanel(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const insertImageUrl = () => {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl('');
    setShowImagePanel(false);
  };

  const ToolBtn = ({ active, onClick, title, children }) => (
    <button type="button" onMouseDown={e => { e.preventDefault(); onClick(); }} title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-bg hover:text-text'}`}>
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-lg overflow-visible focus-within:border-primary transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-bg border-b border-border rounded-t-lg">
        <ToolBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito (Ctrl+B)"><Bold size={14} /></ToolBtn>
        <ToolBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Itálico (Ctrl+I)"><Italic size={14} /></ToolBtn>
        <ToolBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado (Ctrl+U)"><UnderlineIcon size={14} /></ToolBtn>
        <ToolBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado"><Strikethrough size={14} /></ToolBtn>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Cor do texto */}
        <div className="relative">
          <ToolBtn active={false} onClick={() => { setShowColorPicker(p => !p); setShowHlPicker(false); setShowImagePanel(false); }} title="Cor do texto">
            <Palette size={14} />
          </ToolBtn>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-2 flex gap-1 z-30">
              {COLORS.map(c => (
                <button key={c} type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                  className="w-5 h-5 rounded-full border border-border/50 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
              ))}
              <button type="button" onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                className="w-5 h-5 rounded-full border border-border/50 bg-white text-[9px] text-text-muted hover:scale-110 transition-transform flex items-center justify-center">✕</button>
            </div>
          )}
        </div>

        {/* Destaque */}
        <div className="relative">
          <ToolBtn active={editor.isActive('highlight')} onClick={() => { setShowHlPicker(p => !p); setShowColorPicker(false); setShowImagePanel(false); }} title="Destaque">
            <Highlighter size={14} />
          </ToolBtn>
          {showHlPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-2 flex gap-1 z-30">
              {HIGHLIGHTS.map(c => (
                <button key={c} type="button" onMouseDown={e => {
                  e.preventDefault();
                  if (c === 'transparent') editor.chain().focus().unsetHighlight().run();
                  else editor.chain().focus().setHighlight({ color: c }).run();
                  setShowHlPicker(false);
                }} className="w-5 h-5 rounded border border-border/50 hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: c === 'transparent' ? '#fff' : c }}>
                  {c === 'transparent' && <span className="text-[9px] text-text-muted">✕</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Imagem — upload ou URL */}
        <div className="relative">
          <ToolBtn active={false} onClick={() => { setShowImagePanel(p => !p); setShowColorPicker(false); setShowHlPicker(false); setImageError(''); }} title="Inserir imagem">
            <ImageIcon size={14} />
          </ToolBtn>
          {showImagePanel && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-xl shadow-xl p-3 z-30 w-72 flex flex-col gap-2">
              {/* Upload de arquivo */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <button type="button" onMouseDown={e => { e.preventDefault(); fileInputRef.current?.click(); }}
                className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-lg text-xs text-text-muted hover:border-primary hover:text-primary transition-colors">
                <ImageIcon size={13} />
                <span>Enviar arquivo (PNG, JPEG... até 3 MB)</span>
              </button>

              {imageError && <p className="text-xs text-red-500">{imageError}</p>}

              {/* Separador */}
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="flex-1 h-px bg-border" /><span>ou</span><div className="flex-1 h-px bg-border" />
              </div>

              {/* URL */}
              <div className="flex gap-1">
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && insertImageUrl()}
                  placeholder="Colar URL da imagem..."
                  className="flex-1 text-xs border border-border rounded px-2 py-1.5 focus:outline-none focus:border-primary" />
                <button type="button" onMouseDown={e => { e.preventDefault(); insertImageUrl(); }}
                  className="px-3 py-1.5 bg-primary text-white text-xs rounded hover:bg-blue-700 transition-colors font-semibold">OK</button>
              </div>
            </div>
          )}
        </div>

        {/* Contador de caracteres */}
        <div className="ml-auto text-xs text-text-muted pr-1">
          <span className={charCount > MAX_CHARS * 0.9 ? 'text-orange-500 font-semibold' : ''}>{charCount}</span>/{MAX_CHARS}
        </div>
      </div>

      {/* Editor area */}
      <div onClick={() => editor.commands.focus()} className="cursor-text relative">
        {!editor.getText() && (
          <div className="px-3 py-2 text-sm text-text-muted pointer-events-none select-none absolute top-0 left-0">{placeholder}</div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal (digitar nome) ─────────────────────────────────────
function ConfirmDeleteDeckModal({ deck, onConfirm, onClose }) {
  const [typed, setTyped] = useState('');
  const match = typed === deck.name;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-text font-heading">Excluir deck</h3>
            <p className="text-sm text-text-muted mt-1">
              Esta ação é <strong>irreversível</strong>. Todos os cards e histórico de revisões serão apagados.
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">
            Digite <span className="text-text font-bold">"{deck.name}"</span> para confirmar
          </label>
          <input
            autoFocus
            value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && match && onConfirm()}
            placeholder={deck.name}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-red-400 transition-colors"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-text-muted hover:border-border-dark transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={!match}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${match ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-100 text-red-300 cursor-not-allowed'}`}>
            Excluir deck
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Confirm Delete Card Modal ────────────────────────────────────────────────
function ConfirmDeleteCardModal({ card, onConfirm, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-text font-heading">Excluir card?</h3>
            <p className="text-sm text-text-muted mt-1 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: card.front }} />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-lg text-sm font-medium text-text-muted hover:border-border-dark transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
            Excluir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Deck Accordion (hierárquico, expand/collapse) ────────────────────────────

// Soma recursiva de stats de um deck e todos seus descendentes
function sumStats(deck, allDecks) {
  const children = allDecks.filter(d => d.parent_id === deck.id);
  const childSums = children.reduce((acc, c) => {
    const cs = sumStats(c, allDecks);
    return { unseen: acc.unseen + cs.unseen, due_learning: acc.due_learning + cs.due_learning, due_review: acc.due_review + cs.due_review, overdue: acc.overdue + cs.overdue };
  }, { unseen: 0, due_learning: 0, due_review: 0, overdue: 0 });
  return {
    unseen: (deck.unseen || 0) + childSums.unseen,
    due_learning: (deck.due_learning || 0) + childSums.due_learning,
    due_review: (deck.due_review || 0) + childSums.due_review,
    overdue: (deck.overdue || 0) + childSums.overdue,
  };
}

function DeckRow({ deck, allDecks, depth, onStudy, onEdit, onSettings, onDelete, plugins }) {
  const children = allDecks.filter(d => d.parent_id === deck.id);
  const hasChildren = children.length > 0;
  const [expanded, setExpanded] = useState(true);

  const totals = sumStats(deck, allDecks);
  const ownHasWork = (deck.unseen || 0) + (deck.due_learning || 0) + (deck.due_review || 0) > 0;
  const showOverdue = plugins?.dueOverview;
  const gridCols = showOverdue ? 'grid-cols-[1fr_auto_auto_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto_auto_auto]';

  return (
    <>
      <div className={`grid ${gridCols} items-center px-4 py-2.5 border-b border-border/40 hover:bg-blue-50/30 transition-colors group`}>
        {/* Nome com indentação e chevron */}
        <div className="flex items-center min-w-0" style={{ paddingLeft: `${depth * 20}px` }}>
          {hasChildren ? (
            <button type="button" onClick={() => setExpanded(e => !e)}
              className="mr-1.5 p-0.5 text-text-muted hover:text-primary rounded transition-colors shrink-0">
              <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <ChevronRight size={13} />
              </motion.div>
            </button>
          ) : (
            <span className="w-5 mr-1.5 shrink-0" />
          )}
          <button onClick={() => onStudy(deck)} disabled={!ownHasWork}
            className={`text-sm truncate transition-colors text-left ${ownHasWork ? 'text-primary hover:underline font-medium cursor-pointer' : 'text-text cursor-default'}`}>
            {deck.name}
          </button>
        </div>

        {/* Stats — soma com filhos */}
        <span className="w-16 text-center text-sm font-semibold text-primary">{totals.unseen || 0}</span>
        <span className="w-16 text-center text-sm font-semibold text-orange-500">{totals.due_learning || 0}</span>
        <span className="w-16 text-center text-sm font-semibold text-green-600">{totals.due_review || 0}</span>
        {showOverdue && (
          <span className="w-16 text-center text-sm font-semibold text-red-600">{totals.overdue || 0}</span>
        )}
        <div className="w-20 flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onSettings(deck)} title="Configurar deck" className="p-1 text-text-muted hover:text-primary rounded transition-colors"><Settings size={13} /></button>
          <button onClick={() => onEdit(deck)} title="Editar cards" className="p-1 text-text-muted hover:text-primary rounded transition-colors"><Edit2 size={13} /></button>
          <button onClick={() => onDelete(deck)} title="Excluir deck" className="p-1 text-text-muted hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>

      {/* Filhos com animação */}
      <AnimatePresence initial={false}>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children.map(child => (
              <DeckRow key={child.id} deck={child} allDecks={allDecks} depth={depth + 1}
                onStudy={onStudy} onEdit={onEdit} onSettings={onSettings} onDelete={onDelete} plugins={plugins} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const PAGE_SIZES = [20, 50, 100];

// Coleta todos os descendentes de um deck recursivamente
function getAllDescendants(deckId, allDecks) {
  const children = allDecks.filter(d => d.parent_id === deckId);
  return children.flatMap(c => [c, ...getAllDescendants(c.id, allDecks)]);
}

function DeckAccordion({ decks, onStudy, onEdit, onSettings, onDelete, plugins }) {
  const [query, setQuery]       = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage]         = useState(0);

  const q = query.trim().toLowerCase();

  // ── Modo busca: lista plana de todos os decks que casam com a query ──────
  const searchResults = q
    ? decks.filter(d => d.name.toLowerCase().includes(q))
    : null;

  // ── Modo normal: apenas roots paginados ──────────────────────────────────
  const roots      = decks.filter(d => !d.parent_id);
  const source     = searchResults ?? roots;           // o que paginar
  const totalPages = Math.ceil(source.length / pageSize);
  const paginated  = source.slice(page * pageSize, (page + 1) * pageSize);

  // Resetar página quando query ou pageSize muda
  useEffect(() => { setPage(0); }, [query, pageSize]);

  const totalNovo     = decks.reduce((s, d) => s + (d.unseen      || 0), 0);
  const totalAprender = decks.reduce((s, d) => s + (d.due_learning || 0), 0);
  const totalRevisar  = decks.reduce((s, d) => s + (d.due_review   || 0), 0);
  const totalAtrasado = decks.reduce((s, d) => s + (d.overdue      || 0), 0);

  const showOverdue = plugins?.dueOverview;
  const gridCols = showOverdue ? 'grid-cols-[1fr_auto_auto_auto_auto_auto]' : 'grid-cols-[1fr_auto_auto_auto_auto]';

  return (
    <div className="flex flex-col gap-3">
      {/* Barra de busca + seletor de itens por página */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar deck por nome..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-primary"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}
          className="text-sm border border-border rounded-lg px-2 py-2 bg-white focus:outline-none focus:border-primary text-text-muted cursor-pointer">
          {PAGE_SIZES.map(n => <option key={n} value={n}>{n} por página</option>)}
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Cabeçalho */}
        <div className={`grid ${gridCols} items-center px-4 py-2.5 bg-bg border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wide`}>
          <span>Baralho {q && <span className="normal-case font-normal ml-1 text-primary">— {source.length} resultado{source.length !== 1 ? 's' : ''}</span>}</span>
          <span className="w-16 text-center text-primary">Novo</span>
          <span className="w-16 text-center text-orange-500">Aprender</span>
          <span className="w-16 text-center text-green-600">Revisar</span>
          {showOverdue && <span className="w-16 text-center text-red-600">Atrasado</span>}
          <span className="w-20" />
        </div>

        {/* Rows */}
        {paginated.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-text-muted">Nenhum deck encontrado para "<strong>{query}</strong>".</div>
        ) : searchResults ? (
          // Modo busca: lista plana sem accordion
          paginated.map(deck => (
            <DeckRow key={deck.id} deck={deck} allDecks={decks} depth={0}
              onStudy={onStudy} onEdit={onEdit} onSettings={onSettings} onDelete={onDelete} plugins={plugins} />
          ))
        ) : (
          // Modo normal: accordion hierárquico
          paginated.map(deck => (
            <DeckRow key={deck.id} deck={deck} allDecks={decks} depth={0}
              onStudy={onStudy} onEdit={onEdit} onSettings={onSettings} onDelete={onDelete} plugins={plugins} />
          ))
        )}

        {/* Totais */}
        <div className={`grid ${gridCols} items-center px-4 py-2.5 border-t border-border bg-bg`}>
          <span className="text-sm font-bold text-text">Total</span>
          <span className="w-16 text-center text-sm font-bold text-primary">{totalNovo}</span>
          <span className="w-16 text-center text-sm font-bold text-orange-500">{totalAprender}</span>
          <span className="w-16 text-center text-sm font-bold text-green-600">{totalRevisar}</span>
          {showOverdue && <span className="w-16 text-center text-sm font-bold text-red-600">{totalAtrasado}</span>}
          <span className="w-20" />
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-muted">
            Página {page + 1} de {totalPages} · {source.length} {searchResults ? 'resultado' : 'deck'}{source.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(0)} disabled={page === 0}
              className="px-2 py-1 text-xs rounded border border-border disabled:opacity-30 hover:border-primary hover:text-primary transition-colors">«</button>
            <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
              className="px-2.5 py-1 text-xs rounded border border-border disabled:opacity-30 hover:border-primary hover:text-primary transition-colors">‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              // janela de páginas centrada na atual
              let start = Math.max(0, Math.min(page - 3, totalPages - 7));
              const p = start + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${p === page ? 'bg-primary text-white border-primary' : 'border-border hover:border-primary hover:text-primary'}`}>
                  {p + 1}
                </button>
              );
            })}
            <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
              className="px-2.5 py-1 text-xs rounded border border-border disabled:opacity-30 hover:border-primary hover:text-primary transition-colors">›</button>
            <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}
              className="px-2.5 py-1 text-xs rounded border border-border disabled:opacity-30 hover:border-primary hover:text-primary transition-colors">»</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Heatmap palettes ─────────────────────────────────────────────────────────
const PALETTES = {
  green:  { name: 'Verde',    shades: ['#ebedf0','#9be9a8','#40c463','#30a14e','#216e39'] },
  blue:   { name: 'Azul',     shades: ['#ebedf0','#bdd8f5','#79b4ec','#2f80ed','#1a56b0'] },
  orange: { name: 'Laranja',  shades: ['#ebedf0','#ffd8a8','#ffa94d','#fd7e14','#d9480f'] },
  red:    { name: 'Vermelho', shades: ['#ebedf0','#ffc9c9','#ff6b6b','#fa5252','#c0392b'] },
  purple: { name: 'Roxo',     shades: ['#ebedf0','#d8b4fe','#a855f7','#7c3aed','#581c87'] },
};
const getPalette = () => localStorage.getItem('fc_heatmap_palette') || 'green';
const setPaletteLS = (p) => localStorage.setItem('fc_heatmap_palette', p);

// ─── Stats Inline ─────────────────────────────────────────────────────────────
function StatsInline({ sessionId, plugins }) {
  const [stats, setStats]         = useState(null);
  const [palette, setPalette]     = useState(getPalette);
  const [heatmapVisible, setHeatmapVisible] = useState(true);

  useEffect(() => {
    fetch(`${API}/stats/${sessionId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setStats)
      .catch(() => setStats({}));
  }, [sessionId]);

  if (!stats) return (
    <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
  );

  const { retention, heatmap = [], forecast = [], counts = {}, trueRetention = {} } = stats;
  const retentionPct = retention?.retention ? Math.round(retention.retention * 100) : 0;
  const avgSec       = retention?.avg_seconds_per_card ? Math.round(retention.avg_seconds_per_card) : 0;
  const formatTime   = (s) => s >= 60 ? `${Math.floor(s/60)}m ${s%60}s` : `${s}s`;

  // ── Heatmap grid (52 semanas × 7 dias + 7 dias futuros) ────────────────────
  // Normalize keys: pg DATE → string "YYYY-MM-DD"
  const toKey = (v) => (typeof v === 'string' ? v : new Date(v).toISOString()).slice(0, 10);
  const forecastMap = {};
  forecast.forEach(f => { forecastMap[toKey(f.day)] = f.count; });
  const heatmapMap  = {};
  heatmap.forEach(h => { heatmapMap[toKey(h.day)] = h.count; });

  const today    = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const weeks    = [];
  // 52 semanas passadas + 1 semana futura = 53 semanas
  for (let w = 52; w >= -1; w--) {
    const wDays = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + (6 - d)));
      const key      = date.toISOString().slice(0, 10);
      const isFuture = key > todayKey;
      wDays.push({ date: key, count: heatmapMap[key] || 0, forecast: forecastMap[key] || 0, isFuture });
    }
    weeks.push(wDays);
  }

  // ── Streaks ─────────────────────────────────────────────────────────────────
  const allDays = weeks.flat().filter(d => !d.isFuture);

  // currentStreak: consecutive days ending today (if today empty, extend to yesterday — Anki style)
  let currentStreak = 0;
  {
    let i = allDays.length - 1;
    // skip today if not yet studied (streak may still be alive from yesterday)
    if (i >= 0 && allDays[i].count === 0) i--;
    for (; i >= 0; i--) {
      if (allDays[i].count > 0) currentStreak++;
      else break;
    }
  }

  // longestStreak: longest consecutive run in history
  let longestStreak = 0, runLen = 0;
  for (const day of allDays) {
    if (day.count > 0) { runLen++; if (runLen > longestStreak) longestStreak = runLen; }
    else { runLen = 0; }
  }

  const daysLearned    = allDays.filter(d => d.count > 0).length;
  const daysLearnedPct = allDays.length > 0 ? Math.round((daysLearned / allDays.length) * 100) : 0;

  // ── Cor do heatmap ──────────────────────────────────────────────────────────
  const shades   = PALETTES[palette].shades;
  const maxCount = Math.max(...Object.values(heatmapMap), 1);
  const cellColor = (day) => {
    if (day.isFuture && day.forecast > 0) return '#bfdbfe'; // azul claro previsão
    if (!day.count) return shades[0];
    const lvl = Math.min(Math.ceil((day.count / maxCount) * 4), 4);
    return shades[lvl];
  };

  // ── True Retention ──────────────────────────────────────────────────────────
  const matureTotal = trueRetention.mature_total || 0;
  const maturePass  = trueRetention.mature_pass  || 0;
  const youngTotal  = trueRetention.young_total  || 0;
  const youngPass   = trueRetention.young_pass   || 0;
  const maturePct   = matureTotal > 0 ? Math.round((maturePass / matureTotal) * 100) : null;
  const youngPct    = youngTotal  > 0 ? Math.round((youngPass  / youngTotal)  * 100) : null;

  if (!retention?.total_reviews) return (
    <div className="mt-4 bg-white rounded-xl border border-border p-6 text-center text-sm text-text-muted">
      Sem estatísticas ainda — conclua pelo menos uma sessão de estudo.
    </div>
  );

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Retenção geral', value: `${retentionPct}%`, color: 'text-primary' },
          { label: 'Revisões totais', value: retention?.total_reviews || 0, color: 'text-text' },
          { label: 'Tempo médio/card', value: avgSec ? formatTime(avgSec) : '—', color: 'text-orange-500' },
          { label: 'Estabilidade média', value: counts?.avg_stability ? counts.avg_stability.toFixed(1) + 'd' : '—', color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 text-center">
            <div className={`text-2xl font-bold font-heading ${color}`}>{value}</div>
            <div className="text-xs text-text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* True Retention */}
      {plugins.trueRetention && (maturePct !== null || youngPct !== null) && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-text font-heading mb-1 flex items-center gap-2 text-sm">
            <Award size={14} className="text-primary" /> True Retention
            <span className="ml-1 text-xs font-normal text-text-muted">(exclui cards novos — mede apenas revisões de memória real)</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold font-heading text-green-600">{maturePct !== null ? `${maturePct}%` : '—'}</div>
              <div className="text-xs text-text-muted mt-1">Maduros (revisão)</div>
              <div className="text-xs text-green-700 mt-0.5">{maturePass} acertos / {matureTotal} tentativas</div>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 text-center">
              <div className="text-2xl font-bold font-heading text-orange-500">{youngPct !== null ? `${youngPct}%` : '—'}</div>
              <div className="text-xs text-text-muted mt-1">Jovens (aprendendo)</div>
              <div className="text-xs text-orange-700 mt-0.5">{youngPass} acertos / {youngTotal} tentativas</div>
            </div>
          </div>
        </div>
      )}

      {/* Distribuição de estados */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold text-text font-heading mb-3 flex items-center gap-2 text-sm">
          <Brain size={14} className="text-primary" /> Distribuição dos cards
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Novos', key: 'total_new', bg: 'bg-blue-50', fg: 'text-primary' },
            { label: 'Aprendendo', key: 'total_learning', bg: 'bg-orange-50', fg: 'text-orange-500' },
            { label: 'Revisão', key: 'total_review', bg: 'bg-green-50', fg: 'text-green-600' },
            { label: 'Reaprendendo', key: 'total_relearning', bg: 'bg-red-50', fg: 'text-red-500' },
          ].map(({ label, key, bg, fg }) => (
            <div key={key} className={`rounded-lg p-3 text-center ${bg}`}>
              <div className={`text-xl font-bold font-heading ${fg}`}>{counts?.[key] || 0}</div>
              <div className="text-xs text-text-muted mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Heatmap */}
      {plugins.heatmap && (
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-text font-heading flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-primary" /> Review Heatmap
            </h3>
            <div className="flex items-center gap-2">
              {/* Seletor de paleta */}
              <div className="flex gap-1">
                {Object.entries(PALETTES).map(([key, p]) => (
                  <button key={key} title={p.name} onClick={() => { setPalette(key); setPaletteLS(key); }}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${palette === key ? 'border-text scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: p.shades[3] }} />
                ))}
              </div>
              <button onClick={() => setHeatmapVisible(v => !v)} className="p-1 text-text-muted hover:text-text transition-colors">
                {heatmapVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Streak badges */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs bg-orange-50 text-orange-600 rounded-full px-3 py-1">
              <span>🔥</span><strong>{currentStreak}</strong><span>dias seguidos</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-600 rounded-full px-3 py-1">
              <span>⚡</span><strong>{longestStreak}</strong><span>maior sequência</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 rounded-full px-3 py-1">
              <span>📅</span><strong>{daysLearned}</strong><span>dias estudados ({daysLearnedPct}%)</span>
            </div>
          </div>

          {heatmapVisible && (
            <>
              <div className="flex gap-[3px] overflow-x-auto pb-1">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map(day => (
                      <div key={day.date}
                        title={day.isFuture
                          ? (day.forecast ? `${day.date}: ${day.forecast} previstos` : day.date)
                          : `${day.date}: ${day.count} revisões`}
                        className="w-[11px] h-[11px] rounded-sm cursor-default transition-opacity hover:opacity-80"
                        style={{ backgroundColor: cellColor(day) }} />
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                <span>Menos</span>
                {shades.map((c, i) => <div key={i} className="w-[11px] h-[11px] rounded-sm" style={{ backgroundColor: c }} />)}
                <span>Mais</span>
                <span className="ml-3 w-[11px] h-[11px] rounded-sm inline-block" style={{ backgroundColor: '#bfdbfe' }} />
                <span>Previstos</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Previsão 30 dias */}
      {forecast.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="font-semibold text-text font-heading mb-3 flex items-center gap-2 text-sm">
            <TrendingUp size={14} className="text-primary" /> Previsão — próximos 30 dias
          </h3>
          <div className="flex items-end gap-0.5 h-20">
            {(() => {
              const maxF = Math.max(...forecast.map(f => f.count), 1);
              return forecast.map(f => (
                <div key={f.day} className="flex-1" title={`${f.day}: ${f.count}`}>
                  <div className="w-full bg-primary/20 rounded-t-sm hover:bg-primary/40 transition-colors"
                    style={{ height: `${Math.max((f.count / maxF) * 70, 4)}px` }} />
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Occlusion Card Renderer ─────────────────────────────────────────────────
function OcclusionCard({ card, flipped }) {
  const [note, setNote] = useState(null);

  useEffect(() => {
    if (!card.occlusion_note_id) return;
    fetch(`${API}/occlusion/${card.occlusion_note_id}`).then(r => r.json()).then(setNote);
  }, [card.occlusion_note_id]);

  if (!note) return <div className="flex justify-center py-10"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const { image_data, shapes = [], mode, header, footer, remarks, sources } = note;
  const targetIdx = card.shape_index ?? 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {header && <div className="text-sm text-text-muted text-center">{header}</div>}
      <div className="relative inline-block w-full">
        <img src={image_data} alt="occlusion" className="w-full rounded-lg" draggable={false} />
        <OcclusionOverlay shapes={shapes} imageData={image_data} targetIdx={targetIdx} flipped={flipped} mode={mode} />
      </div>
      {footer && <div className="text-sm text-text-muted text-center">{footer}</div>}
      {flipped && (
        <>
          <div className="mt-2 text-center text-base font-semibold text-primary">
            {shapes[targetIdx]?.label || `${targetIdx + 1}`}
          </div>
          {remarks && (
            <div className="mt-1 text-sm text-text bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              <span className="font-semibold text-text-muted text-xs uppercase tracking-wide">Observações: </span>{remarks}
            </div>
          )}
          {sources && (
            <div className="mt-1 text-xs text-text-muted bg-bg border border-border rounded-lg px-3 py-2">
              <span className="font-semibold uppercase tracking-wide">Fontes: </span>{sources}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OcclusionOverlay({ shapes, imageData, targetIdx, flipped, mode }) {
  const imgRef = useRef(null);
  const [dim, setDim] = useState(null); // { nw, nh }

  useEffect(() => {
    const el = new window.Image();
    el.onload = () => setDim({ nw: el.naturalWidth, nh: el.naturalHeight });
    el.src = imageData;
  }, [imageData]);

  if (!dim) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {shapes.map((s, i) => {
        const left   = (s.x / dim.nw) * 100;
        const top    = (s.y / dim.nh) * 100;
        const width  = (s.w / dim.nw) * 100;
        const height = (s.h / dim.nh) * 100;

        const isTarget = i === targetIdx;
        // reveal_all: front shows all revealed (no covering), back shows label highlight
        const shouldCover = flipped ? false
          : mode === 'reveal_all' ? false
          : mode === 'hide_all'   ? true
          : isTarget;

        const showHighlight = !shouldCover && isTarget;
        if (!shouldCover && !showHighlight) return null;

        const isEllipse = s.type === 'ellipse';
        const borderRadius = isEllipse ? '50%' : '2px';

        return (
          <div key={i} style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, borderRadius }}
            className={`flex items-center justify-center text-white font-bold text-sm
              ${shouldCover ? 'bg-blue-600/85' : 'bg-transparent border-2 border-green-500'}`}>
            {shouldCover && (s.label || `${i + 1}`)}
          </div>
        );
      })}
    </div>
  );
}

// ─── Study Mode ───────────────────────────────────────────────────────────────
function StudyMode({ deck, onExit }) {
  const sessionId = getSessionId();
  const [queue, setQueue] = useState([]);
  const [current, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [reviewError, setReviewError] = useState(false);
  const [editingCard, setEditingCard] = useState(null); // modal de edição inline
  const [editForm, setEditForm] = useState({ front: '', back: '', hint: '' });
  const startTime = useRef(Date.now());

  const openEdit = () => {
    setEditForm({ front: card.front, back: card.back, hint: card.hint || '' });
    setEditingCard(card);
  };

  const saveEdit = async () => {
    const r = await fetch(`${API}/cards/${editingCard.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const updated = await r.json();
    // Atualiza o card na fila sem perder o progresso
    setQueue(q => q.map((c, i) => i === current ? { ...c, ...updated } : c));
    setEditingCard(null);
  };

  useEffect(() => {
    fetch(`${API}/study/${deck.id}?session_id=${sessionId}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setQueue(data); setLoading(false); if (!data.length) setDone(true); })
      .catch(() => { setLoading(false); setDone(true); });
  }, [deck.id, sessionId]);

  const card = queue[current];
  const elapsed = card ? Math.max(0, card.elapsed_days || 0) : 0;
  const preview = card ? schedule({ ...card, elapsed_days: elapsed }) : null;

  const handleRate = async (rating) => {
    const elapsedDays = (Date.now() - startTime.current) / 86400000;
    setReviewError(false);
    try {
      const r = await fetch(`${API}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: card.id, session_id: sessionId, rating, elapsed_days: elapsedDays }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
        throw new Error(err.error || `HTTP ${r.status}`);
      }
    } catch (e) {
      console.error('[review] failed:', e.message);
      setReviewError(e.message);
      return;
    }
    setReviewed(r => r + 1);
    startTime.current = Date.now();
    const nextIdx = current + 1;
    if (nextIdx >= queue.length) setDone(true);
    else { setCurrentIdx(nextIdx); setFlipped(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (done) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <Award size={40} className="text-green-600" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text font-heading">Sessão concluída!</h2>
        <p className="text-text-muted mt-1">{reviewed} cards revisados nesta sessão.</p>
      </div>
      <button onClick={onExit} className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
        Voltar aos decks
      </button>
    </div>
  );

  const ratingLabels = { 1: 'Errei', 2: 'Difícil', 3: 'Bom', 4: 'Fácil' };
  const ratingColors = {
    1: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',
    2: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100',
    3: 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100',
    4: 'bg-blue-50 border-blue-200 text-primary hover:bg-blue-100',
  };

  return (
    <div className="flex-1 flex flex-col w-full p-4 gap-4">

      {/* Modal de edição inline */}
      <AnimatePresence>
        {editingCard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-text font-heading">Editar card</h3>
                <button onClick={() => setEditingCard(null)} className="p-1.5 text-text-muted hover:text-text transition-colors"><X size={18} /></button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Frente</label>
                  <RichEditor content={editForm.front} onChange={html => setEditForm(f => ({ ...f, front: html }))} placeholder="Pergunta..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Verso</label>
                  <RichEditor content={editForm.back} onChange={html => setEditForm(f => ({ ...f, back: html }))} placeholder="Resposta..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Dica (opcional)</label>
                  <input value={editForm.hint} onChange={e => setEditForm(f => ({ ...f, hint: e.target.value }))}
                    placeholder="Dica..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditingCard(null)}
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text-muted hover:border-border-dark transition-colors">Cancelar</button>
                <button onClick={saveEdit}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Salvar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onExit} className="flex items-center gap-1 text-sm text-text-muted hover:text-primary transition-colors">
          <ChevronLeft size={16} /> Sair
        </button>
        <div className="text-sm text-text-muted">{current + 1} / {queue.length}</div>
        <button onClick={openEdit} className="p-1.5 text-text-muted hover:text-primary hover:bg-bg rounded-lg transition-colors" title="Editar este card">
          <Edit2 size={15} />
        </button>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(current / queue.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded-2xl border border-border shadow-lg flex flex-col min-h-full">

          {card.occlusion_note_id ? (
            /* ── Occlusion Card ── */
            <div className="p-5 flex-1 flex flex-col gap-3" onClick={() => !flipped && setFlipped(true)}>
              <div className="text-xs text-text-muted uppercase tracking-widest font-medium text-center">{deck.name}</div>
              <OcclusionCard card={card} flipped={flipped} />
              {!flipped && <div className="text-xs text-text-muted opacity-50 text-center">toque para revelar</div>}
            </div>
          ) : (
            <>
              {/* Pergunta — sempre visível */}
              <div
                className={`flex flex-col items-center p-6 text-center cursor-pointer select-none ${!flipped ? 'flex-1 justify-center' : 'border-b border-border'}`}
                onClick={() => !flipped && setFlipped(true)}
              >
                <div className="text-xs text-text-muted mb-4 uppercase tracking-widest font-medium">{deck.name}</div>
                <div className="fc-content prose prose-sm max-w-none text-text w-full"
                  dangerouslySetInnerHTML={{ __html: card.front }} />
                {card.hint && <div className="mt-4 text-sm text-text-muted italic">Dica: {card.hint}</div>}
                {!flipped && <div className="mt-6 text-xs text-text-muted opacity-50">toque para revelar</div>}
              </div>

              {/* Resposta — aparece abaixo com dissolve */}
              <AnimatePresence>
                {flipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center p-6 text-center flex-1 justify-center"
                  >
                    <div className="text-xs text-primary mb-3 uppercase tracking-widest font-semibold">Resposta</div>
                    <div className="fc-content prose prose-sm max-w-none text-text w-full"
                      dangerouslySetInnerHTML={{ __html: card.back }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {reviewError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          <span>Erro ao salvar: <strong>{reviewError}</strong> — tente novamente.</span>
        </div>
      )}

      {/* Rating buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.15 }} className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(r => (
              <button key={r} onClick={() => handleRate(r)}
                className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all ${ratingColors[r]}`}>
                <span>{ratingLabels[r]}</span>
                {preview && <span className="text-xs font-normal mt-0.5 opacity-70">{formatInterval(preview[r].interval)}</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!flipped && (
        <button onClick={() => setFlipped(true)}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          Revelar resposta
        </button>
      )}
    </div>
  );
}

// ─── Plugin Settings Modal ────────────────────────────────────────────────────
function PluginModal({ plugins, onChange, onClose }) {
  const PLUGIN_LIST = [
    { key: 'heatmap',        label: 'Review Heatmap',    desc: 'Mapa de calor de atividade diária com sequências e paletas de cores.' },
    { key: 'trueRetention',  label: 'True Retention',    desc: 'Retenção real separada entre cards maduros e jovens (exclui primeira exposição).' },
    { key: 'imageOcclusion', label: 'Image Occlusion',   desc: 'Crie flashcards ocultando partes de imagens com retângulos e elipses numerados.' },
    { key: 'dueOverview',    label: 'More Decks Stats',  desc: 'Exibe coluna "Atrasado" no painel de baralhos com cards de revisão vencidos.' },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-text font-heading flex items-center gap-2"><Puzzle size={16} className="text-primary" /> Plugins</h3>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3">
          {PLUGIN_LIST.map(({ key, label, desc }) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-bg transition-colors">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text">{label}</div>
                <div className="text-xs text-text-muted mt-0.5">{desc}</div>
              </div>
              <button type="button" onClick={() => onChange({ ...plugins, [key]: !plugins[key] })}
                className={`mt-0.5 w-10 h-5 rounded-full transition-colors shrink-0 relative ${plugins[key] ? 'bg-primary' : 'bg-border'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${plugins[key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Image Occlusion Editor ───────────────────────────────────────────────────
function OcclusionEditor({ deck, noteId, onClose }) {
  const canvasRef     = useRef(null);
  const [image, setImage]   = useState(null);
  const [imgEl, setImgEl]   = useState(null);
  const [shapes, setShapes] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tool, setTool]   = useState('rect');      // rect | ellipse
  const [mode, setMode]   = useState('hide_all');  // hide_all | hide_one | reveal_all
  const [header, setHeader]   = useState('');
  const [footer, setFooter]   = useState('');
  const [remarks, setRemarks] = useState('');
  const [sources, setSources] = useState('');
  const [saving, setSaving] = useState(false);
  const [labelEdit, setLabelEdit] = useState(null);
  const [labelVal, setLabelVal]   = useState('');

  // Carrega nota existente
  useEffect(() => {
    if (!noteId) return;
    fetch(`${API}/occlusion/${noteId}`).then(r => r.json()).then(n => {
      setMode(n.mode || 'hide_all');
      setHeader(n.header || '');
      setFooter(n.footer || '');
      setRemarks(n.remarks || '');
      setSources(n.sources || '');
      setShapes(n.shapes || []);
      const el = new Image();
      el.onload = () => setImgEl(el);
      el.src = n.image_data;
      setImage(n.image_data);
    });
  }, [noteId]);

  // Keyboard shortcuts: Delete = remove selected, Escape = cancel drawing
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selected !== null && document.activeElement?.tagName !== 'INPUT') {
          setShapes(s => s.filter((_, i) => i !== selected));
          setSelected(null);
        }
      }
      if (e.key === 'Escape') {
        setDrawing(null);
        setSelected(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected]);

  // Re-render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgEl) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    ctx.drawImage(imgEl, 0, 0);
    const allShapes = drawing ? [...shapes, { ...drawing, type: tool }] : shapes;
    allShapes.forEach((s, i) => {
      const isSelected = i === selected;
      ctx.fillStyle   = isSelected ? 'rgba(26,115,232,0.35)' : 'rgba(26,115,232,0.25)';
      ctx.strokeStyle = isSelected ? '#1a73e8' : '#1557b0';
      ctx.lineWidth   = 2;
      if (s.type === 'ellipse') {
        const rx = s.w / 2, ry = s.h / 2, cx = s.x + rx, cy = s.y + ry;
        ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else {
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.strokeRect(s.x, s.y, s.w, s.h);
      }
      ctx.fillStyle = '#fff';
      ctx.font      = `bold ${Math.max(12, Math.min(s.w, s.h) * 0.3)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label || `${i + 1}`, s.x + s.w / 2, s.y + s.h / 2);
    });
  }, [imgEl, shapes, drawing, selected, tool]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const hitTest = (s, x, y) => {
    if (s.type === 'ellipse') {
      const rx = s.w / 2, ry = s.h / 2, cx = s.x + rx, cy = s.y + ry;
      return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    }
    return x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h;
  };

  const onMouseDown = (e) => {
    if (!imgEl) return;
    const { x, y } = getPos(e);
    const idx = shapes.findIndex(s => hitTest(s, x, y));
    if (idx >= 0) { setSelected(idx); return; }
    setSelected(null);
    setDrawing({ x, y, w: 0, h: 0 });
  };
  const onMouseMove = (e) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    setDrawing(d => ({ ...d, w: x - d.x, h: y - d.y }));
  };
  const onMouseUp = () => {
    if (!drawing) return;
    const { x, y, w, h } = drawing;
    if (Math.abs(w) > 8 && Math.abs(h) > 8) {
      const norm = { x: w < 0 ? x + w : x, y: h < 0 ? y + h : y, w: Math.abs(w), h: Math.abs(h), label: `${shapes.length + 1}`, type: tool };
      setShapes(s => [...s, norm]);
      setSelected(shapes.length);
    }
    setDrawing(null);
  };

  const deleteShape = (i) => { setShapes(s => s.filter((_, idx) => idx !== i)); setSelected(null); };

  const uploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;
      setImage(src); setShapes([]);
      const el = new window.Image();
      el.onload = () => setImgEl(el);
      el.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const save = async () => {
    if (!image || shapes.length === 0) return;
    setSaving(true);
    try {
      const body = { deck_id: deck.id, image_data: image, shapes, mode, header, footer, remarks, sources };
      const url  = noteId ? `${API}/occlusion/${noteId}` : `${API}/occlusion`;
      const method = noteId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error();
      toast.success(`${shapes.length} card${shapes.length > 1 ? 's' : ''} de oclusão ${noteId ? 'atualizados' : 'criados'} com sucesso.`);
      onClose();
    } catch { toast.error('Erro ao salvar oclusão.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text"><ChevronLeft size={18} /></button>
        <h2 className="font-bold text-text font-heading flex-1">Image Occlusion — {deck.name}</h2>
        <button onClick={save} disabled={saving || !image || shapes.length === 0}
          className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
          {saving ? 'Salvando…' : `Gerar ${shapes.length} card${shapes.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-6xl mx-auto w-full">
        {/* Canvas */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Toolbar */}
          {image && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wide">Ferramenta:</span>
              {[{ val: 'rect', icon: '▭', label: 'Retângulo' }, { val: 'ellipse', icon: '◯', label: 'Elipse' }].map(t => (
                <button key={t.val} onClick={() => setTool(t.val)} title={t.label}
                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${tool === t.val ? 'bg-primary text-white border-primary' : 'border-border text-text-muted hover:border-primary hover:text-primary'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
              {selected !== null && (
                <button onClick={() => deleteShape(selected)}
                  className="ml-auto px-3 py-1 text-sm rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1">
                  <X size={12} /> Excluir selecionada <span className="text-xs opacity-60">(Del)</span>
                </button>
              )}
            </div>
          )}
          {!image ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-16 cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-colors">
              <ImageIcon size={32} className="text-text-muted mb-2" />
              <span className="text-sm text-text-muted">Clique para carregar uma imagem</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
            </label>
          ) : (
            <div className="relative border border-border rounded-xl overflow-hidden bg-bg">
              <canvas ref={canvasRef} className="w-full cursor-crosshair select-none"
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
            </div>
          )}
          <p className="text-xs text-text-muted">Clique e arraste para criar formas · Clique para selecionar · <kbd className="bg-bg border border-border rounded px-1">Del</kbd> excluir · <kbd className="bg-bg border border-border rounded px-1">Esc</kbd> cancelar</p>
        </div>

        {/* Painel direito */}
        <div className="w-full lg:w-64 flex flex-col gap-4">
          {/* Upload */}
          <label className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-text-muted cursor-pointer hover:border-primary hover:text-primary transition-colors">
            <ImageIcon size={14} /> Trocar imagem
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </label>

          {/* Modo */}
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Modo</label>
            {[
              { val: 'hide_all',   label: 'Hide All, Guess One',   desc: 'Todos cobertos, revelar um por vez' },
              { val: 'hide_one',   label: 'Hide One, Guess One',   desc: 'Apenas um coberto por vez' },
              { val: 'reveal_all', label: 'Reveal All, Guess One', desc: 'Todos visíveis, identificar o alvo' },
            ].map(m => (
              <label key={m.val} className={`flex items-start gap-2 p-2.5 rounded-lg border mb-2 cursor-pointer transition-colors ${mode === m.val ? 'border-primary bg-blue-50' : 'border-border hover:bg-bg'}`}>
                <input type="radio" name="mode" value={m.val} checked={mode === m.val} onChange={() => setMode(m.val)} className="mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-text">{m.label}</div>
                  <div className="text-xs text-text-muted">{m.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Campos de texto */}
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1 block">Cabeçalho</label>
            <input value={header} onChange={e => setHeader(e.target.value)} placeholder="Texto acima da imagem…"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1 block">Rodapé</label>
            <input value={footer} onChange={e => setFooter(e.target.value)} placeholder="Texto abaixo da imagem…"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1 block">Observações <span className="normal-case font-normal">(verso)</span></label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Anotações exibidas no verso…" rows={2}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1 block">Fontes <span className="normal-case font-normal">(verso)</span></label>
            <input value={sources} onChange={e => setSources(e.target.value)} placeholder="Ex.: Gray's Anatomy, p. 42"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>

          {/* Lista de shapes */}
          {shapes.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Máscaras ({shapes.length})</label>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {shapes.map((s, i) => (
                  <div key={i} onClick={() => setSelected(i)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${selected === i ? 'border-primary bg-blue-50' : 'border-border hover:bg-bg'}`}>
                    <span className={`w-5 h-5 bg-primary text-white text-xs flex items-center justify-center shrink-0 ${s.type === 'ellipse' ? 'rounded-full' : 'rounded-sm'}`}>{i + 1}</span>
                    {labelEdit === i ? (
                      <input autoFocus value={labelVal} onChange={e => setLabelVal(e.target.value)}
                        onBlur={() => { setShapes(sh => sh.map((x, j) => j === i ? { ...x, label: labelVal || `${i+1}` } : x)); setLabelEdit(null); }}
                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                        className="flex-1 text-xs border-b border-primary outline-none bg-transparent" />
                    ) : (
                      <span className="flex-1 truncate text-xs" onDoubleClick={() => { setLabelEdit(i); setLabelVal(s.label || `${i+1}`); }}>
                        {s.label || `${i + 1}`}
                      </span>
                    )}
                    <button onClick={e => { e.stopPropagation(); deleteShape(i); }} className="text-text-muted hover:text-red-500 shrink-0"><X size={12} /></button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-text-muted mt-1">Duplo-clique no rótulo para editar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card Editor ──────────────────────────────────────────────────────────────
function CardEditor({ deck, onClose, plugins }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ front: '', back: '', hint: '' });
  const [deletingCard, setDeletingCard] = useState(null);
  const [showOcclusion, setShowOcclusion] = useState(false);

  useEffect(() => {
    fetch(`${API}/decks/${deck.id}/cards`)
      .then(r => r.json())
      .then(data => { setCards(data); setLoading(false); });
  }, [deck.id]);

  const openNew = () => { setForm({ front: '', back: '', hint: '' }); setEditing('new'); };
  const openEdit = (c) => { setForm({ front: c.front, back: c.back, hint: c.hint || '' }); setEditing(c); };

  const save = async () => {
    if (!form.front.trim() || !form.back.trim()) return;
    if (editing === 'new') {
      const r = await fetch(`${API}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck_id: deck.id, ...form }),
      });
      const newCard = await r.json();
      setCards(c => [...c, newCard]);
      toast.success('Card criado com sucesso.');
    } else {
      const r = await fetch(`${API}/cards/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const updated = await r.json();
      setCards(c => c.map(x => x.id === updated.id ? updated : x));
      toast.success('Card atualizado.');
    }
    setEditing(null);
  };

  const confirmDeleteCard = async () => {
    const card = deletingCard;
    await fetch(`${API}/cards/${card.id}`, { method: 'DELETE' });
    setCards(c => c.filter(x => x.id !== card.id));
    setDeletingCard(null);
    toast.success('Card excluído.');
  };

  return (
    <div className="flex-1 flex flex-col w-full p-4 gap-4">

      {/* Modal de confirmar exclusão de card */}
      <AnimatePresence>
        {deletingCard && (
          <ConfirmDeleteCardModal
            card={deletingCard}
            onConfirm={confirmDeleteCard}
            onClose={() => setDeletingCard(null)}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-primary transition-colors"><ChevronLeft size={18} /></button>
          <h2 className="font-bold text-text font-heading">{deck.name} — Cards</h2>
        </div>
        <div className="flex items-center gap-2">
          {plugins?.imageOcclusion && (
            <button onClick={() => setShowOcclusion(true)}
              className="flex items-center gap-1.5 px-3 py-2 border border-border text-text-muted rounded-lg text-sm hover:border-primary hover:text-primary transition-colors">
              <ImageIcon size={14} /> Oclusão de imagem
            </button>
          )}
          <button onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Novo card
          </button>
        </div>
      </div>

      {showOcclusion && (
        <OcclusionEditor deck={deck} onClose={() => { setShowOcclusion(false);
          fetch(`${API}/decks/${deck.id}/cards`).then(r => r.json()).then(data => setCards(data)); }} />
      )}

      {/* Card form modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-text font-heading">{editing === 'new' ? 'Novo card' : 'Editar card'}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 text-text-muted hover:text-text transition-colors"><X size={18} /></button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Frente</label>
                  <RichEditor
                    content={form.front}
                    onChange={html => setForm(f => ({ ...f, front: html }))}
                    placeholder="Pergunta ou conceito..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Verso</label>
                  <RichEditor
                    content={form.back}
                    onChange={html => setForm(f => ({ ...f, back: html }))}
                    placeholder="Resposta ou definição..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5 block">Dica (opcional)</label>
                  <input value={form.hint} onChange={e => setForm(f => ({ ...f, hint: e.target.value }))}
                    placeholder="Dica para ajudar a lembrar..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text-muted hover:border-border-dark transition-colors">Cancelar</button>
                <button onClick={save}
                  className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Salvar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
          <BookOpen size={40} className="opacity-30" />
          <p>Nenhum card ainda. Crie o primeiro!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {cards.map((c, i) => (
            <div key={c.id} className="bg-white border border-border rounded-xl p-4 flex items-start gap-4">
              <span className="text-xs text-text-muted font-mono mt-0.5 w-6 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text line-clamp-1 prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: c.front }} />
                <div className="text-xs text-text-muted line-clamp-1 prose prose-sm mt-0.5"
                  dangerouslySetInnerHTML={{ __html: c.back }} />
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(c)} className="p-1.5 text-text-muted hover:text-primary hover:bg-bg rounded-lg transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeletingCard(c)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Searchable Parent Deck Dropdown ─────────────────────────────────────────
function ParentDeckSelect({ allDecks, value, onChange, excludeId }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Build full path label for each deck
  const getPath = (deck) => {
    const parts = [deck.name];
    let current = deck;
    while (current.parent_id) {
      const parent = allDecks.find(d => d.id === current.parent_id);
      if (!parent) break;
      parts.unshift(parent.name);
      current = parent;
    }
    return parts.join(' › ');
  };

  const filtered = allDecks
    .filter(d => d.id !== excludeId)
    .filter(d => !search || getPath(d).toLowerCase().includes(search.toLowerCase()));

  const selected = value ? allDecks.find(d => d.id === value) : null;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between hover:border-primary transition-colors focus:outline-none focus:border-primary">
        <span className={selected ? 'text-text' : 'text-text-muted'}>
          {selected ? getPath(selected) : 'Nenhum (deck raiz)'}
        </span>
        <ChevronRight size={14} className={`text-text-muted transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-xl shadow-xl z-40 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-border">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Pesquisar deck pai..."
                className="w-full text-sm px-2 py-1.5 border border-border rounded-lg focus:outline-none focus:border-primary" />
            </div>

            <div className="max-h-48 overflow-y-auto">
              {/* Option: no parent */}
              <button type="button" onClick={() => { onChange(null); setOpen(false); setSearch(''); }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-blue-50 ${!value ? 'text-primary font-semibold bg-blue-50/50' : 'text-text-muted'}`}>
                — Nenhum (deck raiz)
              </button>

              {filtered.length === 0 && (
                <div className="px-3 py-4 text-sm text-text-muted text-center">Nenhum deck encontrado</div>
              )}

              {filtered.map(d => (
                <button key={d.id} type="button"
                  onClick={() => { onChange(d.id); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-blue-50 flex items-center gap-1.5 ${value === d.id ? 'text-primary font-semibold bg-blue-50/50' : 'text-text'}`}>
                  {d.parent_id && <span className="text-text-muted text-xs ml-3">↳</span>}
                  <span className="truncate">{getPath(d)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Deck Form Modal ──────────────────────────────────────────────────────────
function DeckModal({ deck, allDecks, onSave, onClose }) {
  const [form, setForm] = useState({
    name: deck?.name || '',
    description: deck?.description || '',
    discipline: deck?.discipline || '',
    parent_id: deck?.parent_id || null,
  });

  const save = async () => {
    if (!form.name.trim()) return;
    const url  = deck?.id ? `${API}/decks/${deck.id}` : `${API}/decks`;
    const method = deck?.id ? 'PUT' : 'POST';
    const r = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    onSave(await r.json(), !!deck?.id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-text font-heading">{deck ? 'Editar deck' : 'Novo deck'}</h3>
          <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text transition-colors"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1 block">Nome *</label>
            <input autoFocus value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="Ex: Anatomia - Sistema Nervoso"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1 block">Deck pai (hierarquia)</label>
            <ParentDeckSelect
              allDecks={allDecks}
              value={form.parent_id}
              onChange={pid => setForm(f => ({ ...f, parent_id: pid }))}
              excludeId={deck?.id}
            />
            {form.parent_id && (
              <p className="text-xs text-text-muted mt-1 ml-1">
                Este deck ficará dentro do deck selecionado.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1 block">Descrição</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              placeholder="Descrição opcional..."
              className="w-full border border-border rounded-lg px-3 py-2 text-sm text-text resize-none focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text-muted hover:border-border-dark transition-colors">Cancelar</button>
          <button onClick={save} className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">Salvar</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Flashcards() {
  const sessionId = getSessionId();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('dashboard');
  const [activeDeck, setActiveDeck] = useState(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [deletingDeck, setDeletingDeck] = useState(null);
  const [serverError, setServerError] = useState(false);
  const [plugins, setPlugins] = useState(getPlugins);
  const [showPlugins, setShowPlugins] = useState(false);

  const loadDecks = () => {
    setLoading(true);
    setServerError(false);
    fetch(`${API}/decks?session_id=${sessionId}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setDecks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(e => { console.error('loadDecks:', e.message); setLoading(false); setServerError(true); });
  };

  useEffect(() => { loadDecks(); }, []);

  const handleStudy    = (deck) => { setActiveDeck(deck); setMode('study'); };
  const handleEdit     = (deck) => { setActiveDeck(deck); setMode('editor'); };
  const handleSettings = (deck) => { setEditingDeck(deck); setShowDeckModal(true); };
  const confirmDeleteDeck = async () => {
    const deck = deletingDeck;
    await fetch(`${API}/decks/${deck.id}`, { method: 'DELETE' });
    setDecks(d => d.filter(x => x.id !== deck.id));
    setDeletingDeck(null);
    toast.success(`Deck "${deck.name}" excluído com sucesso.`);
  };
  const handleDeckSaved = (data, isEdit) => {
    if (isEdit) {
      setDecks(d => d.map(x => x.id === data.id ? { ...x, ...data } : x));
      toast.success(`Deck "${data.name}" atualizado com sucesso.`);
    } else {
      setDecks(d => [...d, data]);
      toast.success(`Deck "${data.name}" criado com sucesso.`);
    }
    setShowDeckModal(false);
    setEditingDeck(null);
  };

  if (mode === 'study' && activeDeck) return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-bg">
      <StudyMode deck={activeDeck} onExit={() => { setMode('dashboard'); loadDecks(); }} />
    </div>
  );

  if (mode === 'editor' && activeDeck) return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-bg">
      <CardEditor deck={activeDeck} plugins={plugins} onClose={() => { setMode('dashboard'); loadDecks(); }} />
    </div>
  );

  return (
    <div className="bg-bg min-h-full">
      <AnimatePresence>
        {(showDeckModal || editingDeck) && (
          <DeckModal deck={editingDeck} allDecks={decks.filter(d => d.id !== editingDeck?.id)} onSave={handleDeckSaved}
            onClose={() => { setShowDeckModal(false); setEditingDeck(null); }} />
        )}
        {deletingDeck && (
          <ConfirmDeleteDeckModal
            deck={deletingDeck}
            onConfirm={confirmDeleteDeck}
            onClose={() => setDeletingDeck(null)}
          />
        )}
        {showPlugins && (
          <PluginModal plugins={plugins} onChange={p => { setPlugins(p); savePlugins(p); }} onClose={() => setShowPlugins(false)} />
        )}
      </AnimatePresence>

      <div className="px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text font-heading flex items-center gap-2">
              <Brain size={24} className="text-primary" /> Flashcards
            </h1>
            <p className="text-text-muted text-sm mt-1">Revisão espaçada com FSRS-4.5 (mesmo algoritmo do Anki)</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPlugins(true)} title="Plugins"
              className="p-2 border border-border rounded-lg text-text-muted hover:text-primary hover:border-primary transition-colors">
              <Puzzle size={16} />
            </button>
            <button onClick={() => { setEditingDeck(null); setShowDeckModal(true); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Novo deck
            </button>
          </div>
        </div>

        {/* Error */}
        {serverError && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong>Não foi possível conectar ao servidor.</strong>
              <p className="mt-1 text-red-600">Inicie com <code className="bg-red-100 px-1 rounded font-mono">npm run dev:server</code></p>
            </div>
            <button onClick={loadDecks}
              className="shrink-0 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
              Tentar novamente
            </button>
          </div>
        )}

        {/* Deck table */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : decks.length === 0 && !serverError ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Layers size={32} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-text">Nenhum deck ainda</p>
              <p className="text-sm text-text-muted mt-1">Crie seu primeiro deck e comece a estudar com repetição espaçada.</p>
            </div>
            <button onClick={() => setShowDeckModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              <Plus size={16} /> Criar primeiro deck
            </button>
          </div>
        ) : !serverError && (
          <>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <DeckAccordion decks={decks} onStudy={handleStudy} onEdit={handleEdit} onSettings={handleSettings} onDelete={deck => setDeletingDeck(deck)} plugins={plugins} />
            </motion.div>

            {/* Stats inline below table */}
            <StatsInline sessionId={sessionId} plugins={plugins} />
          </>
        )}
      </div>
    </div>
  );
}
