## 🧪 Testing

The project includes comprehensive Jest unit tests for critical game logic.

**Test Suite**: lib/game.test.ts
- ✅ 63 tests covering all critical functions
- ✅ 67-88% coverage of game logic  
- ✅ Jest + TypeScript with Next.js integration

**Run Tests**:
`ash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
`

**Tested Functions**:
- generateEquationFacts - Equation generation (all difficulties)
- getEquationAnswer - Answer calculation (all operations)
- ormatEquation - Equation formatting
- calculateAcorns - Scoring system
- actPool - Fact generation (all game types)
- pickFacts & shuffle - Random selection

---

## 🐛 Recent Bug Fixes (December 2024)

- **Fixed**: Critical equation generation bug where equations weren't being added to the facts array
- **Impact**: Equations mode now works correctly for all difficulty levels
- **Testing**: Added comprehensive test coverage to prevent regression

