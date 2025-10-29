# Pactle

This repository contains the complete frontend assessment for the Pactle founding engineer role. It is a role-aware Quotation Management application built with React, TypeScript, Tailwind, and React Query, featuring optimistic updates, infinite scroll, and a role-based permission system.
Assessment clip - https://res.cloudinary.com/dr8dfbwu8/video/upload/v1761737676/pactle_assignment_j28nqg.mov

## Features

-   **Authentication:** Mocked email/password sign-up and sign-in, persisting user sessions and roles to `localStorage`.
-   **Role-Based Access Control:** The entire UI is role-aware, dynamically changing based on three roles:
    -   **`manager`**: Full edit/approve/reject/comment/reply permissions.
    -   **`sales_rep`**: Can view quotations and add top-level comments.
    -   **`viewer`**: Read-only access.
-   **Quotation List:**
    -   **Infinite Scroll:** Uses `useInfiniteQuery` and an `IntersectionObserver` to seamlessly load quotations as the user scrolls.
    -   **Debounced Search:** Search input is debounced by 300ms to prevent excessive API calls.
    -   **URL-Synced Filters:** All filters (search term, status) are stored in the URL query params, making the view shareable and refresh-resilient.
-   **Quotation Detail Page:**
    -   **Inline Editing:** `manager` can edit key fields like Client and Amount.
    -   **Status Actions:** `manager` can Approve or Reject a quote, with an optional field for a "reason" that gets added to the history.
    -   **Change History Timeline:** A full audit trail shows a timeline of all changes (creation, edits, status changes), including who made them and when.
-   **Recursive Comments & Replies:**
    -   A threaded comment system allows for discussion.
    -   **Role-Based Visibility:** Top-level comments are public, but **replies are only visible** to users with the **same role** as the replier.
-   **Optimistic Updates:**
    -   Approving/Rejecting a quote (from the list or detail page) updates the UI instantly for a snappy feel.

---

## Tech Stack

-   **Framework:** React (Vite + TypeScript)
-   **Routing:** React Router v6
-   **Global State:** Zustand
-   **Styling:** Tailwind CSS (with a custom theme)
-   **Forms:** React Hook Form
-   **Mock API:** `json-server`

---

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone [your-repo-url]
    cd pactle-assessment
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application and mock API:**
    This command uses `concurrently` to start both the Vite dev server (`http://localhost:5173`) and the `json-server` mock API (`http://localhost:3001`).

    ```bash
    npm start
    ```

4.  **Sign Up & Log In:**
    The auth system is mocked and uses `localStorage`. You **must Sign Up first** to create a user. All new users default to the `viewer` role.

    Once logged in, use the **role-switcher dropdown** in the top bar to test `manager` and `sales_rep` permissions.

---

## Architecture Overview

### State Management

This project uses a split-state management strategy:

-   **Global UI State (Zustand):** `useAuthStore` is a simple Zustand store that holds the `user` object and `token`. It's persisted to `localStorage` and acts as the single source of truth for the user's authentication status and current role.

-   **Server State (React Query):** All asynchronous data (quotations, details, comments) is managed by TanStack Query.
    -   `useInfiniteQuery` handles the complex logic of fetching, caching, and appending pages for the quotation list.
    -   `useQuery` is used on the detail page.
    -   `useMutation` is used for all create/update actions (editing, changing status, posting comments). This provides a clean pattern for managing loading states and implementing optimistic updates with `onMutate` and `onError` rollbacks.

### Permissions

All role-based logic is centralized in the `usePermissions` hook. This hook reads the `role` from `useAuthStore` and returns a set of booleans (`canEdit`, `canApproveReject`, etc.). Components consume this hook to conditionally render UI elements. This keeps the permission logic decoupled and easy to test or modify.

---

## Product Sense Extras Implemented

-   ✅ **Inline status history:** Implemented as the **"Change History"** timeline on the detail page, providing a full audit trail.
-   ✅ **URL-driven state:** All filters on the list page are synced with the URL query parameters.
-   ✅ **Keyboard shortcuts:**
    -   On the detail page, `a` triggers "Approve" and `r` triggers "Reject".

---

## Trade-offs & Future Work

-   **Mock API Nesting:** `json-server` doesn't support nested `POST`s (e.g., `POST /comments/:id/replies`). This was simulated by `GET`ting the parent `Quotation`, adding the new comment/reply, and `PATCH`ing the entire `Quotation` object. A real API would handle this atomically.
-   **Toast Notifications:** A production-ready app would use a toast library (like `react-hot-toast`) to show visual feedback for optimistic update successes or (more importantly) failures/rollbacks, rather than just `console.error`.
-   **Form Validation:** Used `react-hook-form` for basic auth validation, but more complex inline validation could be added to the detail page (e.g., ensuring the `amount` is a positive number).
