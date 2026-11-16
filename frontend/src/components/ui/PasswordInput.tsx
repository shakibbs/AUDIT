'use client';
import { useState, type InputHTMLAttributes } from 'react';
import { Icon } from './Icon';

/** A password box with an eye button that shows or hides what was typed (owner 2026-11-16). Starts hidden. */
export function PasswordInput({ className = 'field', what = 'password', ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { what?: string }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={shown ? 'text' : 'password'} className={`${className} pr-10`} />
      <button type="button" onClick={() => setShown((v) => !v)} aria-label={`${shown ? 'Hide' : 'Show'} ${what}`} aria-pressed={shown}
        className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-[10px] text-txt-3 hover:text-txt">
        <Icon name={shown ? 'eye-off' : 'eye'} size={16} />
      </button>
    </div>
  );
}
