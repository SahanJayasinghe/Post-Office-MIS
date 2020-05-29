import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { StyleSheet, Button, View, Image, Text, FlatList, AppRegistry, TextInput, ScrollView, TouchableHighlight, ImageBackground,PermissionsAndroid, Platform} from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Table, Row, Rows } from 'react-native-table-component';
import { CameraKitCameraScreen } from 'react-native-camera-kit';



export default class EnterMail extends Component{
	constructor(props){
		super(props)
		this.state = {
			dataId:null,
		}
		
	    this.apiData=[];
		this.status=null;
	}

	searchButton = () => {
		console.log(this.state.dataId);
		fetch('http://192.168.8.128:4545/users/'+(this.state.dataId),{
			method: 'GET',
		}).then((responseData) => {
			return responseData.json();
		}).then((jsonData) => {
			console.log(jsonData[0]);
			this.apiData = jsonData

		}).done();
	}
	
	
	getData = (qrvalue) => {
	  let qr_content = qrvalue.split('_');
	  if(qr_content === undefined || qr_content[0] === undefined ||qr_content[1] === undefined){
          alert('Invalid QR Code');
            }
	  else{
          let content1 = qr_content[0].split('=');
          let content2 = qr_content[1].split('=');
          if(content1[0] === 'type' && content2[0] === 'id'){
              let type = content1[1];
              let id = content2[1];
			  if(!(id===this.state.dataId)){
				  this.setState({dataId:id})
				  
			  }
          }
          else{
              alert('Invalid QR Code');
          }                
      }
  	}
	

	
	
	render(){
		const data = this.apiData;
		console.log(data)
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
					<View style={{flexDirection: 'column'}}>
						<Text style={textStyles.black}>{jsonData.id} |</Text>
						<Text style={textStyles.black}> {jsonData.status}</Text>
						<Text style={textStyles.black}> {jsonData.receiver_name}</Text>
						<Text style={textStyles.black}> {jsonData.number}</Text>
						<Text style={textStyles.black}> {jsonData.street}</Text>								
					</View>
				</View>)
		});
		
		return(
			
			<View style={{flex:1,flexDirection: 'column',}}>
			<View style={{
        		flex: 1,
				
      			}}>
			<CameraKitCameraScreen 
          		showFrame={false}
          		scanBarcode={true}
          		laserColor={'blue'}
          		frameColor={'yellow'}
          		colorForScannerFrame={'black'}
          		onReadCode={event =>
            		this.getData(event.nativeEvent.codeStringValue)
          		}
        	/>
			<Text>'help'</Text>

	 			</View>
     		<View style={{
        		flex:1,
				alignItems: 'center',

      			}}>
    			<Text style={textStyles.black} >{"\n"}If there is a problem in scanning QR code, enter the letter/parcel Id here and Submit{"\n"}</Text>
				<TextInput 
					style={{ height: 50,
						width:200,
						borderColor: 'azure', 
						borderWidth: 1, 
						fontSize: 17, 
						justifyContent: 'center',
        				alignItems: 'center',
						textAlign: 'center'}}
					placeholder = {this.state.dataId}
					placeholderTextColor = "white"
					onSubmitEditing={({ nativeEvent }) => this.setState({ dataId: nativeEvent.text })}	
					underlineColorAndroid = 'transparent'
				/>	
				<Text style={{fontSize: 5}}>{'\n'}</Text>
				<TouchableHighlight
					style={{backgroundColor: "cornflowerblue"}}
	   				activeOpacity={0.8}
       				underlayColor="blue"
	  				onPress = {this.searchButton}>
	  				<Text style={textStyles.red}>Save Mail</Text>
	  			</TouchableHighlight>
				<Text style={{fontSize:5}}>{'\n'}</Text>
				<ScrollView>{dataDisplay}
							<Text style={{fontSize:5}}>{'\n'}</Text>
				            </ScrollView>
				<Text style={{fontSize:5}}>{'\n'}</Text>
	
				
			</View>	
			
			</View>
				
			
			);
	}
	}


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

AppRegistry.registerComponent('Appname',() => EnterMail);