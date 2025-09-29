# Adaptive Learning Platform

An AI-powered adaptive learning platform designed to provide a personalized learning experience for students. It leverages generative AI to create dynamic tests, track progress in real-time, and offer tailored recommendations to address individual learning gaps.

## Key Features

*   **AI-Powered Test Generation:** Automatically generate personalized tests and quizzes based on student performance and learning goals. Each generated question has scoring logic dynamically configured with AI assistance.
*   **Adaptive Testing Engine:** The difficulty of questions adjusts in real-time based on student responses, ensuring an optimal and challenging learning experience.
*   **Real-time Progress Tracking:** Monitor student progress with detailed analytics and visualizations, with immediate updates to user progress scores.
*   **Diagnostic Reporting:** Identify students' strengths and weaknesses with comprehensive diagnostic reports, showcasing learning gaps, trends, and personalized recommendations.
*   **Personalized Learning Recommendations:** Provide students with tailored recommendations to help them improve in their weak areas.
*   **Parent and Teacher Dashboards:** Separate dashboards for parents and teachers to track student progress and gain insights.
*   **Secure User Authentication:** Secure user sign-up and login with support for guest access.

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

    Create a file named `.env.local` in the root of your project and add the following:

    ```
    GOOGLE_API_KEY=your_google_api_key
    ```

    Replace `your_google_api_key` with your actual Google API key. You can obtain a key from the [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
