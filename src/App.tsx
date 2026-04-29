import { Routes, Route } from 'react-router-dom'
import UsersListPage from './pages/UsersListPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<UsersListPage />} />
      <Route path="/users" element={<UsersListPage />} />
    </Routes>
  )
}

export default App
