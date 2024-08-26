import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ResetPassword from "./pages/Resetpassword";
import ForgotPassword from "./pages/Forgotpassword";
import MainLayout from "./components/MainLayout";
import Signup from "./pages/SignUp";
import Register from "./pages/register";
import PredicateAi from "./pages/PredicateAi";
import AddNewLine from "./pages/AddNewLine";
import AccountDetails from "./pages/AccountDetails";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const currentUser = useSelector((state) => state.auth.user);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Register />} />

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
