import React from 'react';
import axios from 'axios';
import {BASE_URL} from '../../config/settings';
import list from '../../mock/users.json';
import _ from 'underscore';
import {
    Link
  } from "react-router-dom";
class MakeAdmin extends React.Component{
    constructor(props){
        super(props);
        this.state={
            searchText:'',
            everyone:[]
        }
    }
    componentDidMount=()=>{
      this.getAllUsers();
    }
    async getAllUsers(){
      let res = await axios.get(BASE_URL+"/User/AllUsers?userid=mr.chandoo@gmail.com");
      this.setState({everyone:res.data});
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
    search=()=>{

    }
    textChange=(e,name)=>{
        let a={};
        a[name] = e.target.value;
        this.setState(a)
    }
    addFriend=(f)=>{
      this.asyncAddFriend(f.userid);
    }
    async asyncAddFriend(friendId){
      let params={userid:friendId}
        axios.post(`https://ryn-partnerapp.azure-api.net/api/User/CreateAdmin?userid=${friendId}`).then((e)=>{
            this.getAllUsers();
        }).catch((e)=>{
            alert("failure");
        });
    }
    removeFriend=(f)=>{
      this.asyncRemoveFriend(f.userid);
    }
    async asyncRemoveFriend(friendId){
      let params={"userid":'mr.chandoo@gmail.com',"frienduserid":friendId}
        axios.post('https://ryn-partnerapp.azure-api.net/api/User/DeleteAdmin?userid='+friendId,params).then((e)=>{
            this.getAllUsers();
        }).catch((e)=>{
            alert("failure");
        });
    }
    render(){
        return (<div>
            <div className="card card-container user-card">
                <div className="display-name">
                  <table align="center">
                    <tbody>
              <tr>
                <td>
                  Welcome <b>{list.preferredName}</b>
                </td>
              </tr>
              <tr>
                <td>
                  <input type='text' placeholder='Search' value={this.state.searchText} onChange={(e)=>{this.textChange(e,'searchText')}} />
                </td>
              </tr>
              <tr>
                <td className="srch-user">
                  <table>
                    <tbody>
                      {_.map(this.state.everyone,(f)=>{
                        if(f.isadmin){
                          return(<tr><td>{f.firstname} {f.lastname}</td><td width='30%'><input type='button' onClick={(e)=>{this.removeFriend(f)}} value='Remove'></input></td></tr>);
                        }else{
                          return(<tr><td>{f.firstname} {f.lastname}</td><td width='30%'><input type='button' onClick={(e)=>{this.addFriend(f)}} value='Make Admin'></input></td></tr>);
                        }
                        
                      })}
                    </tbody>
                  </table>
                  
                </td>
              </tr>
            </tbody>
                  </table>
                </div>
             </div>
        </div>);
    }
}
export default MakeAdmin;
