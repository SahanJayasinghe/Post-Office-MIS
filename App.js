import 'react-native-gesture-handler';

import React, { Component } from 'react';
import { StyleSheet, Button, View, Image, Text, FlatList, AppRegistry, TextInput, ScrollView, TouchableHighlight, ImageBackground} from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Table, Row, Rows } from 'react-native-table-component';
import Delivered from './MarkAsDelivered';
import EnterMail from './QrScan';
import Scan from './QR';



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
		<Drawer.Screen name="Mark Delivered" component={Delivered} />
		<Drawer.Screen name="Enter Mails" component={EnterMail} />
		<Drawer.Screen name="Map" component={Map} />
		<Drawer.Screen name="Camera" component={Scan} />

      </Drawer.Navigator>
    </NavigationContainer>
  );
}
	




	
