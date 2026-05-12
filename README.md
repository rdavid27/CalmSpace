# CalmSpace - Mental Health Support Bot

CalmSpace is a personal mental health companion web application designed specifically to support college students. It provides a safe space for users to write journal entries and receive instant, AI-powered empathetic feedback, coping strategies, and encouragement.

## 🌟 Key Features

*   **User Authentication:** Secure sign-up and login functionality powered by Firebase Authentication.
*   **Daily Journaling:** A safe, private space for users to log their daily feelings, thoughts, and worries.
*   **AI-Powered Analysis:** Integrates with the **Google Gemini API** to analyze journal entries and provide:
    *   A brief, empathetic summary of the user's emotional state.
    *   Practical coping strategies and tips.
    *   Positive, encouraging messages tailored to the entry.
*   **Journal History:** All entries and their AI analyses are securely saved to Firebase Firestore, allowing users to look back at their progress.
*   **Mental Health Resources:** A dedicated section providing quick access to crisis support (like the National Suicide Prevention Lifeline), campus resources, self-care tips, and helpful wellness apps.
*   **Responsive Design:** A clean, calming, and responsive UI built with vanilla HTML/CSS and Feather Icons.

## 🛠️ Technology Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules)
*   **Backend & Database:** Firebase Authentication, Cloud Firestore
*   **AI Integration:** Google Gemini API (`gemini-1.5-flash`)
*   **Icons:** Feather Icons
*   **Development Tools:** Node.js (for local server via `serve` or `live-server`)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

*   Node.js and npm installed on your machine.
*   A Firebase project with Authentication (Email/Password) and Firestore enabled.
*   A Google Gemini API key.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/CalmSpace.git
    cd CalmSpace
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure API Keys:**
    Open `script.js` and locate the configuration sections. **Note:** In a production environment, you should secure these keys (e.g., via environment variables or a backend server), but for local development they are configured as variables.
    
    *   Update the `firebaseConfig` object with your Firebase project details.
    *   Update the `GEMINI_API_KEY` variable with your valid Google Gemini API key.

4.  **Run the application:**
    You can run the app locally using the provided npm scripts:
    
    *   For a development server with live reload:
        ```bash
        npm run dev
        ```
    *   Or using `serve`:
        ```bash
        npm start
        ```

5.  **Open your browser:**
    Navigate to the local URL provided by the terminal (usually `http://127.0.0.1:8080` or similar).

## 🔒 Security Note

The current implementation includes API keys directly in the frontend JavaScript files for demonstration purposes. **Before deploying to production, ensure you implement proper security measures:**
*   Set up Firebase Security Rules for Firestore to restrict data access only to the authenticated user.
*   Consider moving the Gemini API calls to a secure backend (e.g., Firebase Cloud Functions) to avoid exposing your Gemini API key in the client-side code.

## 📄 License

This project is licensed under the MIT License.
