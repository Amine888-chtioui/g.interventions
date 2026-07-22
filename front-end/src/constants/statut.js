export const STATUTS = [
  { value: 'EN_ATTENTE', label: 'En attente', color: 'secondary' },
  { value: 'EN_COURS', label: 'En cours', color: 'warning' },
  { value: 'TERMINEE', label: 'Terminée', color: 'success' },
  { value: 'ANNULEE', label: 'Annulée', color: 'danger' },
];

export const statutLabel = (value) =>
  STATUTS.find((s) => s.value === value)?.label || value;

export const statutColor = (value) =>
  STATUTS.find((s) => s.value === value)?.color || 'secondary';
