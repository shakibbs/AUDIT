import type { Settings } from '@/api/types';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/format';

/** Company facts the audit depends on, and the people CiV contacts. */
export function CompanyTab({ settings }: { settings: Settings }) {
  const c = settings.company;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Company">
        <dl className="m-0">
          <div className="kv"><dt>Name</dt><dd>{c.name}</dd></div>
          <div className="kv"><dt>Industry</dt><dd>{c.vertical}</dd></div>
          <div className="kv"><dt>Brands and trade names</dt><dd>{c.brands.length ? c.brands.join(', ') : 'Not set'}</dd></div>
          <div className="kv"><dt>States contacted</dt><dd>{c.states.length ? c.states.join(', ') : 'None yet (from your calls and texts)'}</dd></div>
          <div className="kv"><dt>Litigation forum</dt><dd>{c.forum ?? 'Not set'}</dd></div>
          <div className="kv"><dt>Engaged since</dt><dd>{formatDate(c.engaged)}</dd></div>
        </dl>
        <p className="tiny mb-0 mt-3">To change any of these, write to your CiV contact: each one changes which rules are applied.</p>
      </Card>
      <Card title="Contacts" sub="Your Admins and lawyers, from Users & Access">
        {settings.contacts.length === 0 && <p className="m-0 text-[13px] text-txt-2">No Admin or lawyer yet.</p>}
        {settings.contacts.map((p) => (
          <div key={p.email} className="chk"><span><span className="font-semibold">{p.name}</span><span className="tiny block">{p.role}</span></span><span className="mono text-[12px] text-txt-2">{p.email}</span></div>
        ))}
      </Card>
    </div>
  );
}
