import { MessageSquarePlus, Search, Send, UserPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Avatar, Badge, Btn, Card, EmptyState, PageHeader, cn } from '../components/shared';

function ConversationRow({ conversation, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition',
        active ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-100 dark:hover:bg-slate-800',
      )}
    >
      <Avatar name={conversation.name || 'Conversation'} initials={conversation.avatar} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{conversation.name || 'Conversation'}</p>
          {conversation.time ? <span className="shrink-0 text-[11px] text-slate-400">{conversation.time}</span> : null}
        </div>
        <p className="truncate text-xs text-slate-500">{conversation.lastMsg || 'No messages yet'}</p>
      </div>
      {conversation.unread ? (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
          {conversation.unread}
        </span>
      ) : null}
    </button>
  );
}

export default function MessagesPage() {
  const conversationsState = useFetch(() => flowdeskApi.getConversations(), [], []);
  const [selectedId, setSelectedId] = useState(null);
  const [text, setText] = useState('');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchBusy, setSearchBusy] = useState(false);
  const [startError, setStartError] = useState('');
  const scrollRef = useRef(null);

  const messagesState = useFetch(
    () => (selectedId ? flowdeskApi.getMessages(selectedId) : Promise.resolve([])),
    [selectedId],
    [],
  );

  useEffect(() => {
    const first = conversationsState.data?.[0];
    if (!selectedId && first?.id) setSelectedId(first.id);
  }, [conversationsState.data, selectedId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messagesState.data]);

  useEffect(() => {
    if (!searching) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setSearchBusy(true);
    const timer = setTimeout(async () => {
      try {
        const data = await flowdeskApi.getEmployees({ page: 1, limit: 10, search: q });
        if (active) setResults(data?.items || []);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearchBusy(false);
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, searching]);

  async function send(event) {
    event.preventDefault();
    if (!selectedId || !text.trim()) return;
    await flowdeskApi.sendMessage(selectedId, text.trim());
    setText('');
    messagesState.reload();
    conversationsState.reload();
  }

  async function startChat(employee) {
    setStartError('');
    try {
      const conversation = await flowdeskApi.startDirectConversation(employee.id);
      await conversationsState.reload();
      setSelectedId(conversation.id);
      setSearching(false);
      setQuery('');
      setResults([]);
    } catch (err) {
      setStartError(err.message || 'Unable to start conversation');
    }
  }

  if (conversationsState.loading) return <PageLoader message="Loading conversations..." />;
  if (conversationsState.error) return <PageError message={conversationsState.error} onRetry={conversationsState.reload} />;

  const conversations = conversationsState.data || [];
  const activeConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div className="space-y-5">
      <PageHeader title="Messages" subtitle="Chat with your team and confirm requests directly." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="flex h-[640px] flex-col p-0">
          <div className="flex items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
            {searching ? (
              <>
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-300 px-2 py-1.5 dark:border-slate-700">
                  <Search size={15} className="text-slate-400" />
                  <input
                    autoFocus
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="Search people in your organization..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <Btn
                  variant="ghost"
                  className="px-2"
                  onClick={() => {
                    setSearching(false);
                    setQuery('');
                    setResults([]);
                    setStartError('');
                  }}
                >
                  <X size={16} />
                </Btn>
              </>
            ) : (
              <>
                <p className="flex-1 text-sm font-semibold">Conversations</p>
                <Btn variant="secondary" className="px-2.5 py-1.5 text-xs" onClick={() => setSearching(true)}>
                  <MessageSquarePlus size={15} />
                  New chat
                </Btn>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {searching ? (
              <div>
                {startError ? <p className="px-2 py-1 text-xs text-rose-600">{startError}</p> : null}
                {searchBusy ? (
                  <p className="px-3 py-2 text-sm text-slate-500">Searching...</p>
                ) : query.trim().length < 2 ? (
                  <p className="px-3 py-2 text-sm text-slate-500">Type at least 2 characters to find people.</p>
                ) : results.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-slate-500">No matching people found.</p>
                ) : (
                  results.map((employee) => (
                    <div
                      key={employee.id}
                      className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Avatar name={employee.name || employee.email} initials={employee.avatar} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{employee.name || employee.email}</p>
                        <p className="truncate text-xs text-slate-500">{employee.dept || employee.role || employee.email}</p>
                      </div>
                      <Btn className="px-2.5 py-1.5 text-xs" onClick={() => startChat(employee)}>
                        <UserPlus size={14} />
                        Message
                      </Btn>
                    </div>
                  ))
                )}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-4">
                <EmptyState title="No conversations" description="Start a new chat to message someone in your organization." />
              </div>
            ) : (
              conversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={selectedId === conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                />
              ))
            )}
          </div>
        </Card>

        <Card className="flex h-[640px] flex-col p-0">
          {!selectedId ? (
            <EmptyState title="Select a conversation" description="Choose a conversation on the left, or start a new chat." />
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
                <Avatar name={activeConversation?.name || 'Conversation'} initials={activeConversation?.avatar} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{activeConversation?.name || 'Conversation'}</p>
                  <p className="text-xs text-slate-500">
                    {activeConversation?.online ? 'Online' : activeConversation?.type === 'group' ? `${activeConversation?.members || 0} members` : 'Direct message'}
                  </p>
                </div>
              </div>

              {messagesState.loading ? (
                <PageLoader message="Loading messages..." />
              ) : messagesState.error ? (
                <PageError message={messagesState.error} onRetry={messagesState.reload} />
              ) : (
                <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950/40">
                  {(messagesState.data || []).length === 0 ? (
                    <p className="mt-6 text-center text-sm text-slate-500">No messages yet. Say hello!</p>
                  ) : (
                    (messagesState.data || []).map((message) => {
                      const mine = message.from === 'me';
                      return (
                        <div key={message.id ?? `${message.time}-${message.text}`} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                          <div
                            className={cn(
                              'max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                              mine
                                ? 'rounded-br-sm bg-blue-600 text-white'
                                : 'rounded-bl-sm bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100',
                            )}
                          >
                            {!mine && message.sender ? (
                              <p className="mb-0.5 text-[11px] font-semibold text-blue-600 dark:text-blue-300">{message.sender}</p>
                            ) : null}
                            <p className="whitespace-pre-wrap break-words">{message.text}</p>
                            <p className={cn('mt-1 text-right text-[10px]', mine ? 'text-blue-100' : 'text-slate-400')}>{message.time}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              <form className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-800" onSubmit={send}>
                <input
                  className="w-full rounded-full border border-slate-300 bg-transparent px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                />
                <Btn type="submit" className="rounded-full px-3" disabled={!text.trim()}>
                  <Send size={16} />
                </Btn>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
