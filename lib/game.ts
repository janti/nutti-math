export type Fact = { a: number; b: number }

// Extended fact type for equations with variables
export type EquationFact = { 
  a: number; 
  b: number; 
  c?: number; // Third number for hard difficulty (optional)
  result: number;
  operation: 'addition' | 'multiplication' | 'subtraction' | 'division';
  missingValue: 'a' | 'b' | 'c'; // Only left side variables, never result
  variableIcon: string; // fruit emoji like 🍎, 🍊, 🍌
}

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

// Special acorn calculation for equations (more generous with time)
export function calculateAcornsForEquations(correct: number, total: number, averageMs: number): number {
  const accuracy = correct / total
  const avgSeconds = averageMs / 1000

  // Always give at least 1 acorn for participation
  if (correct === 0) return 1
  if (accuracy === 1.0) {
    if (avgSeconds <= 8) return 5      // Fast (more generous: 8s vs 3s)
    if (avgSeconds <= 15) return 4     // Medium (more generous: 15s vs 5s)
    return 3                           // Slow but perfect (no time limit)
  }

  // Scale acorns based on accuracy (2-4 acorns) - same accuracy requirements
  if (accuracy >= 0.8) return 4       // 8-9 correct
  if (accuracy >= 0.6) return 3       // 6-7 correct  
  if (accuracy >= 0.4) return 2       // 4-5 correct

  return 1  // Less than 40% accuracy gets 1 acorn
}

// Calculate total acorns from all rounds
export function calculateTotalAcorns(rounds: Array<{ correct: number, total: number, avgMs: number }>): number {
  return rounds.reduce((sum, round) => sum + calculateAcorns(round.correct, round.total, round.avgMs), 0)
}

export function factPool(range: '1-5' | '1-10' | '6-10' | '1-12' | '2-12' | 'mix' | '1-10-add' | '1-20-add' | '1-50-add' | '50-100-add' | '1-100-add' | 'mix-add' | '1-10-sub' | '1-20-sub' | '1-50-sub' | '50-100-sub' | '1-100-sub' | 'mix-sub' | 'equations-easy' | 'equations-medium' | 'equations-hard' | '1-5-div' | '1-10-div' | '1-12-div' | 'mix-div', gameType: 'multiplication' | 'addition' | 'subtraction' | 'equations' | 'division' = 'multiplication'): Fact[] {
  if (gameType === 'addition') {
    return additionFactPool(range)
  }
  
  if (gameType === 'subtraction') {
    return subtractionFactPool(range)
  }
  
  if (gameType === 'division') {
    return divisionFactPool(range)
  }
  
  // For equations, we still return Fact[] but they should be converted to EquationFact[] elsewhere
  if (gameType === 'equations' || range.startsWith('equations-')) {
    // Return empty array - equations will be generated separately
    return []
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

function divisionFactPool(range: string): Fact[] {
  const pool: Fact[] = []
  
  switch (range) {
    case '1-5-div':
      // Generate division facts with divisors 1-5 and results 1-5
      for (let b = 1; b <= 5; b++) {
        for (let result = 1; result <= 5; result++) {
          const a = b * result // Ensure exact division
          pool.push({ a, b })
        }
      }
      break
    case '1-10-div':
      // Generate division facts with divisors 1-10 and results 1-10
      for (let b = 1; b <= 10; b++) {
        for (let result = 1; result <= 10; result++) {
          const a = b * result
          pool.push({ a, b })
        }
      }
      break
    case '1-12-div':
      // Generate division facts with divisors 1-12 and results 1-12
      for (let b = 1; b <= 12; b++) {
        for (let result = 1; result <= 12; result++) {
          const a = b * result
          pool.push({ a, b })
        }
      }
      break
    case 'mix-div':
      // Generate a mix of division facts
      // Include facts from 1-5 range
      for (let b = 1; b <= 5; b++) {
        for (let result = 1; result <= 5; result++) {
          const a = b * result
          pool.push({ a, b })
        }
      }
      // Include some facts from 1-10 range
      for (let b = 1; b <= 10; b++) {
        for (let result = 1; result <= 10; result++) {
          const a = b * result
          if (Math.random() < 0.7) { // 70% chance to include
            pool.push({ a, b })
          }
        }
      }
      // Include some facts from 1-12 range  
      for (let b = 1; b <= 12; b++) {
        for (let result = 1; result <= 12; result++) {
          const a = b * result
          if (Math.random() < 0.3) { // 30% chance to include
            pool.push({ a, b })
          }
        }
      }
      break
    default:
      // Default to 1-5 for unknown ranges
      for (let b = 1; b <= 5; b++) {
        for (let result = 1; result <= 5; result++) {
          const a = b * result
          pool.push({ a, b })
        }
      }
      break
  }
  
  return pool
}

function subtractionFactPool(range: string): Fact[] {
  const pool: Fact[] = []
  
  switch (range) {
    case '1-10-sub':
      // Generate subtraction facts where minuend is 1-10, subtrahend is 1-10, and result is positive
      for (let a = 1; a <= 10; a++) {
        for (let b = 1; b <= Math.min(a, 10); b++) {
          if (a - b >= 0) { // Ensure non-negative result
            pool.push({ a, b })
          }
        }
      }
      break
    case '1-20-sub':
      // Generate subtraction facts where minuend is 1-20, subtrahend is 1-20, and result is positive
      for (let a = 1; a <= 20; a++) {
        for (let b = 1; b <= Math.min(a, 20); b++) {
          if (a - b >= 0) {
            pool.push({ a, b })
          }
        }
      }
      break
    case '1-50-sub':
      // Generate subtraction facts where minuend is 1-50, subtrahend is 1-25, and result is positive
      for (let a = 1; a <= 50; a++) {
        for (let b = 1; b <= Math.min(a, 25); b++) {
          if (a - b >= 0) {
            pool.push({ a, b })
          }
        }
      }
      break
    case '50-100-sub':
      // Generate subtraction facts where minuend is 50-100, subtrahend is 25-50, and result is positive
      for (let a = 50; a <= 100; a++) {
        for (let b = 25; b <= Math.min(a, 50); b++) {
          if (a - b >= 0) {
            pool.push({ a, b })
          }
        }
      }
      break
    case '1-100-sub':
      // Generate subtraction facts where minuend is 1-100, subtrahend is 1-50, and result is positive
      for (let a = 1; a <= 100; a++) {
        for (let b = 1; b <= Math.min(a, 50); b++) {
          if (a - b >= 0) {
            pool.push({ a, b })
          }
        }
      }
      break
    case 'mix-sub':
      // Generate a mix of all subtraction ranges
      // Include facts from 1-10 range
      for (let a = 1; a <= 10; a++) {
        for (let b = 1; b <= Math.min(a, 10); b++) {
          if (a - b >= 0) {
            pool.push({ a, b })
          }
        }
      }
      // Include some facts from 1-20 range
      for (let a = 11; a <= 20; a++) {
        for (let b = 1; b <= Math.min(a, 20); b++) {
          if (a - b >= 0 && Math.random() < 0.5) { // 50% chance to include
            pool.push({ a, b })
          }
        }
      }
      // Include some facts from 1-50 range
      for (let a = 21; a <= 50; a++) {
        for (let b = 1; b <= Math.min(a, 25); b++) {
          if (a - b >= 0 && Math.random() < 0.3) { // 30% chance to include
            pool.push({ a, b })
          }
        }
      }
      // Include some facts from 50-100 range
      for (let a = 50; a <= 100; a++) {
        for (let b = 25; b <= Math.min(a, 50); b++) {
          if (a - b >= 0 && Math.random() < 0.2) { // 20% chance to include
            pool.push({ a, b })
          }
        }
      }
      break
    default:
      // Default to 1-10 for unknown ranges
      for (let a = 1; a <= 10; a++) {
        for (let b = 1; b <= Math.min(a, 10); b++) {
          if (a - b >= 0) {
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

// Fruit icons for equation variables
const fruitIcons = ['🍎', '🍊', '🍌', '🍇', '🍓', '🍒', '🥝', '🍑', '🥭', '🍍']

// Generate equation-based problems with missing values (only on left side)
export function generateEquationFacts(difficulty: 'easy' | 'medium' | 'hard', count: number = 10): EquationFact[] {
  console.log('generateEquationFacts called with:', { difficulty, count })
  const facts: EquationFact[] = []
  
  for (let i = 0; i < count; i++) {
    // Choose random operation (all 4 types)
    const operations: Array<'addition' | 'multiplication' | 'subtraction' | 'division'> = 
      ['addition', 'multiplication', 'subtraction', 'division']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    // Only allow missing values on left side (a or b, or c for hard difficulty)
    const missingOptions: Array<'a' | 'b'> = ['a', 'b']
    let missingValue: 'a' | 'b' | 'c' = missingOptions[Math.floor(Math.random() * missingOptions.length)]
    const variableIcon = fruitIcons[Math.floor(Math.random() * fruitIcons.length)]
    
    let a: number, b: number, result: number
    
    if (difficulty === 'easy') {
      if (operation === 'addition') {
        // Easy addition: ? + 1-10 = result (1-20)
        b = Math.floor(Math.random() * 10) + 1
        result = Math.floor(Math.random() * 10) + b + 1 // Ensure result > b
        a = result - b
      } else if (operation === 'multiplication') {
        // Easy multiplication: ? × 1-5 = result
        b = Math.floor(Math.random() * 5) + 1
        a = Math.floor(Math.random() * 5) + 1
        result = a * b
      } else if (operation === 'subtraction') {
        // Easy subtraction: ? - 1-10 = result (1-10)
        b = Math.floor(Math.random() * 10) + 1
        result = Math.floor(Math.random() * 10) + 1
        a = result + b // Ensure a > b for positive result
      } else { // division
        // Easy division: ? ÷ 1-5 = result (1-5)
        b = Math.floor(Math.random() * 5) + 1
        result = Math.floor(Math.random() * 5) + 1
        a = result * b // Ensure exact division
      }
    } else if (difficulty === 'medium') {
      if (operation === 'addition') {
        // Medium addition: ? + 1-20 = result
        b = Math.floor(Math.random() * 20) + 1
        result = Math.floor(Math.random() * 20) + b + 1
        a = result - b
      } else if (operation === 'multiplication') {
        // Medium multiplication: ? × 1-10 = result
        b = Math.floor(Math.random() * 10) + 1
        a = Math.floor(Math.random() * 10) + 1
        result = a * b
      } else if (operation === 'subtraction') {
        // Medium subtraction: ? - 1-20 = result
        b = Math.floor(Math.random() * 20) + 1
        result = Math.floor(Math.random() * 20) + 1
        a = result + b
      } else { // division
        // Medium division: ? ÷ 1-10 = result
        b = Math.floor(Math.random() * 10) + 1
        result = Math.floor(Math.random() * 10) + 1
        a = result * b
      }
    } else { // hard
      // 50% chance for 3-number equations on hard difficulty
      const useThreeNumbers = Math.random() < 0.5
      
      if (useThreeNumbers && (operation === 'addition' || operation === 'subtraction')) {
        // Three-number equations: a + b + c = result or a - b - c = result
        const missingOptions: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c']
        missingValue = missingOptions[Math.floor(Math.random() * missingOptions.length)] as 'a' | 'b' | 'c'
        
        if (operation === 'addition') {
          // Three-number addition: ? + b + c = result
          b = Math.floor(Math.random() * 20) + 1
          const c = Math.floor(Math.random() * 20) + 1
          result = Math.floor(Math.random() * 30) + b + c + 1
          a = result - b - c
          facts.push({ a, b, c, result, operation, missingValue, variableIcon })
        } else { // subtraction
          // Three-number subtraction: ? - b - c = result
          b = Math.floor(Math.random() * 20) + 1
          const c = Math.floor(Math.random() * 15) + 1
          result = Math.floor(Math.random() * 20) + 1
          a = result + b + c // Ensure positive result
          facts.push({ a, b, c, result, operation, missingValue, variableIcon })
        }
      } else {
        // Regular two-number equations for hard difficulty
        if (operation === 'addition') {
          // Hard addition: ? + 1-50 = result
          b = Math.floor(Math.random() * 50) + 1
          result = Math.floor(Math.random() * 50) + b + 1
          a = result - b
        } else if (operation === 'multiplication') {
          // Hard multiplication: ? × 1-12 = result
          b = Math.floor(Math.random() * 12) + 1
          a = Math.floor(Math.random() * 12) + 1
          result = a * b
        } else if (operation === 'subtraction') {
          // Hard subtraction: ? - 1-50 = result
          b = Math.floor(Math.random() * 50) + 1
          result = Math.floor(Math.random() * 50) + 1
          a = result + b
        } else { // division
          // Hard division: ? ÷ 1-12 = result
          b = Math.floor(Math.random() * 12) + 1
          result = Math.floor(Math.random() * 12) + 1
          a = result * b
        }
        facts.push({ a, b, result, operation, missingValue, variableIcon })
      }
    }
  }
  
  console.log('generateEquationFacts returning:', facts.length, 'facts:', facts)
  return facts
}

// Get the correct answer for an equation fact
export function getEquationAnswer(fact: EquationFact): number {
  switch (fact.missingValue) {
    case 'a':
      if (fact.operation === 'addition') {
        return fact.c ? fact.result - fact.b - fact.c : fact.result - fact.b
      }
      if (fact.operation === 'multiplication') return fact.result / fact.b
      if (fact.operation === 'subtraction') {
        return fact.c ? fact.result + fact.b + fact.c : fact.result + fact.b
      }
      if (fact.operation === 'division') return fact.result * fact.b
      break
    case 'b':
      if (fact.operation === 'addition') {
        return fact.c ? fact.result - fact.a - fact.c : fact.result - fact.a
      }
      if (fact.operation === 'multiplication') return fact.result / fact.a
      if (fact.operation === 'subtraction') {
        return fact.c ? fact.a - fact.result - fact.c : fact.a - fact.result
      }
      if (fact.operation === 'division') return fact.a / fact.result
      break
    case 'c':
      if (fact.operation === 'addition') return fact.result - fact.a - fact.b
      if (fact.operation === 'subtraction') return fact.a - fact.b - fact.result
      break
  }
  return 0
}

// Format equation for display
export function formatEquation(fact: EquationFact): string {
  let op: string
  if (fact.operation === 'addition') op = '+'
  else if (fact.operation === 'multiplication') op = '×'
  else if (fact.operation === 'subtraction') op = '-'
  else op = '÷' // division
  
  if (fact.c) {
    // Three-number equations
    switch (fact.missingValue) {
      case 'a':
        return `${fact.variableIcon} ${op} ${fact.b} ${op} ${fact.c} = ${fact.result}`
      case 'b':
        return `${fact.a} ${op} ${fact.variableIcon} ${op} ${fact.c} = ${fact.result}`
      case 'c':
        return `${fact.a} ${op} ${fact.b} ${op} ${fact.variableIcon} = ${fact.result}`
    }
  } else {
    // Two-number equations
    switch (fact.missingValue) {
      case 'a':
        return `${fact.variableIcon} ${op} ${fact.b} = ${fact.result}`
      case 'b':
        return `${fact.a} ${op} ${fact.variableIcon} = ${fact.result}`
    }
  }
  return '' // Should never reach here
}
