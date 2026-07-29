export const PRIORITES = [
  { value: 'FAIBLE', label: 'Faible' },
  { value: 'NORMALE', label: 'Normale' },
  { value: 'URGENTE', label: 'Urgente' },
  { value: 'CRITIQUE', label: 'Critique' },
];

export const prioriteLabel = (value) =>
  PRIORITES.find((p) => p.value === value)?.label || value;

const PRIORITE_STYLES = {
  FAIBLE: { dot: '#6b7280', bg: '#eceef2', fg: '#4b5563' },
  NORMALE: { dot: '#2f7dd1', bg: '#e3edfa', fg: '#2660a4' },
  URGENTE: { dot: '#e07b00', bg: '#fdecd8', fg: '#b5610a' },
  CRITIQUE: { dot: '#d1263b', bg: '#fbe0e3', fg: '#b01d30' },
};

export const prioriteStyle = (value) => PRIORITE_STYLES[value] || PRIORITE_STYLES.NORMALE;
