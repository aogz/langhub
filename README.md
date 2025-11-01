# 🚀 Langhub: Your AI-Powered Language Learning Classroom

**Langhub is a revolutionary web application that transforms any content into an interactive language learning environment. Learn languages naturally by reading real content—articles, blogs, news—with AI-powered assistance powered by Chrome's built-in AI and Webfuse Web Augmentation Proxy.**

[![Google Chrome Built-in AI Challenge 2025 Submission](https://img.shields.io/badge/Google%20Chrome%20AI%20Challenge-2025-blueviolet)](https://googlechromeai2025.devpost.com/)

---

## Table of Contents

- [The Challenge: Immersive Learning, Interrupted](#the-challenge-immersive-learning-interrupted)
- [Our Solution: The Web Is Your Classroom](#our-solution-the-web-is-your-classroom)
- [Features](#-features)
- [Powered by Chrome's Built-in AI](#-powered-by-chromes-built-in-ai)
- [How to Use & Test](#️-how-to-use--test)
  - [Installation](#installation)
  - [Usage](#usage)
- [Architecture](#-architecture)
- [License](#-license)

---

## The Challenge: Immersive Learning, Interrupted

Language learners thrive on immersion. Reading articles, blogs, and news in a target language is one of the most effective ways to build vocabulary and understanding. However, the constant need to switch tabs to look up unknown words breaks the flow, disrupts concentration, and makes the learning process feel disjointed and frustrating.

Traditional language learning apps force you into artificial environments, away from the real content you want to engage with. You lose context, momentum, and the natural learning rhythm that comes from reading authentic material.

## Our Solution: The Web Is Your Classroom

**Langhub** is a powerful web application that transforms any content into an interactive language-learning playground. It turns the content you already love—articles, blogs, and stories—into your next lesson. With powerful, on-device AI powered by Chrome's built-in APIs, you can translate words, get grammar explanations, ask questions about text and images, and practice vocabulary—all in one seamless interface.

No more copy-pasting, no more context switching. Just pure, uninterrupted immersion.

## ✨ Features

-   **Content Import**: Capture content from webpages directly into your classroom using Webfuse Web Augmentation Proxy technology
-   **Interactive Word Selection**: Click and highlight words within selected text blocks for instant translation
-   **Instant, On-Device Translation**: Get real-time translations for words and phrases using Chrome's Translator API
-   **Contextual Q&A**: Ask questions about selected text and receive AI-powered explanations tailored to your learning level
-   **Grammar Guru**: Instantly get clear, concise explanations for complex sentences and grammatical structures
-   **Multimodal Learning**: Ask questions about images or provide voice answers—the AI understands context from both text and visual content
-   **Vocabulary Builder**: Automatically save words you translate to build your personal vocabulary database
-   **Practice Mode**: Test your knowledge with interactive practice sessions for your saved vocabulary
-   **Smart Language Detection**: Automatically detects the source language for accurate translations
-   **Personalized Experience**: Set your native and target languages to tailor the entire experience to your learning journey
-   **Chat History**: Maintain conversation context across multiple questions and learning sessions
-   **Textbook View**: Access a clean, organized view of all your selected texts and learning materials
-   **Import/Export Vocabulary**: Manage your word lists with CSV import/export functionality
-   **Elegant UI**: Modern, unobtrusive interface that keeps you focused on learning
-   **Privacy-First**: All AI processing happens client-side—your browsing and learning habits remain completely private

## 🧠 Powered by Chrome's Built-in AI

Langhub is built using **Chrome's built-in AI APIs**, participating in the **Google Chrome Built-in AI Challenge 2025**. We leverage the following APIs to create a comprehensive learning experience:

-   **Translator API**: Delivers fast, private, and seamless translation for selected words and phrases
-   **Language Detection API**: Automatically detects the source language to ensure accurate translations
-   **Prompt API**: Powers our Contextual Q&A, Grammar Guru, and multimodal learning features
  - Multimodal support for **image and audio input**—provide an image to generate questions or speak your answers directly
  - Uses Gemini 2.0 Flash Experimental model for intelligent, context-aware responses

Using on-device models means:

-   **🚀 Blazing Speeds**: Translations and AI responses are almost instantaneous
-   **🔒 Enhanced Privacy**: Your selected text never leaves your browser
-   **💸 No Server Costs**: Powerful AI features with no backend overhead
-   **✈️ Offline Capability**: Works even when your connection is spotty
-   **🌍 Global Access**: No account required, no data collection, completely private

This project showcases the power of client-side AI to create more responsive, private, and accessible web experiences for everyone.

## 🛠️ How to Use & Test

We've made it simple for you to test Langhub.

### Installation

1.  **Clone the Repository**:

    ```bash
    git clone <repository-url>
    cd langhub
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Run the Application**:

    Start the development server:

    ```bash
    npm start
    ```

    Or build for production:

    ```bash
    npm run build
    ```

4.  **Configure Your Languages**:

    -   Open the Langhub web app (typically running on `http://localhost:3000`)
    -   Navigate to Settings
    -   Set your native language
    -   Click **"Save Settings"**

5. **Enable Experimental APIs** (Optional):

    For AI features to work, you might need to enable certain flags by going to [chrome://flags](chrome://flags):

    -  Prompt API for Gemini Nano (Enable Multilingual)
    -  Prompt API for Gemini Nano with Multimodal Input
    -  Proofreader API for Gemini Nano (optional)

### Usage

1.  **Add Content to Your Classroom**:

    -   Open Langhub in your browser
    -   Copy text from any webpage, article, or document
    -   Paste it directly into the Langhub classroom

2.  **Interactive Translation**:

    -   Once text appears in the classroom, highlight individual words or phrases
    -   Translation popups appear instantly with the word's meaning
    -   Click **"Next"** to save words to your vocabulary

3.  **Ask Questions & Get Explanations**:

    -   Select a sentence or paragraph in your classroom
    -   Use the **"Ask me a question"** button to have the AI generate a question for you to answer
    -   Or type your own question in the chat interface
    -   Get grammar explanations with the **"Explain grammar"** button

4.  **Learn with Images**:

    -   Paste or import images into your classroom
    -   Click **"Ask about this image"** to generate language learning questions about the image

5.  **Practice Your Vocabulary**:

    -   Navigate to the Vocabulary page to see all your saved words
    -   Use the **"Practice"** feature to test your knowledge
    -   Track your progress with the visual progress indicators

6.  **Voice Input**:

    -   Use the microphone button to speak your answers
    -   The AI will evaluate your spoken responses and provide feedback

7.  **Manage Your Learning**:

    -   Access your **Textbook** page to review all selected texts
    -   Import/export vocabulary lists as CSV files
    -   Group words by source to track where you learned them

## 🏗️ Architecture

Langhub is a React-based web application with an Webfuse extension component:

### React Web Application (`src/`)

-   **Classroom Component**: Main learning interface where content appears for interaction
-   **Vocabulary Management**: Complete vocabulary system with practice mode and progress tracking
-   **Settings**: Language preferences and user configuration
-   **Textbook Page**: Organized view of all selected texts and learning materials
-   **Interactive Text**: Word-level selection and translation functionality
-   **Chat Interface**: AI-powered Q&A with conversation history

### Webfuse extension (`wf-extension/`)

-   **Content Script** (`content.js`): Enables seamless text and image capture from webpages
-   **New Tab Override** (`startpage.html`): Custom start page that opens the Langhub classroom
-   **WebFuse Integration**: Uses Webfuse for communication between the extension and web app

### Key Technologies

-   React 19 with React Router
-   Tailwind CSS for styling
-   Chrome Built-in AI APIs (Translator, Prompt, Language Detection)
-   LocalStorage for data persistence
-   Service Worker for offline support

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for language learners everywhere**

