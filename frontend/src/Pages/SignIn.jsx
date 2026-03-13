import { Alert, Button, Label, Spinner, TextInput, Card } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { FaUserCircle, FaLock, FaGraduationCap } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import authService from "../services/auth.service";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userEmail: "",
    userPassword: "",
  });

  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(signInStart());

    try {
      const result = await authService.signIn(formData);

      if (result.success && result.data) {
        // Dispatch user data to Redux store
        dispatch(signInSuccess(result.data));
        navigate("/");
      } else {
        dispatch(signInFailure(result.message || "Login failed."));
      }
    } catch (err) {
      console.error("Sign in error:", err);
      dispatch(signInFailure("Something went wrong. Please try again."));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative py-20 px-4">
        {/* Header with Icon */}
        <div className="text-center mb-12 animate-fade-in-down">
          <HiAcademicCap className="mx-auto text-8xl text-blue-600 dark:text-cyan-400 mb-4 animate-bounce drop-shadow-lg dark:drop-shadow-[0_0_25px_rgba(34,211,238,0.7)]" />
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-blue-500 dark:to-purple-600 text-transparent bg-clip-text">
            Welcome Back
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-semibold">
            Sign in to EduNexus Academic System
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Left side - Illustration & Info */}
            <div className="hidden md:flex animate-slide-in-left">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <Card className="relative bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-300 dark:border-blue-500/50 p-8 h-full flex flex-col w-full">
                  <img src="Login.png" alt="signIn" className="w-full mb-6 rounded-lg shadow-lg" />
                  <h3 className="text-2xl font-bold mb-4 text-blue-800 dark:text-cyan-300">
                    Access Your Dashboard
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    Welcome back to EduNexus University Academic System! Sign in to manage students, 
                    courses, library resources, and fines. Access your dashboard and continue your 
                    academic administrative work.
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    <div className="flex-1 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse animation-delay-200"></div>
                    <div className="flex-1 h-2 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full animate-pulse animation-delay-400"></div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="flex animate-slide-in-right">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <Card className="relative bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-cyan-500/50 shadow-2xl p-8 h-full flex flex-col w-full">
                  <div className="flex items-center gap-3 mb-6">
                    <FaUserCircle className="text-4xl text-blue-600 dark:text-cyan-400" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h2>
                  </div>

                  <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div>
                      <Label value="Email Address" className="text-gray-700 dark:text-gray-300 font-semibold" />
                      <TextInput
                        name="userEmail"
                        type="email"
                        placeholder="your.email@university.edu"
                        value={formData.userEmail}
                        onChange={handleChange}
                        icon={FaUserCircle}
                        className="mt-2"
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <Label value="Password" className="text-gray-700 dark:text-gray-300 font-semibold" />
                      <TextInput
                        name="userPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.userPassword}
                        onChange={handleChange}
                        icon={FaLock}
                        className="mt-2"
                        required
                      />
                      {showPassword ? (
                        <BsFillEyeSlashFill
                          className="absolute right-3 top-11 text-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                        />
                      ) : (
                        <BsFillEyeFill
                          className="absolute right-3 top-11 text-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                        />
                      )}
                    </div>

                    {error && (
                      <Alert color="failure" className="text-sm font-medium animate-fade-in">
                        {error}
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-blue-500/50 transform hover:scale-[1.02] transition-all duration-300 mt-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" />
                          <span className="pl-3">Signing in...</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          <FaLock />
                          Sign In to Dashboard
                        </span>
                      )}
                    </Button>

                    <div className="flex items-center my-2">
                      <div className="flex-1 border-t-2 border-gray-300 dark:border-gray-600"></div>
                      <p className="px-4 text-gray-600 dark:text-gray-400 font-semibold">OR</p>
                      <div className="flex-1 border-t-2 border-gray-300 dark:border-gray-600"></div>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-700 dark:text-gray-300">
                        Don't have an account?{" "}
                        <Link 
                          to="/sign-up" 
                          className="text-blue-700 dark:text-cyan-400 font-bold hover:underline hover:text-blue-800 dark:hover:text-cyan-300 transition-colors"
                        >
                          Create Account
                        </Link>
                      </p>
                    </div>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/"
                      className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-cyan-400 transition-all duration-300 group"
                    >
                      <FaGraduationCap className="text-3xl text-blue-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
                      <div className="flex items-center gap-1">
                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-600 rounded-lg text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                          Edu
                        </span>
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Nexus</span>
                      </div>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
