import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker'; // Ensure correct import

const PermissionFormScreen = ({ navigation }) => {
    const [hinhThucDon, setHinhThucDon] = useState('Đơn xin nghỉ học');
    const [noiDungDon, setNoiDungDon] = useState('');

    const submitForm = async () => {
        const userJson = await AsyncStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;

        if (!user || !noiDungDon) {
            Alert.alert('Error', 'Vui lòng điền đầy đủ thông tin!');
            return;
        }

        try {
            const response = await fetch('http://192.168.1.9:5000/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    maSV: user._id,
                    tenSV: user.name,
                    email: user.email,
                    hinhThucDon,
                    noiDungDon,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json(); // Optionally process the response data

            Alert.alert('Success', 'Đơn của bạn đã được gửi.');
            navigation.goBack();
        } catch (error) {
            console.error('Error creating form:', error);
            Alert.alert('Error', 'Có lỗi xảy ra khi gửi đơn.');
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text>Chọn Hình Thức Đơn:</Text>
            <Picker
                selectedValue={hinhThucDon}
                onValueChange={(itemValue) => setHinhThucDon(itemValue)}
            >
                <Picker.Item label="Đơn xin nghỉ học" value="Đơn xin nghỉ học" />
                <Picker.Item label="Đơn xin học bổng" value="Đơn xin học bổng" />
                <Picker.Item label="Đơn xin chứng nhận sinh viên ở trường" value="Đơn xin chứng nhận sinh viên ở trường" />
                <Picker.Item label="Đơn xin chuyển ngành" value="Đơn xin chuyển ngành" />
                <Picker.Item label="Đơn xin thực tập doanh nghiệp" value="Đơn xin thực tập doanh nghiệp" />
            </Picker>

            <Text>Nội Dung Đơn:</Text>
            <TextInput
                value={noiDungDon}
                onChangeText={setNoiDungDon}
                placeholder="Nhập nội dung đơn..."
                style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, height: 100 }}
                multiline
            />

            <Button title="Gửi Đơn" onPress={submitForm} />
        </View>
    );
};

export default PermissionFormScreen;
