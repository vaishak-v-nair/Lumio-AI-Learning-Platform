# Lumio - Your Personalized Learning Companion

## About

Lumio is a web application designed to provide a personalized learning experience. It leverages AI to understand your learning needs and creates a tailored educational journey just for you.

## Features

*   **User Authentication:** Secure sign-up and login functionality.
*   **Personalized Onboarding:** A quick and easy multi-step form to understand your educational background and interests.
*   **AI-Powered Learning:** Utilizes Google's AI to generate custom learning plans and questions.
*   **User Profiles:** View and manage your profile information, including your name and bio.
*   **Performance Tracking:** Track your progress and review your test results.

## Technologies Used

*   **Frontend:**
    *   [Next.js](https://nextjs.org/)
    *   [React](https://reactjs.org/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
*   **Backend & Database:**
    *   [Firebase](https://firebase.google.com/) (Authentication, Firestore)
*   **AI:**
    *   [Google AI (Genkit)](https://developers.google.com/genkit)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js and npm installed on your machine.
*   A Firebase project set up with Authentication and Firestore enabled.

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/vaishak-v-nair/lumio.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Set up your environment variables. You'll need to create a `.env.local` file in the root of the project and add your Firebase configuration.
4.  Run the development server
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:9003`.
