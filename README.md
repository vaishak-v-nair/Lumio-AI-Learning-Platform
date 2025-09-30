# Lumio: An AI-Powered Adaptive Learning Platform

Lumio is an intelligent, personalized learning platform designed to help students master new topics. It leverages cutting-edge generative AI to create a dynamic and responsive educational experience that adapts to each user's individual learning pace and style.

## Key Features

*   **Retrieval-Augmented (RAG) Test Generation**: Goes beyond simple prompts by using a structured knowledge base to generate diverse, contextually relevant, and non-repetitive test questions.
*   **Truly Adaptive Testing Engine**: The difficulty of questions adjusts in real-time during a test based on the student's answers, creating an optimal learning curve.
*   **AI-Powered Scoring & Feedback**: Moves beyond simple right/wrong checks. The AI dynamically scores answers and provides detailed, encouraging explanations for both correct and incorrect responses.
*   **Comprehensive Diagnostic Reporting**: Generates detailed reports that break down performance into four key learning fundamentals:
    *   **Listening**: Comprehending the details of a question.
    *   **Grasping**: Understanding core concepts.
    *   **Retention**: Recalling facts and formulas.
    *   **Application**: Applying knowledge to solve problems.
*   **Personalized AI Recommendations**: Provides actionable tips and learning plans tailored to the user's weak areas, with different suggestions for students, parents, and teachers.
*   **Multi-Perspective Dashboards**:
    *   **Student Dashboard**: Tracks daily progress, shows recent achievements, and launches new tests.
    *   **Parent Dashboard**: Offers a snapshot of the child's performance, highlighting strengths, weaknesses, and providing supportive tips.
    *   **Teacher Dashboard**: Visualizes classroom-level data with a response-time heatmap and generates AI-driven insights for the entire class.
*   **Gamification & Engagement**: Motivates learners by awarding badges and tracking achievements for milestones like mastering a topic, maintaining a streak, or quick thinking.
*   **Secure User Authentication & Profiles**: Features a complete authentication system (sign-up/login) and personalized user profiles where users can track their lifetime statistics and customize their avatar.

## Technology Stack

*   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **AI/Generative**: [Google's Gemini models](https://deepmind.google/technologies/gemini/) via [Genkit](https://firebase.google.com/docs/genkit)
*   **UI**: [React](https://react.dev/) with [ShadCN UI](https://ui.shadcn.com/) components
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database**: [Firebase](https://firebase.google.com/) (Firestore for database, Firebase Auth for authentication)
*   **Charting**: [Recharts](https://recharts.org/)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later)
*   npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/your-project.git
    cd your-project
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up your environment variables:**

    Create a file named `.env` in the root of your project and add your Google AI API key:

    ```
    # No .local needed, this file is gitignored
    GOOGLE_API_KEY=your_google_api_key
    ```

    Replace `your_google_api_key` with your actual Google API key. You can obtain a key from the [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
