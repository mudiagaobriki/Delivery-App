
import React, {useContext, useEffect, useState} from 'react';
import { WTransactionHistory } from '../components';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  Alert, Image, TextInput
} from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { colors } from '../common/theme';
var { height } = Dimensions.get('window');
import i18n from 'i18n-js';
import {useDispatch, useSelector} from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { DrawerActions } from '@react-navigation/native';
import * as Linking from "expo-linking"
import * as firebase from "firebase";
import {FirebaseContext} from "common/src";

export default function FireService(props) {
  const [contacts, setContacts] = useState([])

  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const providers = useSelector(state => state.paymentmethods.providers);
  const [profile,setProfile] = useState();

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  const { api, appcat } = useContext(FirebaseContext);
  const {
    fetchAddressfromCoords,
    fetchDrivers,
    updateTripPickup,
    updateTripDrop,
    updatSelPointType,
    getDistanceMatrix,
    MinutesPassed,
    updateTripCar,
    getEstimate,
    getDirectionsApi,
    clearEstimate,
    addBooking,
    clearBooking,
    clearTripPoints,
    GetDistance
  } = api;
  const dispatch = useDispatch();
  const cars = useSelector(state => state.cartypes.cars);
  const tripdata = useSelector(state => state.tripdata);
  const usersdata = useSelector(state => state.usersdata);
  const estimatedata = useSelector(state => state.estimatedata);
  const activeBookings = useSelector(state => state.bookinglistdata.active);
  const gps = useSelector(state => state.gpsdata);

  useEffect(()=>{
    const fs = firebase.database().ref('fireservice');
    console.log("Fire Service: ", fs)
    fs.get()
        .then((snapshot) => {
          console.log("Snapshot: ", snapshot)
        })
    // let starCountRef = firebase.database().ref('fireservice/mile3');
    // starCountRef.on('value', (snapshot) => {
    //   const data = snapshot.val();
    //   console.log("Snapshot: ", snapshot.val())
    //   console.log("Firebase data: ", data)
    //   // updateStarCount(postElement, data);
    // });


    if(auth.info && auth.info.profile){
        setProfile(auth.info.profile);
    } else{
        setProfile(null);
    }
},[auth.info]);

  useEffect(() => {
    console.log("GPS: ", gps)
    console.log("Trip Data: ", tripdata)
  },[gps.location])

  const doReacharge = () => {
    if(!(profile.mobile && profile.mobile.length > 6) || profile.email == ' ' || profile.firstName == ' ' || profile.lastName == ' ' ){
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.navigate('editUser');
     } else{
          if (providers) {
      props.navigation.push('addMoney', { userdata: { ...auth.info.profile, uid: auth.info.uid}, providers: providers });
    } else {
      Alert.alert(t('alert'),t('provider_not_found'))
    }
  }
}

  const doWithdraw = () => {
    if(!(profile.mobile && profile.mobile.length > 6) || profile.email == ' ' || profile.firstName == ' ' || profile.lastName == ' ' ){
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.navigate('editUser');
    }else{
    if (parseFloat(auth.info.profile.walletBalance)>0) {
      props.navigation.push('withdrawMoney', { userdata: { ...auth.info.profile, uid: auth.info.uid} });
    } else {
      Alert.alert(t('alert'),t('wallet_zero'))
    }
  }
}

  const walletBar = height / 4;

  const lCom ={ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer()); } };
  const rCom = auth.info && auth.info.profile && (auth.info.profile.usertype =='driver' || (auth.info.profile.usertype =='rider' && settings && settings.RiderWithDraw))?<TouchableOpacity onPress={doWithdraw}><Text style={{color:colors.WHITE, marginTop: 5}}>{t('withdraw')}</Text></TouchableOpacity>:null;

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.HEADER}
        leftComponent={isRTL? rCom:lCom}
        rightComponent={isRTL? lCom:rCom}
        centerComponent={<Text style={styles.headerTitleStyle}>Fire Service</Text>}
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />

      <View >
        <View >
          <View >
            {/*<View style={{ flexDirection:isRTL?'row-reverse':'row', justifyContent: "space-around", marginTop: 8 }}>*/}
            {/*  <View style={{ height: walletBar - 50, width: '48%', backgroundColor: colors.BORDER_BACKGROUND, borderRadius: 8, justifyContent: 'center', flexDirection: 'column' }}>*/}
            {/*    <Text style={{ textAlign: 'center', fontSize: 18 }}>{t('wallet_ballance')}</Text>*/}
            {/*    {settings.swipe_symbol===false?*/}
            {/*      <Text style={{ textAlign: 'center', fontSize: 25, fontWeight: '500', color: colors.BALANCE_GREEN }}>{settings.symbol}{auth.info && auth.info.profile ? parseFloat(auth.info.profile.walletBalance).toFixed(settings.decimal) : ''}</Text>*/}
            {/*      :*/}
            {/*      <Text style={{ textAlign: 'center', fontSize: 25, fontWeight: '500', color: colors.BALANCE_GREEN }}>{auth.info && auth.info.profile ? parseFloat(auth.info.profile.walletBalance).toFixed(settings.decimal) : ''}{settings.symbol}</Text>*/}
            {/*    }*/}
            {/*  </View>*/}
            {/*  <TouchableWithoutFeedback onPress={doReacharge}>*/}
            {/*    <View style={{ height: walletBar - 50, width: '48%', backgroundColor: colors.BALANCE_GREEN , borderRadius: 8, justifyContent: 'center', flexDirection: 'column' }}>*/}
            {/*      <Icon*/}
            {/*        name='add-circle'*/}
            {/*        type='MaterialIcons'*/}
            {/*        color={colors.WHITE}*/}
            {/*        size={45}*/}
            {/*        iconStyle={{ lineHeight: 48 }}*/}
            {/*      />*/}
            {/*      <Text style={{ textAlign: 'center', fontSize: 18, color: colors.WHITE }}>{t('add_money')}</Text>*/}
            {/*    </View>*/}
            {/*  </TouchableWithoutFeedback>*/}
            {/*</View>*/}
          </View>
          {/*<View style={{ marginVertical: 10 }}>*/}
          {/*  <Text style={{ paddingHorizontal: 10, fontSize: 18, fontWeight: '500', marginTop: 8, textAlign:isRTL? "right":"left" }}>{t('transaction_history_title')}</Text>*/}
          {/*</View>*/}
        </View>

        {/*<View style={{flex:1}}>*/}
        {/*  <View style={{ height: '100%',paddingBottom:6}}>*/}
        {/*    <WTransactionHistory walletHistory={auth.info && auth.info.profile? auth.info.profile.walletHistory: []}/>*/}
        {/*  </View>*/}
        {/*</View>*/}
      </View>

        <View Style={{flex: 1}}>
          <View style={{padding: 20}}>
            <Text style={{ fontSize: 24, textAlign:"left",
              color:"black"}}>{"Rivers State "}Fire Service</Text>
            <Text style={{ fontSize: 16, textAlign:"left",
              color:"#919091"}}>Tap to Call</Text>
          </View>
          <View style={{paddingHorizontal: 30}}>
            <TextInput placeholder="25 Colonel Larry Street"
                       value = {tripdata.pickup.add}
                       style={styles.searchInputs}/>
            {/*<TextInput placeholder="Where are you going to?"*/}
            {/*           style={styles.searchInputs}/>*/}
            <View style={{marginTop: 20}}>
              <TouchableOpacity style={{justifyContent: "center", alignContent: "center"}}
                                onPress = {() => Linking.openURL(`tel:${contacts[0].mobile}`)} >
                <Image source={require("../../assets/images/call.png")} style={{width: 200, height:200, alignSelf: "center"}} />
              </TouchableOpacity>
              {/*<View style={styles.cards}>*/}
              {/*    <Image source={require("../../assets/images/call.png")} style={styles.cardImage} />*/}
              {/*    /!*<Text style={{ fontFamily:"Rubik_400Regular", fontSize: 14, textAlign:"left",*!/*/}
              {/*    /!*    color:"black", marginTop: 5,}}>Ambulance</Text>*!/*/}
              {/*    /!*<FontAwesome name="chevron-circle-right" size={30} style={{marginTop: 15}} />*!/*/}
              {/*</View>*/}
              {/*<View style={[styles.cards,{marginLeft:20}]}>*/}
              {/*    <Image source={require("../../assets/images/ambulance4.png")} style={styles.cardImage} />*/}
              {/*    <Text style={{ fontFamily:"Rubik_400Regular", fontSize: 14, textAlign:"left",*/}
              {/*        color:"black", marginTop: 5,}}>Deceased</Text>*/}
              {/*    <FontAwesome name="chevron-circle-right" size={30} style={{marginTop: 15}} />*/}
              {/*</View>*/}
            </View>
            {/*<View style={{marginTop: 30}}>*/}
            {/*  {contacts.length === 0 && <Text>Loading...</Text>}*/}
            {/*  /!*<FlatList data={contacts} renderItem={renderItem} keyExtractor={item => item.id} />*!/*/}
            {/*</View>*/}
            <View style={{flexDirection: "row", marginTop: 25, justifyContent: "center"}}>
              <TouchableOpacity style={{justifyContent: "center", alignItems: "center",
                backgroundColor: "#000000", alignSelf: "center", width: 300, height: 60,
                paddingHorizontal: 20, borderRadius: 20,}}>
                <Text style={{ fontSize: 18, textAlign:"center",
                  color:"#ffffff"}}>Need Ambulance Too?</Text>
              </TouchableOpacity>
              {/*<TouchableOpacity style={{justifyContent: "center", alignItems: "center",*/}
              {/*    backgroundColor: "#EC6461", alignSelf: "center", width: "50%", height: 70,*/}
              {/*paddingHorizontal: 20,}}>*/}
              {/*    <Text style={{ fontFamily:"Rubik_400Regular", fontSize: 15, textAlign:"center",*/}
              {/*        color:"#ffffff"}}>Order for Someone Else</Text>*/}
              {/*</TouchableOpacity>*/}
            </View>
          </View>
        </View>


    </View>
  );

}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontSize: 20
  },

  textContainer: {
    textAlign: "center"
  },
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  searchInputs:{
    marginTop: 15,
    marginBottom: 10,
  },
  cards: {
    width: 150,
    height: 200,
    backgroundColor: "#eeeeee",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: 250,
    height: 250,
    resizeMode: "stretch",
    alignItems: "center",
    justifyContent: "center"
  }

});
