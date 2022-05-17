import React from 'react';
import axios from 'axios';
import {BASE_URL,APP_KEY} from '../../config/settings';
import list from '../../mock/users.json';
import _ from 'underscore';
import {
    Link
  } from "react-router-dom";
class Login extends React.Component{
    constructor(props){
        super(props);
        this.state={
            userid:'',
            password:'',
            myFriends:[],
            preferredName:''
        }
    }
    componentDidMount=()=>{
      this.getAllUsers();
      this.getMyProfile();
    }
    async getMyProfile(){
      let userId = window.localStorage.getItem("userid");
      let res = await axios.get(BASE_URL+"/User/GetUserDetail?userid="+userId);
      this.setState({preferredName:res.data.preferredname});

    }
    async getAllUsers(){
      let userId = window.localStorage.getItem("userid");
      let res = await axios.get(BASE_URL+"/User/AllUsers?userid="+userId);
      let friends = _.filter(res.data,{isfriend:true});
      this.setState({myFriends:friends});
      this.getAudioStatus();
    }
    getAudioStatus=()=>{
      setTimeout(()=>{
        let w = new window.RecordYourName(APP_KEY,"https://partner-app-ryn.azurewebsites.net/");
        let userId = window.localStorage.getItem("userid");
        let params=[
          {
            userId:userId,
            loggedOn:true,
            placeHodler:'controls',
            preferredName:this.state.preferredName
          }
        ]
        _.each(this.state.myFriends,(f)=>{
          params.push({
            userId:f.userid,
            placeHodler:'avh_'+f.userid,
            preferredName:f.preferredname,
            gender:f.gender,
            location:f.location,
          });
        });
        w.fetch(params);
      },0);
    }
    textChange=(e,name)=>{
        let a={};
        a[name] = e.target.value;
        this.setState(a)
    }
    login=()=>{
        let params={"userid":this.state.userid,"password":this.state.password}
        axios.post(BASE_URL+'/PartnerUser/Login',params).then((e)=>{
            alert("success");
        }).catch((e)=>{
            alert("failure");
        });
    }
    render(){
        return (<div>
            <div className="card card-container user-card">
                   <table align="center">
                      <tbody>
                          <tr>
                            <td className="login-name">
                              Welcome <b>{this.state.preferredName}</b> <span id='controls'></span>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <Link to="/update">Update Profile</Link> &nbsp; <Link to="/admin">Change Admin</Link> &nbsp; <Link to="/search">Add Friends</Link>
                            </td>
                          </tr>
                          <tr>
                            <td className="srch-user">
                              <input type='text' placeholder='Search' />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              {_.map(this.state.myFriends,(f)=>{
                                let spanId="avh_"+f.userid;
                                  return (<div className='avh name-list'>
                                      <div className="icon-dev"><div className="employee-initials">{f.firstname.charAt(0)}{f.lastname.charAt(0)}</div></div>
                                      <div className={'av nv av_' + f.avatarId}>{f.firstname} {f.lastname}<span id={spanId}></span></div>
                                  </div>);
                              })}
                            </td>
                          </tr>
                      </tbody>
                    </table>
            </div>
        </div>);
    }
}
export default Login;
