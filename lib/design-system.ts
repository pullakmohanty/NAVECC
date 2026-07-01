// NavECC Design System - single source of truth for all visual tokens

// ── BRAND COLORS ──────────────────────────────────────────────────────────────
export const colors = {
  navy:    '#005EB8',
  teal:    '#085040',
  coral:   '#005EB8',
  amber:   '#085040',
  green:   '#085040',
  purple:  '#005EB8',
  blue:    '#005EB8',
  surface: '#F4F7FA',
  white:   '#FFFFFF',
  muted:   '#212B32',
  border:  '#F0F4F5',
};

// ── ROOT CAUSE COLORS ─────────────────────────────────────────────────────────
export const rootCauseColors: Record<string, string> = {
  'Courier / Traffic':   '#005EB8',
  'Cold Chain':          '#005EB8',
  'Hospital Receiving':  '#085040',
  'Homecare Scheduling': '#085040',
};

// ── SEVERITY / URGENCY BADGE STYLES ──────────────────────────────────────────
export const severityStyles: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  CRITICAL: { bg: '#FDECEA', text: '#005EB8', border: '#f5c4b3', hex: '#005EB8' },
  HIGH:     { bg: '#FFF3E0', text: '#085040', border: '#FAC775', hex: '#085040' },
  MEDIUM:   { bg: '#E6F1FB', text: '#212B32', border: '#212B32', hex: '#005EB8' },
  LOW:      { bg: '#EAF3DE', text: '#212B32', border: '#C0DD97', hex: '#085040' },
};

// ── STATUS BADGE STYLES ───────────────────────────────────────────────────────
export const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  'OPEN':        { bg: '#FFF8E1', text: '#212B32', border: '#FAC775' },
  'IN REVIEW':   { bg: '#E6F1FB', text: '#212B32', border: '#212B32' },
  'RESOLVED':    { bg: '#EAF3DE', text: '#212B32', border: '#C0DD97' },
};

// ── DATA SOURCE PILL STYLES ───────────────────────────────────────────────────
export const dataSourceStyles: Record<string, { bg: string; text: string }> = {
  COURIER: { bg: 'transparent', text: '#212B32' },
  APPT:    { bg: 'transparent', text: '#212B32' },
  NURSE:   { bg: 'transparent', text: '#212B32' },
};

// ── AGENT COLORS ──────────────────────────────────────────────────────────────
export const agentColors: Record<string, string> = {
  'cpxo':          '#005EB8',
  'delivery-ops':  '#085040',
  'clinical-risk': '#005EB8',
  'compliance':    '#085040',
  'engagement':    '#005EB8',
};

// ── RECHARTS SHARED CONFIG ────────────────────────────────────────────────────
export const chartDefaults = {
  fontFamily:   'Inter, system-ui, sans-serif',
  fontSize:     12,
  color:        '#212B32',
  tickColor:    '#212B32',
  gridColor:    '#F0F4F5',
  tooltipStyle: {
    backgroundColor: '#005EB8',
    border:          'none',
    borderRadius:    6,
    fontSize:        12,
    color:           '#FFFFFF',
  },
  tooltipLabelStyle:  { color: '#FFFFFF', fontWeight: 600 },
  tooltipItemStyle:   { color: '#F0F4F5' },
};

// ── BADGE SHARED STYLE ────────────────────────────────────────────────────────
export const badgeBase = {
  fontSize:     10,
  fontWeight:   600,
  padding:      '2px 8px',
  borderRadius: 9999,
  border:       '0.5px solid',
  display:      'inline-block' as const,
};

// ── PILL SHARED STYLE ─────────────────────────────────────────────────────────
export const pillBase = {
  fontSize:     10,
  fontWeight:   600,
  padding:      '1px 6px',
  borderRadius: 4,
  display:      'inline-block' as const,
};

// ── TYPOGRAPHY ────────────────────────────────────────────────────────────────
export const typography = {
  pageTitle:    { fontSize: 18, fontWeight: 500, color: '#005EB8' },
  pageSubtitle: { fontSize: 12, color: '#212B32' },
  sectionLabel: { fontSize: 11, fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#212B32' },
  cardLabel:    { fontSize: 11, fontWeight: 500, color: '#212B32' },
  cardValue:    { fontSize: 24, fontWeight: 500, color: '#005EB8' },
  cardSub:      { fontSize: 11, color: '#212B32' },
  bodyText:     { fontSize: 13, color: '#212B32' },
  mutedText:    { fontSize: 12, color: '#212B32' },
  incidentId:   { fontSize: 12, fontWeight: 500, color: '#085040' },
  tableHeader:  { fontSize: 11, fontWeight: 500, color: '#212B32' },
  tableCell:    { fontSize: 12, color: '#212B32' },
};

// ── CARD STYLES ───────────────────────────────────────────────────────────────
export const cardStyle = {
  backgroundColor: '#FFFFFF',
  border:          '1px solid #F0F4F5',
  borderRadius:    10,
  padding:         '14px 16px',
};

// ── SPACING ───────────────────────────────────────────────────────────────────
export const spacing = {
  pagePadding:    '20px 24px 20px 16px',
  sectionGap:     16,
  cardPadding:    '14px 16px',
  tableCellPad:   '8px 12px',
};
