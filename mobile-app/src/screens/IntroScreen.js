import React, { useState, useEffect, useRef, useContext } from "react";
import {
    StyleSheet,
    View,
    Image,
    ImageBackground,
    Text,
    Dimensions,
    Linking,
    Platform,
    Alert,
} from "react-native";
import MaterialButtonDark from "../components/MaterialButtonDark";
import * as Facebook from 'expo-facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from "expo-crypto";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from 'common/src';
import { colors } from "../common/theme";
import Constants from "expo-constants";
import RNPickerSelect from 'react-native-picker-select';
import i18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment/min/moment-with-locales';

export default function IntroScreen(props) {

    const { api } = useContext(FirebaseContext);
    const {
        facebookSignIn,
        appleSignIn,
        clearLoginError
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const { t } = i18n;
    const settings = useSelector(state => state.settingsdata.settings);
    const pageActive = useRef(false);
    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);
    const [isRTL,setIsRTL] = useState();

    useEffect(() => {
        AsyncStorage.getItem('lang', (err, result) => {
            if(result){
                const langLocale = JSON.parse(result)['langLocale']
                setIsRTL(langLocale == 'he' || langLocale == 'ar')
                setLangSelection(langLocale);
            }else{
                setIsRTL(i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0)
                setLangSelection(i18n.locale);
            }
        });
    }, []);

    useEffect(() => {
        if (auth.info && pageActive.current) {
            pageActive.current = false;
            props.navigation.navigate('AuthLoading');
        }
        if (auth.error && auth.error.msg && pageActive.current && auth.error.msg.message !== t('not_logged_in')) {
            pageActive.current = false;
            if (auth.error.msg.message === t('require_approval') || auth.error.msg.message === t('email_verify_message')) {
                setState({
                    ...state,
                    password: '',
                    phoneNumber: null,
                    verificationId: null,
                    verificationCode: null
                });
            }
            if (auth.error.msg.message === t('require_approval')){
                Alert.alert(t('alert'), t('require_approval'));
            } else if(auth.error.msg.message === t('email_verify_message')){
                Alert.alert(t('alert'), t('email_verify_message'));
            } else{
                Alert.alert(t('alert'), t('login_error'));
            }
            dispatch(clearLoginError());
        }
    }, [auth.info, auth.error]);

    const FbLogin = async () => {
        try {
            await Facebook.initializeAsync({ appId: Constants.manifest.facebookAppId });
            const {
                type,
                token
            } = await Facebook.logInWithReadPermissionsAsync({
                permissions: ['public_profile', "email"],
            });
            if (type === 'success') {
                pageActive.current = true;
                dispatch(facebookSignIn(token));
            }
            else {
                Alert.alert(t('alert'), t('facebook_login_auth_error'));
            }
        } catch ({ message }) {
            Alert.alert(t('alert'), t('facebook_login_auth_error') + ' ' + message);
        }
    }

    const AppleLogin = async () => {
        const csrf = Math.random().toString(36).substring(2, 15);
        const nonce = Math.random().toString(36).substring(2, 10);
        const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
        try {
            const applelogincredentials = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                state: csrf,
                nonce: hashedNonce
            });

            pageActive.current = true;
            dispatch(appleSignIn({
                idToken: applelogincredentials.identityToken,
                rawNonce: nonce,
            }));

        } catch (error) {
            if (error.code === 'ERR_CANCELED') {
                console.log(error);
            } else {
                Alert.alert(t('alert'), t('apple_signin_error'));
            }
        }
    }

    const onPressLoginEmail = async () => {
        pageActive.current = false;
        props.navigation.navigate("Login");
    }

    const onPressRegister = async () => {
        pageActive.current = false;
        props.navigation.navigate("Register");
    }


    const openTerms = async () => {
        Linking.openURL(settings.CompanyTerms).catch(err => console.error("Couldn't load page", err));
    }


    return (
        <ImageBackground
            source={require('../../assets/images/bg.jpg')}
            resizeMode="stretch"
            style={styles.imagebg}
        >
            <View style={styles.topSpace}></View>
            <View style={[styles.headLanuage,[isRTL?{left:10}:{right: 10}]]}>
                <Text style={{ color: colors.BLACK, marginLeft: 3 }}>Lang:</Text>
                {langSelection && languagedata && languagedata.langlist ?
                    <RNPickerSelect
                        placeholder={{}}
                        value={langSelection}
                        useNativeAndroidPickerStyle={true}
                        style={{
                            inputIOS: styles.pickerStyle,
                            inputAndroid: styles.pickerStyle,
                            placeholder: {
                                color: 'white'
                            },

                        }}
                        onValueChange={
                            (text) => {
                                let defl = null;
                                for (const value of Object.values(languagedata.langlist)) {
                                   if(value.langLocale == text){
                                      defl = value;
                                   }
                                }
                                setLangSelection(text);
                                i18n.locale = text;
                                moment.locale(defl.dateLocale);
                                setIsRTL(text == 'he' || text == 'ar')
                                AsyncStorage.setItem('lang', JSON.stringify({langLocale:text,dateLocale:defl.dateLocale }));
                            }
                        }
                        label={"Language"}
                        items={Object.values(languagedata.langlist).map(function (value) { return { label: value.langName, value: value.langLocale }; })}
                        Icon={() => { return <Ionicons style={{ marginTop: 2 }} name="md-arrow-down" size={20} color="gray" />; }}
                    />
                    : null}
            </View>
            <MaterialButtonDark
                onPress={onPressLoginEmail}
                style={styles.materialButtonDark}
            >{t('login')}</MaterialButtonDark>
            {/*{settings && settings.MobileLoginEnabled ?*/}
                <MaterialButtonDark
                    onPress={onPressRegister}
                    style={styles.materialButtonDark2}
                >{t('register')}</MaterialButtonDark>
                {/*: null}*/}
            {(Platform.OS == 'ios' && settings && settings.AppleLoginEnabled) || (settings && settings.FacebookLoginEnabled) ?
                <View style={styles.seperator}>
                    <View style={styles.lineLeft}></View>
                    <View style={styles.lineLeftFiller}>
                        <Text style={styles.sepText}>{t('spacer_message')}</Text>
                    </View>
                    <View style={styles.lineRight}></View>
                </View>
                : null}

            {(Platform.OS == 'ios' && settings && settings.AppleLoginEnabled) || (settings && settings.FacebookLoginEnabled) ?
                <View style={styles.socialBar}>
                    {settings && settings.FacebookLoginEnabled ?
                        <TouchableOpacity style={styles.socialIcon} onPress={FbLogin}>
                            <Image
                                source={require("../../assets/images/image_fb.png")}
                                resizeMode="contain"
                                style={styles.socialIconImage}
                            ></Image>
                        </TouchableOpacity>
                        : null}
                    {Platform.OS == 'ios' && settings.AppleLoginEnabled ?
                        <TouchableOpacity style={styles.socialIcon} onPress={AppleLogin}>
                            <Image
                                source={require("../../assets/images/image_apple.png")}
                                resizeMode="contain"
                                style={styles.socialIconImage}
                            ></Image>
                        </TouchableOpacity>
                        : null}
                </View>
                : null}
            <View>
                <TouchableOpacity style={styles.terms} onPress={openTerms}>
                    <Text style={styles.actionText}>{t('terms')}</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    imagebg: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: Dimensions.get('window').width,
        height: '100%',
    },
    topSpace: {
        marginTop: 0,
        marginLeft: 0,
        marginRight: 0,
        height: Dimensions.get('window').height * 0.56,
        width: Dimensions.get('window').width
    },
    materialButtonDark: {
        height: 40,
        marginTop: 20,
        marginLeft: 35,
        marginRight: 35,
        backgroundColor: colors.BUTTON,
    },
    materialButtonDark2: {
        height: 40,
        marginTop: 14,
        marginLeft: 35,
        marginRight: 35,
        backgroundColor: colors.BUTTON,
    },
    actionLine: {
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    actionItem: {
        height: 20,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    actionText: {
        fontSize: 15,
        fontFamily: "Roboto-Regular",
        fontWeight: 'bold'
    },
    seperator: {
        width: 250,
        height: 20,
        flexDirection: "row",
        marginTop: 20,
        alignSelf: 'center'
    },
    lineLeft: {
        width: 40,
        height: 1,
        backgroundColor: "rgba(113,113,113,1)",
        marginTop: 9
    },
    sepText: {
        color: colors.BLACK,
        fontSize: 16,
        fontFamily: "Roboto-Regular"
    },
    lineLeftFiller: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center"
    },
    lineRight: {
        width: 40,
        height: 1,
        backgroundColor: "rgba(113,113,113,1)",
        marginTop: 9
    },
    socialBar: {
        height: 40,
        flexDirection: "row",
        marginTop: 15,
        alignSelf: 'center'
    },
    socialIcon: {
        width: 40,
        height: 40,
        marginLeft: 15,
        marginRight: 15,
        alignSelf: "center"
    },
    socialIconImage: {
        width: 40,
        height: 40
    },
    terms: {
        marginTop: 18,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: "center",
        opacity: .54
    },
    pickerStyle: {
        color: colors.BLACK,
        width: 50,
        fontSize: 20,
        height: 30,
        marginLeft: 3,
        fontWeight: 'bold',
        alignContent: 'center',
        justifyContent: 'center',
        marginLeft: Platform.OS == 'ios'? 0 : -5,
    },
    headLanuage:{
        position: 'absolute',
        top: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.3,
        borderRadius: 20,
        padding: 3,
    }
});
