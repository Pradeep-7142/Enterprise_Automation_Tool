import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Btn, Card, EmptyState, PageHeader } from '../components/shared';

export default function MessagesPage() {
  const conversationsState = useFetch(() => flowdeskApi.getConversations(), [], []);
  const [selectedId, setSelectedId] = useState(null);
  const [text, setText] = useState('');
  const messagesState = useFetch(
    () => (selectedId ? flowdeskApi.getMessages(selectedId) : Promise.resolve([])),
    [selectedId],
    [],
  );

  useEffect(() => {
    const first = conversationsState.data?.[0];
    if (!selectedId && first?.id) setSelectedId(first.id);
  }, [conversationsState.data, selectedId]);

  async function send(event) {
    event.preventDefault();
    if (!selectedId || !text.trim()) return;
    await flowdeskApi.sendMessage(selectedId, text.trim());
    setText('');
    messagesState.reload();
  }

  if (conversationsState.loading) return <PageLoader message="Loading conversations..." />;
  if (conversationsState.error) return <PageError message={conversationsState.error} onRetry={conversationsState.reload} />;

  const conversations = conversationsState.data || [];

  return (
    <div className="space-y-5">
      <PageHeader title="Messages" subtitle="Internal thread communication linked to workflow records." />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-[640px] overflow-y-auto p-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={`mb-2 w-full rounded-lg px-3 py-2 text-left text-sm ${selectedId === conversation.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <p className="font-medium">{conversation.name || 'Conversation'}</p>
              <p className="text-xs text-slate-500">{conversation.lastMsg || conversation.time}</p>
            </button>
          ))}
        </Card>
        <Card className="h-[640px] p-0">
          {!selectedId ? (
            <EmptyState title="Select a conversation" description="Choose a conversation from the left sidebar to view messages." />
          ) : messagesState.loading ? (
            <PageLoader message="Loading messages..." />
          ) : messagesState.error ? (
            <PageError message={messagesState.error} onRetry={messagesState.reload} />
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {(messagesState.data || []).map((message) => (
                  <div key={message.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                    <p className="font-medium">{message.sender || (message.from === 'me' ? 'You' : 'Them')}</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{message.text}</p>
                    <p className="mt-1 text-xs text-slate-400">{message.time}</p>
                  </div>
                ))}
              </div>
              <form className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800" onSubmit={send}>
                <input className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type message..." />
                <Btn type="submit">
                  <Send size={15} />
                  Send
                </Btn>
              </form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
