import type { RegChange, Rulebook, RulebookCalendar } from '@/api/types';

export const rulebook: Rulebook = {
  version: 'Rulebook v3.0', set: 70, proposed: 55, tbd: 21, versionStatus: 'provisional',
  note: 'Some rules are not yet confirmed by a lawyer. Proposed values run and results are marked provisional; TBD rules are never scored.',
  settings: [
    { key: 'optout_deadline_business_days', value: '10', owner: 'Counsel', status: 'proposed', counselItem: 'A1' },
    { key: 'optout_keywords', value: 'STOP, QUIT, END, REVOKE, OPT OUT, CANCEL, UNSUBSCRIBE', owner: 'Counsel', status: 'proposed', counselItem: 'A3' },
    { key: 'optout_scope_rules', value: 'Awaiting publication of the FCC order adopted 30 Sep 2026', owner: 'Counsel', status: 'tbd', counselItem: 'A5' },
    { key: 'calling_hours', value: 'Not set yet', owner: 'Counsel', status: 'tbd', counselItem: 'A6' },
    { key: 'calling_hours', place: 'FL', value: 'Not set yet', owner: 'Counsel', status: 'tbd', counselItem: 'A6' },
    { key: 'frequency_limits', value: 'State table pending', owner: 'Counsel', status: 'tbd', counselItem: 'A7' },
    { key: 'autodialed_modes', value: 'Strict and lenient readings under test', owner: 'Counsel', status: 'tbd', counselItem: 'A12' },
    { key: 'ebr_purchase_months / ebr_inquiry_months', value: '18 / 3', owner: 'Counsel', status: 'proposed', counselItem: 'A9' },
    { key: 'written_consent_types', value: 'Web certificate, signed form, IVR or keypress with disclosures', owner: 'Counsel', status: 'proposed', counselItem: 'B1' },
    { key: 'dnc_check_max_age_days', value: '31', owner: 'Counsel', status: 'proposed', counselItem: 'A14' },
    { key: 'clock_skew_seconds', value: '120', owner: 'Engineering', status: 'set', counselItem: null },
    { key: 'grade_bands', value: '90 / 80 / 70 / 60', owner: 'Product', status: 'set', counselItem: null },
    { key: 'hard_cap_share', value: 'Not set yet', owner: 'Product', status: 'tbd', counselItem: 'D8' },
    { key: 'ai_accuracy_pass_mark', value: '95 %', owner: 'Product', status: 'proposed', counselItem: 'D9' },
    { key: 'business_day_calendar', value: 'Mon–Fri except US federal holidays, in the recipient time zone', owner: 'Counsel', status: 'proposed', counselItem: null },
  ],
  impact: [
    { key: 'autodialed_modes', counselItem: 'A12', strict: 'Every mode except manual', lenient: 'Only prerecorded or AI voice', contacts: 48210, changing: 6120 },
    { key: 'sms_treated_as_autodialed', counselItem: 'A17', strict: 'Yes', lenient: 'No', contacts: 48210, changing: 3340 },
    { key: 'seller_absent_effect', counselItem: 'B7', strict: 'NO_PROOF', lenient: 'WEAK', contacts: 48210, changing: 940 },
    { key: 'optout_grace_business_days', counselItem: 'A4', strict: '0', lenient: '10', contacts: 48210, changing: 212 },
  ],
};

export const regChanges: RegChange[] = [
  { id: 'rc-1', title: 'FCC adopts a new order on revoking consent', jurisdiction: 'Federal · FCC', status: 'adopted', date: '2026-09-30', effective: '30 days after publication in the Federal Register (not yet published)', summary: 'A caller may treat an opt-out as applying only to the category of informational messages it was aimed at, and may designate an exclusive opt-out method. A follow-up proposal asks about shortening the 10-business-day deadline.', settings: ['optout_scope_rules', 'optout_deadline_business_days'], metrics: ['M08', 'M09', 'M10'], domains: ['REV', 'SMS'], confirmed: false, source: 'FCC open meeting, 30 Sep 2026' },
  { id: 'rc-2', title: 'Seventh Circuit: a text is not a “telephone call” for private do-not-call suits', jurisdiction: 'Federal · 7th Circuit', status: 'court ruling', date: '2026-07-14', effective: 'In force in that circuit', summary: 'In Steidinger v. Blackstone Medical Services the court held that texts fall outside the private do-not-call claim. Other courts differ, so results depend on the forum.', settings: [], metrics: ['M13'], domains: ['NDN', 'SDN', 'SMS'], confirmed: true, source: 'Seventh Circuit opinion, 14 Jul 2026' },
  { id: 'rc-3', title: 'Oregon extends its telemarketing law to texts', jurisdiction: 'Oregon', status: 'in force', date: '2026-01-01', effective: '1 Jan 2026', summary: 'Solicitations are limited to 8am–8pm and to three in 24 hours, and texts are covered.', settings: ['calling_hours', 'frequency_limits'], metrics: ['M16', 'M17'], domains: [], confirmed: true, source: 'Oregon HB 3865', checkedByCounsel: false,
    updates: [{ id: 'ru-1', rule: 'calling_hours', isNewRule: false, meaning: null, place: 'OR', value: '8am – 8pm', startsOn: '2026-01-01', state: 'draft', myReview: null }] },
  { id: 'rc-4', title: 'Texas treats texts as telephone solicitation', jurisdiction: 'Texas', status: 'in force', date: '2025-09-01', effective: '1 Sep 2025', summary: 'Texts are now covered, sellers must register, and private suits are allowed.', settings: ['calling_hours', 'state_consent_rule'], metrics: ['M16'], domains: ['CTF', 'SMS', 'PLT'], confirmed: true, source: 'Texas SB 140' },
];

// Calendar & hours tab. Draft values for TBD rules are shown as "not set yet" with the draft beside them.
const HOLIDAYS_2026: [string, string, string][] = [
  ['2026-01-01', "New Year's Day", '2026-01-01'], ['2026-01-19', 'Martin Luther King Jr. Day', '2026-01-19'],
  ['2026-02-16', "Washington's Birthday", '2026-02-16'], ['2026-05-25', 'Memorial Day', '2026-05-25'], ['2026-06-19', 'Juneteenth', '2026-06-19'],
  ['2026-07-03', 'Independence Day', '2026-07-04'], ['2026-09-07', 'Labor Day', '2026-09-07'], ['2026-10-12', 'Columbus Day', '2026-10-12'],
  ['2026-11-11', 'Veterans Day', '2026-11-11'], ['2026-11-26', 'Thanksgiving Day', '2026-11-26'], ['2026-12-25', 'Christmas Day', '2026-12-25'],
];

export const calendar: RulebookCalendar = {
  year: 2026,
  holidays: HOLIDAYS_2026.map(([date, name, actual]) => ({ date, name, actual })),
  nextHoliday: { date: '2026-10-12', name: 'Columbus Day' },
  businessDays: { value: null, shown: 'Monday to Friday, except US federal holidays, in the time zone of the person contacted', status: 'proposed', counselItem: null },
  callingHours: [
    { place: 'Federal', value: '8am – 9pm', status: 'tbd', counselItem: 'A6' }, { place: 'CT', value: '9am – 8pm', status: 'tbd', counselItem: 'A6' },
    { place: 'FL', value: '8am – 8pm', status: 'tbd', counselItem: 'A6' }, { place: 'MD', value: '8am – 8pm', status: 'tbd', counselItem: 'A6' },
    { place: 'OK', value: '8am – 8pm', status: 'tbd', counselItem: 'A6' }, { place: 'TX', value: '8am – 9pm; Sunday from 12pm', status: 'tbd', counselItem: 'A6' },
  ],
  smsFollowsCallingHours: { value: null, shown: 'Not set yet', status: 'tbd', counselItem: 'B4' },
  frequencyLimits: [
    { place: 'Federal', value: null, status: 'tbd', counselItem: 'A7' },
    ...['FL', 'MD', 'OK'].map((place) => ({ place, value: '3 per 24 hours per person, solicitations only', status: 'tbd' as const, counselItem: 'A7' })),
  ],
  restrictedHolidays: { value: null, shown: 'Not set yet', status: 'tbd', counselItem: 'A8' },
  optOut: {
    deadlineDays: { value: 10, shown: '10', status: 'proposed', counselItem: 'A1' },
    confirmationMinutes: { value: 5, shown: '5', status: 'proposed', counselItem: 'A2' },
    keywords: { value: ['STOP', 'QUIT', 'END', 'REVOKE', 'OPT OUT', 'OPTOUT', 'CANCEL', 'UNSUBSCRIBE'], shown: 'STOP, QUIT, END, REVOKE, OPT OUT, OPTOUT, CANCEL, UNSUBSCRIBE', status: 'proposed', counselItem: 'A3' },
  },
  timeZone: { order: ['ZIP code of the person contacted', 'Area code of the number', 'New York time (the earliest deadline)'], status: 'proposed' },
};
