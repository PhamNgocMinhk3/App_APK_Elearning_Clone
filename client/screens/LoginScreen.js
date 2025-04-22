import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as Yup from 'yup';

const LoginScreen = ({ navigation }) => {
    const [errorState, setErrorState] = useState('');

    const handleLogin = async (values) => {
        const { email, password } = values;
        const API_URL = 'http://192.168.1.9:5000/api/auth/send-otp';
        try {
            await clearStorage();
            
            // Step 1: Send the OTP request
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }), 
            });
            const data = await response.json();
            
            if (data.error) {
                setErrorState(data.error);
                Alert.alert('Lỗi', data.error);
            } else {
                Alert.alert('OTP Sent', 'OTP đã được gửi về email của bạn.');
                navigation.navigate('OtpVerification', { email, password }); // Navigate to OTP Verification screen
            }
        } catch (error) {
            console.error('Lỗi gửi OTP:', error);
            setErrorState('Đã xảy ra lỗi trong quá trình gửi OTP');
            Alert.alert('Lỗi', 'Đã xảy ra lỗi trong quá trình gửi OTP');
        }
    };

    const clearStorage = async () => {
        try {
            await AsyncStorage.removeItem('tokenAccess');
            await AsyncStorage.removeItem('tokenRefresh');
            await AsyncStorage.removeItem('user');
        } catch (error) {
            console.error('Lỗi khi xóa AsyncStorage:', error);
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Chào mừng bạn trở lại!</Text>
            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={Yup.object().shape({
                    email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
                    password: Yup.string().required('Mật khẩu là bắt buộc'),
                })}
                onSubmit={handleLogin}
            >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập email"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                        />
                        {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mật khẩu"
                            secureTextEntry
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                        />
                        {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        {errorState !== '' && <Text style={styles.errorText}>{errorState}</Text>}
                        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
                            <Text style={styles.buttonText}>Đăng nhập</Text>
                        </TouchableOpacity>
                    </>
                )}
            </Formik>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.linkText}>Tạo tài khoản mới</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.linkText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    screenTitle: { fontSize: 32, marginBottom: 20 },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#ff8c00',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: { color: '#fff', fontSize: 16 },
    errorText: { color: 'red', fontSize: 12 },
    linkText: { color: '#007bff', marginTop: 20, textAlign: 'center' },
    socialLoginContainer: { 
        marginTop: 30,
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
    },
    socialButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        flex: 1,
    },
    socialIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
});

export default LoginScreen;
