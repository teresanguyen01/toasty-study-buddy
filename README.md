# Toasty's Study Buddy 🧠⚡

A modern flashcard application that converts handwritten notes into interactive flashcards using AI-powered OCR and spaced repetition learning.

## 🚀 Features

### Core Features

- **📸 OCR Note Upload**: Snap photos of handwritten notes and convert them to flashcards instantly
- **🤖 AI-Powered Q/A Generation**: Automatically generates high-quality question-answer pairs from your notes
- **📚 Spaced Repetition**: Implements the proven SM-2 algorithm for optimal learning retention
- **🎯 Smart Review System**: Tracks your progress and schedules reviews at optimal intervals
- **📊 Progress Analytics**: Visualize your learning progress with detailed statistics
- **👥 Social Features**: Share decks with friends and compete on leaderboards
- **🔐 Firebase Authentication**: Secure user authentication with email/password

### Technical Features

- **⚡ Fast Performance**: <200ms response times for smooth user experience
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **🔒 Secure**: Firebase Authentication and Firestore database
- **🔄 Real-time Updates**: Live progress tracking and instant feedback
- **🎨 Modern UI**: Beautiful, intuitive interface with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI Services**: OpenAI GPT-4 for Q/A generation
- **OCR**: Tesseract.js for text extraction
- **UI/UX**: Framer Motion, Lucide React icons
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+
- Firebase project (already configured)
- OpenAI API key
- Modern browser with camera access (for photo capture)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/toasty-study-buddy.git
cd toasty-study-buddy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# OCR Configuration
TESSERACT_LANG=eng
```

### 4. Firebase Setup

The Firebase configuration is already set up in `src/lib/firebase/config.ts` with your project settings:

- **Project ID**: toasty-study-buddy
- **Auth Domain**: toasty-study-buddy.firebaseapp.com
- **Storage Bucket**: toasty-study-buddy.firebasestorage.app

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📖 Usage Guide

### Creating Your First Account

1. **Sign Up**: Click "Sign up" on the login page
2. **Enter Details**: Provide your name, email, and password
3. **Verify Email**: Check your email for verification (optional)
4. **Start Learning**: Begin creating your first deck

### Creating Your First Deck

1. **Upload Notes**: Click "Upload Notes" on the homepage
2. **Take Photo**: Use your camera or upload an image of handwritten notes
3. **Review Cards**: Edit the AI-generated Q/A pairs as needed
4. **Save Deck**: Create a new deck and save your flashcards

### Studying with Spaced Repetition

1. **Start Review**: Click "Study Now" to begin a review session
2. **Rate Difficulty**: After each card, rate how well you knew it (0-5 scale)
3. **Track Progress**: Monitor your learning progress and due cards
4. **Stay Consistent**: Review regularly for optimal retention

### Managing Decks

- **Create Decks**: Organize cards into themed decks
- **Set Visibility**: Choose private, friends-only, or public sharing
- **Add Tags**: Categorize cards for better organization
- **Track Stats**: Monitor completion rates and study streaks

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── cards/         # Card management
│   │   ├── decks/         # Deck management
│   │   ├── ocr/           # OCR processing
│   │   ├── qa-generate/   # AI Q/A generation
│   │   └── review/        # Spaced repetition
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/             # React components
│   ├── forms/             # Form components
│   └── ui/                # UI components
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
└── lib/                   # Utility libraries
    ├── firebase/          # Firebase services
    ├── ai/                # AI services
    └── ocr/               # OCR services
```

## 🔧 API Endpoints

### OCR Processing

- `POST /api/ocr` - Extract text from uploaded images

### Q/A Generation

- `POST /api/qa-generate` - Generate Q/A pairs from text
- `PUT /api/qa-generate` - Improve existing Q/A pairs

### Deck Management

- `GET /api/decks` - List user's decks
- `POST /api/decks` - Create new deck
- `PUT /api/decks` - Update deck
- `DELETE /api/decks` - Delete deck

### Card Management

- `GET /api/cards` - List cards in deck
- `POST /api/cards` - Create new card
- `PUT /api/cards` - Update card
- `DELETE /api/cards` - Delete card

### Review System

- `GET /api/review` - Get next card for review
- `POST /api/review` - Submit review rating
- `PUT /api/review` - Get study statistics

## 🎯 Performance Goals

- **⚡ Speed**: Convert notes to flashcards in <30 seconds
- **🎯 Retention**: Drive ≥3 weekly study sessions
- **🚀 Scale**: Support 100k DAU with <200ms response times
- **📱 Accessibility**: WCAG 2.1 AA compliance

## 🔒 Security Features

- Firebase Authentication with email/password
- Firestore security rules
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file upload handling
- CORS protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SuperMemo 2](https://super-memo.com/) for the spaced repetition algorithm
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities
- [OpenAI](https://openai.com/) for AI-powered Q/A generation
- [Firebase](https://firebase.google.com/) for authentication and database
- [Next.js](https://nextjs.org/) for the amazing React framework

## 📞 Support

- 📧 Email: support@toasty-study-buddy.com
- 💬 Discord: [Join our community](https://discord.gg/toasty-study-buddy)
- 📖 Documentation: [docs.toasty-study-buddy.com](https://docs.toasty-study-buddy.com)

---

Made with ❤️ by the Toasty Study Buddy team
# toasty-study-buddy
