import 'react-native-gesture-handler';


import React, { Component } from 'react';
import { StyleSheet, Button, View, Image, Text, FlatList, AppRegistry, TextInput, ScrollView, TouchableHighlight, ImageBackground} from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Table, Row, Rows } from 'react-native-table-component';
import Delivered from './MarkAsDelivered';


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
});

const tableStyles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30 },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text: { margin: 6 }
});



function HomeScreen({ navigation }) {
  return (
	<ImageBackground source={require('./images/background.jpg')} style={{width: '100%', height: '100%'}}>
    <View style={textStyles.container} style={{flex: 1,alignItems: 'center'}}>
	  <Text style={textStyles.red}>{'\n'}{'\n'}Sri Lanka Post Office Management and Information System{'\n'}</Text>
	  <Image source={require('./images/sl_post_logo.png')} style={{width: 400, height: 200}} />
	  <Text>{'\n'}{'\n'}{'\n'}</Text>
	  <TouchableHighlight 
	   	activeOpacity={0.8}
       	underlayColor="blue"
	  	onPress = {() => navigation.openDrawer()}>
	  	<Text style={textStyles.red}>Start Duties</Text>
	  </TouchableHighlight>
    </View>
	</ImageBackground>
  );
}

function EnterMails ({ navigation }) {
  return (
	<ImageBackground source={require('./images/background.jpg')} style={{width: '100%', height: '100%'}}>
  
	<View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}> 
	<Text style={textStyles.red}>Scan the QR code{"\n"}{"\n"}</Text>
	  <View style={{width: 150, height: 150, backgroundColor: 'lightgrey'}} />
	  <Image source={require('./images/background.jpg')} style={{width: 400, height: 200}} />
      {/*<Button color="deepskyblue" style={{alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.goBack()} title="Go back home" />*/}
    </View>
	 </ImageBackground>
  );
}

function MailList ({ navigation }) {
	const state = {
      tableHead: ['ID', 'QR code' , 'Address','State' ],
      tableData: [
        ['1', 'GJy5d25g', '3/A, tample raod, Moratuwa. 25000', 'Not Delivered'],
        ['2', 'HGVvn5f4', '32/1, tample raod, Moratuwa. 25000', 'Not Delivered'],
        ['3', 'SFgy5452', '40, tample raod, Moratuwa. 25000', 'Not Delivered'],
        ['4', 'SRGG554g', '68, tample raod, Moratuwa. 25000', 'Not Delivered']
      ]
    }
  return (	
	<ImageBackground source={require('./images/background.jpg')} style={{width: '100%', height: '100%'}}>
	<View style={tableStyles.container}>
        <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
          <Row data={state.tableHead} style={tableStyles.head} textStyle={tableStyles.text}/>
          <Rows data={state.tableData} textStyle={tableStyles.text}/>
        </Table>
		   {/*<Button color="deepskyblue" style={{alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.goBack()} title="Go back home" />*/}
     </View>
	 </ImageBackground>
  );
}




function Map ({ navigation }) {
  return (
	<ImageBackground source={require('./images/background.jpg')} style={{width: '100%', height: '100%'}}>
	<View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}> 
	<Text style={textStyles.red}>Map</Text>
	  <View style={{width: 300, height: 450, backgroundColor: 'lightgrey'}} />
	  {/*<Button color="deepskyblue" style={{alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.goBack()} title="Go back home" />*/}
    </View>
	</ImageBackground>
  );;
}


const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator 
		  drawerContentOptions={{
    	  	activeTintColor: 'black',
			inactiveTintColor: 'white',
			activeBackgroundColor: 'white',
    	  	itemStyle: { marginVertical: 10 },
			labelStyle: {fontWeight: 'bold',fontSize: 15}
        }}
		  drawerStyle={{
          	backgroundColor: '#1483f9',
   		  	width: 240,
  		}}
		initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
		<Drawer.Screen name="Mails and Parcels List" component={MailList} />
        <Drawer.Screen name="Enter Mails and Parcels" component={EnterMails} />
		<Drawer.Screen name="Mark Delivered" component={Delivered} />
		<Drawer.Screen name="Map" component={Map} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
	

{/*
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
			body: JSON.stringify({id: this.dataId, status: this.status})
		}).then((responseData) => {
			return responseData.json();
		}).done();
		this.dataId = null;
		this.status = null;
	}
	
	render(){
		const data = this.state.apiData;
		let dataDisplay = data.map(function(jsonData){
			return(
				<View key={jsonData.id}>
					<View style={{flexDirection: 'row'}}>
						<Text>{jsonData.id}</Text>
						<Text>{jsonData.status}</Text>
					</View>
				</View>)
		});
		return(
			<View>
		       <Text>UPDATE</Text>
			<TextInput  
				placeholder = 'Id'
				onChangeText = {(text) => {this.dataId = text}}
				value ={this.dataId}
				underlineColorAndroid = 'transparent'
			/>
			
			<TextInput 
				placeholder = 'status'
				onChangeText = {(text) => {this.status = text}}
				value ={this.status}
				underlineColorAndroid = 'transparent'
			/>
				
			<TouchableHighlight onPress = {this.getButton}>
				<Text>View Data</Text>
			</TouchableHighlight>
			
			<TouchableHighlight onPress = {this.updateButton}>
				<Text>update Data</Text>
			</TouchableHighlight>
			
			<ScrollView>{dataDisplay}</ScrollView>
			</View>
			);
	}
	}

AppRegistry.registerComponent('Appname',() => Delivered);
*/}



{/*
export default class App extends Component<Props>{
	state={
		data:[]
	}
	
	fetchData = async()=>{
		const response = await fetch('http://192.168.8.128:4545/users');
		const users = await response.json();
		this.setState({data: users});
	}
	
	componentDidMount(){
		this.fetchData();
	}
	
	render(){
		return(
			<View>
			<FlatList 
			data={this.state.data}
			keyExtracter = {(item,index) => index.toSring()}
			renderItem={({item})=>
				<View>
				<Text>{item.id}</Text>
				
			</View>
			}
			/>
			</View>
			);
	}
}
	
*/}
	
