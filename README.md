# TransitTracker

A focused real-time transit tracking application for bus services: MTA Bus and Stony Brook University campus buses (SBU Bus).

## Project Structure

### Root Configuration Files
- **`package.json`** - Project dependencies and scripts
- **`vite.config.ts`** - Vite build configuration
- **`tsconfig.json`** - TypeScript compiler configuration
- **`eslint.config.js`** - ESLint linting rules
- **`components.json`** - shadcn/ui component configuration
- **`index.html`** - Application entry point

### Source Directory (`src/`)

#### Main Application Files
- **`main.tsx`** - Application entry point, renders the root component
- **`App.tsx`** - Main application component with navigation and routing
- **`index.css`** - Tailwind CSS imports and theme styles

#### Components (`src/components/`)

##### Page Components (`src/components/pages/`)
**`BusPage.tsx`** - MTA Bus tracking interface
  - Search by route (NYCT & Bronx/Brooklyn routes)
  - Search by stop ID
  - Closest stops finder (geolocation-based)
  - Resizable map panel (horizontal on desktop, vertical on mobile)
  - Live vehicle locations on map
  - Route geometry visualization
  - Auto-refresh every 30 seconds

**`SbuBusPage.tsx`** - Stony Brook University campus bus interface
  - Search by route or stop
  - Next bus arrival times
  - Route geometry visualization
  - Resizable map panel

**`MainLayout.tsx`** - Application layout wrapper with navigation

##### UI Components (`src/components/ui/`)
Pre-built shadcn/ui components for consistent design:
- **Form controls**: `button.tsx`, `input.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`
- **Navigation**: `tabs.tsx`, `navigation-menu.tsx`, `breadcrumb.tsx`, `menubar.tsx`
- **Overlays**: `dialog.tsx`, `popover.tsx`, `tooltip.tsx`, `sheet.tsx`, `drawer.tsx`
- **Data display**: `table.tsx`, `card.tsx`, `badge.tsx`, `alert.tsx`, `accordion.tsx`
- **Feedback**: `progress.tsx`, `spinner.tsx`, `skeleton.tsx`
- **Layout**: `resizable.tsx`, `separator.tsx`, `scroll-area.tsx`

#### Services (`src/services/`)

##### Bus Services
- **`mta-bus-routes.ts`** - Loads MTA bus routes
  - NYC routes
  - Route metadata and colors

- **`mta-bus-stops.ts`** - Bus stop data and location services
  - Stop lookup by route
  - Nearby stops search using geolocation

- **`mta-live-bus.ts`** - Real-time MTA bus tracking
  - Fetches live vehicle positions
  - Arrival predictions at stops
  - Vehicle tracking data

- **`mta-route-geometry.ts`** - Bus route path visualization
  - Route polyline coordinates
  - Caching for performance

- **`sbu-bus-service.ts`** - Stony Brook University bus service
  - Campus bus routes and stops
  - Next bus predictions
  - Static data from CSV files

- **`route-geometry.ts`** - Generic route geometry service
  - OSRM routing API integration
  - Coordinate fetching and caching

##### Static Data
- `public/sbu-bus-data/` - CSV files for SBU campus routes and stops (Inner Loop, Outer Loop, Hospital, etc.)
  - `Stops List.csv` - All campus stop locations

#### Utilities (`src/lib/`)
- **`utils.ts`** - Utility functions (not important)

### Public Assets (`public/`)
- Static assets served directly

## Key Features

### Real-Time Data Integration
- **Auto-refresh**: Periodic updates for live arrival information

### Route Filtering
- Filter arrivals by selected routes
- Visual indicators for active/inactive filters
- Persistent across data refreshes

### Responsive Design
- Desktop: Horizontal split-panel layout
- Mobile: Vertical split-panel (map on top, content below)
- Resizable panels for customizable workspace

### Map Integration
- Leaflet-based interactive maps
- Live vehicle tracking
- Route geometry visualization
- Stop markers with popups
- Auto-resize handling for panel changes

## Technologies Used

- **React 19.1.1** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Leaflet** - Interactive maps
- **Protocol Buffers** - Binary data encoding

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Data Sources

- **NYC Bus**: XML/JSON feeds provided by the MTA
- **OSRM Routing**: Route geometry generation
- **SBU Transportation**: Campus bus schedules and routes
