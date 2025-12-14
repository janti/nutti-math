# 🐿️ Nutti Math - AI-Powered Math Trainer

A comprehensive, modern math trainer featuring AI-powered feedback, interactive storytelling, teacher analytics, and complete multilingual support. Supports six different math operations: multiplication, division, addition, subtraction, equations, and AI-generated word problems! Built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎮 Game Mechanics
- **Six Math Operations**: Multiplication (✖️), Division (➗), Addition (➕), Subtraction (➖), Equations (📐), and Word Problems (📝)
- **Multiplication Tables (1-20)**: 
  - 🧸 1-5: Basic tables
  - 1-10: Standard tables
  - 🌟 6-10: Advanced tables
  - 📚 1-12: Extended tables
  - 🍪 2-12: Classic tables
  - 🔥 1-20: Expert level
- **Division Practice (1-20)**: 
  - 🧸 1-5: Basic division
  - 1-10: Standard division
  - 1-12: Extended division
  - 🔥 1-20: Expert division
- **Addition Ranges (1-200)**: 
  - 🧸 1-10: Basic single-digit addition
  - 1-20: Teen number mastery
  - 1-50: Extended range practice
  - 50-100: Advanced two-digit addition
  - 1-100: Complete addition mastery
  - 🔥 1-200: Expert addition
- **Subtraction Ranges (1-200)**: 
  - 🧸 1-10: Basic subtraction
  - 1-20: Teen number subtraction
  - 1-50: Extended range
  - 50-100: Advanced subtraction
  - 1-100: Complete subtraction mastery
  - 🔥 1-200: Expert subtraction
- **Equation Solving (Variable-based)**: 
  - 🍎 Easy: Simple 2-number equations with fruit variables
  - 🍊 Medium: Mixed operations (×, ÷, +, -)
  - 🍓 Hard: 3-number equations with complex operations
  - 🔥 Very Hard: Advanced multi-step equations
- **Word Problems (AI-Generated)**: 
  - 📗 Easy: Simple story problems
  - 📙 Medium: Multi-step problems
  - 📕 Hard: Complex scenarios
  - 🔥 Very Hard: Advanced reasoning
- **Customizable Rounds**: Choose 1, 2, 3, 5, or 10 rounds
- **Acorn Collection System**: Earn 1-5 acorns per round based on performance
- **Performance-Based Rewards**: Acorns awarded for accuracy and speed (adaptive for different game modes)
- **Gamification Elements**: Visual acorn display and total collection tracking
- **10 Questions per Round**: Perfectly balanced practice sessions
- **Real-time Progress**: Visual progress bar and statistics
- **Round-by-Round Analytics**: Detailed performance tracking per round

### 🤖 AI Integration
- **Smart Hints**: Context-aware hints for all six math operations during gameplay
- **Operation-Aware AI**: AI system automatically detects problem type (×, ÷, +, -, equations, word problems)
- **Advanced H-Key Support**: Press 'H' during any question for instant AI assistance
- **Loading Indicators**: Visual feedback during hint generation
- **AI-Generated Word Problems**: Real-time story problem generation in all three languages
- **Word Problem Caching**: Pre-fetches and caches word problems for smooth gameplay
- **Round Feedback**: Personalized AI feedback after each round for all math operations
- **Final Assessment**: Comprehensive AI analysis of overall performance across all problem types
- **Multi-language AI**: AI responds in Finnish, English, or Swedish
- **OpenAI Integration**: Powered by GPT models for natural, contextual responses

### 📚 Interactive Story Feature
- **Math Story Introduction**: Engaging story about Nutti the Squirrel learning multiplication
- **5-Page Interactive Story**: Beautiful illustrated narrative in 3 languages
- **Modal Interface**: Clean, focused story presentation with proper accessibility
- **Navigation Controls**: Easy page-by-page story progression

### 🌍 Internationalization
- **3 Languages**: Finnish (fi), English (en), Swedish (sv)
- **Complete Localization**: All UI elements, feedback, and content (230+ translation keys)
- **Language Switching**: Easy language selection in header
- **Language Switching**: Easy language selection in header
- **Localized AI**: AI feedback matches selected language

### 👩‍🏫 Teacher Analytics
- **Comprehensive Dashboard**: Complete teacher view with student performance tracking
- **Student Data Storage**: LocalStorage-based analytics with 1000+ result capacity
- **Acorn Tracking**: Monitor student motivation through acorn collection statistics
- **Performance Gamification**: Track total acorns earned and performance trends
- **Round Breakdown**: Detailed round-by-round performance analysis including acorns per round
- **Multi-Student Support**: Track multiple students with nickname-based filtering
- **Performance Statistics**: Accuracy, time spent, hints used, acorns earned, and detailed fact analysis
- **Data Export Ready**: Structured data format for future export capabilities

### 🍬 User Experience
- **Nutti Theme**: Delightful squirrel mascot with candy and nature decorations
- **Emoji Icons**: Expressive emoji icons throughout the interface for playful, child-friendly design
- **Responsive Design**: Fully responsive layouts that adapt to all screen sizes
- **Mobile-First**: Optimized for phones, tablets, and desktop
- **Interactive Help System**: Built-in keyboard shortcuts guide and usage instructions
- **Enhanced Focus Management**: Advanced input field focus control with virtual keypad integration
- **Acorn Gamification**: Visual acorn collection with 1-5 acorn reward system
- **Performance Motivation**: Earn more acorns with better accuracy and speed
- **Progress Visualization**: See accumulated acorns across all rounds
- **Accessibility**: Complete ARIA labels, keyboard navigation, and screen reader support
- **Performance Optimized**: Smart caching, precomputation, and smooth transitions
- **Multi-Input Support**: Virtual keypad, physical keyboard, and touch interaction
- **Professional UI**: Modern design with gradient backgrounds and shadow effects

### ⚡ Technical Features
- **Next.js 15**: Latest React framework with App Router and server components
- **TypeScript**: Full type safety throughout the application with strict configuration
- **Emoji Design**: Playful emoji-based iconography for child-friendly interface
- **Performance Caching**: Smart fact precomputation and localStorage optimization
- **Duplicate Prevention**: Advanced deduplication systems with unique game identifiers
- **Error Handling**: Comprehensive error handling with timeouts and fallbacks
- **Modern Architecture**: Clean component structure with proper separation of concerns
- **OpenAI Integration**: Both OpenAI API and Azure OpenAI Service support
- **State Management**: Optimized React hooks with performance considerations
- **Build Optimization**: Streamlined codebase with unnecessary features removed

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key or Azure OpenAI Service access

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd nutti-math-i18n-ai-prompts
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
# OpenAI Configuration (Recommended)
OPENAI_API_KEY=your_openai_api_key_here

# Or Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name

# Optional: Production URL for metadata
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/
│   ├── [locale]/           # Internationalized routes
│   │   ├── page.tsx        # Home page with game setup
│   │   ├── play/           # Main gameplay with virtual keypad
│   │   ├── break/          # Round break with AI feedback and statistics
│   │   ├── results/        # Final results and comprehensive analytics
│   │   └── layout.tsx      # Locale-specific layout with metadata
│   ├── api/
│   │   └── ai/             # AI API endpoints
│   │       ├── hint/       # Smart hint generation for both operations
│   │       ├── feedback/   # Round feedback analysis
│   │       └── final/      # Final game assessment
│   └── globals.css         # Global styles with Tailwind
├── components/
│   ├── Keypad.tsx          # Virtual number keypad with keyboard support
│   ├── NuttiBadge.tsx      # Dynamic character badge with moods
│   ├── Progress.tsx        # Animated progress bar component
│   ├── MathStory.tsx       # Interactive story with modal interface
│   ├── TeacherView.tsx     # Comprehensive analytics dashboard
│   └── UI/
│       ├── LangSwitcher.tsx # Language switching component
│       └── Header.tsx      # Application header with navigation
├── lib/
│   ├── ai.ts              # AI integration with OpenAI support
│   ├── game.ts            # Game logic and fact generation
│   └── storage.ts         # LocalStorage management for teacher analytics
├── messages/              # Complete internationalization
│   ├── en.json           # English translations (230+ keys)
│   ├── fi.json           # Finnish translations (230+ keys)  
│   └── sv.json           # Swedish translations (230+ keys)
├── i18n/
│   └── request.ts        # Next-intl configuration with Next.js 15 support
└── i18n.ts               # Locale configuration and routing
```

## 🎯 Game Flow

1. **Welcome Story**: Optional interactive story introduction with modal interface
2. **Setup**: Choose nickname, math operation (multiplication/division/addition/subtraction/equations/word problems), difficulty, and number of rounds
3. **Play**: Solve 10 math problems per round with intelligent hints available via H-key or hint button
4. **Break**: Review round statistics, acorn rewards, and receive personalized AI feedback
5. **Repeat**: Continue for selected number of rounds with progress and acorn tracking
6. **Results**: Final statistics, total acorn collection, round breakdown, and comprehensive AI assessment
7. **Teacher Analytics**: Optional teacher dashboard with detailed performance data and acorn statistics

## 🤖 AI Features

### Hint System
- **Operation-Aware**: Automatically detects all six problem types (multiplication, division, addition, subtraction, equations, word problems)
- **Context-aware strategies**: Tailored hints for each operation type
- **Mental math techniques**: Encourages learning strategies for all operations
- **Multiple access methods**: Available via 'H' key or hint button during any question
- **Loading indicators**: Visual feedback during hint generation
- **Analytics tracking**: Tracks hint usage for comprehensive teacher analytics

### Word Problem Generation
- **AI-Powered Stories**: Real-time generation of contextual word problems
- **Multi-language Support**: Problems generated in Finnish, English, or Swedish
- **Smart Caching**: Pre-fetches and caches problems for all difficulty levels
- **Varied Operations**: Covers addition, subtraction, multiplication, and division
- **Difficulty Scaling**: Four levels from simple to complex reasoning

### Round Feedback
- **Performance analysis**: Analyzes patterns with specific statistics
- **Personalized feedback**: Encouraging, tailored responses
- **Improvement suggestions**: Targeted advice for better performance
- **Adaptive content**: Adjusts to student's difficulty level and progress

### Final Assessment
- **Comprehensive review**: Performance analysis across all rounds and operations
- **Achievement celebration**: Recognizes progress and accomplishments
- **Motivational conclusion**: Tailored to individual performance and growth
- Incorporates round-by-round analysis

## 🌐 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| Finnish  | fi   | ✅ Complete |
| English  | en   | ✅ Complete |
| Swedish  | sv   | ✅ Complete |

## 🎨 Design System

### Colors (Nutti Theme)
- **Primary Orange**: `#F68B1E` - Main accent color
- **Warm Beige**: `#FFE8C2` - Secondary highlights  
- **Teal**: `#2BB3C0` - Action buttons and progress

### Icons
- **Emoji Icons**: Expressive emoji system for playful, child-friendly interface
- **Accessibility**: All icons include proper ARIA labels and descriptive text
- **Semantic**: Emojis match their function and context (🎮 for games, 📚 for story, etc.)

### Typography
- Clean, readable fonts optimized for mathematics
- Large, clear numbers for multiplication problems
- Proper contrast ratios for accessibility

## 📱 Responsive Design

- **Mobile First**: Fully responsive layouts that adapt to all screen sizes
- **Flexible Heights**: Dynamic height management for different screen sizes
- **Touch Optimized**: Large touch targets and swipe gestures
- **Desktop**: Full-featured experience with keyboard shortcuts

## ⌨️ Keyboard Shortcuts

- **0-9**: Enter digits during gameplay
- **Enter**: Submit answer / Start game / Continue story
- **Backspace**: Delete digit / Clear input
- **H**: Request AI hint during questions
- **Tab**: Navigate between interactive elements
- **Esc**: Close modals and return to main menu
- **Arrow Keys**: Navigate story pages (when story is active)

## 🔧 Configuration

### Game Settings
Stored in localStorage as `nutti.settings`:
{
  "alias": "Player name",
  "range": "1-5|6-10|1-10|2-12|mix",
  "rounds": 1|2|3|5|10
}
```

### Performance Optimization
- **Fact Caching**: Pre-computed multiplication problems
- **Round Precomputation**: Next round prepared in background
- **localStorage**: Efficient state persistence
- **Duplicate Prevention**: Smart deduplication systems

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build with optimization
npm run build

# Start production server
npm start

# Linting and code quality
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Component Architecture**: Reusable, maintainable components

## 📊 Performance Features

- **Smart Caching**: Multiplication facts cached for instant loading
- **Background Processing**: Next round prepared during breaks
- **Optimized Rendering**: Minimal re-renders and efficient state updates
- **Timeout Protection**: AI requests with fallback behavior

## 🐛 Troubleshooting

### Common Issues

**AI not working**
- Check environment variables in `.env.local`
- Verify OpenAI API key validity and billing status
- Check network connectivity and firewall settings
- Monitor browser console for API errors

**Language switching issues**
- Clear browser cache and localStorage
- Check locale routing configuration in `i18n.ts`
- Verify all translation files are present

**Performance issues**
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors
- Clear Next.js cache: `rm -rf .next`
- Restart development server

**Teacher view not showing data**
- Play at least one complete game
- Check localStorage for saved results
- Verify nickname was entered during game setup

**Responsive layout issues**
- Try refreshing the page
- Check browser zoom level (100% recommended)
- Clear browser cache if layouts appear broken

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js 15** - Latest React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework for beautiful styling
- **Unicode Emoji** - Expressive emoji system for child-friendly design
- **next-intl** - Comprehensive internationalization for Next.js
- **OpenAI** - AI-powered feedback and hint system
- **TypeScript** - Type safety and developer experience
- **Vercel** - Deployment and hosting platform
- **React** - User interface library

## 🎯 Recent Updates

### Version History
- **v0.4.0** - Professional Icons, Responsive Design, Code Cleanup, UI Polish
- **v0.3.0** - Addition Support, Enhanced UI, Focus Management, Layout Optimization
- **v0.2.0** - AI Text-to-Speech, Interactive Story, Teacher Analytics
- **v0.1.5** - Complete localization, Round breakdown analytics
- **v0.1.0** - Core multiplication trainer with AI feedback

### Latest Features (December 2024)
- ✅ **Six Math Operations**: Complete support for multiplication, division, addition, subtraction, equations, and word problems
- ✅ **AI-Generated Word Problems**: Real-time story problem generation in all three languages
- ✅ **Equation Solving**: Variable-based equations with fruit emojis (🍎, 🍊, 🍓) and 3-number support
- ✅ **Extended Difficulty Ranges**: Up to 1-200 for addition/subtraction, 1-20 for multiplication/division
- ✅ **Word Problem Caching**: Smart pre-fetching for smooth gameplay experience
- ✅ **Adaptive Acorn Rewards**: Different time thresholds for equations and word problems
- ✅ **Enhanced Emoji System**: Consistent emoji iconography throughout the interface
- ✅ **Fully Responsive Design**: Complete mobile-first redesign with adaptive layouts
- ✅ **Enhanced AI Hints**: Operation-aware AI system for all six math operations
- ✅ **Code Optimization**: Streamlined codebase with improved performance
- ✅ **UI Polish**: Improved spacing, button sizing, and layout consistency
- ✅ **Complete Localization**: 270+ translation keys covering all game modes
- ✅ **Interactive Math Story**: 5-page illustrated story about Nutti the Squirrel
- ✅ **Teacher Analytics**: Comprehensive dashboard with round-by-round breakdown
- ✅ **Next.js 15 Upgrade**: Latest framework features and performance improvements

## 🎯 Future Enhancements

- [ ] Data export functionality for teacher reports (CSV/PDF)
- [ ] Extended story chapters and characters
- [ ] Achievement badges and progress certificates
- [ ] Parent/teacher email reporting
- [ ] Offline mode support with service workers
- [ ] Mixed operation practice sessions (combining multiple operations)
- [ ] Student progress tracking over time with charts
- [ ] Customizable AI personality settings
- [ ] Fraction and decimal support
- [ ] More word problem themes and contexts
- [ ] Timed challenge modes
- [ ] Multiplayer competition features

## 🏆 Key Metrics

- **3 Languages**: Complete localization support (Finnish, English, Swedish)
- **270+ Translation Keys**: Comprehensive language coverage for all math operations  
- **6 Math Operations**: Multiplication, Division, Addition, Subtraction, Equations, Word Problems
- **26 Difficulty Levels**: 6 multiplication + 4 division + 6 addition + 6 subtraction + 4 equations + 4 word problems
- **1000+ Results**: Teacher analytics storage capacity
- **10 Questions/Round**: Optimal learning session length
- **AI-Powered**: Smart hints, word problem generation, round feedback, and final assessment
- **100% Accessible**: Full ARIA compliance and keyboard navigation

---

Made with ❤️ and 🤖 AI for young mathematicians learning multiplication tables and addition!

**Nutti the Squirrel** 🐿️ is ready to help students master their multiplication tables and addition skills through engaging, AI-enhanced learning experiences.