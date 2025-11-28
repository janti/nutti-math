export type Fact = { a: number; b: number }

// Acorn scoring system - calculates acorns earned based on performance
export function calculateAcorns(correct: number, total: number, averageMs: number): number {
  const accuracy = correct / total
  const avgSeconds = averageMs / 1000

  // Always give at least 1 acorn for participation
  if (correct === 0) return 1
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
export function calculateTotalAcorns(rounds: Array<{ correct: number, total: number, avgMs: number }>): number {
  return rounds.reduce((sum, round) => sum + calculateAcorns(round.correct, round.total, round.avgMs), 0)
}

export function factPool(range: '1-5' | '1-10' | '6-10' | '1-12' | '2-12' | 'mix' | '1-10-add' | '1-20-add' | '1-50-add' | '50-100-add' | '1-100-add' | 'mix-add', gameType: 'multiplication' | 'addition' = 'multiplication'): Fact[] {
  if (gameType === 'addition') {
    return additionFactPool(range)
  }
  
  let start: number, end: number

  switch (range) {
    case '1-5':
      start = 1; end = 5; break
    case '1-10':
      start = 1; end = 10; break
    case '6-10':
      start = 6; end = 10; break
    case '1-12':
      start = 1; end = 12; break
    case '2-12':
      start = 2; end = 12; break
    case 'mix':
      start = 1; end = 12; break
    default:
      start = 2; end = 12; break
  }

  const pool: Fact[] = []
  for (let a = start; a <= end; a++) for (let b = start; b <= end; b++) pool.push({ a, b })
  return pool
}

function additionFactPool(range: string): Fact[] {
  const pool: Fact[] = []
  
  switch (range) {
    case '1-10-add':
      // Generate addition facts with results 1-10
      for (let result = 1; result <= 10; result++) {
        for (let a = 1; a <= Math.min(result, 10); a++) {
          const b = result - a
          if (b >= 1 && b <= 10) {
            pool.push({ a, b })
          }
        }
      }
      break
    case '1-20-add':
      // Generate addition facts with results 1-20
      for (let result = 1; result <= 20; result++) {
        for (let a = 1; a <= Math.min(result, 20); a++) {
          const b = result - a
          if (b >= 1 && b <= 20) {
            pool.push({ a, b })
          }
        }
      }
      break
    case '1-50-add':
      // Generate addition facts with results 1-50
      for (let result = 1; result <= 50; result++) {
        for (let a = 1; a <= Math.min(result, 25); a++) {
          const b = result - a
          if (b >= 1 && b <= 25) {
            pool.push({ a, b })
          }
        }
      }
      break
    case '50-100-add':
      // Generate addition facts with results 50-100
      for (let result = 50; result <= 100; result++) {
        for (let a = 25; a <= Math.min(result, 75); a++) {
          const b = result - a
          if (b >= 25 && b <= 75) {
            pool.push({ a, b })
          }
        }
      }
      break
    case '1-100-add':
      // Generate addition facts with results 1-100
      for (let result = 1; result <= 100; result++) {
        for (let a = 1; a <= Math.min(result, 50); a++) {
          const b = result - a
          if (b >= 1 && b <= 50) {
            pool.push({ a, b })
          }
        }
      }
      break
    case 'mix-add':
      // Generate a mix of all addition ranges
      // Include facts from 1-10 range
      for (let result = 1; result <= 10; result++) {
        for (let a = 1; a <= Math.min(result, 10); a++) {
          const b = result - a
          if (b >= 1 && b <= 10) {
            pool.push({ a, b })
          }
        }
      }
      // Include some facts from 1-20 range
      for (let result = 11; result <= 20; result++) {
        for (let a = 1; a <= Math.min(result, 20); a++) {
          const b = result - a
          if (b >= 1 && b <= 20 && Math.random() < 0.5) { // 50% chance to include
            pool.push({ a, b })
          }
        }
      }
      // Include some facts from 1-50 range
      for (let result = 21; result <= 50; result++) {
        for (let a = 1; a <= Math.min(result, 25); a++) {
          const b = result - a
          if (b >= 1 && b <= 25 && Math.random() < 0.3) { // 30% chance to include
            pool.push({ a, b })
          }
        }
      }
      // Include some facts from 50-100 range
      for (let result = 50; result <= 100; result++) {
        for (let a = 25; a <= Math.min(result, 75); a++) {
          const b = result - a
          if (b >= 25 && b <= 75 && Math.random() < 0.2) { // 20% chance to include
            pool.push({ a, b })
          }
        }
      }
      break
    default:
      // Default to 1-10 for unknown ranges
      for (let result = 1; result <= 10; result++) {
        for (let a = 1; a <= Math.min(result, 10); a++) {
          const b = result - a
          if (b >= 1 && b <= 10) {
            pool.push({ a, b })
          }
        }
      }
      break
  }
  
  return pool
}
export const shuffle = <T,>(arr: T[]) => arr.map(v => [Math.random(), v] as const).sort((a, b) => a[0] - b[0]).map(x => x[1])
export const pickFacts = (pool: Fact[], n: number) => {
  const result = shuffle(pool).slice(0, n)
  console.log('pickFacts: Requested', n, 'facts, returning', result.length, 'facts')
  return result
}
