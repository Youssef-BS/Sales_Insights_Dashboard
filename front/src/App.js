import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Resetpassword from "./pages/Resetpassword";
import Forgotpassword from "./pages/Forgotpassword";
import MainLayout from "./components/MainLayout";

import { useSelector } from "react-redux";
import Authorised from "./utils/auth";
import Signup from "./pages/SignUp";
import Register from "./pages/register";
function App() {
  const currentUser = useSelector((state)=>state.auth.user);
  console.log(";;;;"+currentUser)
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<Resetpassword />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/signup" element={<Register/>}/>

        <Route path="/admin" element={<Authorised user={currentUser}> <MainLayout /></Authorised>}>
          <Route index element={<Dashboard />} />
          
        </Route>
        <Route path= "/*" element={<Login/>}/>
      </Routes>
    </Router>
  );
}

export default App;
