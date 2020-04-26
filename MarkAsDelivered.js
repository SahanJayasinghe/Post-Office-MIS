import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { StyleSheet, Button, View, Image, Text, FlatList, AppRegistry, TextInput, ScrollView, TouchableHighlight, ImageBackground} from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Table, Row, Rows } from 'react-native-table-component';

const textStyles = StyleSheet.create({
  container: {
    marginTop: 50,
  },
  bigBlue: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 30,
  },
  red: {
    color: 'azure',
	fontWeight: 'bold',
    fontSize: 30,
	textAlign: 'center',
  },
  
  black: {
    color: 'azure',
    fontSize: 20,
	textAlign: 'center',
  },
});


export default class Delivered extends Component{
	constructor(props){
		super(props)
		this.state = {
			apiData:[]
		}
		
		this.dataId=null;
		this.status=null;
	}
	
	getButton = () => {
		fetch('http://192.168.8.128:4545/users',{
			method: 'GET'
		}).then((responseData) => {
			return responseData.json();
		}).then((jsonData) => {
			console.log(jsonData);
			this.setState({apiData : jsonData})
			console.log(this.state.apiData)
		}).done();
		this.dataId = null;
	}
	
	updateButton = () => {
		fetch('http://192.168.8.128:4545/users',{
			method: 'PUT',
			headers: {
				'Accept':'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({id: this.dataId})
		}).then((responseData) => {
			return responseData.json();
		}).done();
		this.dataId = null;
		this.status = null;
	}

	searchButton = () => {
		fetch('http://192.168.8.128:4545/users/'+(this.dataId),{
			method: 'GET',
		}).then((responseData) => {
			return responseData.json();
		}).then((jsonData) => {
			console.log(jsonData);
			this.setState({apiData : jsonData})

		}).done();
		this.dataId = null;
	}
	
	
	render(){
		const data = this.state.apiData;
		let dataDisplay = data.map(function(jsonData){
			return(
				<View key={jsonData.id} 
				style={{
        		flex: 1,
        		flexDirection: 'column',
        		justifyContent: 'center',
        		alignItems: 'center',
				textAlign: 'center'
      			}}>
					<View style={{flexDirection: 'row'}}>
						<Text style={textStyles.black}>{jsonData.id} |</Text>
						<Text style={textStyles.black}> {jsonData.status}</Text>
					</View>
				</View>)
		});
		return(
			<ImageBackground source={require('./images/background.jpg')} style={{width: '100%', height: '100%'}}>
				
			<View style={{
        		flex: 1,
        		flexDirection: 'column',
        		justifyContent: 'center',
        		alignItems: 'center',
				textAlign: 'center'
      			}}> 
				<Text style={textStyles.red}>{"\n"}Scan the QR code{"\n"}</Text>
	 			<View style={{width: 150, height: 150, backgroundColor: 'lightgrey'}} />
     			
    			<Text style={textStyles.black} >{"\n"}If there is a problem in scanning QR code, enter the letter/parcel Id here and Submit{"\n"}</Text>
				<TextInput 
					style={{ height: 50, 
						borderColor: 'azure', 
						borderWidth: 1, 
						fontSize: 17, 
						justifyContent: 'center',
        				alignItems: 'center',
						textAlign: 'center'}}
					placeholder = 'Enter Letter/Parcel Id Here'
					placeholderTextColor = "white"
					onChangeText = {(text) => {this.dataId = text}}
					value ={this.dataId}
					underlineColorAndroid = 'transparent'
				/>	
				<Text style={{fontSize: 5}}>{'\n'}</Text>
				<TouchableHighlight
					style={{backgroundColor: "cornflowerblue"}}
	   				activeOpacity={0.8}
       				underlayColor="blue"
	  				onPress = {this.searchButton}>
	  				<Text style={textStyles.red}>Search</Text>
	  			</TouchableHighlight>
				<Text style={{fontSize:5}}>{'\n'}</Text>
				<TouchableHighlight 
					style={{backgroundColor: "cornflowerblue"}}
	   				activeOpacity={0.8}
       				underlayColor="blue"
	  				onPress = {this.updateButton}>
	  				<Text style={textStyles.red}>MarkAsDelivered</Text>
	  			</TouchableHighlight>
				<Text style={{fontSize:5}}>{'\n'}</Text>
				<ScrollView>{dataDisplay}</ScrollView>	
			</View>	
				
			</ImageBackground>
			);
	}
	}

AppRegistry.registerComponent('Appname',() => Delivered);
