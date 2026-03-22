import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from 'flowbite-react';
import { FaGraduationCap, FaUserGraduate, FaMoneyCheckAlt } from 'react-icons/fa';
import { HiAcademicCap, HiBookOpen, HiLibrary } from 'react-icons/hi';
import { useSelector } from 'react-redux';

export default function HomePage() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Theme Support */}
      <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 text-gray-900 dark:text-white py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HiAcademicCap className="mx-auto text-9xl mb-8 animate-bounce text-blue-600 dark:text-cyan-400 drop-shadow-lg dark:drop-shadow-[0_0_25px_rgba(34,211,238,0.7)]" />
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-600 text-transparent bg-clip-text animate-pulse">
              Welcome to EduNexus
            </h1>
            <p className="text-2xl md:text-3xl mb-8 max-w-3xl mx-auto font-bold text-blue-700 dark:text-cyan-300 drop-shadow-lg">
              Your Complete University Academic Management System
            </p>
            <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-700 dark:text-gray-300 font-semibold">
              Manage students, courses, library resources, and fines - all in one integrated platform
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link to="/sign-up">
                <Button size="xl" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-lg hover:shadow-cyan-500/50 transform hover:scale-110 transition-all duration-300 animate-pulse">
                  <FaGraduationCap className="mr-2 h-6 w-6" />
                  Get Started
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button size="xl" className="bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 font-bold shadow-lg hover:shadow-cyan-400/50 transform hover:scale-110 transition-all duration-300">
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Theme Support */}
      <div className="py-24 bg-white dark:bg-gray-900 relative">
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-2 h-2 bg-cyan-400 rounded-full top-1/4 left-1/4 animate-ping"></div>
          <div className="absolute w-3 h-3 bg-purple-400 rounded-full top-1/3 right-1/3 animate-ping animation-delay-1000"></div>
          <div className="absolute w-2 h-2 bg-blue-400 rounded-full bottom-1/4 right-1/4 animate-ping animation-delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in-down">
            <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-500 text-transparent bg-clip-text">
              Comprehensive Academic Services
            </h2>
            <p className="text-2xl text-blue-700 dark:text-cyan-300 font-semibold">
              Everything you need for university management in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Student Service */}
            <div className="group relative flex">
              <Card className="text-center bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-300 dark:border-blue-500/30 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 animate-fade-in-up h-full w-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-transparent rounded-lg transition-all duration-500"></div>
                <FaUserGraduate className="mx-auto text-7xl text-blue-600 dark:text-blue-400 mb-6 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all duration-300 transform group-hover:scale-125 group-hover:rotate-12 drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                <h3 className="text-2xl font-bold mb-4 text-blue-800 dark:text-cyan-300 group-hover:text-blue-900 dark:group-hover:text-cyan-200">Student Management</h3>
                <p className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-200 flex-grow">
                  Complete student CRUD operations, enrollment management, and course registration tracking
                </p>
              </Card>
            </div>

            {/* Course Service */}
            <div className="group relative animation-delay-200 flex">
              <Card className="text-center bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-purple-300 dark:border-purple-500/30 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 animate-fade-in-up h-full w-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:to-transparent rounded-lg transition-all duration-500"></div>
                <HiBookOpen className="mx-auto text-7xl text-purple-600 dark:text-purple-400 mb-6 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-all duration-300 transform group-hover:scale-125 group-hover:-rotate-12 drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                <h3 className="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-300 group-hover:text-purple-900 dark:group-hover:text-purple-200">Course Management</h3>
                <p className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-200 flex-grow">
                  Manage courses, capacity planning, availability checking, and enrollment count tracking
                </p>
              </Card>
            </div>

            {/* Library Service */}
            <div className="group relative animation-delay-400 flex">
              <Card className="text-center bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-indigo-300 dark:border-indigo-500/30 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/50 animate-fade-in-up h-full w-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 group-hover:from-indigo-600/10 group-hover:to-transparent rounded-lg transition-all duration-500"></div>
                <HiLibrary className="mx-auto text-7xl text-indigo-600 dark:text-indigo-400 mb-6 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-all duration-300 transform group-hover:scale-125 group-hover:rotate-12 drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                <h3 className="text-2xl font-bold mb-4 text-indigo-800 dark:text-indigo-300 group-hover:text-indigo-900 dark:group-hover:text-indigo-200">Library System</h3>
                <p className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-200 flex-grow">
                  Book management, borrow and return operations, and automated fine calculations
                </p>
                <div className="mt-6">
                  <Link to={currentUser ? "/library" : "/sign-in"}>
                    <Button className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700">
                      Open Library Portal
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Fine Service */}
            <div className="group relative animation-delay-600 flex">
              <Card className="text-center bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-300 dark:border-green-500/30 hover:border-green-500 dark:hover:border-green-400 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/50 animate-fade-in-up h-full w-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/0 to-green-600/0 group-hover:from-green-600/10 group-hover:to-transparent rounded-lg transition-all duration-500"></div>
                <FaMoneyCheckAlt className="mx-auto text-7xl text-green-600 dark:text-green-400 mb-6 group-hover:text-green-700 dark:group-hover:text-green-300 transition-all duration-300 transform group-hover:scale-125 group-hover:-rotate-12 drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                <h3 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-300 group-hover:text-green-900 dark:group-hover:text-green-200">Fine Management</h3>
                <p className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-200 flex-grow">
                  Automated fine calculation, payment processing, and library integration
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Service Integration Section with Theme Support */}
      <div className="py-24 bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 dark:from-pink-400 dark:via-purple-500 dark:to-cyan-500 text-transparent bg-clip-text">
              Integrated Service Architecture
            </h2>
            <p className="text-2xl text-blue-700 dark:text-cyan-300 font-semibold">
              Seamlessly connected microservices for efficient academic operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Student-Course Integration */}
            <div className="group relative animate-slide-in-left">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <Card className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black border-2 border-blue-400 dark:border-blue-500/50 p-8 hover:border-blue-600 dark:hover:border-blue-400 transition-all duration-500 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <FaUserGraduate className="text-5xl text-blue-600 dark:text-blue-400 mr-4 animate-pulse drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                  <span className="text-3xl text-blue-700 dark:text-cyan-300 font-bold">↔</span>
                  <HiBookOpen className="text-5xl text-purple-600 dark:text-purple-400 ml-4 animate-pulse drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                  Student ↔ Course Integration
                </h3>
                <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-cyan-400 mr-2 text-xl">✓</span>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200">Students can check course availability before enrolling</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-cyan-400 mr-2 text-xl">✓</span>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200">Courses track enrollment count from student service</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-cyan-400 mr-2 text-xl">✓</span>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200">Real-time capacity management</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-cyan-400 mr-2 text-xl">✓</span>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200">Automated enrollment validation</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Library-Fine Integration */}
            <div className="group relative animate-slide-in-right">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <Card className="relative bg-gradient-to-br from-indigo-50 via-pink-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black border-2 border-purple-400 dark:border-purple-500/50 p-8 hover:border-purple-600 dark:hover:border-purple-400 transition-all duration-500 transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <HiLibrary className="text-5xl text-indigo-600 dark:text-indigo-400 mr-4 animate-pulse drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                  <span className="text-3xl text-pink-600 dark:text-pink-300 font-bold">↔</span>
                  <FaMoneyCheckAlt className="text-5xl text-green-600 dark:text-green-400 ml-4 animate-pulse drop-shadow-lg dark:drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                </div>
                <h3 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400">
                  Library ↔ Fine Integration
                </h3>
                <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-pink-600 dark:text-pink-400 mr-2 text-xl">✓</span>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200">Automated fine calculation on late returns</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 dark:text-pink-400 mr-2 text-xl">✓</span>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200">Library receives fine status updates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 dark:text-pink-400 mr-2 text-xl">✓</span>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200">Payment processing integration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-pink-600 dark:text-pink-400 mr-2 text-xl">✓</span>
                    <span className="group-hover:text-gray-900 dark:group-hover:text-gray-200">Fine status marked as PAID after payment</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section with Theme Support */}
      <div className="relative bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900 text-gray-900 dark:text-white py-24 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-gradient-x"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <div className="animate-fade-in-up">
            <FaGraduationCap className="mx-auto text-8xl mb-8 text-blue-600 dark:text-cyan-400 animate-bounce drop-shadow-lg dark:drop-shadow-[0_0_25px_rgba(34,211,238,0.9)]" />
            <h2 className="text-5xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-300 dark:via-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
              Ready to Get Started?
            </h2>
            <p className="text-2xl mb-12 text-blue-800 dark:text-cyan-200 font-semibold">
              Join EduNexus today and experience the future of university academic management
            </p>
            <div className="flex justify-center">
              <Link to="/sign-up">
                <Button size="xl" className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-110 transition-all duration-300 animate-pulse px-10 py-4">
                  <FaGraduationCap className="mr-3 h-7 w-7" />
                  Create Your Account Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
