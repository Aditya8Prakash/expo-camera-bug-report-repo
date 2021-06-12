import React from 'react';
import CoustomLoader from '../components/coustomLoader';
import SurfaceLoader from '../components/surfaceLoader';
import db from "../config";
import firebase from 'firebase';
import Icon from 'react-native-vector-icons/AntDesign';
import {RFPercentage} from "react-native-responsive-fontsize";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Dimensions, Linking, Vibration, AsyncStorage, Share, Clipboard, ToastAndroid, Image} from 'react-native';
import Slider from '@react-native-community/slider'
import {Header, Card, Overlay} from 'react-native-elements';
import {TouchableRipple, FAB, List, Divider, Switch} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from "expo-permissions";
import {Camera} from 'expo-camera';

var imagePlaceholder = 'https://cdn.discordapp.com/attachments/775183012027564039/852502277529141288/refreshed-image.png'
var display = {width: Dimensions.get('window').width,height: Dimensions.get('window').height}
var versionInfo={initialVersionCode:0.1,versionCode:''}
var APIfeature = [{ type: "CROP_HINTS", maxResults: 4 },{ type: "SAFE_SEARCH_DETECTION", maxResults: 4 },{ type: "LABEL_DETECTION", maxResults: 4 },{ type: "FACE_DETECTION", maxResults: 4 },{ type: "LOGO_DETECTION", maxResults: 4 },{ type: "LANDMARK_DETECTION", maxResults: 4 }];

export default class SearchScreen extends React.Component {
    constructor () {
        super();
        this.camera = null
    }
    state = {
        camMode:Camera.Constants.Type.back,
        flash:Camera.Constants.FlashMode.off,
        autoFocus:Camera.Constants.AutoFocus.off,
        zoom:0,
        whiteBlcProps:[{ id: "auto", property: "Auto" },{ id: "sunny", property: "Sunny" },{ id: "cloudy", property: "Cloudy" },{ id: "shadow", property: "Shadow" },{ id: "incandescent", property: "Incandescent" },{ id: "fluorescent", property: "Fluorescent" }],
        cameraReady:false,
        imageLoading:false,
        cameraInUse:false,
        optionInUse:false,
        settingInUse:false,
        image: imagePlaceholder,
        response:'',
        s2:true,
        s4:false,
        s5:true,
        s6:false,
        s7:false,
        theme:false,
        modal:false,
        loading:false,
        contentLoading:true,
        hasCameraPremission: null,
    }
    createUniqueId = () => {return Math.random().toString(36).substring(7);}
    convertToBooliean = str => {
        var isTrue = (str === 'true');
        return isTrue;
    }
    launchSettings = val =>this.setState({settingInUse:val,modal:false});
    launchCam=val=>this.setState({cameraInUse:val,cameraReady:false,imageLoading:false,zoom:0});
    launchOptions=val=>this.setState({optionInUse:val});
    launchInfo=()=>{
        var info = ' > Version : '+versionInfo.initialVersionCode+'\n > Latest_Version : '+versionInfo.versionCode+'\n > Date : '+Date()+'\n > App_Status : OK \n > API_Level : '+APIfeature.length
        Alert.alert('Info :',info,[{text: 'copy info', onPress: () => this.exportInfo(info)},{ text: "OK"}]);
    }
    unloadLoadingApp=val=>setTimeout(()=>this.setState({contentLoading:val}),1000);
    toogleCam=()=>this.state.camMode===Camera.Constants.Type.back?this.setState({camMode:Camera.Constants.Type.front}):this.setState({camMode:Camera.Constants.Type.back});
    toogleCam=()=>this.state.camMode===Camera.Constants.Type.back?this.setState({camMode:Camera.Constants.Type.front}):this.setState({camMode:Camera.Constants.Type.back});
    toogleFlash=()=>this.state.flash===Camera.Constants.FlashMode.on?this.setState({flash:Camera.Constants.FlashMode.off}):this.setState({flash:Camera.Constants.FlashMode.on});
    toogleAutoFocus=()=>this.state.autoFocus===Camera.Constants.AutoFocus.on?this.setState({autoFocus:Camera.Constants.AutoFocus.off}):this.setState({autoFocus:Camera.Constants.AutoFocus.on});
    camState=val=>this.setState({cameraReady:val});
    launchModal=val=>this.setState({modal:val});
    logOut=()=>firebase.auth().signOut().then(this.destroyDataSaved());
    getCameraPermissions=async()=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasCameraPremission:status==='granted'});
    }
    pickImage = async () => {
        var result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4,4],
            quality: 1,
        });
        this.setState({image:result.uri});
    };
    takeASnap=async()=>{
        if (this.camera) {
            this.setState({imageLoading:true},async()=>{
                setTimeout(async()=>{
                    var obj = await this.camera.takePictureAsync({ quality: 1, base64: true, skipProcessing: true})
                    this.setState({cameraInUse:false,image:obj.uri}) 
                },100)
            });
        }
    }
    cancl=()=>{
        if (this.state.image !== imagePlaceholder) {
            Vibration.vibrate();
            this.setState({image:imagePlaceholder});
        } else {
            ToastAndroid.show('Image is not selected',1500);
        }
    }
    uploadImage = async (uri, id) => {
        var response = await fetch(uri);
        var blob = await response.blob();
        return firebase.storage().ref().child('user_Searches/'+'image_'+id+id).put(blob).then(response=>this.fetchImage(id));
    };
    fetchImage=id=>firebase.storage().ref().child('user_Searches/'+'image_'+id+id).getDownloadURL().then(url=>this.setState({image:url})).catch(error=>Alert.alert('An Error Occured : ( \n >> '+error+' <<'));
    findImage=async()=>{
        if (this.state.image !== imagePlaceholder) {
            this.uploadImage(this.state.image,this.createUniqueId());
            // Ultimate Function Goes here (to be created)
        } else {ToastAndroid.show('Image is not selected',1500);}
    }
    getDataFromServer = async () =>{
        await firebase.database().ref('/').once('value',data=>versionInfo.versionCode=data.val().versionCode,err=>Alert.alert(err.message));
        if (versionInfo.versionCode !== versionInfo.initialVersionCode) {alert('You are using older version of this app \nYou are recomended to update the app from Google PlayStore');}
    } 
    handleOption=(type,value,name,max) =>this.setState({s2:type==='s2'?value:this.state.s2,s4:type==='s4'?value:this.state.s4,s5:type==='s5'?value:this.state.s5,s6:type==='s6'?value:this.state.s6,s7:type==='s7'?value:this.state.s7,},()=>{if (value===true) {APIfeature.push({ type: name, maxResults: max });} else if (value===false) {for (let i = 0; i < APIfeature.length; i++) {var element = APIfeature[i];if (element.type ===  name) {APIfeature.splice(i);}}}});
    changeVal=val=>this.setState({theme:val,optionInUse:false,loading:true},()=>setTimeout(()=>{this.storeTheme();this.setState({optionInUse:true,loading:false})}, 1000));
    storeTheme = async () => {try {await AsyncStorage.setItem('theme',this.state.theme.toString())} catch (error) {Alert.alert(error);}}
    retrieveTheme = async () => {try {const value = await AsyncStorage.getItem('theme');if (value !== null) {this.setState({theme:(this.convertToBooliean(value))})}} catch (error) {Alert.alert(error);}}
    exportInfo = info =>{
        Clipboard.setString(info);
        ToastAndroid.show('Copied to Clipboard',1500);
    };
    onShare = async () => {try {var result = await Share.share({message:'https://aditya-prakash-yt.github.io/aditya-prakash-yt.com/',})} catch (error) {alert(error.message);}};
    destroyDataSaved=async()=> {
        try {await AsyncStorage.clear()} catch (error) {Alert.alert(error);};
        this.props.navigation.navigate('LoginScreen');
    }
    componentDidMount(){
        this.getDataFromServer();
        this.getCameraPermissions();
        this.retrieveTheme();
        this.unloadLoadingApp(false);
    }  
    render(){
        if (this.state.contentLoading) {
            return (
                <View style={styles.containerl}>
                    <Text style={styles.txtl}>Please Wait Loading App : )</Text>
                    <CoustomLoader color='#000000'/>
                </View>
            )
        } else {
            if (!this.state.settingInUse) {
                if (!this.state.cameraInUse) {
                    if (!this.state.optionInUse) {
                        return (
                            <SafeAreaProvider>
                                <Header backgroundColor='#3b9ca3'>
                                    <TouchableOpacity style={this.state.loading?[styles.logotbtn,{display:'none'}]:styles.logotbtn} onPress={()=>this.launchSettings(true)}><Icon name='user' type='antdesign' style={styles.icon}/></TouchableOpacity>
                                    <Text style={styles.headingStyle}>Find-By-Image</Text>
                                    <TouchableOpacity style={this.state.loading?[styles.logotbtn,{display:'none'}]:styles.logotbtn} onPress={this.logOut}><Icon name='logout' type='antdesign' style={styles.icon}/></TouchableOpacity>
                                </Header>
                                {
                                    this.state.loading?
                                        <View style={this.state.theme?[styles.containerl,{backgroundColor:'#222222'}]:styles.containerl}>
                                            <Text style={this.state.theme?[styles.txtl,{color:'#ffffff'}]:styles.txtl}>Loading Theme</Text>
                                            <CoustomLoader color={this.state.theme?'#ffffff':'#000000'}/>
                                        </View>:
                                        <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                                            <View style={styles.imageContainer}>
                                                <Image style={this.state.theme?[styles.image,{backgroundColor:'#ffffff22'}]:styles.image} source={{ uri: this.state.image }}/>
                                                <Text style={this.state.theme?[styles.txt1,{color:'#ffffff'}]:styles.txt1}>
                                                    Pick Image from :
                                                </Text>
                                                    <View style={styles.row2}>
                                                        <TouchableRipple rippleColor={this.state.theme?'#00ffff22':'#00000022'} style={this.state.theme?[styles.button,{backgroundColor:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.button} onPress={this.pickImage}>
                                                            <Text style={this.state.theme?[styles.text,{color:'#00ffff'}]:styles.text}>Gallery</Text>
                                                        </TouchableRipple>
                                                        <TouchableRipple rippleColor={this.state.theme?'#00ffff22':'#00000022'} style={this.state.theme?[styles.button,{backgroundColor:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.button} onPress={()=>this.launchCam(true)}>
                                                            <Text style={this.state.theme?[styles.textb,{color:'#00ffff'}]:styles.textb}>Camera</Text>
                                                        </TouchableRipple>
                                                    </View>
                                                    <View style={styles.row3}>
                                                        <TouchableRipple rippleColor={this.state.theme?'#00ffc822':'#00000022'} style={this.state.theme?[styles.searcbtns,{backgroundColor:'#00000000',borderColor:'#00ffc8',borderWidth:2}]:styles.searcbtns} onPress={this.findImage}>
                                                            <Text style={this.state.theme?[styles.textb,{color:'#00ffc8'}]:styles.textb}>Search</Text>
                                                        </TouchableRipple>
                                                        <TouchableRipple rippleColor={this.state.theme?'#00ffc822':'#00000022'} style={this.state.theme?[styles.searcbtns,{backgroundColor:'#00000000',borderColor:'#00ffc8',borderWidth:2}]:styles.searcbtns} onPress={this.cancl}>
                                                            <Text style={this.state.theme?[styles.textb,{color:'#00ffc8'}]:styles.textb}>Cancel</Text>
                                                        </TouchableRipple>
                                                    </View>
                                            </View>
                                        <FAB style={styles.fab} large icon={()=>{return <Icon name='setting' style={styles.fabIcon}/>}} onPress={()=>this.launchOptions(true)} animated={false}/>
                                    </View>
                                }
                            </SafeAreaProvider>
                        );
                    } else {
                        return(
                            <SafeAreaProvider>
                                <Header backgroundColor='#3b9ca3'>
                                    <TouchableOpacity style={styles.logotbtn} onPress={()=>this.launchOptions(false)}>
                                        <Icon name='arrowleft' type='antdesign' style={styles.icon}/>
                                    </TouchableOpacity>
                                    <Text style={styles.headingStyle}>Find-By-Image</Text>
                                    <TouchableOpacity style={styles.logotbtn} onPress={this.logOut}>
                                        <Icon name='logout' type='antdesign' style={styles.icon}/>
                                    </TouchableOpacity>
                                </Header>
                                <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                                    <View style={styles.listCont}>
                                        <List.Subheader style={this.state.theme?[styles.listhed,{color:'#ffffff'}]:styles.listhed}>
                                            <Icon name='edit' style={styles.icon4S} />
                                            Coustomize Your Search :
                                        </List.Subheader>
                                            <Divider style={this.state.theme?{backgroundColor:'#aaaaaa'}:styles.devdColor}/>
                                        <List.Item style={styles.list} left={()=>{return <Text style={this.state.theme?[styles.listtxt,{color:'#ffffff'}]:styles.listtxt}>Face Detection</Text>}} right={()=>{return <Switch value={this.state.s2} color='#49c1c9' onValueChange={value=>this.handleOption('s2',value,"FACE_DETECTION",5)}/>}}/>
                                            <Divider style={this.state.theme?{backgroundColor:'#aaaaaa'}:styles.devdColor}/>
                                        <List.Item style={styles.list} left={()=>{return <Text style={this.state.theme?[styles.listtxt,{color:'#ffffff'}]:styles.listtxt}>Text Detection</Text>}} right={()=>{return <Switch value={this.state.s4} color='#49c1c9' onValueChange={value=>this.handleOption('s4',value,"TEXT_DETECTION",5)}/>}}/>
                                            <Divider style={this.state.theme?{backgroundColor:'#aaaaaa'}:styles.devdColor}/>
                                        <List.Item style={styles.list} left={()=>{return <Text style={this.state.theme?[styles.listtxt,{color:'#ffffff'}]:styles.listtxt}>Landmark Detection</Text>}} right={()=>{return <Switch value={this.state.s5} color='#49c1c9' onValueChange={value=>this.handleOption('s5',value,"LANDMARK_DETECTION",5)}/>}}/>
                                            <Divider style={this.state.theme?{backgroundColor:'#aaaaaa'}:styles.devdColor}/>
                                        <List.Item style={styles.list} left={()=>{return <Text style={this.state.theme?[styles.listtxt,{color:'#ffffff'}]:styles.listtxt}>Handwritng Detection</Text>}} right={()=>{return <Switch value={this.state.s6} color='#49c1c9' onValueChange={value=>this.handleOption('s6',value,"DOCUMENT_TEXT_DETECTION",5)}/>}}/>
                                            <Divider style={this.state.theme?{backgroundColor:'#aaaaaa'}:styles.devdColor}/>
                                        <List.Item style={styles.list} left={()=>{return <Text style={this.state.theme?[styles.listtxt,{color:'#ffffff'}]:styles.listtxt}>Image Properties</Text>}} right={()=>{return <Switch value={this.state.s7} color='#49c1c9' onValueChange={value=>this.handleOption('s7',value,"IMAGE_PROPERTIES",5)}/>}}/>
                                            <Divider style={this.state.theme?{backgroundColor:'#aaaaaa'}:styles.devdColor}/>
                                    </View>
                                        <List.Item style={[styles.list,{paddingVertical:20}]} left={()=>{return <Text style={this.state.theme?[styles.listtxt,{color:'#ffffff'}]:styles.listtxt}>Enable Dark Theme</Text>}} right={()=>{return <Switch value={this.state.theme} color='#49c1c9' onValueChange={val=>this.changeVal(val)}/>}}/>
                                </View>
                            </SafeAreaProvider>
                        )
                    }
                }
                if (this.state.cameraInUse) {
                    if (this.state.hasCameraPremission) {
                        return (
                            <SafeAreaProvider>
                                <Header backgroundColor='#3b9ca3'>
                                    <TouchableOpacity style={styles.logotbtn} onPress={()=>this.launchCam(false)}>
                                        <Icon name='close' type='antdesign' style={styles.icon}/>
                                    </TouchableOpacity>
                                    <Text style={styles.headingStyle}>Find-By-Image</Text>
                                    <TouchableOpacity style={this.state.cameraInUse?[styles.logotbtn,{display:'none'}]:styles.logotbtn}>
                                        <Icon name='logout' type='antdesign' style={styles.icon}/>
                                    </TouchableOpacity>
                                </Header>
                                <View style={[styles.container,{backgroundColor:'#222222'}]}>
                                    <Camera style={[styles.camera]} type={this.state.camMode} ratio={1} ref={refrence=>this.camera=refrence} onCameraReady={()=>this.camState(true)} zoom={this.state.zoom} autoFocus={this.state.autoFocus} flash={this.state.flash} whiteBalance={this.state.whiteBlcProps}>                                    
                                        {this.state.imageLoading?<SurfaceLoader/>:<Icon name='plus' style={[styles.cntIco,{transform:[{scale:(1.25+this.state.zoom)}]}]}/>}
                                        {this.state.cameraReady?
                                            <View>
                                                <View style={styles.flashView}>
                                                    <TouchableOpacity style={styles.flashOp} onPress={()=>this.toogleFlash}><Icon name='bulb1' style={this.state.flash===Camera.Constants.FlashMode.on?[styles.flash,{color:'#ffef00'}]:styles.flash} /></TouchableOpacity>
                                                    <TouchableOpacity style={styles.flashOp} onPress={()=>this.toogleAutoFocus}><Icon name='scan1' style={this.state.autoFocus===Camera.Constants.AutoFocus.on?[styles.flash,{color:'#ffef00'}]:styles.flash} /></TouchableOpacity>
                                                </View>
                                                <View style={styles.dash}>
                                                    <View style={styles.sl1}>
                                                        <Slider style={{width:display.width-display.width/4}} value={this.state.zoom} onValueChange={val=>this.setState({zoom:val})} minimumValue={0} maximumValue={1} step={0.025}/>  
                                                    </View>
                                                    <View style={styles.row}>
                                                        <TouchableOpacity onPress={this.toogleCam}>
                                                            <Icon name='retweet' style={styles.cambtnoth}/>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={this.takeASnap}>
                                                            <Icon name='camera' style={styles.camerabtn}/>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={()=>this.launchCam(false)}>
                                                            <Icon name='close' style={styles.cambtnoth}/>
                                                        </TouchableOpacity>
                                                    </View>   
                                                </View>
                                            </View>
                                        :
                                            <View style={this.state.theme?[styles.containerl,{backgroundColor:'#222222'}]:styles.containerl}>
                                                <Text style={this.state.theme?[styles.txtl,{color:'#ffffff'}]:styles.txtl}>Loading Camera</Text>
                                                <CoustomLoader color={this.state.theme?'#ffffff':'#000000'}/>
                                            </View>}
                                    </Camera>
                                </View>
                            </SafeAreaProvider>
                        )
                    }else{
                        return(
                            <SafeAreaProvider>
                                <Header backgroundColor='#3b9ca3'>
                                    <TouchableOpacity style={styles.logotbtn} onPress={()=>this.launchCam(false)}>
                                        <Icon name='arrowleft' type='antdesign' style={styles.icon}/>
                                    </TouchableOpacity>
                                    <Text style={styles.headingStyle}>Find-By-Image</Text>
                                    <TouchableOpacity style={styles.logotbtn} onPress={this.logOut}>
                                        <Icon name='logout' type='antdesign' style={styles.icon}/>
                                    </TouchableOpacity>
                                </Header>
                                <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                                    <Text style={this.state.theme?[styles.nocam,{color:'#ffffff'}]:styles.nocam}>No Camera Premission</Text>
                                    <Text style={this.state.theme?[styles.nocam2,{color:'#ffffff'}]:styles.nocam2}>Please Provide Camera Permission :-)</Text>
                                    <TouchableOpacity style={this.state.theme?[styles.per,{borderColor:'#00ffff',borderRadius:0,backgroundColor:'#00000000',borderWidth:2}]:styles.per} onPress={()=>this.getCameraPermissions()}>
                                        <Text style={this.state.theme?[styles.text,{color:'#00ffff'}]:styles.text}>
                                            Grant Camera Premission
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={this.state.theme?[styles.per,{borderColor:'#00ffff',borderRadius:0,backgroundColor:'#00000000',borderWidth:2}]:styles.per} onPress={()=>this.launchCam(false)}>
                                        <Text style={this.state.theme?[styles.text,{color:'#00ffff'}]:styles.text}>
                                            Deny Camera Premission
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </SafeAreaProvider> 
                        )
                    }
                }
            } else {
                return (
                    <SafeAreaProvider>
                            <Header backgroundColor='#3b9ca3'>
                                <TouchableOpacity style={styles.logotbtn} onPress={()=>this.launchSettings(false)}>
                                    <Icon name='arrowleft' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                                    <Text style={styles.headingStyle}>Find-By-Image</Text>
                                <TouchableOpacity style={styles.logotbtn} onPress={this.logOut}>
                                    <Icon name='logout' type='antdesign' style={styles.icon}/>
                                </TouchableOpacity>
                            </Header>
                            <View style={this.state.theme?[styles.container,{backgroundColor:'#222222'}]:styles.container}>
                                <View>
                                <Card containerStyle={{backgroundColor:'#00000000'}} wrapperStyle={{borderColor:'#00000000',borderWidth:0}}>
                                <Card.Title style={this.state.theme?[styles.titleS,{color:'#ffffff'}]:styles.titleS}>
                                    <Icon style={this.state.theme?[styles.icon2S,{color:'#ffffff'}]:styles.icon2S} name='profile'/>
                                    A Note From Developer
                                </Card.Title>
                                    <Card.Divider style={this.state.theme?{backgroundColor:'#ffffff'}:{backgroundColor:'#000000'}}/>
                                    <Text style={this.state.theme?[styles.cardTxtS,{color:'#ffffff'}]:styles.cardTxtS}>
                                        As a Developer I would really like that you would rate my app. If there is any bug, glitch, suggestion or feedback related to this app, then please report it on my support email.
                                    </Text>
                                    <Text style={this.state.theme?[styles.thankS,{color:'#ffffff'}]:styles.thankS}>
                                        Thank you,{'\n'}--Aditya Prakash
                                    </Text>
                                    <Card.Divider style={this.state.theme?{backgroundColor:'#ffffff'}:{backgroundColor:'#000000'}}/>
                                    <View style={styles.dashS}>
                                        <TouchableRipple rippleColor={this.state.theme?'#00ffff33':'#00000022'} onPress={()=>Linking.openURL('market://details?id=')} style={this.state.theme?[styles.btnS,{backgroundColor:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btnS}>
                                            <Text style={this.state.theme?[styles.txtS,{color:'#00ffff'}]:styles.txtS}>Rate App</Text>
                                        </TouchableRipple>
                                        <TouchableRipple rippleColor={this.state.theme?'#00ffff33':'#00000022'} onPress={()=>this.launchModal(true)} style={this.state.theme?[styles.btnS,{backgroundColor:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btnS}>
                                            <Text style={this.state.theme?[styles.txtS,{color:'#00ffff'}]:styles.txtS}>Report Bug</Text>
                                        </TouchableRipple>
                                    </View>
                                    <Card.Divider style={this.state.theme?{backgroundColor:'#ffffff'}:{backgroundColor:'#000000'}}/>
                                    <View style={styles.dashS}>
                                        <TouchableRipple rippleColor={this.state.theme?'#8c00ff22':'#00000022'} onPress={()=>Linking.openURL('https://discord.gg/AV73XSXq2m')} style={this.state.theme?[styles.btnS,{backgroundColor:'#00000000',borderColor:'#8c00ff',borderWidth:2}]:styles.btnS}>
                                            <Text style={this.state.theme?[styles.txtS,{color:'#8c00ff'}]:styles.txtS}>Discord</Text>
                                        </TouchableRipple>
                                        <TouchableRipple rippleColor={this.state.theme?'#ff000033':'#00000022'} onPress={()=>Linking.openURL('https://www.youtube.com/channel/UCIJF8t1WzTWG8RbYpz9rzTA')} style={this.state.theme?[styles.btnS,{backgroundColor:'#00000000',borderColor:'#ff0000',borderWidth:2}]:styles.btnS}>
                                            <Text style={this.state.theme?[styles.txtS,{color:'#ff0000'}]:styles.txtS}>YouTube</Text>
                                        </TouchableRipple>
                                    </View>
                                    <Card.Divider style={this.state.theme?{backgroundColor:'#ffffff'}:{backgroundColor:'#000000'}}/>
                                </Card>
                                    <View style={styles.dashS}>
                                        <TouchableOpacity style={this.state.theme?[styles.btn2S,{backgroundColor:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btn2S} onPress={this.launchInfo}>
                                            <Icon style={this.state.theme?[styles.icon3S,{color:'#00ffff'}]:styles.icon3S} name='infocirlceo'/>
                                            <Text style={this.state.theme?[styles.txt1S,{color:'#00ffff'}]:styles.txt1S}>Info</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={this.state.theme?[styles.btn2S,{backgroundColor:'#00000000',borderColor:'#00ffff',borderWidth:2}]:styles.btn2S} onPress={this.onShare}>
                                            <Icon style={this.state.theme?[styles.icon3S,{color:'#00ffff'}]:styles.icon3S} name='sharealt'/>
                                            <Text style={this.state.theme?[styles.txt1S,{color:'#00ffff'}]:styles.txt1S}>Share</Text>
                                        </TouchableOpacity>  
                                    </View>
                                </View>
                            </View>
                            <Overlay isVisible={this.state.modal} backdropStyle={styles.modal} overlayStyle={this.state.theme?[styles.modalSurface,{backgroundColor:'#222222'}]:styles.modalSurface} onBackdropPress={()=>this.launchModal(false)}>
                                <List.Section>
                                    <List.Subheader style={this.state.theme?[styles.listhed,{color:'#ffffff'}]:styles.modalHed}>
                                        <Icon name='flag' style={styles.icon4S} />
                                        Report a Bug
                                    </List.Subheader>
                                    <TouchableOpacity style={[styles.modalOp,{color:'#8c00ff'}]} onPress={()=>Linking.openURL('mailto:suportwithfindbyimage@gmail.com')}>
                                        <Text style={[styles.listtxt,{color:'#8c00ff'}]}>Report By E-mail</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalOp,{color:'#8c00ff'}]} onPress={()=>Linking.openURL('mailto:suportwithfindbyimage@gmail.com')}>
                                        <Text style={[styles.listtxt,{color:'#8c00ff'}]}>Report on Website</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalOp,{color:'#8c00ff'}]} onPress={()=>Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSfQVCMXh69LA1WIaWB2fMjeVJ1T5rnPbKj58YYON_74AeIyPg/viewform')}>
                                        <Text style={[styles.listtxt,{color:'#8c00ff'}]}>Report through Forms</Text>
                                    </TouchableOpacity>
                                </List.Section>
                            </Overlay>
                    </SafeAreaProvider>
                )
            }
        }
    }
}

const styles = StyleSheet.create({
    headingStyle:{
        fontSize:RFPercentage(4.25),
        color:'#ffffff',
        letterSpacing:-2,
        alignSelf:'center'
    },
    logotbtn:{
        flexDirection:'row',
        backgroundColor:'#ffffff36',
        borderRadius:5,
        alignItems:'center'
    },
    icon:{
        padding: 10 ,
        color:'#ffffff',
        fontSize:RFPercentage(3)
    },
    image:{
        width:display.width-50<350 === true?display.width-50:350,
        height:display.width-50<350 === true?display.width-50:350,
        backgroundColor:'#00000022',
        borderRadius:5,
    },
    text:{
        fontSize:RFPercentage(3)
    },
    textb:{
        fontSize:RFPercentage(3),
        letterSpacing:-2,
        textAlign:'center'
    },
    row2:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        justifyContent:'space-evenly'
    },
    row:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        marginTop:20
    },
    button:{
        width:'30%',
        padding:10,
        backgroundColor:'#4cc8e7af',
        textAlign:'center'
    },
    container:{
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        flex:1,
        backgroundColor:'#ffffff',
        width:display.width,
    },
    nocam:{
        fontSize:RFPercentage(3.5)
    },
    nocam2:{
        fontSize:20,
        marginBottom:60
    },
    camera:{
        width:500,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        flex:1,
    },
    per:{
        padding:10,
        margin:10,
        backgroundColor:'#4cc8e7',
        borderRadius:5,
        letterSpacing:-1
    },
    camerabtn:{
        fontSize:60,
        color:'#ffffff',
        backgroundColor:'#47bac263',
        padding:10,
        borderRadius:500,
        marginBottom:5,
        marginHorizontal:25,
        marginTop:5
    },
    dash:{
        marginTop:display.height-175,
        backgroundColor:'#00000058',
        width:display.width+30,
        paddingBottom:20,
    },
    cambtnoth:{
        fontSize:45,
        color:'#ffffff',
        backgroundColor:'#47bac263',
        padding:10,
        borderRadius:100
    },
    txt1:{
        alignSelf:'center',
        margin:10,
        fontSize:30,
        letterSpacing:-2
    },
    button2:{
        padding:10,
        backgroundColor:'#4cc8e74d',
        borderRadius:5
    },
    row3:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        justifyContent:'space-evenly',
        marginTop:30
    },
    searcbtns:{
        width:'30%',
        padding:10,
        backgroundColor:'#6fabd6',
        textAlign:'center'
    },
    fab: {
        position: 'absolute',
        right:15,
        bottom:15,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        backgroundColor:'#4bc1c9'
    },
    fabIcon:{
        color:'#ffffff',
        fontSize:25,
        transform:[{scale:1.3}]
    },
    list:{
        padding:10,
        width:display.width-70,
    },
    listtxt:{
        fontSize:17
    },
    listCont:{
        padding:15,
    },
    listhed:{
        fontSize:20,
        color:'#000000',
        flexDirection:'row'
    },
    titleS:{
        fontSize:RFPercentage(3),
        letterSpacing:-1,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
        color:'#000000'
    },
    btnS:{
        padding:5,
        backgroundColor:'#4cc8e7af',
        width:120,
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'space-around',
        alignItems:'center',
        borderRadius:2.5
    },
    txtS:{
        fontSize:20,
        letterSpacing:-1
    },
    dashS:{
        justifyContent:'space-evenly',
        alignItems:'center',
        alignContent:'center',
        marginBottom:10,
        flexDirection:'row'
    },
    thankS:{
        margin:10,
        letterSpacing:-1,
        fontSize:20
    },
    cardTxtS:{
        fontSize:20,
        letterSpacing:-1
    },
    titleS:{
        fontSize:RFPercentage(3),
        letterSpacing:-1,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        alignContent:'center',
    },
    icon2S:{
        padding:10,
        fontSize:RFPercentage(4)
    },
    txt1S:{
        fontSize:20,
    },
    btn2S:{
        padding:7,
        backgroundColor:'#4cc8e7af',
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'space-evenly',
        alignItems:'center',
        margin:10
    },
    icon3S:{
        fontSize:25,
        paddingRight:10,
    },
    icon4S:{
        paddingRight:10,
        fontSize:23
    },
    devdColor:{
        backgroundColor:'#77777788'
    },
    containerl:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        height:display.height,
        width:display.width,
        backgroundColor:'#ffffff'
    },
    txtl:{
        fontSize:25,
        paddingVertical:50,
        color:'#000000'
    },
    modal:{
        padding:55,
    },
    modalSurface:{
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        backgroundColor:'#ffffff',
        padding:25,
        margin:30,
        width:display.width-75,
        borderRadius:5,
    },
    modalOp:{
        flexDirection:'row',
        alignContent:'center',
        justifyContent:'space-evenly',
        alignItems:'center',
        padding:10,
        marginHorizontal:5,
        marginVertical:7,
        width:display.width-135,
        borderWidth:2,
        borderColor:'#8c00ff',
    },
    modalHed:{
        fontSize:23,
        paddingVertical:10,
        color:'#000000'
    },
    sl1:{
        width:display.width-display.width/6,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        justifyContent:'space-around',
        alignSelf:'center',
        marginTop:10,
        opacity:0.75,
        transform:[{scale:1.2}]
    },
    cntIco:{
        position:'absolute',
        color:'#ffffff',
        opacity:0.75,
        fontSize:15,
    },
    flash:{
        color:'#ffffff',
        fontSize:27,
    },
    flashOp:{
        margin:7
    },
    flashView:{
        position:'absolute',
        padding:7,
        backgroundColor:'#00000058',
        borderRadius:5,
        bottom:display.height/3,
        paddingLeft:20
    }
});
