import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import Header from "./components/Header"
import SideNav from "./components/SideNav";
import HomePage from "./Pages/HomePage";
import FooterComponent from "./components/FooterComponent";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Component from "./Pages/Component";

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const isAuthenticated = Boolean(currentUser);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        {isAuthenticated ? (
          <div className="min-h-screen">
            <SideNav
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen((prev) => !prev)}
            />

            <div
              className={`flex min-h-screen flex-col transition-all duration-300 ${
                isSidebarOpen ? "lg:ml-72" : "lg:ml-28"
              }`}
            >
              <Header
                showMenuButton
                onMenuToggle={() => setIsSidebarOpen((prev) => !prev)}
              />

              <main className="flex-1 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/component" element={<Component />} />
                  <Route path="/dashboard" element={<Component />} />
                  <Route path="/dashboard/student/course" element={<Component />} />
                  <Route path="/dashboard/student/library" element={<Component />} />
                  <Route path="/dashboard/staff/course" element={<Component />} />
                  <Route path="/dashboard/staff/library" element={<Component />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <>
            <Header />
            <div className="min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/component" element={<Component />} />
                <Route path="/dashboard" element={<Component />} />
                <Route path="/dashboard/student/course" element={<Component />} />
                <Route path="/dashboard/student/library" element={<Component />} />
                <Route path="/dashboard/staff/course" element={<Component />} />
                <Route path="/dashboard/staff/library" element={<Component />} />
              </Routes>
            </div>
            <FooterComponent />
          </>
        )}
      </div>
    </Router>
  )
}

export default App
