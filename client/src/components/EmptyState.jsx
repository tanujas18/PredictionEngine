export default function EmptyState({ message = 'No results found', icon = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 dark:text-slate-400">
      {icon && <div className="mb-3 text-4xl">{icon}</div>}
      <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">{message}</p>
      <p className="text-sm">Try adjusting your filters or search terms</p>
    </div>
  )
}