import { BookOpen, ChevronDown, ChevronUp, ExternalLink, Headphones, Search } from 'lucide-react';
import { useState } from 'react';
import { Card, PageHeader, SearchInput } from '../components/shared';

const FAQ = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'How do I create a workflow request?',
        a: 'Navigate to Requests → Create Request. Fill in the title, description, priority, and any amount. Your request will be automatically routed through the configured approval workflow for your department.',
      },
      {
        q: 'What roles are available in FlowDesk?',
        a: 'FlowDesk supports: Employee, Manager, Department Head, Finance, HR, IT, Support, Auditor, Viewer, Org Admin, and Super Admin. Each role has different permissions for creating, approving, and managing requests.',
      },
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot password" on the login page and enter your email. You will receive a reset link. You can also change your password in Settings → Change Password.',
      },
    ],
  },
  {
    section: 'Approvals & Requests',
    items: [
      {
        q: 'Who can approve requests?',
        a: 'Managers, Department Heads, Finance, HR, Org Admins, and Super Admins can approve or reject requests. Approval routing depends on your configured workflow template.',
      },
      {
        q: 'Can I add a comment when approving or rejecting?',
        a: 'Yes. When you click Approve or Reject, a modal will appear asking for optional notes. These comments are stored in the request timeline and visible to the requester.',
      },
      {
        q: 'What happens after a request is rejected?',
        a: 'A rejected request is finalized — no further action can be taken. The requester will receive a notification with the rejection reason. They can create a new request if needed.',
      },
    ],
  },
  {
    section: 'Employees & Departments',
    items: [
      {
        q: 'How do I add a new employee?',
        a: 'Go to Employees → Add Member (Org Admin and Super Admin only). Fill in name, email, temporary password, role, and department. The user can change their password after first login.',
      },
      {
        q: 'How do I create a department?',
        a: 'Go to Departments → New Department (Org Admin and Super Admin only), or use the Admin Console → Departments tab. You can set a name, description, and assign a department head.',
      },
    ],
  },
  {
    section: 'Reports & Audit',
    items: [
      {
        q: 'Who can view audit logs?',
        a: 'Audit logs are visible to Super Admin, Org Admin, and Auditor roles. They show all security events, approvals, user changes, and workflow activity.',
      },
      {
        q: 'How do I export data?',
        a: 'Analytics and Audit Logs pages have an "Export CSV" button. Reports can be generated on-demand from the Reports page and downloaded in PDF or CSV format.',
      },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0 dark:border-slate-800">
      <button
        className="flex w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        {open ? <ChevronUp size={15} className="flex-shrink-0 text-slate-400" /> : <ChevronDown size={15} className="flex-shrink-0 text-slate-400" />}
      </button>
      {open && <p className="pb-4 text-sm text-slate-500 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function HelpPage() {
  const [search, setSearch] = useState('');

  const filtered = FAQ.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    }),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Help Center" subtitle="Quick references and support guides for FlowDesk operations." />

      {/* Support cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <BookOpen size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Documentation</p>
              <p className="mt-1 text-sm text-slate-500">Use the platform guides below for workflow design, approvals, and audit trails.</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Headphones size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold">Support</p>
              <p className="mt-1 text-sm text-slate-500">Contact your FlowDesk administrator for tenant-specific support and escalations.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* FAQ search */}
      <div>
        <SearchInput value={search} onChange={setSearch} placeholder="Search frequently asked questions…" className="max-w-md" />
      </div>

      {/* FAQ Accordion */}
      {filtered.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="text-slate-500">No results for "<span className="font-medium">{search}</span>"</p>
        </Card>
      ) : (
        filtered.map((section) => (
          <Card key={section.section}>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{section.section}</h3>
            {section.items.map((item) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </Card>
        ))
      )}
    </div>
  );
}
