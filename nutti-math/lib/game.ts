export type Fact = { a:number; b:number }
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
