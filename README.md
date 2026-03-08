# 🍔 UTDFreeFoodFinder

**UTDFreeFoodFinder** is a premium, real-time web application designed for UT Dallas students to find and share free food on campus. It combines a stunning "foodie" aesthetic with powerful proximity-based tools to ensure no free meal goes to waste.

![Status](https://img.shields.io/badge/Status-Version--2.0-orange?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-MERN%20Stack--Atlas-green?style=for-the-badge)
![Aesthetic](https://img.shields.io/badge/UI-Dark%20Glassmorphism-purple?style=for-the-badge)

## ✨ Key Features

- **🚀 Proximity-Based Sorting**: Intelligent "Nearby buildings" toggle sorts the campus map based on your GPS location, letting you post food in seconds.
- **🔍 Searchable building & Room Selection**: Type building codes (e.g., "ECSN", "JSOM") or specific room numbers to find exactly where the food is.
- **🌑 Premium Dark Aesthetic**: A high-resolution food collage background with deep glassmorphism panels for a state-of-the-art visual experience.
- **📸 In-App Camera**: Capture photos of the food directly from your phone or laptop camera for immediate posting.
- **✅ Community Validation**: Community-driven availability tracking. Cards are automatically marked as **GONE** and disabled after 3 negative reports.
- **💬 Real-Time Updates**: Live commenting system for Comets to share status updates (e.g., "Only Cheese pizza left!").
- **🗺️ Precision Navigation**: Direct Google Maps integration using precise coordinates from the Nebula API.

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: For a lightning-fast, reactive user experience.
- **Vanilla CSS**: A custom-built, premium glassmorphic design system.
- **Lucide React**: Sleek, modern iconography.
- **React Webcam**: For native photo capture capabilities.

### Backend & Database
- **Node.js & Express**: A robust RESTful API architecture.
- **MongoDB Atlas**: Cloud-hosted NoSQL database for real-time food alerts.
- **Mongoose**: Formalized data modeling for food posts, votes, and comments.

### External APIs
- **[UTD Nebula API](https://api.utdnebula.com/)**: powers the campus-wide location, building, and room data.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- MongoDB Atlas Account (for custom deployment)

### Installation & Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/peeky1811/UtdFreeFoodFinder.git
   cd UtdFreeFoodFinder
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with your MONGODB_URI
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the App:**
   Open your browser to `http://localhost:5173`.

## 📜 Roadmap
- [x] Searchable building/room selection.
- [x] GPS-based proximity sorting.
- [x] Transition to MongoDB Atlas.
- [x] Premium dark aesthetic overhaul.
- [ ] User authentication for authenticated posting.
- [ ] Push notifications for new food alerts near you.

---
*Powered by Comets, for Comets. Developed for the UTD Community.*
