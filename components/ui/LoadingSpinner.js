export default function LoadingSpinner({
  size = 'md',
  message = 'Loading...',
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex flex-col items-center justify-center p-6 gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-blue-600 border-t-transparent ${currentSize}`}
        role="status"
        aria-label="loading"
      />
      {message && (
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
