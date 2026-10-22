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
          <div className="kv"><dt>Brands and trade names</dt><dd>{c.brands.join(', ')}</dd></div>
          <div className="kv"><dt>States contacted</dt><dd>{c.states.join(', ')}</dd></div>
          <div className="kv"><dt>Litigation forum</dt><dd>{c.forum}</dd></div>
          <div className="kv"><dt>Engaged since</dt><dd>{formatDate(c.engaged)}</dd></div>
        </dl>
        <p className="tiny mb-0 mt-3">To change any of these, write to your CiV contact: each one changes which rules are applied.</p>
      </Card>
      <Card title="Contacts">
        {settings.contacts.map((p) => (
          <div key={p.role} className="chk"><span><span className="font-semibold">{p.name}</span><span className="tiny block">{p.role}</span></span><span className="mono text-[12px] text-txt-2">{p.email}</span></div>
        ))}
      </Card>
    </div>
  );
}
