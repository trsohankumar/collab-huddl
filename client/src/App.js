import React from 'react';
import {BrowserRouter, Redirect, Route} from 'react-router-dom'
import GroupEditor from './components/groupEditor/groupEditor.component';

import HomePage from './pages/HomePage';
import RoomPage from './pages/RoomPage';

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
