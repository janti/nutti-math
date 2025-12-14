## 🧪 Testing

The project includes comprehensive Jest unit tests for critical game logic.

**Test Suite**: lib/game.test.ts
- ✅ 60+ tests covering all critical functions
- ✅ High coverage of game logic  
- ✅ Jest + TypeScript with Next.js integration

**Run Tests**:
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Tested Functions**:
- `generateEquationFacts` - Equation generation (all difficulties)
- `getEquationAnswer` - Answer calculation (all operations)
- `formatEquation` - Equation formatting
- `calculateAcorns` - Scoring system (standard, equations, word problems)
- `factPool` - Fact generation (multiplication, division, addition, subtraction, equations, word problems)
- `pickFacts` & `shuffle` - Random selection

**Test Coverage**:
- ✅ Equation generation for all 4 difficulty levels (easy, medium, hard, veryhard)
- ✅ Answer calculation for 2-number and 3-number equations
- ✅ All 4 operations (addition, subtraction, multiplication, division)
- ✅ Acorn scoring with adaptive time thresholds
- ✅ Fact pool generation for all 6 game types
- ✅ Edge cases and validation

---

## 🐛 Recent Bug Fixes (December 2024)

- **Fixed**: Critical equation generation bug where equations weren't being added to the facts array
- **Impact**: Equations mode now works correctly for all difficulty levels
- **Testing**: Added comprehensive test coverage to prevent regression

