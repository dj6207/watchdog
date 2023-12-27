import { Home } from './pages';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './assets/App.css';
import { NavBar } from './features/';
import { RouteItem } from './types';

function App() {
  const userRoutes:RouteItem[] = [
    { path: '/home', label: 'Home'},
  ];

  return (
    <>
      <BrowserRouter>
        <NavBar userRoutes={userRoutes} />
        <Routes>
          <Route path='/' element={<Navigate to="/home" />}/>
          <Route path='/home' Component={Home}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
