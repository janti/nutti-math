export type Fact = { a:number; b:number }

// Acorn scoring system - calculates acorns earned based on performance
export function calculateAcorns(correct: number, total: number, averageMs: number): number {
  const accuracy = correct / total
  const avgSeconds = averageMs / 1000
  
  // Always give at least 1 acorn for participation
  if (correct === 0) return 1
  
  // Perfect performance (10/10) with good speed gets 5 acorns
  if (accuracy === 1.0) {
    if (avgSeconds <= 3) return 5      // Very fast
    if (avgSeconds <= 5) return 4      // Fast
    return 3                           // Slow but perfect
  }
  
  // Scale acorns based on accuracy (2-4 acorns)
  if (accuracy >= 0.8) return 4       // 8-9 correct
  if (accuracy >= 0.6) return 3       // 6-7 correct  
  if (accuracy >= 0.4) return 2       // 4-5 correct
  
  return 1  // Less than 40% accuracy gets 1 acorn
}

// Calculate total acorns from all rounds
export function calculateTotalAcorns(rounds: Array<{correct: number, total: number, avgMs: number}>): number {
  return rounds.reduce((sum, round) => sum + calculateAcorns(round.correct, round.total, round.avgMs), 0)
}

export function factPool(range:'1-5'|'1-10'|'6-10'|'2-12'|'mix'): Fact[] {
  let start: number, end: number
  
  switch(range) {
    case '1-5':
      start = 1; end = 5; break
    case '1-10':
      start = 1; end = 10; break
    case '6-10':
      start = 6; end = 10; break
    case '2-12':
      start = 2; end = 12; break
    case 'mix':
      start = 1; end = 12; break
    default:
      start = 2; end = 12; break
  }
  
  const pool: Fact[] = []
  for (let a=start; a<=end; a++) for (let b=start; b<=end; b++) pool.push({a,b})
  return pool
}
export const shuffle = <T,>(arr:T[]) => arr.map(v=>[Math.random(),v] as const).sort((a,b)=>a[0]-b[0]).map(x=>x[1])
export const pickFacts = (pool:Fact[], n:number) => {
  const result = shuffle(pool).slice(0,n)
  console.log('pickFacts: Requested', n, 'facts, returning', result.length, 'facts')
  return result
}
