# 💰 Spendr — Smart Expense Tracker

A full-stack expense tracking web application built with **React** + **Firebase**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | Email/password signup & login via Firebase Auth |
| ➕ CRUD | Add, edit, delete expenses with a clean modal form |
| 🤖 Auto-categorize | Keywords in descriptions auto-assign a category |
| 📊 Charts | Doughnut (category breakdown) + Bar (monthly trend) |
| 🎯 Budget | Set monthly limit — alerts at 80% and 100% |
| 📱 Responsive | Works on desktop and mobile |
| ⚡ Real-time | Firestore `onSnapshot` keeps data live across tabs |

---

## 🗂 Project Structure

```
expense-tracker/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── AuthPage.jsx          # Login / Signup page
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx         # Main dashboard with charts
│   │   │   └── BudgetPage.jsx        # Budget settings + ring chart
│   │   ├── Expenses/
│   │   │   ├── ExpensesPage.jsx      # Expenses list with search/filter
│   │   │   └── ExpenseForm.jsx       # Add / Edit modal form
│   │   └── Layout/
│   │       └── Navbar.jsx            # Top navigation
│   ├── hooks/
│   │   ├── useAuth.js                # Firebase Auth context & helpers
│   │   ├── useExpenses.js            # Firestore CRUD for expenses
│   │   └── useBudget.js              # Read/write monthly budget
│   ├── utils/
│   │   └── categorize.js             # Auto-categorization engine
│   ├── styles/
│   │   └── global.css                # Design system & global styles
│   ├── firebase.js                   # Firebase initialization
│   ├── App.jsx                       # Root component & routing
│   └── index.js                      # React entry point
├── firestore.rules                   # Firestore security rules
├── package.json
└── README.md
```

---

## 🚀 Setup Instructions

### Step 1 — Clone / download this project

```bash
cd expense-tracker
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create a Firebase project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → give it a name (e.g. `spendr-app`)
3. Disable Google Analytics if not needed → **Create project**

### Step 4 — Enable Firebase Authentication

1. In the Firebase console, go to **Build → Authentication**
2. Click **"Get started"**
3. Under **Sign-in method**, enable **Email/Password**

### Step 5 — Create a Firestore database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll set rules next)
4. Select a Cloud Firestore location close to your users → **Done**

### Step 6 — Deploy Firestore security rules

Either paste the contents of `firestore.rules` directly in the Firebase console
under **Firestore → Rules**, or use the Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init firestore    # select your project
firebase deploy --only firestore:rules
```

### Step 7 — Add your Firebase config to the app

1. In Firebase console → **Project Settings** (gear icon) → **Your apps**
2. Click **"Add app"** → choose **Web** (`</>`)
3. Register the app (nickname: `spendr-web`)
4. Copy the values from the `firebaseConfig` object
5. Create a `.env` file in the project root using the values from `.env.example`:

```env
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1234567890
REACT_APP_FIREBASE_APP_ID=1:1234...
```

6. Restart the app after saving the file:

```bash
npm start
```

### Step 8 — Start the development server

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) — you're ready! 🎉

---

## 🏗 Build for production

```bash
npm run build
```

Then deploy the `build/` folder to Firebase Hosting, Vercel, or Netlify.

### Deploy to Firebase Hosting (optional)

```bash
firebase init hosting
# select "build" as the public directory
# configure as single-page app: Yes
firebase deploy --only hosting
```

---

## 🗃 Database Structure

### `users` collection

| Field | Type | Description |
|---|---|---|
| `user_id` | string | Firebase Auth UID |
| `name` | string | Display name |
| `email` | string | Email address |
| `budget` | number | Monthly budget limit (0 = not set) |
| `createdAt` | string | ISO date string |

### `expenses` collection

| Field | Type | Description |
|---|---|---|
| `id` | string | Auto-generated Firestore ID |
| `user_id` | string | Owner's Firebase Auth UID |
| `amount` | number | Expense amount in ₹ |
| `category` | string | Category id (food, transport, etc.) |
| `description` | string | Description text |
| `date` | string | Date in `YYYY-MM-DD` format |
| `createdAt` | string | ISO timestamp |

---

## 🤖 Auto-Categorization

When you type a description and move to the next field, the app scans the text
for keywords and automatically selects the closest category. You can always
override it manually.

| Category | Sample Keywords |
|---|---|
| 🍔 Food & Dining | restaurant, zomato, swiggy, pizza, grocery |
| 🚗 Transport | uber, ola, metro, petrol, toll, rapido |
| 🛍️ Shopping | amazon, flipkart, myntra, mall, cloth |
| 🎬 Entertainment | netflix, spotify, movie, gaming, concert |
| 💊 Health | doctor, pharmacy, gym, hospital, dental |
| ⚡ Utilities | electricity, wifi, mobile, recharge, bill |
| 📚 Education | book, course, tuition, udemy, exam |
| ✈️ Travel | hotel, flight, airbnb, makemytrip, oyo |

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **Firebase Auth** — Authentication
- **Firestore** — Real-time NoSQL database
- **Chart.js + react-chartjs-2** — Charts
- **date-fns** — Date formatting
- **react-hot-toast** — Notifications
- **lucide-react** — Icons

---

## 📄 License

MIT — free to use and modify.
