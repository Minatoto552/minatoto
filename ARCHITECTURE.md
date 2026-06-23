# Application Architecture

## Runtime

- `src/App.tsx` defines the public, employee, customer, and admin routes.
- `src/lib/VrcBarAppContext.tsx` owns authentication state and Firestore subscriptions.
- `src/components/auth/ProtectedRoute.tsx` enforces role-based page access.
- `firestore.rules` enforces the same ownership and role boundaries in Firestore.

## Main Domains

- Authentication and profiles
- Orders and recipes
- Cast and staff placements
- Shift and attendance requests
- Points, lotteries, and Dice games
- Announcements and emergency calls
- Administrative maintenance

## Security Boundary

Customer data is filtered to the signed-in customer. Passwords must never be listed or stored as plaintext. Administrative mutations require both a protected UI route and matching Firestore Rules.
