import { Button, Navbar, TextInput, Dropdown, Avatar } from "flowbite-react";
import { FaMoon, FaSun, FaGraduationCap } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";
import { AiOutlineSearch } from "react-icons/ai";
import { HiLibrary } from "react-icons/hi";
import { signOutSuccess } from "../redux/user/userSlice";
import authService from "../services/auth.service";

const Header = () => {
  const path = useLocation().pathname;
  const { theme } = useSelector((state) => state.theme);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    authService.signOut();
    dispatch(signOutSuccess());
    navigate("/sign-in");
  };

  return (
    <Navbar className="border-b-2 sticky top-0 bg-slate-200 shadow-md z-40">
      <Link
        to="/"
        className="flex items-center gap-2 self-center whitespace-nowrap text-sm sm:text-xl font-bold dark:text-white group"
      >
        <FaGraduationCap className="text-2xl sm:text-3xl text-blue-600 dark:text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
        <div className="flex items-center">
          <span className="px-2 py-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-lg text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
            Edu
          </span>
          <span className="ml-1 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Nexus</span>
        </div>
      </Link>

      <form>
        <TextInput
          type="text"
          placeholder="Search..."
          rightIcon={AiOutlineSearch}
          className="hidden lg:inline"
        />
      </form>

      <div className="flex gap-2 md:order-2 items-center">
        <Button
          className="w-12 h-10 inline text-indigo-800"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? <FaSun /> : <FaMoon />}
        </Button>

        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="user"
                img={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1EbhMbqdCA85UXXAxxXvcc0PN9xvHOZF6yYVUVRAYSlQC_B9aPU-tEdU&s"
                }
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium">
                {currentUser.userName}
              </span>
              <span className="block truncate text-sm font-normal">
                {currentUser.userEmail || ""}
              </span>
            </Dropdown.Header>
            <Dropdown.Item>
              <Link to="/library">Library Portal</Link>
            </Dropdown.Item>
            <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700" outline>
              Sign In
            </Button>
          </Link>
        )}

        <Navbar.Toggle className="text-sm" />
      </div>

      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link
            to="/"
            className="text-blue-900 font-semibold hover:text-indigo-900 dark:text-gray-400 dark:hover:text-indigo-500 hover:underline"
          >
            Home
          </Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/component"} as={"div"}>
          <Link
            to="/component"
            className="text-blue-900 font-semibold hover:text-indigo-900 dark:text-gray-400 dark:hover:text-indigo-500 hover:underline"
          >
            Component
          </Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/library"} as={"div"}>
          <Link
            to="/library"
            className="flex items-center gap-2 text-blue-900 font-semibold hover:text-indigo-900 dark:text-gray-400 dark:hover:text-indigo-500 hover:underline"
          >
            <HiLibrary className="text-lg" />
            Library
          </Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
