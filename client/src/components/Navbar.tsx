import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" className="brand-link">Prediction Engine</NavLink>
      </div>
      <ul className="navbar-nav">
        <li>
          <Button asChild variant="ghost" size="sm">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Matches
            </NavLink>
          </Button>
        </li>
        <li>
          <Button asChild variant="ghost" size="sm">
            <NavLink to="/teams" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Teams
            </NavLink>
          </Button>
        </li>
        <li>
          <Button asChild variant="ghost" size="sm">
            <NavLink to="/my-predictions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Predictions
            </NavLink>
          </Button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar