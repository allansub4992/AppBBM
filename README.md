# BBM Tracker Kalimantan Timur

A mobile-first fuel tracking application for East Kalimantan (Kaltim) residents to monitor real-time fuel prices at local gas stations and maintain a personal refueling log.

## Features

### 🔐 Authentication
- Google Sign-In integration (mock implementation for demo)
- Automatic session persistence

### ⛽ Fuel Price Dashboard
- Real-time fuel prices for:
  - Pertalite
  - Pertamax
  - Pertamax Turbo
  - Solar
- Prices from major SPBU chains:
  - Pertamina
  - Shell
  - BP
- Last update timestamps

### 📝 Refuel Log Management
- Quick-add refuel records with:
  - Date selection
  - SPBU selection
  - Fuel type
  - Liters consumed
  - Total cost
  - Optional receipt photo capture
- Auto-calculation of total cost based on current prices
- Edit existing records
- Delete records with confirmation
- Search and filter functionality

### 📊 Statistics Panel
- Monthly spending summary
- Total liters consumed
- Average price per liter
- Refuel count

### 🔄 Sync & Offline Support
- Automatic data sync when online
- Offline mode with local storage
- Visual sync status indicators
- Pull-to-refresh functionality
- Queued changes sync when connection returns

## Design System

### Neo-Brutalist Aesthetic
- **Color Palette:**
  - Deep charcoal background (#1A1A1D)
  - Cream white text (#F5F5F0)
  - Electric yellow (#FFE600) for Pertalite
  - Hot pink (#FF006E) for Pertamax
  - Cyan (#00F5FF) for Solar
  - Neon green (#39FF14) for success states

- **Typography:**
  - Display: Syne Extra Bold (800)
  - Body: Space Grotesk Medium (500)
  - Monospace: JetBrains Mono Bold (700)

- **Visual Elements:**
  - 4px thick black borders
  - Hard drop shadows (8px offset, no blur)
  - Halftone dot pattern background
  - Brutalist card layouts

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom brutalist utilities
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Routing:** React Router v6
- **State Management:** React Context API
- **Storage:** localStorage for offline persistence

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx           # Main dashboard with tabs
│   ├── LoginScreen.tsx         # Google auth screen
│   ├── FuelPriceCard.tsx       # Price display card
│   ├── RefuelRecordCard.tsx    # Transaction history card
│   ├── RefuelLogForm.tsx       # Add/edit refuel form
│   ├── StatisticsPanel.tsx     # Monthly stats display
│   ├── DeleteConfirmDialog.tsx # Delete confirmation
│   └── ToastContainer.tsx      # Toast notifications
├── contexts/
│   ├── AuthContext.tsx         # Authentication state
│   └── FuelContext.tsx         # Fuel data & records state
├── types/
│   └── fuel.ts                 # TypeScript interfaces
├── hooks/
│   └── useToast.ts            # Toast notification hook
└── App.tsx                     # Root component

```

## Features Implementation

### Authentication Flow
1. User opens app
2. Check for existing session in localStorage
3. If not authenticated, show Google sign-in screen
4. After sign-in, sync cloud data and show dashboard

### Data Management
- All refuel records stored in localStorage
- Automatic sync when online
- Offline changes queued for sync
- Visual indicators for sync status

### User Interactions
- **Add Refuel:** Tap FAB button → Fill form → Auto-save
- **Edit Record:** Hover/tap record → Edit button → Modify → Save
- **Delete Record:** Hover/tap record → Delete button → Confirm
- **Filter Records:** Use fuel type chips or search bar
- **Refresh Data:** Pull down or tap refresh button

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Contributing

This is a demo application. For production use, implement:
- Real Google OAuth integration
- Backend API for fuel prices
- Cloud database for data sync
- Receipt OCR for automatic data entry
- Push notifications for price changes
