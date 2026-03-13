import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header"
import HomePage from "./Pages/HomePage";
import FooterComponent from "./components/FooterComponent";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Component from "./Pages/Component";

const App = () => {
  return (
    <Router>
      <Header />
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/component" element={<Component />} />
        </Routes>
      </div>
      <FooterComponent />
    </Router>
  )
}

export default App