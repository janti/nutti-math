export default function Progress({ value }: { value: number }) {
  return (
    <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.floor(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-nutti-primary transition-all" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  )
}
