export default function Badge({ status, label, className = '' }) {
  const normalized = (status || '').toLowerCase();

  let styles = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  let dotColor = 'bg-gray-400 dark:bg-gray-400';
  let defaultLabel = 'Unassigned';

  if (normalized === 'assigned') {
    styles = 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200';
    dotColor = 'bg-green-500';
    defaultLabel = 'Assigned';
  } else if (normalized === 'disabled') {
    styles = 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200';
    dotColor = 'bg-red-500';
    defaultLabel = 'Disabled';
  } else if (normalized === 'unassigned') {
    styles = 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    dotColor = 'bg-gray-400';
    defaultLabel = 'Unassigned';
  }

  const text = label || defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {text}
    </span>
  );
}
