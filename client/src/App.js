import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import RequestPasswordReset from "./pages/RequestPasswordRequest";
import MainLayout from "./components/MainLayout";
import Register from "./pages/register";
import PredicateAi from "./pages/PredicateAi";
import AddNewLine from "./pages/AddNewLine";
import AccountDetails from "./pages/AccountDetails";
import PrivateRoute from "./components/PrivateRoute";
import VerifEmail from "./pages/VerifEmail";
import ChatClient from "./pages/ChatClient";

function App() {
  const currentUser = useSelector((state) => state.auth.user);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifEmail />} />
        <Route path="/request-password-reset" element={<RequestPasswordReset />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute user={currentUser} element={<MainLayout />} />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="Predicate" element={<PredicateAi />} />
          <Route path="AddNewLine" element={<AddNewLine />} />
          <Route path="AccountDetails" element={<AccountDetails />} />
        </Route>

        {/* Fallback Route */}
        <Route path="/*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
