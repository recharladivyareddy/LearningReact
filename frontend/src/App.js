import './App.css';
import About from './components/About.js';
import Login from './components/Login.js';
import SignUp from './components/SignUp.js'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import In from './components/In.js';
import ForgotPassword from './components/ForgotPassword.js';

function App() {
  return (
    <div >
      <Router>
        <Routes>
          <Route path="/" exact element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          {/* <Route path="/logout" element={<LogOut />} /> */}
          <Route path = "/in" element = {<In />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
