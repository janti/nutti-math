export default function Progress({ value }: { value:number }) {
  return (
    <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.floor(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-nutti-orange transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}
