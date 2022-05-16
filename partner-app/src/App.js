import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import React from 'react';
import Login from './modules/login';
import Register from './modules/register';
import Home from './modules/home';
import FindFriends from './modules/find';
import axios from 'axios';
import './App.css';
import MakeAdmin from "./modules/admin";
class App extends React.Component{
  constructor(prop){
    super(prop);
    axios.interceptors.request.use(
      (req) => {
        console.log(req);
        
         // Add configurations here
         let token = window.localStorage.getItem("token");
         if(token)
          req.headers.Authorization = "Bearer "+token;
         return req;
      },
      (err) => {
        window.localStorage.removeItem("token");
         return Promise.reject(err);
      }
   );
  }

  render(){
    return(
    <Router>
      <div className="header">
        <div className="title">Record Your Name</div>
      </div>
      <div className='app'>
        <Switch>
          <Route path='/register'>
            <Register></Register>
          </Route>
          <Route path='/login'>
            <Login></Login>
          </Route>
          <Route path='/home'>
            <Home></Home>
          </Route>
          <Route path='/search'>
            <FindFriends></FindFriends>
          </Route>
          <Route path='/admin'>
            <MakeAdmin></MakeAdmin>
          </Route>
          <Route exact path='/'>
            <Login></Login>
          </Route>

        </Switch>
      </div>
    </Router>)
  }
}
export default App;
