import { Home } from './pages';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './assets/App.css';
import { NavBar, UsageHistory } from './features/';
import { RouteItem } from './types';

function App() {
  const userRoutes:RouteItem[] = [
    { path: '/home', label: 'Home'},
    { path: '/history', label: "Usage History"},
  ];

  return (
    <>
      <BrowserRouter>
        <NavBar userRoutes={userRoutes} />
        <Routes>
          <Route path='/' element={<Navigate to="/home" />}/>
          <Route path='/home' Component={Home}/>
          <Route path='/history' Component={UsageHistory}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
