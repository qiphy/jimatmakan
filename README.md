# Jimat Makan

Project Overview

JimatMakan is a streamlined web application built to help users navigate the rising costs of dining out. By providing a platform to track food expenses and discover budget-friendly local eateries, it empowers the community to make smarter financial decisions without sacrificing the joy of a good meal.

Technologies Used

Frontend: React.js with TypeScript

Styling: Tailwind CSS (via Shadcn UI components)

Build Tool: Vite

Development Platform: Lovable

Database/Backend: Supabase (PostgreSQL & Auth)

Installation / Setup Guide
Prerequisites
Node.js (v18.0 or higher)

npm or bun

Setup Steps
Clone the Repository:

Bash
git clone https://github.com/qiphy/jimatmakan.git
cd jimatmakan
Install Dependencies:

Bash
npm install
# OR if you prefer bun
bun install
Environment Variables:
Create a .env file in the root directory and add your Supabase credentials (if applicable):

Code snippet
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Run Development Server:

Bash
npm run dev
Open http://localhost:8080 to view the app.

Future Roadmap

Interactive Price Maps: Integration with Mapbox or Google Maps to visualize "Cheap Eat" clusters in real-time.

OCR Receipt Scanner: Allow users to snap a photo of their receipt to automatically log expenses.

Community Leaderboards: Gamify savings by ranking users who contribute the most helpful budget tips.

Progressive Web App (PWA): Enable offline access and mobile-home-screen installation for quick logging on the go.
