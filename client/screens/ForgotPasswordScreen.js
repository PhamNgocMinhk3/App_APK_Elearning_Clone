import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

const passwordResetSchema = Yup.object().shape({
  email: Yup.string().email('Email không hợp lệ').required('Email là bắt buộc'),
});
export const ForgotPasswordScreen = ({ navigation }) => {
  const [errorState, setErrorState] = useState('');
  const handleSendPasswordResetEmail = async (values) => {
    const { email } = values;
    const API_URL = 'http://192.168.1.9:5000/api/auth/forgot-password'; 
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.error) {
        setErrorState(data.error);
        Alert.alert('Lỗi', data.error);
      } else {
        Alert.alert('Thành công', 'Email đặt lại mật khẩu đã được gửi.');
        navigation.navigate('Login'); // Điều hướng về màn hình Đăng nhập
      }
    } catch (error) {
      setErrorState('Đã xảy ra lỗi trong quá trình gửi email');
      Alert.alert('Lỗi', 'Đã xảy ra lỗi trong quá trình gửi email');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Quên mật khẩu</Text>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={passwordResetSchema}
        onSubmit={handleSendPasswordResetEmail}
      >
        {({ values, touched, errors, handleChange, handleSubmit, handleBlur }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder='Nhập email'
              autoCapitalize='none'
              keyboardType='email-address'
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            {errorState !== '' && <Text style={styles.errorText}>{errorState}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Gửi email đặt lại mật khẩu</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
      <TouchableOpacity
        style={[styles.button, styles.backButton]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Quay lại Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#ff7f50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#555',
    marginTop: 15,
  },
});

export default ForgotPasswordScreen;
