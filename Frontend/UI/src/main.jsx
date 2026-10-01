import { StrictMode } from "react";
import "./App.css";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";

import LandingPage from "./Components/LandingPage.jsx";
import Login from "./Components/Login.jsx";
import GetStarted from "./Components/GetStarted.jsx";
import Dashboard from "./Components/Dashboard.jsx";
import Transactions from "./Components/Transactions.jsx";
import Budgets from "./Components/Budgets.jsx";
import Profile from "./Components/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/getStarted",
    element: <GetStarted />
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/transactions",
    element: <Transactions />
  },
  {
    path: "/budgets",
    element: <Budgets />
  },
  {
    path: "/profile",
    element: <Profile />
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);