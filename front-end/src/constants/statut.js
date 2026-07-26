export const STATUTS = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
  { value: 'ANNULEE', label: 'Annulée' },
];

export const statutLabel = (value) =>
  STATUTS.find((s) => s.value === value)?.label || value;

const STATUT_STYLES = {
  EN_ATTENTE: { dot: '#6b7280', bg: '#eceef2', fg: '#4b5563' },
  EN_COURS: { dot: '#b5790a', bg: '#fdf0d8', fg: '#8a5c07' },
  TERMINEE: { dot: '#0ca30c', bg: '#e5f6e3', fg: '#0ca30c' },
  ANNULEE: { dot: '#c23b3b', bg: '#fbe7e6', fg: '#c23b3b' },
};

export const statutStyle = (value) => STATUT_STYLES[value] || STATUT_STYLES.EN_ATTENTE;
