import { Outlet } from '@tanstack/react-router'
import { Header } from './components/Header/Header.tsx'

function App() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}

export default App
