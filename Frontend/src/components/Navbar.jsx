// src/components/Navbar.jsx
import { Link } from "react-router-dom";
//  Assuming you will add styles for the Navbar

function Navbar() {
  return (
    <div className="navbar">
      <Link to="/" className="navbar-link">
        Home
      </Link>
      <Link to="/colorize" className="navbar-link">
        Colorize
      </Link>
      <Link to="/feedback" className="navbar-link">
        Feedback
      </Link>
    </div>
  );
}

export default Navbar;
