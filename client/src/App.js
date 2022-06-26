import React from 'react';
import {BrowserRouter, Redirect, Route} from 'react-router-dom'

import HomePage from './pages/HomePage/HomePage';
import RoomPage from './pages/RoomPage/RoomPage';


const App = () =>{
  return (
    <BrowserRouter>
      {/* <Route path='/'  exact render={() => {
        return <Redirect to={`/group/${Date.now()}`}  />
      }} /> */}
      <Route path='/' exact component={HomePage} />
      <Route path="/room/:id" component={RoomPage}  />
    </BrowserRouter> 
  );
}

export default App;
