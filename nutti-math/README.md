# 🐿️ Nutti Math - AI-Powered Multiplication Trainer

A modern, interactive multiplication table trainer featuring AI feedback, multiple languages, and a delightful candy-themed UI. Built with Next.js, TypeScript, and Tailwind CSS.

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

### 🤖 AI Integration
- **Smart Hints**: Context-aware multiplication hints during gameplay
- **Round Feedback**: Personalized AI feedback after each round
- **Final Assessment**: Comprehensive AI analysis of overall performance
- **Multi-language AI**: AI responds in Finnish, English, or Swedish

### 🌍 Internationalization
- **3 Languages**: Finnish (fi), English (en), Swedish (sv)
- **Complete Localization**: All UI elements, emojis, and feedback
- **Language Switching**: Easy language selection in header
- **Localized AI**: AI feedback matches selected language

### 🍬 User Experience
- **Candy Theme**: Delightful candy and emoji decorations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance Optimized**: Fact caching and smooth transitions
- **Enter Key Support**: Quick game start and answer submission

### ⚡ Technical Features
- **TypeScript**: Full type safety throughout the application
- **Performance Caching**: Smart fact precomputation and localStorage optimization
- **Duplicate Prevention**: Prevents double-submission and data duplication
- **Error Handling**: Graceful error handling with timeouts
- **Modern Architecture**: Clean component structure with proper separation of concerns

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

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
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Or Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
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
│   │   ├── play/           # Main gameplay
│   │   ├── break/          # Round break with AI feedback
│   │   ├── results/        # Final results and statistics
│   │   └── layout.tsx      # Locale-specific layout
│   ├── api/
│   │   └── ai/             # AI API endpoints
│   │       ├── hint/       # Hint generation
│   │       └── feedback/   # Round feedback
│   └── globals.css         # Global styles
├── components/
│   ├── Keypad.tsx          # Virtual number keypad
│   ├── NuttiBadge.tsx      # Character badge component
│   └── Progress.tsx        # Progress bar component
├── lib/
│   ├── ai.ts              # AI integration utilities
│   └── game.ts            # Game logic and fact generation
├── messages/              # Internationalization files
│   ├── en.json           # English translations
│   ├── fi.json           # Finnish translations
│   └── sv.json           # Swedish translations
└── i18n.ts               # i18n configuration
```

## 🎯 Game Flow

1. **Setup**: Choose nickname, difficulty, and number of rounds
2. **Play**: Solve 10 multiplication problems per round
3. **Break**: Review statistics and receive AI feedback
4. **Repeat**: Continue for selected number of rounds
5. **Results**: Final statistics and comprehensive AI assessment

## 🤖 AI Features

### Hint System
- Context-aware multiplication strategies
- Encourages mental math techniques
- Available via 'H' key or hint button

### Round Feedback
- Analyzes performance patterns
- Provides encouraging feedback
- Suggests improvements

### Final Assessment
- Comprehensive performance review
- Celebrates achievements
- Motivational conclusion

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

- **0-9**: Enter digits
- **Enter**: Submit answer / Start game
- **Backspace**: Delete digit
- **H**: Request hint
- **Tab**: Navigate between elements

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
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
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
- Check environment variables
- Verify API key validity
- Check network connectivity

**Language switching issues**
- Clear browser cache
- Check locale routing configuration

**Performance issues**
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Tailwind CSS** - Utility-first CSS framework
- **next-intl** - Internationalization for Next.js
- **OpenAI** - AI-powered feedback system
- **Vercel** - Deployment platform

## 🎯 Future Enhancements

- [ ] Additional difficulty levels
- [ ] Progress tracking over time
- [ ] Multiplayer competitions
- [ ] More AI personality options
- [ ] Achievement system
- [ ] Export progress reports

---

Made with ❤️ for young mathematicians learning multiplication tables!