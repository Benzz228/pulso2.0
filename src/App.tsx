import { useEffect, useMemo, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, Bell, CalendarClock,
  Check, CheckCircle2, ChevronDown, CircleHelp, Clock3, Cloud,
  FileText, Filter, FolderOpen, LayoutDashboard, Link2,
  ListChecks, Menu, MessageSquareText, MoreHorizontal, Plus,
  Search, Settings2, ShieldCheck, Sparkles, Users, WandSparkles, X,
  Zap
} from "lucide-react";

type Page = "Visão geral" | "Conteúdos" | "Grupos" | "Publicação em lote" | "Automação" | "Integrações";
type PostStatus = "Rascunho" | "Pronto" | "Na fila" | "Publicado";
type Post = { id: string; title: string; caption: string; channel: string; status: PostStatus; createdAt: string };
type Group = { id: string; name: string; category: string; members: string; connected: boolean };
type Automation = { enabled: boolean; interval: number; dailyLimit: number; startHour: string; endHour: string };

const initialPosts: Post[] = [
  { id: "p1", title: "Apresentação da marca", caption: "Estamos a preparar novidades para a comunidade. Fica atento! ✨", channel: "Facebook", status: "Pronto", createdAt: "Hoje" },
  { id: "p2", title: "Dica da semana", caption: "Uma pequena dica pode fazer uma grande diferença. O que achas?", channel: "Facebook", status: "Rascunho", createdAt: "Hoje" },
  { id: "p3", title: "Oferta especial", caption: "Descobre a nossa seleção desta semana.", channel: "Facebook", status: "Na fila", createdAt: "Ontem" },
];
const initialGroups: Group[] = [
  { id: "g1", name: "Empreendedores de Moçambique", category: "Negócios", members: "12,4 mil", connected: false },
  { id: "g2", name: "Marketing Digital • África", category: "Marketing", members: "8,2 mil", connected: false },
  { id: "g3", name: "Pequenos Negócios MZ", category: "Negócios", members: "5,7 mil", connected: false },
];
const navItems: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Visão geral", icon: LayoutDashboard },
  { label: "Conteúdos", icon: FileText },
  { label: "Grupos", icon: Users },
  { label: "Publicação em lote", icon: ListChecks },
  { label: "Automação", icon: CalendarClock },
  { label: "Integrações", icon: Link2 },
];
function load<T,>(key: string, fallback: T): T {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}
function uid() { return Math.random().toString(36).slice(2, 10); }

export default function App() {
  const [page, setPage] = useState<Page>("Visão geral");
  const [posts, setPosts] = useState<Post[]>(() => load("pulso.posts", initialPosts));
  const [groups, setGroups] = useState<Group[]>(() => load("pulso.groups", initialGroups));
  const [automation, setAutomation] = useState<Automation>(() => load("pulso.automation", { enabled: false, interval: 1, dailyLimit: 8, startHour: "08:00", endHour: "20:00" }));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [toast, setToast] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [batchGroupIds, setBatchGroupIds] = useState<string[]>([]);
  const [batchPostIds, setBatchPostIds] = useState<string[]>([]);
  const [batchCaption, setBatchCaption] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => { localStorage.setItem("pulso.posts", JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem("pulso.groups", JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem("pulso.automation", JSON.stringify(automation)); }, [automation]);
  const filteredPosts = useMemo(() => posts.filter(p => (p.title + " " + p.caption).toLowerCase().includes(query.toLowerCase())), [posts, query]);
  const readyCount = posts.filter(p => p.status === "Pronto" || p.status === "Na fila").length;
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2800); };
  const addPost = () => {
    if (!title.trim() && !caption.trim()) { notify("Adiciona um título ou texto para continuar."); return; }
    setPosts(current => [{ id: uid(), title: title.trim() || "Nova publicação", caption: caption.trim(), channel: "Facebook", status: "Rascunho", createdAt: "Agora" }, ...current]);
    setTitle(""); setCaption(""); setShowPostForm(false); notify("Conteúdo guardado nos teus rascunhos.");
  };
  const addGroup = () => {
    if (!newGroup.trim()) return;
    setGroups(current => [{ id: uid(), name: newGroup.trim(), category: "Personalizado", members: "—", connected: false }, ...current]);
    setNewGroup(""); notify("Destino adicionado à tua lista local.");
  };
  const toggle = (list: string[], id: string, setter: (value: string[]) => void) => setter(list.includes(id) ? list.filter(item => item !== id) : [...list, id]);
  const makeBatch = () => {
    if (!batchCaption.trim() && batchPostIds.length === 0) { notify("Escolhe conteúdos ou escreve uma publicação."); return; }
    if (batchGroupIds.length === 0) { notify("Seleciona pelo menos um destino."); return; }
    if (batchCaption.trim()) setPosts(current => [{ id: uid(), title: "Publicação em lote", caption: batchCaption.trim(), channel: "Facebook", status: "Na fila", createdAt: "Agora" }, ...current]);
    else setPosts(current => current.map(p => batchPostIds.includes(p.id) ? { ...p, status: "Na fila" } : p));
    notify("Lote preparado localmente. A publicação real requer ligação à Meta.");
    setBatchCaption(""); setBatchGroupIds([]); setBatchPostIds([]);
  };

  const Sidebar = () => <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
    <div className="brand"><div className="brand-mark"><Activity size={21} strokeWidth={2.6} /></div><div><span className="brand-name">pulso</span><span className="brand-sub">SOCIAL WORKSPACE</span></div><button className="mobile-close icon-button" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={18}/></button></div>
    <div className="workspace-switch"><div className="workspace-avatar">P</div><div className="workspace-label"><strong>O meu espaço</strong><span>Plano de trabalho</span></div><ChevronDown size={15}/></div>
    <div className="nav-label">WORKSPACE</div>
    <nav>{navItems.map(item => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => { setPage(item.label); setMobileOpen(false); }}><Icon size={18}/><span>{item.label}</span>{item.label === "Automação" && automation.enabled && <i className="nav-dot"/>}</button>; })}</nav>
    <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><strong>Precisas de ajuda?</strong><p>Aprende a organizar o teu fluxo de trabalho.</p><button onClick={() => setPage("Integrações")}>Ver guia <ArrowRight size={14}/></button></div><div className="profile"><div className="profile-avatar">AL</div><div className="profile-info"><strong>Administrador</strong><span>Espaço pessoal</span></div><MoreHorizontal size={18}/></div></div>
  </aside>;

  return <div className="app-shell">
    <Sidebar />
    {mobileOpen && <button className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div></div><div className="topbar-actions"><div className="connection-pill"><span className="status-dot"/> Modo local</div><button className="icon-button notification" aria-label="Notificações" onClick={() => notify("Não tens notificações novas.")}><Bell size={18}/><i/></button><div className="top-avatar">AL</div></div></header>
      <div className="page-content">
        {page === "Visão geral" && <Dashboard posts={posts} groups={groups} readyCount={readyCount} automation={automation} setPage={setPage} onNew={() => setShowPostForm(true)} />}
        {page === "Conteúdos" && <section>
          <PageHeading eyebrow="BIBLIOTECA DE CONTEÚDO" title="Os teus conteúdos" description="Cria, organiza e prepara publicações para os teus canais." action={<button className="button button-primary" onClick={() => setShowPostForm(true)}><Plus size={17}/> Novo conteúdo</button>}/>
          <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Pesquisar conteúdos..."/></div><button className="button button-quiet" onClick={() => notify("A mostrar todos os estados.")}><Filter size={16}/> Filtrar</button><span className="results-count">{filteredPosts.length} conteúdos</span></div>
          <div className="content-grid">{filteredPosts.map(post => <article className="content-card" key={post.id}><div className="content-card-top"><div className="post-type-icon"><MessageSquareText size={18}/></div><Status status={post.status}/><button className="icon-button small" aria-label="Eliminar conteúdo" onClick={() => { setPosts(current => current.filter(p => p.id !== post.id)); notify("Conteúdo removido."); }}><MoreHorizontal size={18}/></button></div><h3>{post.title}</h3><p className="post-caption">{post.caption || "Ainda sem texto de publicação."}</p><div className="content-card-footer"><span><span className="fb-mini">f</span> {post.channel}</span><span>{post.createdAt}</span></div><button className="text-action" onClick={() => { setTitle(post.title); setCaption(post.caption); setShowPostForm(true); }}>Editar conteúdo <ArrowRight size={14}/></button></article>)}
            <button className="new-content-card" onClick={() => setShowPostForm(true)}><span className="new-plus"><Plus size={20}/></span><strong>Criar conteúdo</strong><span>Começa com uma nova ideia</span></button>
          </div>
          {filteredPosts.length === 0 && <Empty icon={<FolderOpen/>} title="Ainda não há resultados" text="Experimenta outra pesquisa ou cria um novo conteúdo."/>}
        </section>}
        {page === "Grupos" && <section>
          <PageHeading eyebrow="DESTINOS" title="Grupos e comunidades" description="Organiza os destinos que pretendes utilizar nas tuas campanhas." action={<button className="button button-primary" onClick={() => notify("A ligação à Meta ainda não está configurada.")}><Link2 size={16}/> Ligar Facebook</button>}/>
          <div className="notice notice-blue"><ShieldCheck size={19}/><div><strong>Os destinos são geridos por ti</strong><p>Esta lista é local. Para importar grupos reais e publicar, será necessária uma integração oficial Meta com permissões válidas. O Pulso não entra automaticamente em grupos.</p></div></div>
          <div className="add-group-panel"><div className="add-group-icon"><Plus size={18}/></div><div className="add-group-copy"><strong>Adicionar destino manualmente</strong><span>Guarda um nome para organizar o teu lote.</span></div><div className="add-group-input"><input value={newGroup} onChange={e => setNewGroup(e.target.value)} onKeyDown={e => e.key === "Enter" && addGroup()} placeholder="Nome do grupo ou comunidade"/><button className="button button-primary" onClick={addGroup}>Adicionar</button></div></div>
          <div className="section-title-row"><div><h2>A tua lista de destinos</h2><p>{groups.length} destinos guardados · seleção múltipla disponível</p></div><button className="button button-quiet" onClick={() => { setBatchGroupIds(groups.map(g => g.id)); setPage("Publicação em lote"); }}><ListChecks size={16}/> Selecionar para lote</button></div>
          <div className="table-wrap"><table><thead><tr><th>DESTINO</th><th>CATEGORIA</th><th>MEMBROS</th><th>ESTADO DA LIGAÇÃO</th><th></th></tr></thead><tbody>{groups.map(group => <tr key={group.id}><td><div className="group-name-cell"><div className="group-avatar"><Users size={17}/></div><div><strong>{group.name}</strong><span>Destino personalizado</span></div></div></td><td><span className="category-chip">{group.category}</span></td><td>{group.members}</td><td><span className="status-muted"><span/> Não ligado</span></td><td><button className="icon-button small" onClick={() => { setGroups(current => current.filter(g => g.id !== group.id)); notify("Destino removido da lista."); }} aria-label="Remover destino"><X size={16}/></button></td></tr>)}</tbody></table></div>
        </section>}
        {page === "Publicação em lote" && <section>
          <PageHeading eyebrow="DISTRIBUIÇÃO" title="Publicação em lote" description="Prepara vários conteúdos e escolhe múltiplos destinos num só fluxo."/>
          <div className="batch-steps"><div className="batch-step active"><span>1</span><div><strong>Conteúdo</strong><small>O que vais publicar</small></div></div><div className="step-line"/><div className="batch-step active"><span>2</span><div><strong>Destinos</strong><small>Onde queres publicar</small></div></div><div className="step-line"/><div className="batch-step"><span>3</span><div><strong>Rever lote</strong><small>Confirmar preparação</small></div></div></div>
          <div className="batch-layout"><div className="panel"><div className="panel-heading"><div><h2>1. Seleciona conteúdos</h2><p>Escolhe rascunhos existentes ou escreve um novo.</p></div><span className="count-chip">{batchPostIds.length} selecionados</span></div><div className="batch-post-list">{posts.map(post => <label className="select-row" key={post.id}><input type="checkbox" checked={batchPostIds.includes(post.id)} onChange={() => toggle(batchPostIds, post.id, setBatchPostIds)}/><div className="select-row-icon"><FileText size={17}/></div><div className="select-row-copy"><strong>{post.title}</strong><span>{post.caption || "Sem texto adicional"}</span></div><Status status={post.status}/></label>)}</div><div className="field-block"><label htmlFor="batch-caption">Ou escreve uma nova publicação</label><textarea id="batch-caption" rows={4} value={batchCaption} onChange={e => setBatchCaption(e.target.value)} placeholder="Escreve aqui a mensagem para este lote..."/><span className="field-hint">{batchCaption.length} caracteres · o conteúdo será guardado como rascunho/fila local</span></div></div>
          <div className="panel"><div className="panel-heading"><div><h2>2. Escolhe destinos</h2><p>Podes selecionar vários destinos.</p></div><button className="text-action" onClick={() => setBatchGroupIds(batchGroupIds.length === groups.length ? [] : groups.map(g => g.id))}>{batchGroupIds.length === groups.length ? "Limpar" : "Selecionar todos"}</button></div><div className="batch-group-list">{groups.map(group => <label className="select-row" key={group.id}><input type="checkbox" checked={batchGroupIds.includes(group.id)} onChange={() => toggle(batchGroupIds, group.id, setBatchGroupIds)}/><div className="group-avatar"><Users size={17}/></div><div className="select-row-copy"><strong>{group.name}</strong><span>{group.category} · {group.members} membros</span></div></label>)}</div><div className="batch-summary"><div><span>Conteúdos</span><strong>{batchPostIds.length + (batchCaption.trim() ? 1 : 0)}</strong></div><div><span>Destinos</span><strong>{batchGroupIds.length}</strong></div><div><span>Combinações</span><strong>{(batchPostIds.length + (batchCaption.trim() ? 1 : 0)) * batchGroupIds.length}</strong></div></div><button className="button button-primary button-full" onClick={makeBatch}><ListChecks size={17}/> Preparar lote <ArrowRight size={16}/></button><p className="micro-disclaimer"><ShieldCheck size={14}/> Preparar não significa publicar. A ligação oficial ainda é necessária.</p></div></div>
        </section>}
        {page === "Automação" && <section>
          <PageHeading eyebrow="ROTINAS INTELIGENTES" title="Automação" description="Define o ritmo de trabalho que gostarias de manter, sem criar cada horário manualmente."/>
          <div className="automation-hero"><div className="automation-orb"><Zap size={27}/></div><div className="automation-hero-copy"><span className="eyebrow">ROTINA RECORRENTE</span><h2>{automation.enabled ? "A tua rotina está ativada" : "Deixa a rotina preparada"}</h2><p>Configura um intervalo recorrente e os limites diários para a tua estratégia.</p></div><button className={`toggle-switch ${automation.enabled ? "on" : ""}`} role="switch" aria-checked={automation.enabled} aria-label="Ativar rotina" onClick={() => { setAutomation(a => ({ ...a, enabled: !a.enabled })); notify(automation.enabled ? "Rotina desativada." : "Configuração local ativada. Ainda não executa publicações."); }}><span/></button></div>
          <div className="automation-layout"><div className="panel"><div className="panel-heading"><div><h2>Configuração da rotina</h2><p>Ajusta a frequência ao teu fluxo de trabalho.</p></div><Settings2 size={19}/></div><div className="field-block"><label htmlFor="interval">Intervalo entre publicações</label><select id="interval" value={automation.interval} onChange={e => setAutomation(a => ({ ...a, interval: Number(e.target.value) }))}><option value={1}>A cada 1 hora</option><option value={2}>A cada 2 horas</option><option value={3}>A cada 3 horas</option><option value={6}>A cada 6 horas</option><option value={12}>A cada 12 horas</option><option value={24}>Uma vez por dia</option></select><span className="field-hint">O intervalo define a cadência pretendida; a execução real precisa de um worker no servidor.</span></div><div className="form-two-col"><div className="field-block"><label htmlFor="limit">Limite diário pretendido</label><select id="limit" value={automation.dailyLimit} onChange={e => setAutomation(a => ({ ...a, dailyLimit: Number(e.target.value) }))}><option value={2}>2 publicações</option><option value={4}>4 publicações</option><option value={8}>8 publicações</option><option value={12}>12 publicações</option><option value={20}>20 publicações</option></select></div><div className="field-block"><label htmlFor="start">Início da rotina</label><input id="start" type="time" value={automation.startHour} onChange={e => setAutomation(a => ({ ...a, startHour: e.target.value }))}/></div><div className="field-block"><label htmlFor="end">Fim da rotina</label><input id="end" type="time" value={automation.endHour} onChange={e => setAutomation(a => ({ ...a, endHour: e.target.value }))}/></div></div><button className="button button-primary" onClick={() => notify("Preferências da rotina guardadas neste navegador.")}><Check size={16}/> Guardar preferências</button></div>
          <div className="panel"><div className="panel-heading"><div><h2>Como vai funcionar</h2><p>Para executar mesmo quando estiveres offline.</p></div><Cloud size={19}/></div><div className="timeline"><div className="timeline-item"><span className="timeline-icon done"><Check size={15}/></span><div><strong>Definir a rotina</strong><p>Escolher intervalo e limites.</p><small>Disponível nesta versão</small></div></div><div className="timeline-item"><span className="timeline-icon"><Link2 size={15}/></span><div><strong>Ligar a Meta</strong><p>Autorizar os recursos permitidos pela plataforma.</p><small>A configurar</small></div></div><div className="timeline-item"><span className="timeline-icon"><Cloud size={15}/></span><div><strong>Ativar worker na nuvem</strong><p>Executar tarefas sem depender do navegador.</p><small>Etapa de backend</small></div></div><div className="timeline-item"><span className="timeline-icon"><Activity size={15}/></span><div><strong>Acompanhar resultados</strong><p>Histórico, erros, tentativas e pausa.</p><small>Após integração</small></div></div></div><div className="notice notice-amber"><ShieldCheck size={18}/><p><strong>Transparência:</strong> ativar esta configuração não publica em segundo plano nesta versão. Não deixes o navegador como única dependência de uma automação real.</p></div></div></div>
        </section>}
        {page === "Integrações" && <section>
          <PageHeading eyebrow="CONTAS E SERVIÇOS" title="Integrações" description="Liga as plataformas de forma segura para preparar o Pulso para uso real."/>
          <div className="integration-card"><div className="integration-brand fb-brand">f</div><div className="integration-copy"><div className="integration-title"><h2>Facebook / Meta</h2><span className="status-badge status-draft">Ainda não ligado</span></div><p>O acesso às páginas, grupos e publicação depende das permissões que a Meta disponibiliza à aplicação e à conta autorizada.</p><div className="permission-list"><span><CheckCircle2 size={14}/> OAuth seguro no servidor</span><span><CheckCircle2 size={14}/> Permissões aprovadas</span><span><CheckCircle2 size={14}/> Fila de execução em nuvem</span></div><button className="button button-primary" onClick={() => notify("Cria primeiro uma aplicação em Meta for Developers; depois configuramos OAuth.")}>Preparar ligação <ArrowRight size={16}/></button></div></div>
          <div className="integration-card"><div className="integration-brand neutral-brand"><Cloud size={22}/></div><div className="integration-copy"><div className="integration-title"><h2>Execução na nuvem</h2><span className="status-badge status-draft">Pendente</span></div><p>Necessária para processar a fila, manter o histórico e executar rotinas mesmo com o utilizador offline.</p><button className="button button-secondary" onClick={() => setPage("Automação")}>Ver configuração de rotina <ArrowRight size={16}/></button></div></div>
          <div className="resource-links"><h3>Recursos oficiais</h3><a href="https://developers.facebook.com/" target="_blank" rel="noreferrer">Meta for Developers <ArrowUpRight size={15}/></a><a href="https://developers.facebook.com/docs/graph-api/" target="_blank" rel="noreferrer">Graph API <ArrowUpRight size={15}/></a><a href="https://developers.facebook.com/docs/facebook-login/" target="_blank" rel="noreferrer">Facebook Login <ArrowUpRight size={15}/></a></div>
        </section>}
      </div>
      <footer className="app-footer"><span>© 2026 Pulso Workspace</span><span><span className="status-dot"/> Os teus dados de demonstração ficam neste navegador</span></footer>
    </main>
    {showPostForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowPostForm(false); }}><div className="modal"><div className="modal-header"><div><span className="eyebrow">BIBLIOTECA DE CONTEÚDO</span><h2>Novo conteúdo</h2></div><button className="icon-button" onClick={() => setShowPostForm(false)} aria-label="Fechar"><X size={19}/></button></div><div className="field-block"><label htmlFor="post-title">Título interno</label><input id="post-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Dica da semana"/></div><div className="field-block"><label htmlFor="post-caption">Texto da publicação</label><textarea id="post-caption" rows={6} value={caption} onChange={e => setCaption(e.target.value)} placeholder="Escreve a mensagem que queres preparar..."/><span className="field-hint">{caption.length} caracteres · guardado como rascunho</span></div><div className="modal-note"><ShieldCheck size={16}/> Este conteúdo fica preparado no Pulso. A publicação real só ficará disponível após integração autorizada.</div><div className="modal-actions"><button className="button button-secondary" onClick={() => setShowPostForm(false)}>Cancelar</button><button className="button button-primary" onClick={addPost}><Check size={16}/> Guardar conteúdo</button></div></div></div>}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}<button onClick={() => setToast("")} aria-label="Fechar"><X size={15}/></button></div>}
  </div>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
}
function Status({ status }: { status: PostStatus }) {
  const cls = status === "Publicado" ? "status-published" : status === "Na fila" ? "status-queued" : status === "Pronto" ? "status-ready" : "status-draft";
  return <span className={`status-badge ${cls}`}><i/>{status}</span>;
}
function Empty({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="empty-state"><div>{icon}</div><h3>{title}</h3><p>{text}</p></div>;
}
function Dashboard({ posts, groups, readyCount, automation, setPage, onNew }: { posts: Post[]; groups: Group[]; readyCount: number; automation: Automation; setPage: (page: Page) => void; onNew: () => void }) {
  const published = posts.filter(p => p.status === "Publicado").length;
  return <section>
    <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={13}/> O TEU CENTRO DE COMANDO</div><h1>Bom trabalho começa<br className="desktop-break"/> com um bom <span>pulso.</span></h1><p>Organiza as ideias, prepara os conteúdos e mantém tudo a fluir.</p></div><div className="welcome-art"><div className="art-ring ring-one"/><div className="art-ring ring-two"/><div className="art-core"><Activity size={39}/></div><span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✦</span></div></div>
    <div className="quick-actions"><button className="quick-action quick-primary" onClick={onNew}><span className="quick-icon"><Plus size={19}/></span><span><strong>Criar conteúdo</strong><small>Transforma uma ideia num post</small></span><ArrowRight size={17}/></button><button className="quick-action" onClick={() => setPage("Publicação em lote")}><span className="quick-icon purple"><ListChecks size={19}/></span><span><strong>Preparar um lote</strong><small>Vários conteúdos e destinos</small></span><ArrowRight size={17}/></button><button className="quick-action" onClick={() => setPage("Automação")}><span className="quick-icon orange"><CalendarClock size={19}/></span><span><strong>Configurar rotina</strong><small>Define o teu intervalo</small></span><ArrowRight size={17}/></button></div>
    <div className="metrics-grid"><Metric icon={<FileText size={18}/>} label="Total de conteúdos" value={String(posts.length).padStart(2,"0")} change="Na tua biblioteca" tone="blue"/><Metric icon={<Clock3 size={18}/>} label="Prontos ou na fila" value={String(readyCount).padStart(2,"0")} change="Aguardam integração" tone="purple"/><Metric icon={<Users size={18}/>} label="Destinos guardados" value={String(groups.length).padStart(2,"0")} change="Lista local" tone="orange"/><Metric icon={<CheckCircle2 size={18}/>} label="Publicações reais" value={String(published).padStart(2,"0")} change="Ainda sem integração" tone="green"/></div>
    <div className="dashboard-lower"><div className="panel recent-panel"><div className="panel-heading"><div><h2>Conteúdo recente</h2><p>O que tens preparado no Pulso.</p></div><button className="text-action" onClick={() => setPage("Conteúdos")}>Ver biblioteca <ArrowRight size={14}/></button></div>{posts.slice(0,4).map(post => <div className="recent-post" key={post.id}><div className="recent-icon"><MessageSquareText size={17}/></div><div className="recent-copy"><strong>{post.title}</strong><span>{post.caption || "Sem texto de publicação"}</span></div><Status status={post.status}/></div>)}{posts.length === 0 && <Empty icon={<FileText/>} title="A tua biblioteca começa aqui" text="Cria o primeiro conteúdo para o veres nesta lista."/>}</div>
    <div className="panel routine-panel"><div className="panel-heading"><div><h2>Rotina automática</h2><p>O estado da tua configuração.</p></div><div className="routine-icon"><Zap size={18}/></div></div><div className="routine-status-row"><div className={`routine-status-dot ${automation.enabled ? "active" : ""}`}/><strong>{automation.enabled ? "Configuração ativada" : "Ainda não configurada"}</strong></div><div className="routine-detail"><span>Intervalo pretendido</span><strong>A cada {automation.interval} {automation.interval === 1 ? "hora" : "horas"}</strong></div><div className="routine-detail"><span>Janela diária</span><strong>{automation.startHour} – {automation.endHour}</strong></div><div className="routine-callout"><Cloud size={17}/><p>A execução em segundo plano requer um serviço na nuvem e ligação oficial.</p></div><button className="button button-secondary button-full" onClick={() => setPage("Automação")}>Configurar automação <ArrowRight size={15}/></button></div></div>
    <div className="bottom-tip"><div className="tip-icon"><WandSparkles size={19}/></div><div><strong>Uma boa rotina começa com organização.</strong><p>Prepara conteúdos e destinos agora. Quando a integração estiver pronta, o Pulso poderá encaminhar as tarefas autorizadas.</p></div><button className="text-action" onClick={() => setPage("Grupos")}>Organizar destinos <ArrowRight size={14}/></button></div>
  </section>;
}
function Metric({ icon, label, value, change, tone }: { icon: ReactNode; label: string; value: string; change: string; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-change"><span className={tone === "green" ? "change-positive" : ""}>{change}</span></div></div>;
}
