import axios from 'axios';
import React from 'react';
import {BASE_URL} from '../../config/settings';
import _ from 'underscore';
import {
    Link
  } from 'react-router-dom'
class Register extends React.Component{
    constructor(props){
        super(props);
        this.state={
            sex:'',
            region:'',
            fname:'',
            lname:'',
            preferredName:'',
            email:'',
            password:'',
            retypePassword:'',
            regions:[
              {
                id:0,
                label:'India'
              },
              {
                id:1,
                label:'Phillippines'
              },
              {
                id:2,
                label:'U.S.A'
              },
              {
                id:3,
                label:'Mexico'
              }
            ]
        }
    }
    textChange=(e,name)=>{
        let a={};
        a[name] = e.target.value;
        this.setState(a)
    }
    register=()=>{
        let params={
          "userid":this.state.email,
          "password":this.state.password,
          "role":"string",
          "expirymode":"string",
          "expirytime":"2023-01-20",
          "avatarid":0,
          "emailid":this.state.email,
          "firstname":this.state.fname,
          "lastname":this.state.lname,
          "preferredname":this.state.preferredName,
          "location":this.state.region
        }


        //console.log(params);
        axios.post(BASE_URL+'/User/Register',params).then((e)=>{
            alert("success");
        }).catch((e)=>{
            alert("failure");
        });
    }
    selectSex=(e)=>{
      this.setState({sex:e})
      //console.log(e);
    }
    selectRegion=(e)=>{
      this.setState({region:e.target.value})
    }
    render(){

        return (<div>
            <div className="card card-container">
               <table align="center">
                <tbody>
                <tr>
                    <td className='label' colSpan={2}>First name</td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <input type="text" placeholder='First name' className='textbox' onChange={(e)=>{this.textChange(e,'fname')}} value={this.state.fname}></input>
                    </td>
                </tr>
                <tr>
                    <td className='label' colSpan={2}>Last name</td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <input type="text" placeholder='Last name' className='textbox'  onChange={(e)=>{this.textChange(e,'lname')}} value={this.state.lname}></input>
                    </td>
                </tr>
                <tr>
                    <td className='label' colSpan={2}>Preferred name</td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <input type="text" placeholder='Preferred to be called as' className='textbox'  onChange={(e)=>{this.textChange(e,'preferredName')}} value={this.state.preferredName}></input>
                    </td>
                </tr>
                <tr>
                    <td className='label' colSpan={2}>Region</td>
                </tr>
                <tr>
                    <td colSpan={2}>
                      <select onChange={this.selectRegion}>
                      <option>Select</option>
                        {_.map(this.state.regions,(o)=>{
                          return(<option>{o.label}</option>)
                        })}
                      </select>
                    </td>
                </tr>
                <tr>
                    <td className='label' colSpan={2}>Sex</td>
                </tr>
                <tr>
                    <td colSpan={2}>
                    <ul class='hl'>
                      <li><input type='radio' name='sex' onClick={()=>{this.selectSex('Male')}} />Male</li>
                      <li><input type='radio' name='sex' onClick={()=>{this.selectSex('Female')}}/>Female</li>
                      <li><input type='radio' name='sex' onClick={()=>{this.selectSex('Transgender')}}/>Transgender</li>
                      <li><input type='radio' name='sex' onClick={()=>{this.selectSex('Undisclosed')}}/>Do not want to disclose</li>
                    </ul>
                    </td>
                </tr>
                <tr>
                    <td className='label' colSpan={2}>Email</td>
                </tr>
                <tr>
                    <td colSpan={2}>
                        <input type="text" placeholder='Enter Email Address' className='textbox'  onChange={(e)=>{this.textChange(e,'email')}} value={this.state.email}></input>
                    </td>
                </tr>
                <tr>
                    <td className='label' colSpan={2}>Password</td>
                </tr>
                <tr>
                    <td colSpan={2}><input type="password" placeholder='Password'  onChange={(e)=>{this.textChange(e,'password')}} value={this.state.password}></input></td>
                </tr>
                <tr>
                    <td className='label' colSpan={2}>Retype Password</td>
                </tr>
                <tr>
                    <td colSpan={2}><input type="password" placeholder='Password'  onChange={(e)=>{this.textChange(e,'retypePassword')}} value={this.state.retypePassword}></input></td>
                </tr>
                <tr>
                    <td className='pt10'>
                        <input type="button" value="Register" onClick={this.register}></input>
                    </td>
                    <td className='pt10 align-right'>
                        <Link to="/">Cancel</Link>
                    </td>
                </tr></tbody>
                </table>
            </div>
        </div>);
    }
}
export default Register;
