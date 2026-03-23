import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Select,
  Card,
} from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { FaUserPlus, FaEnvelope, FaLock, FaUserCircle, FaUserTag, FaGraduationCap } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi";
import authService from "../services/auth.service";

const SignUp = () => {
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPassword: "",
    confirmPassword: "",
    role: "USER",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [confirmShowPassword, setConfirmShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const userRoles = [
    { label: "Student", value: "USER" },
    { label: "Instructor", value: "INSTRUCTOR" },
    { label: "Admin", value: "ADMIN" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Validate passwords match
    if (formData.userPassword !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength (optional)
    if (formData.userPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.signUp({
        userName: formData.userName,
        userEmail: formData.userEmail,
        userPassword: formData.userPassword,
        role: formData.role,
      });

      if (result.success) {
        setSuccessMsg("Registration successful! Redirecting to sign in...");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      } else {
        setErrorMsg(result.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 left-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative py-20 px-4">
        {/* Header with Icon */}
        <div className="text-center mb-12 animate-fade-in-down">
          <HiAcademicCap className="mx-auto text-8xl text-purple-600 dark:text-pink-400 mb-4 animate-bounce drop-shadow-lg dark:drop-shadow-[0_0_25px_rgba(236,72,153,0.7)]" />
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-pink-400 dark:via-purple-500 dark:to-cyan-500 text-transparent bg-clip-text">
            Join EduNexus
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 font-semibold">
            Create your account and start your academic journey
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Left side - Illustration & Info */}
            <div className="hidden md:flex animate-slide-in-left">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <Card className="relative bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-purple-300 dark:border-purple-500/50 p-8 h-full flex flex-col w-full">
                  <img src="Signup.png" alt="signUp" className="w-full mb-6 rounded-lg shadow-lg" />
                  <h3 className="text-2xl font-bold mb-4 text-purple-800 dark:text-pink-300">
                    Welcome to EduNexus
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    Join EduNexus University Academic System today! Create your account to 
                    access comprehensive student management, course enrollment, library services, 
                    and fine management. Register now as a Student, Instructor, or Admin.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Student Management System</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-200"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Course Enrollment</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse animation-delay-400"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Library & Fine Services</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="flex animate-slide-in-right">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                <Card className="relative bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-pink-500/50 shadow-2xl p-8 h-full flex flex-col w-full">
                  <div className="flex items-center gap-3 mb-6">
                    <FaUserPlus className="text-4xl text-purple-600 dark:text-pink-400" />
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                  </div>

                  <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                      <Label value="Full Name" className="text-gray-700 dark:text-gray-300 font-semibold" />
                      <TextInput 
                        name="userName" 
                        type="text"
                        placeholder="John Doe"
                        value={formData.userName} 
                        onChange={handleChange}
                        icon={FaUserCircle}
                        className="mt-2"
                        required 
                      />
                    </div>

                    <div>
                      <Label value="Email Address" className="text-gray-700 dark:text-gray-300 font-semibold" />
                      <TextInput 
                        type="email" 
                        name="userEmail" 
                        placeholder="your.email@university.edu"
                        value={formData.userEmail} 
                        onChange={handleChange}
                        icon={FaEnvelope}
                        className="mt-2"
                        required 
                      />
                    </div>

                    <div>
                      <Label value="User Role" className="text-gray-700 dark:text-gray-300 font-semibold" />
                      <div className="relative mt-2">
                        <FaUserTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 z-10" />
                        <Select 
                          name="role" 
                          value={formData.role} 
                          onChange={handleChange}
                          className="pl-10"
                          required
                        >
                          {userRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    <div className="relative">
                      <Label value="Password" className="text-gray-700 dark:text-gray-300 font-semibold" />
                      <TextInput
                        name="userPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.userPassword}
                        onChange={handleChange}
                        icon={FaLock}
                        className="mt-2"
                        required
                      />
                      {showPassword ? (
                        <BsFillEyeSlashFill
                          className="absolute right-3 top-11 text-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-pink-400 transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                        />
                      ) : (
                        <BsFillEyeFill
                          className="absolute right-3 top-11 text-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-pink-400 transition-colors"
                          onClick={() => setShowPassword((prev) => !prev)}
                        />
                      )}
                    </div>

                    <div className="relative">
                      <Label value="Confirm Password" className="text-gray-700 dark:text-gray-300 font-semibold" />
                      <TextInput
                        name="confirmPassword"
                        type={confirmShowPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={FaLock}
                        className="mt-2"
                        required
                      />
                      {confirmShowPassword ? (
                        <BsFillEyeSlashFill
                          className="absolute right-3 top-11 text-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-pink-400 transition-colors"
                          onClick={() => setConfirmShowPassword((prev) => !prev)}
                        />
                      ) : (
                        <BsFillEyeFill
                          className="absolute right-3 top-11 text-lg cursor-pointer text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-pink-400 transition-colors"
                          onClick={() => setConfirmShowPassword((prev) => !prev)}
                        />
                      )}
                    </div>

                    {successMsg && (
                      <Alert color="success" className="text-sm font-medium animate-fade-in">
                        {successMsg}
                      </Alert>
                    )}

                    {errorMsg && (
                      <Alert color="failure" className="text-sm font-medium animate-fade-in">
                        {errorMsg}
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all duration-300 mt-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" />
                          <span className="pl-3">Creating account...</span>
                        </>
                      ) : (
                        <span className="flex items-center gap-2">
                          <FaUserPlus />
                          Create Your Account
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
                        Already have an account?{" "}
                        <Link 
                          to="/sign-in" 
                          className="text-purple-700 dark:text-pink-400 font-bold hover:underline hover:text-purple-800 dark:hover:text-pink-300 transition-colors"
                        >
                          Sign In Here
                        </Link>
                      </p>
                    </div>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to="/"
                      className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-pink-400 transition-all duration-300 group"
                    >
                      <FaGraduationCap className="text-3xl text-purple-600 dark:text-pink-400 group-hover:rotate-12 transition-transform duration-300" />
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

export default SignUp;
