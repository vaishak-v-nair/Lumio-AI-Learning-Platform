# 🌟 Lumio: An AI-Powered Adaptive Learning Platform

**Lumio** is an intelligent, personalized learning platform designed to help students master new topics.  
It leverages cutting-edge **Generative AI** to create a dynamic and responsive educational experience that adapts to each user’s pace and style.

---

## 🔑 Key Features

- **AI-Powered Test Generation**  
  Automatically generates personalized tests & quizzes using a Retrieval-Augmented Generation (RAG) model.  
  Each question comes with dynamic scoring logic configured by AI.  

- **Adaptive Testing Engine**  
  Adjusts difficulty in real-time based on student responses, ensuring students stay challenged but not overwhelmed.  

- **AI-Powered Scoring & Feedback**  
  Goes beyond right/wrong checks — dynamically scores answers and provides detailed, encouraging explanations.  

- **Real-Time Progress Tracking**  
  Provides instant updates to student scores and progress bars, with visual dashboards, charts, and trends.  

- **Comprehensive Diagnostic Reporting**  
  Breaks down strengths & weaknesses across four key pillars: **Listening, Grasping, Retention, and Application**.  
  Includes radar charts & heatmaps for clear insights.  

- **Personalized Learning Recommendations**  
  AI prescribes targeted practice content and learning plans to help students strengthen weak areas.  

- **Multi-Perspective Dashboards**  
  - **Teacher View** → Class heatmaps, group performance insights  
  - **Parent View** → Simple progress summary of their child  
  - **Student View** → Tracks daily progress, achievements, and launches tests  

- **Gamification & Engagement**  
  Motivates learners with badges, streaks, and milestone achievements.  

- **Secure User Authentication**  
  Role-based login (student, parent, teacher) and guest access for demo.  

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)  
- **Language**: [TypeScript](https://www.typescriptlang.org/)  
- **AI/Generative**: [Google’s Gemini Models](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)  
- **UI**: [React](https://react.dev/) + [ShadCN UI](https://ui.shadcn.com/)  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)  
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore + Firebase Auth)  
- **Charts/Visuals**: [Recharts](https://recharts.org/)  

---

## 🚀 Getting Started

Follow these steps to set up **Lumio** on your local machine.

### ✅ Prerequisites
- Node.js (v18 or later)  
- npm  

### ⚙️ Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/your-repo/your-project.git
   cd your-project
2. **Install dependencies**
   ```bash
   npm install

3. **Set up environment variables**

   Create a file named .env in the root directory:
   ```bash
   GOOGLE_API_KEY=your_google_api_key

👉 Get your API key from Google AI Studio:[Google AI Studio](https://aistudio.google.com/app/api-keys)

4. **Run the development server**
   ```bash
   npm run dev

Open 👉 http://localhost:9002 in your browser.
