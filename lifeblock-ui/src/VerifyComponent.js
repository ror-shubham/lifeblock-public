import React, { Component } from 'react';
import Web3 from "web3"
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import {Card} from 'material-ui/Card';

var _ = require('lodash');



var BlockContractABI = [{"constant":true,"inputs":[],"name":"bal","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_user","type":"address"}],"name":"getCertiCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_user","type":"address"},{"name":"_issuer","type":"address"},{"name":"_certName","type":"bytes32"}],"name":"Verify","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_recipient","type":"address"},{"name":"_certi_name","type":"bytes32"},{"name":"issuer_details","type":"bytes32[]"}],"name":"issueCertificate","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_user","type":"address"}],"name":"getCertificates","outputs":[{"name":"","type":"bytes32[]"},{"name":"","type":"address[]"},{"name":"","type":"uint256[]"},{"name":"","type":"bytes32[4][]"}],"payable":false,"stateMutability":"view","type":"function"}]

var BlockContractAddress = '0x2540a939ed59ddbffde373a5c5e359e2531a538c';
var contract
var web3

class VerifyComponent extends Component {

	constructor() {
		super();

		// Include name of user here too
		this.state = {
			issuer_address: '',
			user_address: '',
			subject: '',
			description:'',
			verified: false,
			valid:{
				'issuer_address':true, 
				'user_address':true, 
				'subject':true, 
				'description': true
			}
		};
	}

	componentDidMount() {
         window.addEventListener('load', function() {

         // Checking if Web3 has been injected by the browser (Mist/MetaMask)
         	let web3 = window.web3
            if (typeof web3 !== 'undefined') {
                 // Use Mist/MetaMask's provider
                 web3 = new Web3(web3.currentProvider);
                 console.log("web3 injected")
             } else {
                 console.log('No web3? You should consider trying MetaMask!')
                 // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
                 web3 = new Web3(new Web3.providers.HttpProvider(
                 	"https://rinkeby.infura.io/I5HrJaXPv6hlCajZDJVD"
                 ));
         }
         contract = new web3.eth.Contract(BlockContractABI,BlockContractAddress);
         })
    }

	handleChangeText = (e) => {
		web3=window.web3
 		let newState = {};
 		newState.valid = this.state.valid
 		newState[e.target.name] = e.target.value;
 		newState['valid'][e.target.name] = (e.target.value.length!=0)
 		this.setState(newState);
	};
	handleChangeAddress = (e) => {
		let web3 = window.web3
 		let newState = {};
 		newState.valid = this.state.valid
 		newState[e.target.name] = e.target.value;
 		newState['valid'][e.target.name] = web3.isAddress(e.target.value);
 		this.setState(newState);
 		this.state.valid[e.target.name]=web3.isAddress(e.target.value);
 		console.log(_.every(_.values(this.state.valid), function(v) {return v;}))
	};

    handleSubmit(event) {
		event.preventDefault();
		let web3 = window.web3

		let user_address_valid = web3.isAddress(this.state.user_address)
		let issuer_address_valid = web3.isAddress(this.state.issuer_address)
		let subject_valid = this.state.subject.length!=0
		let description_valid = this.state.description.length!=0
		if (user_address_valid&&issuer_address_valid&&subject_valid&&description_valid){
			console.log(contract.methods.Verify(
					this.state.user_address,
					this.state.issuer_address,
					web3.fromAscii(this.state.subject)
			).call().then(response=>{
				this.setState({verified:response});
				alert("verified = "+response)
			}))
		}
		else{
			this.setState({
				valid: {
					user_address:user_address_valid ,
					issuer_address:issuer_address_valid,
					subject: subject_valid,
					description: description_valid
				}
			})
		}
		
    }


	render() {
		return(
			<div>
				<h1 className="weight-500">Verify Certificates</h1>
			    <form onSubmit={this.handleSubmit.bind(this)} className="formIssue floatCenter">
			    	<Card className="padding20 margin-10">
				        <TextField 
				        	name="user_address" 
				 	       	onChange={this.handleChangeAddress.bind(this)}
				        	floatingLabelText="User Address" 
				        	className="margin-10"
				        	errorText={this.state.valid['user_address']?"":"Enter valid address"}
				        />
				        <TextField 
				        	name="issuer_address" 
				 	       	onChange={this.handleChangeAddress.bind(this)}
				        	floatingLabelText="Issuer Address" 
				        	className="margin-10"
				        	errorText={this.state.valid['issuer_address']?"":"Enter valid address"}
				        />
				        <TextField 
				        	name="subject" 
				 	       	onChange={this.handleChangeText.bind(this)}
				        	floatingLabelText="Certificate Title" 
				        	className="margin-10 float-left"
				        	errorText={this.state.valid['subject']?"":"This field should not be empty"}
				        />
				        <TextField 
				        	name="description" 
				 	       	onChange={this.handleChangeText.bind(this)}
				        	floatingLabelText="Certificate Description" 
				        	className="width-38"
				        	multiLine={true}
				        	errorText={this.state.valid['description']?"":"This field should not be empty"}
				        />
				    </Card>
			        <RaisedButton 
			        	label="Verify" 
			        	primary={true} 
			        	type='submit' 
			        	className="margin-10"
			        />
			    </form>
			    Verified = {String(this.state.verified)}
		    </div>
		)
	}
};

export default VerifyComponent;
