# JimatMakan

## Project Overview
**JimatMakan** is a community-driven web application designed to help users navigate the rising cost of living. The platform empowers users to track their daily food expenses, discover affordable local eateries, and share "budget gems" within their community. By crowdsourcing price data, JimatMakan ensures that quality meals remain accessible to everyone, regardless of their budget.

---

## Technologies Used
*   **Frontend:** React.js (TypeScript)
*   **Styling:** Tailwind CSS & shadcn/ui
*   **Build Tool:** Vite
*   **Platform:** Lovable.dev (AI-native development)
*   **Backend/Database:** Supabase (PostgreSQL & Auth)

---

## Installation / Setup Guide

To run this project on your local machine, follow these steps:

### 1. Prerequisites
*   **Node.js** (v18.0.0 or higher)
*   **npm** or **bun** package manager

### 2. Clone the Repository
```bash
git clone https://github.com/qiphy/jimatmakan.git
cd jimatmakan
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Configuration
Create a `.env` file in the root folder and populate it with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Start Development Server
```bash
npm run dev
```
The application will be live at `http://localhost:8080`.

---

## Future Roadmap
*   **Map Integration:** A real-time geographical view to find the cheapest meals within a 5km radius.
*   **Smart Receipt Scanner:** Use AI to extract meal prices from receipt photos for instant expense logging.
*   **Social Savings Challenges:** Gamified features where users can compete to see who can eat healthily on the lowest budget.
*   **Price History Graphs:** Visualizing inflation trends for specific dishes (e.g., Nasi Lemak price tracking) over time.

---

## Contributing
If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcomed.
