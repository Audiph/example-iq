# ExampleIQ — Ride Booking App

A transportation booking form built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Prerequisites

- [Node.js](https://nodejs.org/) 18.17 or later
- [pnpm](https://pnpm.io/) package manager (`npm install -g pnpm`)
- A Google Cloud Platform account with a valid API key

## Google Maps API Key Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services > Library**
4. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Distance Matrix API**
5. Navigate to **APIs & Services > Credentials**
6. Click **Create Credentials > API Key**
7. (Recommended) Restrict the key:
   - Under **Application restrictions**, select **HTTP referrers** and add `http://localhost:3000/*`
   - Under **API restrictions**, select the three APIs listed above

## Local Setup

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd example-iq
   pnpm install
   ```

2. Create your environment file:

   ```bash
   cp .env.local.example .env.local
   ```

3. Open `.env.local` and paste your Google Maps API key:

   ```
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Service type selection**: One-way or Hourly booking
- **Google Places Autocomplete**: Search for pickup/dropoff locations and airports
- **Distance & travel time**: Automatically calculated via Google Distance Matrix API when both locations are set
- **Phone number lookup**: Enter a phone number to check if you're a returning customer. Pre-seeded numbers for testing:
  - `+1 617 555 1234` (Sarah)
  - `+1 212 555 9876` (Michael)
- **New customer registration**: If a phone number isn't recognized, the form asks for name and email
- **Multiple stops**: Add intermediate stops between pickup and drop off
- **Form validation**: All required fields are validated before submission
- **Mock API**: Bookings submit to `/api/bookings` (in-memory, resets on server restart)

## Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Production build         |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |
