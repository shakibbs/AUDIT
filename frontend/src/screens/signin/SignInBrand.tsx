import { DISCLOSURE } from '@/api/types';

/** Left panel of the sign-in page. */
export function SignInBrand() {
  return (
    <div className="hidden flex-col justify-between p-12 text-white lg:flex" style={{ background: 'linear-gradient(160deg, #0e1a21, #0a2428 60%, #0e4a45)' }}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-[10px] font-display text-[14px] font-extrabold" style={{ background: 'linear-gradient(135deg, #13b5a2, #0e8c7f)' }}>iV</span>
        <span className="font-display text-[17px] font-bold">Comply iV</span>
      </div>
      <div>
        <h1 className="max-w-md text-[34px] leading-tight">Know where your calling and texting records stand.</h1>
        <p className="mt-4 max-w-md text-[14px] text-[#b9cccd]">Every contact measured, every record fingerprinted and kept, every finding traced to its source.</p>
      </div>
      <p className="max-w-md text-[11.5px] leading-relaxed text-[#7f9a9c]">{DISCLOSURE} Comply iV is not a law firm.</p>
    </div>
  );
}
