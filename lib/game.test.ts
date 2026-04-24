/**
 * Unit tests for lib/game.ts
 * Tests critical game logic functions
 */

import {
    generateEquationFacts,
    getEquationAnswer,
    formatEquation,
    calculateAcorns,
    calculateAcornsForEquations,
    calculateAcornsForWordProblems,
    factPool,
    pickFacts,
    shuffle,
    type EquationFact,
    type Fact,
} from './game'

describe('generateEquationFacts', () => {
    describe('Easy difficulty', () => {
        it('should generate exactly 10 equations', () => {
            const facts = generateEquationFacts('easy', 10)
            expect(facts).toHaveLength(10)
        })

        it('should generate valid equation structures', () => {
            const facts = generateEquationFacts('easy', 10)
            facts.forEach(fact => {
                expect(fact).toHaveProperty('a')
                expect(fact).toHaveProperty('b')
                expect(fact).toHaveProperty('result')
                expect(fact).toHaveProperty('operation')
                expect(fact).toHaveProperty('missingValue')
                expect(fact).toHaveProperty('variableIcon')
                expect(typeof fact.a).toBe('number')
                expect(typeof fact.b).toBe('number')
                expect(typeof fact.result).toBe('number')
            })
        })

        it('should only have missing values on left side (a or b)', () => {
            const facts = generateEquationFacts('easy', 20)
            facts.forEach(fact => {
                expect(['a', 'b']).toContain(fact.missingValue)
            })
        })

        it('should generate all four operations', () => {
            const facts = generateEquationFacts('easy', 100)
            const operations = new Set(facts.map(f => f.operation))
            expect(operations.has('addition')).toBe(true)
            expect(operations.has('subtraction')).toBe(true)
            expect(operations.has('multiplication')).toBe(true)
            expect(operations.has('division')).toBe(true)
        })

        it('should use appropriate ranges for easy difficulty', () => {
            const facts = generateEquationFacts('easy', 50)
            facts.forEach(fact => {
                // Easy difficulty should have smaller numbers
                if (fact.operation === 'multiplication' || fact.operation === 'division') {
                    expect(fact.b).toBeLessThanOrEqual(5)
                } else {
                    expect(fact.b).toBeLessThanOrEqual(10)
                }
            })
        })
    })

    describe('Medium difficulty', () => {
        it('should generate exactly 10 equations', () => {
            const facts = generateEquationFacts('medium', 10)
            expect(facts).toHaveLength(10)
        })

        it('should use larger ranges than easy', () => {
            const facts = generateEquationFacts('medium', 50)
            facts.forEach(fact => {
                if (fact.operation === 'multiplication' || fact.operation === 'division') {
                    expect(fact.b).toBeLessThanOrEqual(10)
                } else {
                    expect(fact.b).toBeLessThanOrEqual(20)
                }
            })
        })
    })

    describe('Hard difficulty', () => {
        it('should generate exactly 10 equations', () => {
            const facts = generateEquationFacts('hard', 10)
            expect(facts).toHaveLength(10)
        })

        it('should sometimes generate three-number equations', () => {
            const facts = generateEquationFacts('hard', 100)
            const threeNumberFacts = facts.filter(f => f.c !== undefined)
            // Should have some three-number equations (around 50% for addition/subtraction)
            expect(threeNumberFacts.length).toBeGreaterThan(0)
        })

        it('should allow c as missing value for three-number equations', () => {
            const facts = generateEquationFacts('hard', 100)
            const threeNumberFacts = facts.filter(f => f.c !== undefined)
            const hasCMissing = threeNumberFacts.some(f => f.missingValue === 'c')
            expect(hasCMissing).toBe(true)
        })
    })

    describe('Very hard difficulty', () => {
        it('should generate exactly 10 equations', () => {
            const facts = generateEquationFacts('veryhard', 10)
            expect(facts).toHaveLength(10)
        })

        it('should have more three-number equations than hard', () => {
            const facts = generateEquationFacts('veryhard', 100)
            const threeNumberFacts = facts.filter(f => f.c !== undefined)
            // Should have clearly more than "some", while allowing random variance
            expect(threeNumberFacts.length).toBeGreaterThanOrEqual(25)
        })

        it('should use larger number ranges', () => {
            const facts = generateEquationFacts('veryhard', 50)
            const hasLargeNumbers = facts.some(f =>
                f.a > 50 || f.b > 50 || f.result > 50
            )
            expect(hasLargeNumbers).toBe(true)
        })
    })
})

describe('getEquationAnswer', () => {
    describe('Two-number equations', () => {
        it('should calculate correct answer for addition with missing a', () => {
            const fact: EquationFact = {
                a: 5,
                b: 3,
                result: 8,
                operation: 'addition',
                missingValue: 'a',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(5) // 8 - 3 = 5
        })

        it('should calculate correct answer for addition with missing b', () => {
            const fact: EquationFact = {
                a: 5,
                b: 3,
                result: 8,
                operation: 'addition',
                missingValue: 'b',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(3) // 8 - 5 = 3
        })

        it('should calculate correct answer for subtraction with missing a', () => {
            const fact: EquationFact = {
                a: 10,
                b: 3,
                result: 7,
                operation: 'subtraction',
                missingValue: 'a',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(10) // 7 + 3 = 10
        })

        it('should calculate correct answer for subtraction with missing b', () => {
            const fact: EquationFact = {
                a: 10,
                b: 3,
                result: 7,
                operation: 'subtraction',
                missingValue: 'b',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(3) // 10 - 7 = 3
        })

        it('should calculate correct answer for multiplication with missing a', () => {
            const fact: EquationFact = {
                a: 4,
                b: 5,
                result: 20,
                operation: 'multiplication',
                missingValue: 'a',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(4) // 20 / 5 = 4
        })

        it('should calculate correct answer for multiplication with missing b', () => {
            const fact: EquationFact = {
                a: 4,
                b: 5,
                result: 20,
                operation: 'multiplication',
                missingValue: 'b',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(5) // 20 / 4 = 5
        })

        it('should calculate correct answer for division with missing a', () => {
            const fact: EquationFact = {
                a: 20,
                b: 5,
                result: 4,
                operation: 'division',
                missingValue: 'a',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(20) // 4 * 5 = 20
        })

        it('should calculate correct answer for division with missing b', () => {
            const fact: EquationFact = {
                a: 20,
                b: 5,
                result: 4,
                operation: 'division',
                missingValue: 'b',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(5) // 20 / 4 = 5
        })
    })

    describe('Three-number equations', () => {
        it('should calculate correct answer for addition with missing a', () => {
            const fact: EquationFact = {
                a: 5,
                b: 3,
                c: 2,
                result: 10,
                operation: 'addition',
                missingValue: 'a',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(5) // 10 - 3 - 2 = 5
        })

        it('should calculate correct answer for addition with missing b', () => {
            const fact: EquationFact = {
                a: 5,
                b: 3,
                c: 2,
                result: 10,
                operation: 'addition',
                missingValue: 'b',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(3) // 10 - 5 - 2 = 3
        })

        it('should calculate correct answer for addition with missing c', () => {
            const fact: EquationFact = {
                a: 5,
                b: 3,
                c: 2,
                result: 10,
                operation: 'addition',
                missingValue: 'c',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(2) // 10 - 5 - 3 = 2
        })

        it('should calculate correct answer for subtraction with missing a', () => {
            const fact: EquationFact = {
                a: 15,
                b: 5,
                c: 3,
                result: 7,
                operation: 'subtraction',
                missingValue: 'a',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(15) // 7 + 5 + 3 = 15
        })

        it('should calculate correct answer for subtraction with missing c', () => {
            const fact: EquationFact = {
                a: 15,
                b: 5,
                c: 3,
                result: 7,
                operation: 'subtraction',
                missingValue: 'c',
                variableIcon: '🍎'
            }
            expect(getEquationAnswer(fact)).toBe(3) // 15 - 5 - 7 = 3
        })
    })
})

describe('formatEquation', () => {
    it('should format two-number addition with missing a', () => {
        const fact: EquationFact = {
            a: 5,
            b: 3,
            result: 8,
            operation: 'addition',
            missingValue: 'a',
            variableIcon: '🍎'
        }
        expect(formatEquation(fact)).toBe('🍎 + 3 = 8')
    })

    it('should format two-number addition with missing b', () => {
        const fact: EquationFact = {
            a: 5,
            b: 3,
            result: 8,
            operation: 'addition',
            missingValue: 'b',
            variableIcon: '🍊'
        }
        expect(formatEquation(fact)).toBe('5 + 🍊 = 8')
    })

    it('should format multiplication correctly', () => {
        const fact: EquationFact = {
            a: 4,
            b: 5,
            result: 20,
            operation: 'multiplication',
            missingValue: 'a',
            variableIcon: '🍌'
        }
        expect(formatEquation(fact)).toBe('🍌 × 5 = 20')
    })

    it('should format subtraction correctly', () => {
        const fact: EquationFact = {
            a: 10,
            b: 3,
            result: 7,
            operation: 'subtraction',
            missingValue: 'b',
            variableIcon: '🍇'
        }
        expect(formatEquation(fact)).toBe('10 - 🍇 = 7')
    })

    it('should format division correctly', () => {
        const fact: EquationFact = {
            a: 20,
            b: 5,
            result: 4,
            operation: 'division',
            missingValue: 'a',
            variableIcon: '🍓'
        }
        expect(formatEquation(fact)).toBe('🍓 ÷ 5 = 4')
    })

    it('should format three-number equations correctly', () => {
        const fact: EquationFact = {
            a: 5,
            b: 3,
            c: 2,
            result: 10,
            operation: 'addition',
            missingValue: 'c',
            variableIcon: '🍎'
        }
        expect(formatEquation(fact)).toBe('5 + 3 + 🍎 = 10')
    })
})

describe('calculateAcorns', () => {
    it('should give 1 acorn for 0 correct answers', () => {
        expect(calculateAcorns(0, 10, 5000)).toBe(1)
    })

    it('should give 5 acorns for perfect score with fast time', () => {
        expect(calculateAcorns(10, 10, 2000)).toBe(5) // 2s average
    })

    it('should give 4 acorns for perfect score with medium time', () => {
        expect(calculateAcorns(10, 10, 4000)).toBe(4) // 4s average
    })

    it('should give 3 acorns for perfect score with slow time', () => {
        expect(calculateAcorns(10, 10, 10000)).toBe(3) // 10s average
    })

    it('should give 4 acorns for 80-90% accuracy', () => {
        expect(calculateAcorns(8, 10, 5000)).toBe(4)
        expect(calculateAcorns(9, 10, 5000)).toBe(4)
    })

    it('should give 3 acorns for 60-70% accuracy', () => {
        expect(calculateAcorns(6, 10, 5000)).toBe(3)
        expect(calculateAcorns(7, 10, 5000)).toBe(3)
    })

    it('should give 2 acorns for 40-50% accuracy', () => {
        expect(calculateAcorns(4, 10, 5000)).toBe(2)
        expect(calculateAcorns(5, 10, 5000)).toBe(2)
    })

    it('should give 1 acorn for less than 40% accuracy', () => {
        expect(calculateAcorns(1, 10, 5000)).toBe(1)
        expect(calculateAcorns(2, 10, 5000)).toBe(1)
        expect(calculateAcorns(3, 10, 5000)).toBe(1)
    })
})

describe('calculateAcornsForEquations', () => {
    it('should be more generous with time than regular calculation', () => {
        // Perfect score with 7s average
        const regularAcorns = calculateAcorns(10, 10, 7000)
        const equationAcorns = calculateAcornsForEquations(10, 10, 7000)

        expect(equationAcorns).toBeGreaterThanOrEqual(regularAcorns)
    })

    it('should give 5 acorns for perfect score with 8s or less', () => {
        expect(calculateAcornsForEquations(10, 10, 8000)).toBe(5)
    })

    it('should give 4 acorns for perfect score with 15s or less', () => {
        expect(calculateAcornsForEquations(10, 10, 15000)).toBe(4)
    })

    it('should give 3 acorns for perfect score with slow time', () => {
        expect(calculateAcornsForEquations(10, 10, 30000)).toBe(3)
    })
})

describe('calculateAcornsForWordProblems', () => {
    it('should be most generous with time', () => {
        // Perfect score with 20s average
        const regularAcorns = calculateAcorns(10, 10, 20000)
        const equationAcorns = calculateAcornsForEquations(10, 10, 20000)
        const wordProblemAcorns = calculateAcornsForWordProblems(10, 10, 20000)

        expect(wordProblemAcorns).toBeGreaterThanOrEqual(equationAcorns)
        expect(wordProblemAcorns).toBeGreaterThanOrEqual(regularAcorns)
    })

    it('should give 5 acorns for perfect score with 15s or less', () => {
        expect(calculateAcornsForWordProblems(10, 10, 15000)).toBe(5)
    })

    it('should give 4 acorns for perfect score with 30s or less', () => {
        expect(calculateAcornsForWordProblems(10, 10, 30000)).toBe(4)
    })
})

describe('factPool', () => {
    describe('Multiplication', () => {
        it('should generate facts for 1-5 range', () => {
            const pool = factPool('1-5', 'multiplication')
            expect(pool.length).toBeGreaterThan(0)
            pool.forEach(fact => {
                expect(fact.a).toBeGreaterThanOrEqual(1)
                expect(fact.a).toBeLessThanOrEqual(5)
                expect(fact.b).toBeGreaterThanOrEqual(1)
                expect(fact.b).toBeLessThanOrEqual(5)
            })
        })

        it('should generate facts for 2-12 range', () => {
            const pool = factPool('2-12', 'multiplication')
            expect(pool.length).toBeGreaterThan(0)
            pool.forEach(fact => {
                expect(fact.a).toBeGreaterThanOrEqual(2)
                expect(fact.a).toBeLessThanOrEqual(12)
                expect(fact.b).toBeGreaterThanOrEqual(2)
                expect(fact.b).toBeLessThanOrEqual(12)
            })
        })
    })

    describe('Addition', () => {
        it('should generate facts for 1-10-add range', () => {
            const pool = factPool('1-10-add', 'addition')
            expect(pool.length).toBeGreaterThan(0)
            pool.forEach(fact => {
                const sum = fact.a + fact.b
                expect(sum).toBeGreaterThanOrEqual(1)
                expect(sum).toBeLessThanOrEqual(10)
            })
        })

        it('should generate facts for 1-100-add range', () => {
            const pool = factPool('1-100-add', 'addition')
            expect(pool.length).toBeGreaterThan(0)
            pool.forEach(fact => {
                const sum = fact.a + fact.b
                expect(sum).toBeGreaterThanOrEqual(1)
                expect(sum).toBeLessThanOrEqual(100)
            })
        })
    })

    describe('Subtraction', () => {
        it('should generate facts for 1-10-sub range', () => {
            const pool = factPool('1-10-sub', 'subtraction')
            expect(pool.length).toBeGreaterThan(0)
            pool.forEach(fact => {
                expect(fact.a).toBeGreaterThanOrEqual(fact.b) // No negative results
                expect(fact.a).toBeLessThanOrEqual(10)
            })
        })

        it('should generate facts for 1-100-sub range', () => {
            const pool = factPool('1-100-sub', 'subtraction')
            expect(pool.length).toBeGreaterThan(0)
            pool.forEach(fact => {
                expect(fact.a).toBeGreaterThanOrEqual(fact.b)
                expect(fact.a).toBeLessThanOrEqual(100)
            })
        })
    })

    describe('Division', () => {
        it('should generate facts for 1-5-div range', () => {
            const pool = factPool('1-5-div', 'division')
            expect(pool.length).toBeGreaterThan(0)
            pool.forEach(fact => {
                expect(fact.a % fact.b).toBe(0) // Exact division
                expect(fact.b).toBeGreaterThanOrEqual(1)
                expect(fact.b).toBeLessThanOrEqual(5)
            })
        })

        it('should generate facts for 1-12-div range', () => {
            const pool = factPool('1-12-div', 'division')
            expect(pool.length).toBeGreaterThan(0)
            pool.forEach(fact => {
                expect(fact.a % fact.b).toBe(0)
                expect(fact.b).toBeGreaterThanOrEqual(1)
                expect(fact.b).toBeLessThanOrEqual(12)
            })
        })
    })

    describe('Equations', () => {
        it('should return empty array for equation ranges', () => {
            expect(factPool('equations-easy', 'equations')).toEqual([])
            expect(factPool('equations-medium', 'equations')).toEqual([])
            expect(factPool('equations-hard', 'equations')).toEqual([])
            expect(factPool('equations-veryhard', 'equations')).toEqual([])
        })
    })

    describe('Word Problems', () => {
        it('should return empty array for word problem ranges', () => {
            expect(factPool('word-problems-easy', 'wordProblems')).toEqual([])
            expect(factPool('word-problems-medium', 'wordProblems')).toEqual([])
        })
    })
})

describe('pickFacts', () => {
    it('should pick exactly n facts from pool', () => {
        const pool: Fact[] = [
            { a: 1, b: 1 },
            { a: 2, b: 2 },
            { a: 3, b: 3 },
            { a: 4, b: 4 },
            { a: 5, b: 5 },
        ]
        const picked = pickFacts(pool, 3)
        expect(picked).toHaveLength(3)
    })

    it('should pick all facts if n equals pool size', () => {
        const pool: Fact[] = [
            { a: 1, b: 1 },
            { a: 2, b: 2 },
            { a: 3, b: 3 },
        ]
        const picked = pickFacts(pool, 3)
        expect(picked).toHaveLength(3)
    })

    it('should pick facts from the pool', () => {
        const pool: Fact[] = [
            { a: 1, b: 1 },
            { a: 2, b: 2 },
            { a: 3, b: 3 },
            { a: 4, b: 4 },
            { a: 5, b: 5 },
        ]
        const picked = pickFacts(pool, 3)
        picked.forEach(fact => {
            const found = pool.some(p => p.a === fact.a && p.b === fact.b)
            expect(found).toBe(true)
        })
    })
})

describe('shuffle', () => {
    it('should return array of same length', () => {
        const arr = [1, 2, 3, 4, 5]
        const shuffled = shuffle(arr)
        expect(shuffled).toHaveLength(arr.length)
    })

    it('should contain all original elements', () => {
        const arr = [1, 2, 3, 4, 5]
        const shuffled = shuffle(arr)
        arr.forEach(item => {
            expect(shuffled).toContain(item)
        })
    })

    it('should not modify original array', () => {
        const arr = [1, 2, 3, 4, 5]
        const original = [...arr]
        shuffle(arr)
        expect(arr).toEqual(original)
    })
})
