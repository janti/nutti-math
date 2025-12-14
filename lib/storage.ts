/**
 * Represents a complete game session result for teacher analytics
 */
export interface GameResult {
  /** Unique identifier for the game session */
  id: string
  /** Student's chosen nickname/alias */
  nickname: string
  /** Timestamp when the game was completed */
  timestamp: number
  /** Game range played (multiplication or addition) */
  range: '1-5' | '1-10' | '6-10' | '1-12' | '2-12' | '1-20' | '1-10-add' | '1-20-add' | '1-50-add' | '50-100-add' | '1-100-add' | '1-200-add' | '1-10-sub' | '1-20-sub' | '1-50-sub' | '50-100-sub' | '1-100-sub' | '1-200-sub' | 'equations-easy' | 'equations-medium' | 'equations-hard' | 'equations-veryhard' | '1-5-div' | '1-10-div' | '1-12-div' | '1-20-div' | 'word-problems-easy' | 'word-problems-medium' | 'word-problems-hard' | 'word-problems-veryhard'
  /** Game type */
  gameType?: 'multiplication' | 'addition' | 'subtraction' | 'equations' | 'division' | 'wordProblems'
  /** Total number of questions answered */
  totalQuestions: number
  /** Number of correct answers */
  correctAnswers: number
  /** Number of incorrect answers */
  wrongAnswers: number
  /** Total hints used across all questions */
  hintsUsed: number
  /** Total time spent in seconds */
  timeSpent: number
  /** Number of rounds played */
  totalRounds: number
  /** Total acorns earned across all rounds */
  totalAcorns?: number
  /** Detailed results for each math fact */
  facts: FactResult[]
  /** Round-by-round breakdown for multi-round games */
  roundResults?: RoundResult[]
}

/**
 * Statistics for a single round in a multi-round game
 */
export interface RoundResult {
  roundNo: number
  questionsInRound: number
  correctInRound: number
  timeSpentInRound: number
  hintsInRound: number
  acornsInRound?: number
}

/**
 * Result data for a single math fact/question
 */
export interface FactResult {
  /** First operand */
  a: number
  /** Second operand */
  b: number
  /** Student's answer */
  userAnswer: number
  /** Correct answer */
  correctAnswer: number
  /** Whether the student answered correctly */
  isCorrect: boolean
  /** Time spent on this question in seconds */
  timeSpent: number
  /** Number of hints used for this question */
  hintsUsed: number
  /** Which round this fact belongs to (for multi-round games) */
  roundNo?: number
  /** Word problem text (for wordProblems gameType) */
  problem?: string
  /** Equation string (for wordProblems gameType) */
  equation?: string
}

/**
 * LocalStorage management for game results and teacher analytics
 */
export class GameStorage {
  private static readonly STORAGE_KEY = 'nutti-math-results'
  private static readonly MAX_STORED_RESULTS = 1000

  /**
   * Save a game result to localStorage
   * Automatically manages storage size by keeping only the most recent results
   */
  static saveResult(result: GameResult): void {
    try {
      const existing = this.getAllResults()
      existing.push(result)

      // Prevent storage overflow by keeping only recent results
      const limited = existing.slice(-this.MAX_STORED_RESULTS)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limited))
    } catch (error) {
      console.error('Failed to save game result:', error)
    }
  }

  /**
   * Retrieve all stored game results
   * @returns Array of all game results, or empty array if none found
   */
  static getAllResults(): GameResult[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Failed to load game results:', error)
      return []
    }
  }

  /**
   * Get all game results for a specific student nickname
   * @param nickname - Student's nickname to filter by
   * @returns Array of game results for the specified student
   */
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
        totalAcorns: 0,
        averageTime: 0,
        averageAcorns: 0
      }
    }

    const totalGames = results.length
    const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0)
    const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0)
    const totalWrong = results.reduce((sum, r) => sum + r.wrongAnswers, 0)
    const totalHints = results.reduce((sum, result) => sum + (result.hintsUsed || 0), 0)
    const totalTime = results.reduce((sum, result) => sum + (result.timeSpent || 0), 0)
    const totalAcorns = results.reduce((sum, result) => {
      if (result.totalAcorns && result.totalAcorns > 0) {
        return sum + result.totalAcorns
      }
      // Fallback calculation for games without acorn data
      // Estimate based on performance: 1-5 acorns per round based on accuracy
      const accuracy = result.totalQuestions > 0 ? result.correctAnswers / result.totalQuestions : 0
      const baseAcorns = accuracy >= 0.8 ? 4 : accuracy >= 0.6 ? 3 : accuracy >= 0.4 ? 2 : 1
      const estimatedAcorns = Math.max(1, baseAcorns * (result.totalRounds || 1))
      return sum + estimatedAcorns
    }, 0)

    return {
      totalGames,
      totalQuestions,
      totalCorrect,
      totalWrong,
      averageAccuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
      totalHints,
      totalTime,
      totalAcorns,
      averageTime: totalGames > 0 ? totalTime / totalGames : 0,
      averageAcorns: totalGames > 0 ? totalAcorns / totalGames : 0
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