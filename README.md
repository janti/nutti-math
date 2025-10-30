# 🐿️ Nutti Math - AI-Powered Multiplication Trainer

A comprehensive, modern multiplication table trainer featuring AI-powered feedback, interactive storytelling, text-to-speech, teacher analytics, and complete multilingual support. Built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎮 Game Mechanics
- **Customizable Rounds**: Choose 1, 2, 3, 5, or 10 rounds
- **Difficulty Levels**: 
  - 🧸 Easy (1-5 tables)
  - 🎯 Medium (6-10 tables)  
  - 🌟 Advanced (1-10 tables)
  - 🚀 Classic (2-12 tables)
  - 🎲 Mix (1-12 tables)
- **10 Questions per Round**: Perfectly balanced practice sessions
- **Real-time Progress**: Visual progress bar and statistics
- **Round-by-Round Analytics**: Detailed performance tracking per round

### 🤖 AI Integration
- **Smart Hints**: Context-aware multiplication hints during gameplay
- **Round Feedback**: Personalized AI feedback after each round
- **Final Assessment**: Comprehensive AI analysis of overall performance
- **Multi-language AI**: AI responds in Finnish, English, or Swedish
- **AI-Powered Text-to-Speech**: High-quality narration using OpenAI TTS API
- **Locale-Specific Voices**: Optimized voice selection for each language

### 📚 Interactive Story Feature
- **Math Story Introduction**: Engaging story about Nutti the Squirrel learning multiplication
- **5-Page Interactive Story**: Beautiful illustrated narrative in 3 languages
- **AI Text-to-Speech Narration**: Professional-quality voice acting
- **User-Controlled Audio**: Play, pause, mute controls with automatic playback options
- **Smart Audio Management**: Respects user preferences and browser autoplay policies

### 🌍 Internationalization
- **3 Languages**: Finnish (fi), English (en), Swedish (sv)
- **Complete Localization**: All UI elements, emojis, and feedback
- **Language Switching**: Easy language selection in header
- **Localized AI**: AI feedback matches selected language

### 👩‍� Teacher Analytics
- **Comprehensive Dashboard**: Complete teacher view with student performance tracking
- **Student Data Storage**: LocalStorage-based analytics with 1000+ result capacity
- **Round Breakdown**: Detailed round-by-round performance analysis
- **Multi-Student Support**: Track multiple students with nickname-based filtering
- **Performance Statistics**: Accuracy, time spent, hints used, and detailed fact analysis
- **Data Export Ready**: Structured data format for future export capabilities

### �🍬 User Experience
- **Nutti Theme**: Delightful squirrel mascot with candy and nature decorations
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Accessibility**: Complete ARIA labels, keyboard navigation, and screen reader support
- **Performance Optimized**: Smart caching, precomputation, and smooth transitions
- **Multi-Input Support**: Virtual keypad, physical keyboard, and touch interaction
- **Professional UI**: Modern design with gradient backgrounds and shadow effects

### ⚡ Technical Features
- **Next.js 15**: Latest React framework with App Router and server components
- **TypeScript**: Full type safety throughout the application with strict configuration
- **Performance Caching**: Smart fact precomputation and localStorage optimization
- **Duplicate Prevention**: Advanced deduplication systems with unique game identifiers
- **Error Handling**: Comprehensive error handling with timeouts and fallbacks
- **Modern Architecture**: Clean component structure with proper separation of concerns
- **OpenAI Integration**: Both OpenAI API and Azure OpenAI Service support
- **Audio Management**: Sophisticated audio lifecycle management with cleanup
- **State Management**: Optimized React hooks with performance considerations

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
│   │       ├── hint/       # Smart hint generation
│   │       ├── feedback/   # Round feedback analysis
│   │       ├── final/      # Final game assessment
│   │       └── tts/        # Text-to-speech generation
│   └── globals.css         # Global styles with Tailwind
├── components/
│   ├── Keypad.tsx          # Virtual number keypad with keyboard support
│   ├── NuttiBadge.tsx      # Dynamic character badge with moods
│   ├── Progress.tsx        # Animated progress bar component
│   ├── MathStory.tsx       # Interactive story with AI narration
│   ├── TeacherView.tsx     # Comprehensive analytics dashboard
│   └── UI/
│       ├── LangSwitcher.tsx # Language switching component
│       └── Header.tsx      # Application header with navigation
├── lib/
│   ├── ai.ts              # AI integration with OpenAI/Azure support
│   ├── game.ts            # Game logic and fact generation
│   └── storage.ts         # LocalStorage management for teacher analytics
├── messages/              # Complete internationalization
│   ├── en.json           # English translations (216 keys)
│   ├── fi.json           # Finnish translations (216 keys)  
│   └── sv.json           # Swedish translations (216 keys)
├── i18n/
│   └── request.ts        # Next-intl configuration with Next.js 15 support
└── i18n.ts               # Locale configuration and routing
```

## 🎯 Game Flow

1. **Welcome Story**: Optional interactive story introduction with AI narration
2. **Setup**: Choose nickname, difficulty, and number of rounds
3. **Play**: Solve 10 multiplication problems per round with hints available
4. **Break**: Review round statistics and receive personalized AI feedback
5. **Repeat**: Continue for selected number of rounds with progress tracking
6. **Results**: Final statistics, round breakdown, and comprehensive AI assessment
7. **Teacher Analytics**: Optional teacher dashboard with detailed performance data

## 🤖 AI Features

### Hint System
- Context-aware multiplication strategies
- Encourages mental math techniques
- Available via 'H' key or hint button
- Tracks hint usage for teacher analytics

### Round Feedback
- Analyzes performance patterns with specific statistics
- Provides encouraging, personalized feedback
- Suggests targeted improvements
- Adapts to student's difficulty level and progress

### Final Assessment
- Comprehensive performance review across all rounds
- Celebrates achievements and progress made
- Motivational conclusion tailored to individual performance
- Incorporates round-by-round analysis

### Text-to-Speech Integration
- **Professional Voice Quality**: OpenAI TTS-1 model
- **Multi-language Support**: Native voices for Finnish, English, Swedish
- **Interactive Story Narration**: Full story reading with user controls
- **Smart Audio Management**: Respects user interaction patterns
- **Accessibility Enhancement**: Screen reader friendly audio controls

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

### Typography
- Clean, readable fonts optimized for mathematics
- Large, clear numbers for multiplication problems
- Proper contrast ratios for accessibility

## 📱 Responsive Design

- **Mobile First**: Optimized for touch interaction
- **Tablet**: Balanced layout with larger touch targets
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
```json
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

**Audio/TTS not working**
- Ensure OpenAI API key has TTS model access
- Check browser audio permissions
- Verify autoplay policies are respected
- Clear audio cache and try manual play button

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js 15** - Latest React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework for beautiful styling
- **next-intl** - Comprehensive internationalization for Next.js
- **OpenAI** - AI-powered feedback and text-to-speech system
- **TypeScript** - Type safety and developer experience
- **Vercel** - Deployment and hosting platform
- **React** - User interface library

## 🎯 Recent Updates

### Version History
- **v0.2.0** - AI Text-to-Speech, Interactive Story, Teacher Analytics
- **v0.1.5** - Complete localization, Round breakdown analytics
- **v0.1.0** - Core multiplication trainer with AI feedback

### Latest Features (October 2025)
- ✅ **Interactive Math Story**: 5-page illustrated story with AI narration
- ✅ **AI Text-to-Speech**: Professional quality voice narration in 3 languages
- ✅ **Teacher Analytics**: Comprehensive dashboard with round-by-round breakdown
- ✅ **Next.js 15 Upgrade**: Latest framework features and performance improvements
- ✅ **Enhanced Audio Controls**: Smart autoplay management and user preferences
- ✅ **Complete Localization**: Every UI element translated across all languages

## 🎯 Future Enhancements

- [ ] Data export functionality for teacher reports
- [ ] Extended story chapters and characters
- [ ] Achievement badges and progress certificates
- [ ] Parent/teacher email reporting
- [ ] Offline mode support
- [ ] Additional math operations (addition, subtraction, division)
- [ ] Gamification elements and rewards system
- [ ] Student progress tracking over time
- [ ] Customizable AI personality settings

## 🏆 Key Metrics

- **3 Languages**: Complete localization support
- **216 Translation Keys**: Comprehensive language coverage  
- **1000+ Results**: Teacher analytics storage capacity
- **10 Questions/Round**: Optimal learning session length
- **AI-Powered**: 4 different AI interaction types
- **100% Accessible**: Full ARIA compliance and keyboard navigation

---

Made with ❤️ and 🤖 AI for young mathematicians learning multiplication tables!

**Nutti the Squirrel** 🐿️ is ready to help students master their multiplication tables through engaging, AI-enhanced learning experiences.