// Types for game results
export interface GameResult {
  id: string
  nickname: string
  timestamp: number
  range: '1-5'|'1-10'|'6-10'|'2-12'|'mix'
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  hintsUsed: number
  timeSpent: number // in seconds
  facts: FactResult[]
}

export interface FactResult {
  a: number
  b: number
  userAnswer: number
  correctAnswer: number
  isCorrect: boolean
  timeSpent: number
  hintsUsed: number
}

// LocalStorage management
export class GameStorage {
  private static readonly STORAGE_KEY = 'nutti-math-results'
  
  static saveResult(result: GameResult): void {
    try {
      const existing = this.getAllResults()
      existing.push(result)
      
      // Keep only last 1000 results to prevent storage overflow
      const limited = existing.slice(-1000)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited))
    } catch (error) {
      console.error('Failed to save game result:', error)
    }
  }
  
  static getAllResults(): GameResult[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load game results:', error)
      return []
    }
  }
  
  static getResultsByNickname(nickname: string): GameResult[] {
    return this.getAllResults().filter(result => 
      result.nickname.toLowerCase() === nickname.toLowerCase()
    )
  }
  
  static getNicknames(): string[] {
    const results = this.getAllResults()
    const nicknames = [...new Set(results.map(r => r.nickname))]
    return nicknames.sort()
  }
  
  static getStats(nickname?: string) {
    const results = nickname 
      ? this.getResultsByNickname(nickname)
      : this.getAllResults()
    
    if (results.length === 0) {
      return {
        totalGames: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalWrong: 0,
        averageAccuracy: 0,
        totalHints: 0,
        totalTime: 0,
        averageTime: 0
      }
    }
    
    const totalGames = results.length
    const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0)
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0)
    const totalWrong = results.reduce((sum, r) => sum + r.wrongAnswers, 0)
    const totalHints = results.reduce((sum, r) => sum + r.hintsUsed, 0)
    const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0)
    
    return {
      totalGames,
      totalQuestions,
      totalCorrect,
      totalWrong,
      averageAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
      totalHints,
      totalTime,
      averageTime: totalGames > 0 ? totalTime / totalGames : 0
    }
  }
  
  static clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
  
  static exportData(): string {
    return JSON.stringify(this.getAllResults(), null, 2)
  }
  
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      if (Array.isArray(data)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
        return true
      }
      return false
    } catch {
      return false
    }
  }
  
  static removeDuplicates(): number {
    const results = this.getAllResults()
    const unique = new Map<string, GameResult>()
    
    // Remove duplicates based on nickname, timestamp (within 1 minute), and total questions
    results.forEach(result => {
      const key = `${result.nickname}-${Math.floor(result.timestamp / 60000)}-${result.totalQuestions}-${result.correctAnswers}`
      if (!unique.has(key)) {
        unique.set(key, result)
      }
    })
    
    const uniqueResults = Array.from(unique.values()).sort((a, b) => a.timestamp - b.timestamp)
    const removedCount = results.length - uniqueResults.length
    
    if (removedCount > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(uniqueResults))
      console.log(`Removed ${removedCount} duplicate game results`)
    }
    
    return removedCount
  }
}