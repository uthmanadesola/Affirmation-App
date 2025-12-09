# PROJECT.md — Daily Affirmations App

## Project Overview

**Daily Affirmations** is a micro-SaaS web application that provides users with personalized motivational affirmations. Users can create accounts, receive random affirmations, add their own custom affirmations, and optionally generate AI-powered affirmations. The application features a customizable theme system and a responsive design that works across all devices.

---

## Table of Contents

1. [How the Project Aligns with Requirements](#how-the-project-aligns-with-requirements)
2. [Data Management Strategy](#data-management-strategy)
3. [API and Backend Architecture](#api-and-backend-architecture)
4. [Backend Connection Strategy](#backend-connection-strategy)
5. [AI and LLM Tools Disclosure](#ai-and-llm-tools-disclosure)
6. [How to Run the Project](#how-to-run-the-project)
7. [Project Structure](#project-structure)

---

## How the Project Aligns with Requirements

### 1. Component Design

**Requirement:** Use reusable, well-structured React components with clear props and state boundaries. One or more composite components that demonstrate component composition.

**Implementation:**

The application implements several reusable and composite components:

| Component | Location | Purpose |
|-----------|----------|---------|
| `NavigationBar` | `src/components/navigationBar.tsx` | Responsive navigation with authentication-aware rendering |
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | HOC that wraps protected pages and redirects unauthenticated users |
| `SettingsPanelComponent` | `src/pages/settingsPanel.tsx` | Slide-out settings panel with theme customization |
| `AuthProvider` | `src/context/AuthContext.tsx` | Context provider wrapping the entire application |

**Composite Component Example — Affirmation Page:**

The `AffirmationPage` (`src/pages/affirmation.tsx`) demonstrates component composition by combining:
- `ProtectedRoute` wrapper for authentication
- `SettingsPanelComponent` for user settings
- Affirmation display card
- Form for adding new affirmations
- List component for viewing/editing user's affirmations

**Props and State Boundaries:**

Each component maintains clear boundaries:
- `ProtectedRoute` receives `children` props and manages redirect logic internally
- `NavigationBar` consumes auth state via `useAuth()` hook but doesn't modify it
- `SettingsPanelComponent` manages its own local state for settings and persists to localStorage

---

### 2. State Management

**Requirement:** Use a recognized state management approach for global/complex state. Demonstrate separation between UI state, client cache, and remote data.

**Implementation:**

**Global State — React Context (`AuthContext`):**

```typescript
// src/context/AuthContext.tsx
type AuthContextType = {
    user: User;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
};
```

The `AuthContext` provides:
- Global authentication state accessible throughout the app
- `login()` and `logout()` functions for state mutations
- Automatic persistence to localStorage on state changes

**State Separation:**

| State Type | Management Approach | Example |
|------------|---------------------|---------|
| **UI State** | Local `useState` | `isMenuOpen`, `isLoading`, `showForm` |
| **Client Cache** | localStorage | Auth tokens, user settings, theme preferences |
| **Remote Data** | Fetch + local state | Affirmations fetched from API stored in component state |

**Settings State with Event-Driven Updates:**

The settings panel uses a custom event system to notify other components of theme changes:

```typescript
// Dispatch event when settings change
window.dispatchEvent(new Event('settingsChanged'));

// Components listen for changes
useEffect(() => {
    const handleSettingsChange = () => setGradient(getGradient());
    window.addEventListener('settingsChanged', handleSettingsChange);
    return () => window.removeEventListener('settingsChanged', handleSettingsChange);
}, []);
```

---

### 3. Authentication & Authorization

**Requirement:** Implement sign up / sign in flows (email+password). Protect at least one route requiring authentication. Persist authentication state across reloads.

**Implementation:**

**Sign Up Flow (`src/pages/signup.tsx`):**
1. User enters name, email, and password
2. Form submits to `POST /api/auth/signup`
3. Server hashes password with bcrypt, stores user in MongoDB
4. Server returns JWT token and user object
5. Client stores token in AuthContext and localStorage
6. User redirected to `/affirmation`

**Sign In Flow (`src/pages/login.tsx`):**
1. User enters email and password
2. Form submits to `POST /api/auth/signin`
3. Server validates credentials against hashed password
4. Server returns JWT token (expires in 7 days)
5. Client stores token and redirects to `/affirmation`

**Protected Routes:**

The `/affirmation` page is protected using the `ProtectedRoute` component:

```typescript
// src/components/ProtectedRoute.tsx
export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    
    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = '/login';
        }
    }, [isAuthenticated]);
    
    if (!isAuthenticated) {
        return <div>Redirecting to login...</div>;
    }
    return <>{children}</>;
}
```

**User-Scoped Data:**

Affirmations are scoped to individual users:
- `POST /api/affirmations` — Creates affirmation with userId from JWT token
- `GET /api/affirmations/my` — Returns only the authenticated user's affirmations
- `PUT /api/affirmations/:id` — Only allows updates if userId matches
- `DELETE /api/affirmations/:id` — Only allows deletion if userId matches

**Persistence Across Reloads:**

```typescript
// On app load, restore auth state from localStorage
useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
    }
}, []);
```

---

### 4. Routing

**Requirement:** Use client-side routing with at least one nested route. Provide navigation and handle not-found routes gracefully.

**Implementation:**

**Router:** TanStack React Router (`@tanstack/react-router`)

**Route Structure:**

```
/                    → Home page (public)
/login               → Login page (public)
/signup              → Sign up page (public)
/affirmation         → Main affirmation page (protected)
/settingsPanel       → Settings page
/blog                → Blog parent route
  └── /blog/article  → Nested article route
/logout              → Logout handler
/*                   → 404 Not Found
```

**Nested Route Implementation (`src/pages/blog/index.tsx`):**

```typescript
export default (parent: AnyRoute) => {
  const rootRoute = createRoute({
    path: '/blog',
    getParentRoute: () => parent,
  })
  return createTree(rootRoute, article)  // article is nested child
}
```

**Navigation Component:**

The `NavigationBar` component provides:
- Responsive navigation (desktop + mobile hamburger menu)
- Authentication-aware links (shows different options based on login state)
- Active link highlighting using `useLocation()`
- Theme synchronization with settings

**404 Not Found Handler:**

```typescript
// src/pages/index.tsx
export const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="min-h-screen bg-gradient-to-br ... flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page not found!</p>
      <Link to="/" className="...">Go Home</Link>
    </div>
  ),
});
```

---

### 5. Server Communication & Persistence

**Requirement:** Implement CRUD interactions with a backend API or BaaS. Demonstrate reading/writing persistent data for user-specific resources.

**Implementation:**

**Backend Stack:**
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB Atlas (cloud-hosted)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt

**CRUD Operations for Affirmations:**

| Operation | Method | Endpoint | Auth | Description |
|-----------|--------|----------|------|-------------|
| **Create** | POST | `/api/affirmations` | Required | Add new affirmation (userId from token) |
| **Read All** | GET | `/api/affirmations` | No | Get all affirmations (for random selection) |
| **Read User's** | GET | `/api/affirmations/my` | Required | Get authenticated user's affirmations |
| **Read Random** | GET | `/api/affirmations/random` | No | Get one random affirmation |
| **Update** | PUT | `/api/affirmations/:id` | Required | Update affirmation (owner only) |
| **Delete** | DELETE | `/api/affirmations/:id` | Required | Delete affirmation (owner only) |

**User-Specific Resource Example:**

```javascript
// server/routes/affirmations.cjs — GET user's affirmations
router.get(`/my`, authMiddleware, async (req, res) => {
    const userId = req.user.userId;  // From JWT token
    const db = await connectDB();
    const affirmations = await db.collection('affirmations')
        .find({ userId: userId.toString() })
        .sort({ createdAt: -1 })
        .toArray();
    res.json(affirmations);
});
```

**Frontend API Communication:**

```typescript
// Fetch with authentication header
const response = await fetch('http://localhost:3001/api/affirmations/my', {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Data Management Strategy

### Why These Choices Were Made

**1. MongoDB Atlas (Database)**

Chosen for:
- Flexible schema for affirmations (easy to add fields later)
- Cloud-hosted with automatic scaling
- Free tier suitable for development and small-scale deployment
- Native support for Node.js via official driver

**2. React Context (State Management)**

Chosen over Redux/Zustand because:
- Authentication state is relatively simple (user, token, isAuthenticated)
- No need for complex middleware or devtools
- Built into React, no additional dependencies
- Sufficient for the scope of this application

**3. localStorage (Client Persistence)**

Used for:
- JWT token storage (persists auth across browser sessions)
- User settings/preferences (theme, notifications)
- Quick access without network requests

**4. JWT Tokens (Authentication)**

Chosen for:
- Stateless authentication (no server-side session storage)
- Contains user ID for request authorization
- Standard industry practice for API authentication
- 7-day expiration balances security and user convenience

---

## API and Backend Architecture

### Server Structure

```
server/
├── index.cjs          # Express app entry point, middleware setup
├── db.cjs             # MongoDB connection singleton
├── middleware/
│   └── auth.cjs       # JWT verification middleware
└── routes/
    ├── auth.cjs       # /api/auth/* — signup, signin
    ├── affirmations.cjs  # /api/affirmations/* — CRUD operations
    └── ai.cjs         # /api/ai — AI affirmation generation
```

### Authentication Middleware

```javascript
// server/middleware/auth.cjs
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach user info to request
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
```

### Database Schema

**Users Collection:**
```javascript
{
    _id: ObjectId,
    email: String,
    password: String (hashed),
    name: String,
    createdAt: Date
}
```

**Affirmations Collection:**
```javascript
{
    _id: ObjectId,
    text: String,
    userId: String,
    createdAt: Date,
    updatedAt: Date (optional)
}
```

---

## Backend Connection Strategy

### Connection Flow

1. **Frontend makes request** with JWT token in Authorization header
2. **Express receives request** and routes to appropriate handler
3. **Auth middleware** (if protected route) validates JWT and extracts userId
4. **Route handler** connects to MongoDB via singleton pattern
5. **Database operation** executes with user-scoped queries
6. **Response returned** to frontend as JSON

### MongoDB Connection Pattern

```javascript
// Singleton pattern prevents multiple connections
let db = null;

async function connectDB() {
    if (db) return db;  // Return existing connection
    
    const client = new MongoClient(process.env.MONGODB_URI, {
        tls: true,
        serverSelectionTimeoutMS: 5000,
    });
    
    await client.connect();
    db = client.db("affirmation_app");
    return db;
}
```

### Error Handling Strategy

- All API endpoints wrapped in try-catch blocks
- Meaningful error messages returned to client
- Server-side errors logged to console
- Client displays user-friendly error messages

---

## AI and LLM Tools Disclosure

### AI Usage in Development

**Minimal AI assistance** was used during development, specifically for:

1. **`src/services/aiAffirmation.ts`** — This file implements AI-powered affirmation generation using the Xenova/transformers library with the distilgpt2 model. The implementation includes prompt engineering for generating category-specific affirmations and fallback logic when AI generation fails.

### AI Features in the Application

The application includes an optional AI affirmation feature that:
- Uses a locally-running Ollama model (qwen2:0.5b) via the backend
- Provides AI-generated affirmations as an alternative to stored affirmations
- Falls back to pre-written affirmations if AI is unavailable

**Note:** The AI affirmation feature is supplementary. The core functionality (CRUD operations, authentication, user management) does not depend on AI.

---

## How to Run the Project

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB Atlas account (or local MongoDB instance)
- Ollama (optional, for AI features)

### Environment Variables

Create a `.env` file in the `project-2` directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
OLLAMA_HOST=http://localhost:11434
```

### Installation

```bash
# Navigate to project directory
cd project-2

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Running the Application

**Terminal 1 — Backend Server:**
```bash
cd project-2/server
node index.cjs
# Output: Server is running on port 3001
```

**Terminal 2 — Frontend Dev Server:**
```bash
cd project-2
npm run dev
# Output: VITE ready at http://localhost:5173/
```

### Accessing the Application

1. Open http://localhost:5173/ in your browser
2. Create an account via the Sign Up page
3. Access the Affirmation page to view and add affirmations
4. Customize theme via the Settings panel

---

## Project Structure

```
project-2/
├── src/
│   ├── components/
│   │   ├── navigationBar.tsx    # Main navigation component
│   │   └── ProtectedRoute.tsx   # Auth protection wrapper
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth state management
│   ├── pages/
│   │   ├── index.tsx            # Root route & layout
│   │   ├── home.tsx             # Landing page
│   │   ├── login.tsx            # Sign in page
│   │   ├── signup.tsx           # Sign up page
│   │   ├── logout.tsx           # Logout handler
│   │   ├── affirmation.tsx      # Main affirmation page (protected)
│   │   ├── settingsPanel.tsx    # Theme & settings
│   │   └── blog/
│   │       ├── index.tsx        # Blog parent route
│   │       └── article.tsx      # Nested article route
│   ├── services/
│   │   └── aiAffirmation.ts     # AI generation service
│   ├── router.tsx               # Router configuration
│   ├── main.tsx                 # App entry point
│   └── index.css                # Global styles (Tailwind)
├── server/
│   ├── index.cjs                # Express server entry
│   ├── db.cjs                   # MongoDB connection
│   ├── middleware/
│   │   └── auth.cjs             # JWT auth middleware
│   └── routes/
│       ├── auth.cjs             # Auth endpoints
│       ├── affirmations.cjs     # CRUD endpoints
│       └── ai.cjs               # AI generation endpoint
├── public/                      # Static assets
├── package.json                 # Dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
└── PROJECT.md                   # This documentation
```

---

## Summary

My Daily Affirmations application fulfills all mandatory technical requirements:

| Requirement | Implementation |
|-------------|----------------|
| Component Design | Reusable components with clear props/state boundaries |
| State Management | React Context for global auth state |
| Authentication | JWT-based auth with signup/signin flows |
| Protected Routes | ProtectedRoute wrapper with redirect logic |
| Routing | TanStack Router with nested routes and 404 handling |
| Server Communication | Full CRUD API with MongoDB persistence |
| User-Specific Data | Affirmations scoped by userId |
| Documentation | This PROJECT.md file |

The application demonstrates production-style patterns including proper error handling, responsive design, theme customization, and a clean separation between frontend and backend concerns.

