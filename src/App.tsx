import { Home } from './pages';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './assets/App.css';
import { NavBar } from './features/';
import { RouteItem } from './types';
import { useAppDispatch } from './app/hooks';
import { setSelectedDate } from './slices/graphSlice';

function App() {
  const dispatch = useAppDispatch();
  const today = new Date
  dispatch(setSelectedDate(today.toISOString()));

  const userRoutes:RouteItem[] = [
    { path: '/home', label: 'Home'},
  ];

  return (
    <>
      <BrowserRouter>
        {/* <NavBar userRoutes={userRoutes} /> */}
        <Routes>
          <Route path='/' element={<Navigate to="/home" />}/>
          <Route path='/home' Component={Home}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
