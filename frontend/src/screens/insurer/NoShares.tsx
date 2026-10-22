/** An insurer or acquirer that no company shares with yet: a calm note instead of error boxes. */
export function NoShares() {
  return (
    <div className="card card-pad text-center">
      <h2 className="m-0 text-[17px]">No company shares with you yet</h2>
      <p className="mb-0 mt-2 text-[13px] text-txt-2">When a client shares its risk attestation with you, it appears here.</p>
    </div>
  );
}
