# 📚 DocGrind - MDN Documentation Learning Platform

A gamified reading experience for MDN JavaScript documentation with progress tracking, exercises, and streak management.

## ⚠️ PRODUCTION STATUS: BROKEN

**The content loading is currently broken in production.** The app works in development but fails in production due to Nuxt Content API route issues.

**Error:** `GET /api/_content/query/*.json` returns 404  
**Symptom:** "Failed to Load Content" on all reading pages  
**Cause:** Nuxt Content's query API doesn't work properly in production builds  

**Workaround:** Run in development mode (`npm run dev`) until fixed.

## 🎯 What It Does

DocGrind transforms reading MDN docs into an engaging, trackable learning experience:

- **Timed Sessions**: Choose 5min, 15min, 1hr, or unlimited reading sessions
- **Progress Tracking**: Visual progress bars and GitHub-style contribution charts
- **Smart Bookmarking**: Resume exactly where you left off in any chapter
- **AI Exercises**: Get 3 practice problems after completing each chapter
- **Streak Management**: Daily reading streaks with email reminders
- **Shareable Progress**: Screenshot-friendly dashboard for social proof

## 🚀 Features

### Session Modes
- **5min** - Quick daily habit building
- **15min** - Focused learning sessions  
- **Joy (1hr)** - Deep dive sessions
- **Zen** - Unlimited reading time

### Progress System
- Chapter completion tracking with percentages
- Overall MDN documentation progress
- Daily activity heatmap (GitHub-style)
- Reading position persistence within chapters

### Learning Enhancement
- LLM-generated exercises after each chapter
- Code editor for practice problems
- Chapter selection with completion status
- Resume vs restart options for flexibility

### Engagement Features
- Email reminders at 12pm, 3pm, 6pm
- Streak preservation messaging
- Shareable progress dashboard
- Daily stats (chapters read, exercises completed, time spent)

## 🛠 Setup

Install dependencies:
```bash
npm install
```

Start development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to start learning!

## 📊 Progress Persistence

All data is saved to localStorage:
- Reading positions within chapters
- Chapter completion status
- Daily activity streaks
- Exercise completion history
- Time spent learning

## 🎮 Usage

1. **Choose Session Mode** - Pick your preferred time limit
2. **Select Chapter** - Browse MDN docs with progress indicators
3. **Read & Track** - Your position is automatically saved
4. **Complete Exercises** - Practice with AI-generated challenges
5. **Build Streaks** - Maintain daily learning habits

## 📧 Reminder System

Stay consistent with smart email notifications:
- Sent only on days with no activity
- Includes streak preservation messaging
- Frequency: 12pm, 3pm, 6pm

## 🎨 Design Philosophy

- **Gamification**: Make documentation reading addictive
- **Progress Visibility**: Clear visual feedback on learning
- **Habit Formation**: Encourage daily reading streaks
- **Social Proof**: Shareable progress achievements

## 🚧 Development Status

Currently in MVP development. See `TODO.md` for detailed feature roadmap and implementation status.

## 🤖 Tech Stack

- **Framework**: Nuxt 3
- **Styling**: Tailwind CSS
- **Data Persistence**: localStorage
- **AI Integration**: LLM-generated exercises
- **Progress Visualization**: Custom charts and heatmaps