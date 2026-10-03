import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Matches from './pages/Matches'
import MatchDetail from './pages/MatchDetail'
import Teams from './pages/Teams'
import TeamProfile from './pages/TeamProfile'
import MyPredictions from './pages/MyPredictions'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Matches />} />
        <Route path="/match/:id" element={<MatchDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamProfile />} />
        <Route path="/my-predictions" element={<MyPredictions />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App