import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, Alert, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const StudentInfoScreen = () => {
    const [userData, setUserData] = useState({
        email: '',
        name: '',
        dateOfBirth: '',
        phoneNumber: '',
        atmNumber: '',
        description: '',
        level: 1,
        diemTrungBinh: '',
        avatar: '', // URL của ảnh người dùng
        residence: '',
        cccd: '',
        major: '',
        systemAffiliation: ''
    });

    const [userId, setUserId] = useState(null);
    const demoAvatar = 'https://example.com/demo-avatar.png'; 

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;
                const idusercantim = user?._id;

                if (user) {
                    setUserId(user._id);
                    const response = await fetch(`http://192.168.1.9:5000/profile/${idusercantim}`);
                    const data = await response.json();

                    // Định dạng lại ngày sinh trước khi lưu vào state
                    if (data.dateOfBirth) {
                        const formattedDate = new Date(data.dateOfBirth).toISOString().split('T')[0]; // Chỉ lấy phần ngày
                        data.dateOfBirth = formattedDate; // Lưu ngày đã định dạng vào state
                    }

                    setUserData(data);
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch user data');
            }
        };

        fetchUserData();
    }, []);


    // Hàm để cập nhật thông tin người dùng
    const handleUpdate = async () => {
        try {
            if (!userId) {
                Alert.alert('Error', 'User ID is not available');
                return;
            }

            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('dateOfBirth', userData.dateOfBirth);
            formData.append('phoneNumber', userData.phoneNumber);
            formData.append('atmNumber', userData.atmNumber);
            formData.append('description', userData.description);
            formData.append('level', userData.level);
            formData.append('residence', userData.residence);
            formData.append('cccd', userData.cccd);
            formData.append('major', userData.major);
            formData.append('systemAffiliation', userData.systemAffiliation);

            if (userData.avatar) {
                const fileName = userData.avatar.split('/').pop(); // Lấy tên file từ đường dẫn URI
                formData.append('avatar', fileName); // Chỉ đính kèm tên file
            }
            
            
            console.log("data upload",formData);
            console.log("data id user",userId);

            
            const response = await fetch(`http://192.168.1.9:5000/profile/${userId}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                const updatedData = await response.json();
                const storedUserData = await AsyncStorage.getItem('user');
                const mergedData = { ...JSON.parse(storedUserData), ...updatedData };

                await AsyncStorage.setItem('user', JSON.stringify(mergedData));
                Alert.alert('Success', 'User information updated successfully');
                setUserData(mergedData);
            } else {
                Alert.alert('Error', 'Failed to update user information');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to update user information');
        }
    };

    // Hàm để chọn ảnh từ thư viện
    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log('ImagePicker Result:', result); // Log kết quả trả về từ ImagePicker

        if (result.canceled) {
            console.log('Image selection was canceled.'); // Log nếu người dùng hủy chọn
            return;
        }

        const uri = result.assets[0]?.uri;
        if (uri) {
            console.log('Selected Image URI:', uri); // Log URI của ảnh đã chọn
            setUserData((prevData) => ({ ...prevData, avatar: uri }));
        } else {
            console.log('Error', 'Failed to get the image URI');
        }
    };

    const userFields = [
        { label: 'Email', key: 'email', editable: true },
        { label: 'Tên', key: 'name', editable: true },
        { label: 'Ngày sinh', key: 'dateOfBirth', editable: true, placeholder: 'YYYY-MM-DD' },
        { label: 'Số điện thoại', key: 'phoneNumber', editable: true },
        { label: 'Số tài khoản BIDV', key: 'atmNumber', editable: true },
        { label: 'Mô tả bản thân', key: 'description', editable: true },
        { label: 'Nơi cư trú', key: 'residence', editable: true },
        { label: 'CCCD', key: 'cccd', editable: true },
        { label: 'Chuyên Ngành', key: 'major', editable: true },
        { label: 'Thuộc Hệ', key: 'systemAffiliation', editable: true },
    ];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.label}>Avatar:</Text>
                <Button title="Upload Avatar" onPress={handleImagePick} />
                <Image
                    source={{
                        uri: userData.avatar
                            ? (userData.avatar.startsWith('http') ? userData.avatar : `http://192.168.1.9:5000/${userData.avatar.replace(/\\/g, '/')}`)
                            : demoAvatar // Hiển thị ảnh demo nếu không có ảnh người dùng
                    }}
                    style={styles.avatar}
                    onError={() => Alert.alert('Error', 'Failed to load avatar image')}
                />
                
                {userFields.map((field) => (
                    <View key={field.key} style={styles.inputContainer}>
                        <Text style={styles.label}>{field.label}:</Text>
                        <TextInput
                            value={field.key === 'dateOfBirth' ? userData.dateOfBirth : userData[field.key]?.toString() || ''}
                            onChangeText={(text) => {
                                setUserData((prevData) => ({ ...prevData, [field.key]: text }));
                            }}
                            style={styles.input}
                            editable={field.editable}
                            placeholder={field.placeholder}
                            keyboardType={field.key === 'dateOfBirth' ? 'numeric' : 'default'} // Chỉ cho phép nhập số cho ngày sinh
                        />
                    </View>
                ))}
                <Text style={styles.roleLabel}>Vai Trò : {userData.level === 1 ? 'Học Sinh' : 'Giảng Viên'}</Text>
                <Button title="Update" onPress={handleUpdate} color="#6200EA" />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EAEAEA',
        padding: 20,
    },
    scrollContainer: {
        width: '100%',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginVertical: 10,
    },
    inputContainer: {
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 10,
        elevation: 3,
        width: '100%',
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f8f8f8',
    },
    roleLabel: {
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#333',
    },
});

export default StudentInfoScreen;
