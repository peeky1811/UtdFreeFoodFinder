# 🍔 UTDFreeFoodFinder

**UTDFreeFoodFinder** is a premium, real-time web application designed for UT Dallas students to find and share free food on campus. Built during a hackathon, it emphasizes speed, ease of use, and a beautiful glassmorphism aesthetic.

![Status](https://img.shields.io/badge/Status-Hackathon--Ready-orange?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-React%20%7C%20Nebula%20API-blue?style=for-the-badge)

## ✨ Key Features

- **🚀 Real-Time Feed**: Instantly see posts as they happen. Uses a custom Pub/Sub synchronization layer for seamless cross-tab updates without complex backend setup.
- **📍 Nebula API Integration**: Fetches precise UTD campus building data, room numbers, and coordinates.
- **🛰️ GPS "Locate Me"**: Intelligent proximity detection automatically selects the nearest building based on your real-time location.
- **📸 Camera Capture**: Snap a photo of the food directly from the app when posting.
- **✅ Smart Voting**: Explicit "Still items left" and "Food is gone" buttons. Automatically marks posts as 'GONE' after 3 negative reports.
- **💬 Live Updates**: Leave instant comments (e.g., "Only napkins left!") to keep fellow Comets informed.
- **🗺️ Map Navigation**: One-click Google Maps integration with precise pin-drops based on Nebula coordinates.
- **🎨 Premium UI**: Modern dark mode with glassmorphism, fluid animations, and responsive design.

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS (Custom Glassmorphic System)
- **Icons**: Lucide React
- **Data Layer**: Mock DB with `localStorage` Pub/Sub (Firebase-ready)
- **APIs**: [UTD Nebula API](https://api.utdnebula.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/peeky1811/UtdFreeFoodFinder.git
   cd UtdFreeFoodFinder
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   Navigate to `http://localhost:5173` in your browser.

## 🧪 Demo Mode

The app comes with a built-in **Demo Mode**. Since Firebase configuration varies by user, the app uses a resilient `localStorage` sync mechanism. 
- Open the app in two different browser tabs.
- Post food in one tab.
- Watch it appear **instantly** in the second tab!

## 📜 License

Created for the UTD Hackathon. Feel free to use and improve!

---
*Developed with ❤️ for the UTD Community.*
