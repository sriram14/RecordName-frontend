import React from 'react';
import axios from 'axios';
import {BASE_URL} from '../../config/settings';
import {withRouter} from 'react-router';
import {
    Link
  } from "react-router-dom";
class Login extends React.Component{
    constructor(props){
        super(props);
        this.state={
            userid:'mr.chandoo@gmail.com',
            password:'c'
        }
    }
    componentDidMount=()=>{
        let x = axios.get("https://recordname.azure-api.net/api/PartnerApp/GetAllPartnerApps");
        console.log(x);
        let token = window.localStorage.getItem("token");
        if(token)
            this.props.history.push('/home');
    }
    textChange=(e,name)=>{
        let a={};
        a[name] = e.target.value;
        this.setState(a)
    }
    login=()=>{
        let params={"userid":this.state.userid,"password":this.state.password}
        axios.post(BASE_URL+'/User/Login',params).then((e)=>{
            window.localStorage.setItem("token",e.data.token);
            window.localStorage.setItem("userid",this.state.userid);
            this.props.history.push('/home');
        }).catch((e)=>{
            alert("failure");
        });
    }
    render(){
        return (<div>
            <div className="card card-container">
               <table align="center">
            <tbody>
                <tr>
                    <td className='label' colSpan={2}>User name</td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <input type="text" placeholder='User name' onChange={(e)=>{this.textChange(e,'userid')}} value={this.state.userid} className='textbox'></input>
                    </td>
                </tr>
                <tr>
                    <td className='label' colSpan={2}>Password</td>
                </tr>
                <tr>
                    <td colSpan={2}><input type="password" placeholder='Password' onChange={(e)=>{this.textChange(e,'password')}} value={this.state.password}></input></td>
                </tr>
                <tr>
                    <td className='pt10'>
                        <input type="button" value="Login" onClick={this.login}></input>
                    </td>
                    <td className='pt10 align-right'>
                        <Link to="/register">Register</Link>
                    </td>
                </tr>
                </tbody>
                </table>
            </div>
        </div>);
    }
}
export default withRouter(Login);
