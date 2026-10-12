export function ModulePlaceholder({ label, phase }: { label: string; phase: string }) {
  return (
    <>
      <h1>{label}</h1>
      <p className="muted">Ce module arrive en {phase}.</p>
    </>
  )
}
