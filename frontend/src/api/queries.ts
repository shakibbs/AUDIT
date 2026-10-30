// One hook per endpoint. Screens never call fetch directly.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiSend } from './client';
import type {
  BuyerLink, RatingEngine, VendorContract, VendorDisputes, AccessEntry, Action, DataHealth, Alert, Insured, LitigationStats, Conduct, ConsentPage, ConsentSummary, Contact, Domain, EvidenceFile, HashCheck, Leads, LegalHold,
  Metric, Position, Readiness, RegChange, ReportRun, ReportType, Revocation, Rulebook, ScoreSummary, SearchHit, Session, Settings,
  Source, Upload, User, VaultStats, VendorSummary, WhoContact, RulebookCalendar, CanCall, OptOut, Certificate, ProvenancePage, ProofRequests,
} from './types';

type Query = Record<string, string | undefined>;

function useGet<T>(path: string, query: Query = {}, enabled = true) {
  return useQuery({ queryKey: [path, query], queryFn: () => apiGet<T>(path, query), enabled });
}

// While a re-run after an upload is on its way, the session is asked again every 15 seconds.
export const useSession = () => useQuery({ queryKey: ['/session'], queryFn: () => apiGet<Session>('/session'),
  refetchInterval: (query) => (query.state.data?.updating ? 15_000 : false) });
export const useScore = (period?: string) => useGet<ScoreSummary>('/score', { period });
export const useDomains = (period?: string) => useGet<Domain[]>('/domains', { period });
/** The findings of the chosen month (all of them without one: the sidebar count and a finding's own drawer). */
export const useActions = (enabled = true, period?: string) => useGet<Action[]>('/actions', { period }, enabled);
/** The alerts of the chosen month (all of them without one: the sidebar count). */
export const useAlerts = (enabled = true, period?: string) => useGet<Alert[]>('/alerts', { period }, enabled);
export const useContacts = (status: string, q: string, period?: string) => useGet<Contact[]>('/contacts', { status, q, period });
export const useConsent = (period?: string) => useGet<ConsentSummary>('/consent', { period });
export const useContact = (id: string) => useGet<Contact>(`/contacts/${encodeURIComponent(id)}`);
export const useConsentPages = (period?: string) => useGet<ConsentPage[]>('/consent-pages', { period });
export const useCertificates = (period?: string) => useGet<Certificate[]>('/certificates', { period });
export const useRevocation = (period?: string) => useGet<Revocation>('/revocation', { period });
export const useWhoContact = (period?: string) => useGet<WhoContact>('/who-contact', { period });
export const useVault = (period?: string) => useGet<VaultStats>('/vault', { period });
export const usePosition = (phone: string, date: string) => useGet<Position>('/position', { phone, date }, Boolean(phone && date));
export const useHashCheck = (hash: string) => useGet<HashCheck>('/hash-check', { hash }, hash.length > 0);
export const useLegalHolds = () => useGet<LegalHold[]>('/legal-holds');
export const useEvidenceFile = (phone: string) => useGet<EvidenceFile>(`/evidence/${encodeURIComponent(phone)}`);
export const useMetrics = (period?: string) => useGet<Metric[]>('/metrics', { period });
export const useConduct = (period?: string) => useGet<Conduct>('/conduct', { period });
export const useLeads = (period?: string) => useGet<Leads>('/leads', { period });
export const useProvenance = (period?: string) => useGet<ProvenancePage>('/provenance', { period });
export const useProofRequests = (period?: string) => useGet<ProofRequests>('/proof-requests', { period });
/** Module 12: a vendor's dispute candidates (only when the vendor came from the backend). */
export const useDisputes = (vendor: string, enabled: boolean) => useGet<VendorDisputes>('/vendor-disputes', { vendor }, enabled);
/** Module 12: every vendor contract the company uploaded. */
/** Module 15: who the company shares its attestation with. */
export const useRatingEngine = (enabled = true) => useGet<RatingEngine>('/rating-engine', {}, enabled);
export const useBuyerLinks = () => useGet<{ links: BuyerLink[] }>('/buyer-links');
export const useVendorContracts = () => useGet<VendorContract[]>('/vendor-contracts');
export const useVendors = (period?: string) => useGet<VendorSummary>('/vendors', { period });
/** With a month: each row also says how much it gave CiV then (the top bar's freshness asks without one). */
export const useSources = (period?: string) => useGet<Source[]>('/sources', { period });
export const useUploads = (period?: string) => useGet<Upload[]>('/uploads', { period });
export const useReports = () => useGet<{ types: ReportType[]; runs: ReportRun[] }>('/reports');
export const useRulebook = (period?: string) => useGet<Rulebook>('/rulebook', { period });
export const useRulebookCalendar = (year: number) => useGet<RulebookCalendar>('/rulebook/calendar', { year: String(year) });
export const useOptOuts = (period?: string) => useGet<OptOut[]>('/optouts', { period });
export const useRegChanges = (period?: string) => useGet<RegChange[]>('/reg-changes', { period });
export const useReadiness = () => useGet<Readiness>('/readiness');
export const useSettings = () => useGet<Settings>('/settings');
export const useUsers = () => useGet<User[]>('/users');
export const useAccessLog = () => useGet<AccessEntry[]>('/access-log');
export const useHealth = () => useGet<DataHealth>('/data-health');
// Insurer pages always ask afresh (on opening and when the tab comes back), so a company that stopped sharing
// disappears at once instead of after the usual 30 seconds.
const FRESH = { staleTime: 0, refetchOnWindowFocus: true } as const;
/** With a month (the month picker; an insurer only gets months from when each company started sharing): that month's sheets. */
export const useInsureds = (enabled = true, period?: string) => useQuery({ queryKey: ['/insureds', { period }], queryFn: () => apiGet<Insured[]>('/insureds', { period }), enabled, ...FRESH });
export const useInsured = (id: string, enabled = true, period?: string) => useQuery({ queryKey: [`/insureds/${id}`, { period }], queryFn: () => apiGet<Insured>(`/insureds/${id}`, { period }), enabled, ...FRESH });
export const useLitigation = () => useGet<LitigationStats>('/litigation');
export const useSearch = (q: string) => useGet<SearchHit[]>('/search', { q }, q.trim().length >= 2);

export interface SendArgs { method: 'POST' | 'PATCH' | 'DELETE'; path: string; body?: unknown }

/** Sends a change, then refetches every query so each screen shows the new state. */
export function useSend<T = unknown>() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ method, path, body }: SendArgs) => apiSend<T>(method, path, body),
    onSuccess: () => client.invalidateQueries(),
  });
}

/** "Can I call now?": asks the backend once; the typed number is not stored, and nothing else is refreshed. */
export function useCanCall() {
  return useMutation({ mutationFn: (number: string) => apiSend<CanCall>('POST', '/can-call', { number }) });
}
