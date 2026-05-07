import { Routes, Route } from 'react-router-dom'
import UsersListPage from './pages/UsersListPage'
import MapPage from './pages/MapPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<UsersListPage />} />
      <Route path="/users" element={<UsersListPage />} />
      <Route path="/map" element={<MapPage />} />
    </Routes>
  )
}

export default App
