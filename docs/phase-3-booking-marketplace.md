# Phase 3: Real Booking Flow, Availability, and Payment-Ready Marketplace

This phase replaces mock booking behavior with a real marketplace workflow.

## Implemented

- Booking page now loads real guide and experience data from the database.
- Booking requests require an approved, verified, complete guide profile.
- Guides can publish availability at `/guide-dashboard/availability`.
- Travelers can only request open availability slots.
- Creating a booking marks the selected slot as booked.
- Cancelling or declining a booking reopens the slot.
- Booking totals are calculated server-side.
- Initial payment records are created with status `INITIATED`.
- Guide and traveler dashboards show booking lifecycle controls.
- Dashboard notification panels show recent booking events.

## API Routes

- `GET /api/guides/[id]/availability`
- `POST /api/guides/availability`
- `PATCH /api/guides/availability/[id]`
- `DELETE /api/guides/availability/[id]`
- `POST /api/bookings`
- `PATCH /api/bookings/[id]`

## Booking Workflow

1. Guide publishes availability.
2. Traveler selects guide, slot, traveler count, and optional notes.
3. Server validates guide approval, slot availability, city match, and overlapping bookings.
4. Server calculates price.
5. Booking is created as `PENDING`.
6. Payment record is created as `INITIATED`.
7. Guide accepts to move to `CONFIRMED` or declines to move to `CANCELLED`.
8. Traveler can cancel pending or confirmed bookings before completion.
9. Guide or admin can mark confirmed bookings as `COMPLETED`.

## Payment Readiness

Added `Payment` model:

- `provider`
- `providerPaymentId`
- `amount`
- `currency`
- `status`

Supported future statuses:

- `INITIATED`
- `PAID`
- `FAILED`
- `REFUNDED`

## Migration Commands

For a clean migration-backed database:

```bash
npx prisma migrate dev --name phase-3-booking-marketplace
npx prisma generate
```

For the current SQLite prototype database:

```bash
npx prisma db push
npx prisma generate
```

## Manual Test Checklist

1. Create traveler account.
2. Create guide account.
3. Admin approves guide.
4. Guide opens `/guide-dashboard/availability`.
5. Guide creates an availability slot.
6. Traveler opens guide profile and starts booking.
7. Traveler selects slot and submits booking request.
8. Guide sees pending request.
9. Guide accepts request.
10. Traveler sees confirmed booking.
11. Try a second booking for the same slot and confirm it is rejected.
12. Cancel a booking and confirm the slot is available again.
13. Mark a confirmed booking completed and confirm earnings update.
