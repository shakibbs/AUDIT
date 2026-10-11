'use client';

import { Toggle } from '@/components/ui/Toggle';
import { useTheme } from '@/state/useTheme';

/** Dark mode switch, shown as a row in the account menu. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 text-[13px]">
      <span className="kpi-tag">Dark mode</span>
      <Toggle label="Dark mode" checked={theme === 'dark'} onChange={toggle} />
    </div>
  );
}
