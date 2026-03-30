import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';

const ROLES = [
  { value: 'administrador', label: 'Administrador', color: 'bg-purple-100 text-purple-700' },
  { value: 'aluno',         label: 'Aluno',         color: 'bg-blue-100 text-blue-700' },
  { value: 'temporario',    label: 'Temporário',    color: 'bg-yellow-100 text-yellow-700' },
];

function roleBadge(role) {
  const r = ROLES.find(r => r.value === role) || ROLES[2];
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${r.color}`}>{r.label}</span>;
}

function PhoneInput({ value, onChange, className = '' }) {
  const fmt = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2)  return d;
    if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };
  return (
    <input
      type="tel"
      value={fmt(value)}
      onChange={e => onChange(e.target.value.replace(/\D/g, ''))}
      placeholder="(00) 00000-0000"
      className={className}
    />
  );
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-border text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors';

// ── Modal reutilizável ────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold text-text font-heading">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-text-muted hover:bg-bg transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 flex flex-col gap-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">{footer}</div>}
      </div>
    </div>
  );
}

// ── Formulário de usuário (criar / editar) ────────────────────────────────────
function UserForm({ initial = {}, onSubmit, onClose, loading, error }) {
  const [name,  setName]  = useState(initial.name  || '');
  const [email, setEmail] = useState(initial.email || '');
  const [phone, setPhone] = useState((initial.phone || '').replace(/\D/g, ''));
  const [role,  setRole]  = useState(initial.role  || 'aluno');

  const handle = (e) => {
    e.preventDefault();
    onSubmit({ name, email, phone, role });
  };

  return (
    <form onSubmit={handle} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">Nome</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required className={inputCls} placeholder="Nome completo" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">E-mail</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} placeholder="email@exemplo.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Celular</label>
        <PhoneInput value={phone} onChange={setPhone} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-text mb-1">Perfil</label>
        <select value={role} onChange={e => setRole(e.target.value)} className={inputCls}>
          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      {error && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <div className="flex gap-3 justify-end pt-1">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-bg transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center gap-2">
          <Check size={15} />
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Cadastros() {
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [editing,    setEditing]    = useState(null);  // user object
  const [deleting,   setDeleting]   = useState(null);  // user object
  const [formError,  setFormError]  = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const searchTimer = useRef(null);

  const load = useCallback(async (s = search, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: s, page: p, limit: LIMIT });
      const res = await fetch(`/api/users?${params}`, { credentials: 'include' });
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [page]);

  const handleSearch = (v) => {
    setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); load(v, 1); }, 300);
  };

  const handleCreate = async (body) => {
    setFormError(''); setFormLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return setFormError(data.error || 'Erro ao cadastrar.');
      setShowCreate(false);
      load(search, 1); setPage(1);
    } catch { setFormError('Erro de conexão.'); }
    finally { setFormLoading(false); }
  };

  const handleEdit = async (body) => {
    setFormError(''); setFormLoading(true);
    try {
      const res = await fetch(`/api/users/${editing.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return setFormError(data.error || 'Erro ao salvar.');
      setEditing(null);
      load();
    } catch { setFormError('Erro de conexão.'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/users/${deleting.id}`, { method: 'DELETE', credentials: 'include' });
      setDeleting(null);
      load(search, page > 1 && users.length === 1 ? page - 1 : page);
      if (page > 1 && users.length === 1) setPage(p => p - 1);
    } catch { /* silencioso */ }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-text font-heading">Cadastros</h1>
          <p className="text-sm text-text-muted mt-0.5">{total} usuário{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setFormError(''); setShowCreate(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <UserPlus size={16} />
          Novo usuário
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou celular..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
        />
        {search && (
          <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-text-muted">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-text-muted hidden md:table-cell">E-mail</th>
                <th className="text-left px-4 py-3 font-semibold text-text-muted hidden lg:table-cell">Celular</th>
                <th className="text-left px-4 py-3 font-semibold text-text-muted">Perfil</th>
                <th className="text-right px-4 py-3 font-semibold text-text-muted">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="text-center py-10 text-text-muted">Carregando...</td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-text-muted">Nenhum usuário encontrado.</td></tr>
              )}
              {!loading && users.map((u, i) => (
                <tr key={u.id} className={`border-b border-border last:border-0 hover:bg-bg/60 transition-colors ${i % 2 === 0 ? '' : 'bg-bg/30'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {u.picture
                        ? <img src={u.picture} alt={u.name} className="w-7 h-7 rounded-full shrink-0" referrerPolicy="no-referrer" />
                        : <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">{u.name[0]}</div>
                      }
                      <span className="font-medium text-text truncate max-w-[140px]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-muted hidden md:table-cell truncate max-w-[180px]">{u.email}</td>
                  <td className="px-4 py-3 text-text-muted hidden lg:table-cell">
                    {u.phone ? `(${u.phone.slice(0,2)}) ${u.phone.slice(2,7)}-${u.phone.slice(7)}` : '—'}
                  </td>
                  <td className="px-4 py-3">{roleBadge(u.role)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => { setFormError(''); setEditing(u); }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleting(u)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remover"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-bg/40">
            <span className="text-xs text-text-muted">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-border text-text-muted hover:bg-bg disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-border text-text-muted hover:bg-bg disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar */}
      {showCreate && (
        <Modal title="Novo usuário" onClose={() => setShowCreate(false)}>
          <UserForm
            onSubmit={handleCreate}
            onClose={() => setShowCreate(false)}
            loading={formLoading}
            error={formError}
          />
        </Modal>
      )}

      {/* Modal Editar */}
      {editing && (
        <Modal title="Editar usuário" onClose={() => setEditing(null)}>
          <UserForm
            initial={editing}
            onSubmit={handleEdit}
            onClose={() => setEditing(null)}
            loading={formLoading}
            error={formError}
          />
        </Modal>
      )}

      {/* Modal Confirmar Exclusão */}
      {deleting && (
        <Modal
          title="Remover usuário"
          onClose={() => setDeleting(null)}
          footer={
            <>
              <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-bg transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2">
                <Trash2 size={15} />
                Remover
              </button>
            </>
          }
        >
          <p className="text-text">
            Tem certeza que deseja remover <strong>{deleting.name}</strong>?
          </p>
          <p className="text-sm text-text-muted">Esta ação não pode ser desfeita.</p>
        </Modal>
      )}
    </div>
  );
}
