import React from 'react';
import {BrowserRouter, Route} from 'react-router-dom'

import HomePage from './pages/HomePage/HomePage';
import RoomPage from './pages/RoomPage/RoomPage';
import Error404 from './pages/Error404/Error404';


const App = () =>{
  return (
    <BrowserRouter>
      <Route path='/' exact component={HomePage} />
      <Route path="/room/:id" component={RoomPage}  />
      <Route path="/error404" component={Error404} />
    </BrowserRouter> 
  );
}

export default App;
