export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </span>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {value}
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
