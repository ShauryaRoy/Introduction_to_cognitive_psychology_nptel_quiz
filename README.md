# Cognitive Psychology Quiz

A clean, dark-themed quiz application built with React and Vite. Test your knowledge of cognitive psychology across 12 weeks with 120 questions extracted directly from DOCX files.

## Features

- **Week-wise Practice**: Study questions from individual weeks in their original order
- **All Weeks Mock Test**: Randomized test combining all 120 questions with shuffled options
- **Answer Safety**: Correct answers only revealed after quiz submission
- **Dark Minimalist UI**: Clean, modern interface with no unnecessary elements
- **Instant Feedback**: Color-coded results (green for correct, red for incorrect)
- **No File Uploads**: All questions pre-parsed from DOCX files into static JSON
- **Zero Answer Mismatches**: Every correct answer validated to exist in options before loading

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Steps

1. **Navigate to the project directory**
   ```bash
   cd quiz-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## How to Start

### Development Server
Start the development server with hot-reload:
```bash
npm run dev
```

The app will open at **http://localhost:5174** (or the next available port).

### Production Build
Create an optimized production build:
```bash
npm run build
```

Output will be in the `dist/` folder, ready to deploy.

### Preview Production Build
To test the production build locally:
```bash
npm run preview
```

## How to Use

1. **Home Page**: Select a week (1-12) to practice or click "All Weeks Mock Test" for a combined randomized test
2. **Taking a Quiz**:
   - Read each question carefully
   - Select one option per question (radio button)
   - Progress through all questions
   - Click "Submit Quiz" to finish
3. **Review Results**:
   - Score displayed at the top
   - Correct answers highlighted in green
   - Your incorrect selections highlighted in red
   - Correct answer shown inline for questions you got wrong
   - Questions you didn't answer marked as unanswered

## Project Structure

```
src/
├── data/
│   └── questions.json          # All 120 questions, 12 weeks (auto-generated from DOCX files)
├── lib/
│   └── buildQuiz.js            # Quiz builder with validation & shuffling logic
├── components/
│   ├── Home.jsx                # Week selection & mode selector
│   └── Quiz.jsx                # Quiz interface & results
├── App.jsx                     # Main app component
├── App.css                     # Dark minimalist styles
└── main.jsx                    # Entry point
```

## Data Format

Questions are stored in `src/data/questions.json` with this structure:
```json
{
  "weeks": [
    {
      "week": 1,
      "questions": [
        {
          "question": "Question text...",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A"
        }
      ]
    }
  ]
}
```

**Important**: Correct answers are validated on parse—each answer must exactly match one option.

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool & dev server
- **Mammoth**: DOCX file parsing (for initial data extraction)
- **CSS3**: Dark minimalist styling

## Keyboard Shortcuts

- No keyboard shortcuts in the UI currently
- All navigation via mouse/touch

## Browser Support

Works on all modern browsers (Chrome, Firefox, Safari, Edge)

## License

Private project

---

**Need help?** Check that:
- Node.js and npm are installed: `node -v && npm -v`
- Dependencies installed: `npm install`
- You're in the `quiz-app` directory when running commands
- Port 5174 is not blocked by a firewall
