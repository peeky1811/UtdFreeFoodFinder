# 🍔 UTDFreeFoodFinder

**UTDFreeFoodFinder** is a professional, real-time web application designed for UT Dallas students to find and share free food on campus. It features a stunning "foodie" aesthetic and powerful proximity-based tools.

![Status](https://img.shields.io/badge/Status-Version--2.0-orange?style=for-the-badge)
![Tech](https://img.shields.io/badge/Stack-MERN%20(MongoDB,%20Express,%20React,%20Node)-green?style=for-the-badge)
![Aesthetic](https://img.shields.io/badge/UI-Dark%20Glassmorphism-purple?style=for-the-badge)

## ✨ Key Features

- **🚀 Proximity-Based Sorting**: Automatically sorts buildings by GPS distance, putting the closest locations at the top.
- **🔍 Searchable Location Selection**: Find any UTD building or specific room number by typing.
- **🌑 Premium Dark Aesthetic**: Custom-built glassmorphism design with a food collage background.
- **📸 In-App Camera**: Capture and upload food photos directly from the posting form.
- **✅ Verification System**: Community reports automatically mark food as **GONE** after 3 negative votes.
- **💬 Real-Time Comments**: Instant feedback and updates from fellow students.
- **🗺️ Navigation**: Native Map integration for every food alert.

## 🛠️ Tech Stack

### Database & Backend
- **MongoDB Atlas**: Cloud-hosted primary database for all food alerts, votes, and comments.
- **Express & Node.js**: High-performance REST API services.
- **Mongoose**: Object Data Modeling (ODM) for structured data integrity.

### Frontend
- **React (Vite)**: Component-based UI with ultra-fast HMR.
- **Vanilla CSS**: Bespoke design system (no generic UI libraries).
- **Lucide React**: Modern iconography.
- **React Webcam**: Native camera integration.

### APIs
- **[UTD Nebula API](https://api.utdnebula.com/)**: powers building layouts, rooms, and campus coordinates.

## 🚀 Getting Started

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/peeky1811/UtdFreeFoodFinder.git
   cd UtdFreeFoodFinder
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Add your MONGODB_URI to a .env file
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

*Originally developed for the UTD Community.*
