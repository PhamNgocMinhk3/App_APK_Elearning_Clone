import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator, TouchableOpacity,Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const EnterGrades = () => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]); // Lưu trữ danh sách lớp
    const navigation = useNavigation(); // Sử dụng hook navigation

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;
                const userId = user ? user._id : null;
                console.log("id user điểm", userId);

                // Gửi yêu cầu đến server để lấy lịch học
                const response = await fetch('http://192.168.1.9:5000/getSchedule/teacher', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setClasses(data || []); // Lưu trữ lớp vào state
                    console.log("Data All 1", data); // Hiển thị dữ liệu nhận được
                } else {
                    const errorData = await response.json();
                    Alert.alert('Error', errorData.message);
                }
            } catch (error) {
                Alert.alert('Error', 'Có lỗi xảy ra khi lấy dữ liệu lớp.');
            } finally {
                setLoading(false);
            }
        };

        fetchClasses(); // Gọi hàm fetchClasses để lấy dữ liệu lớp
    }, []);

    // Hiển thị loading khi đang lấy dữ liệu
    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    // Hàm render cho từng item trong FlatList
    const renderItem = ({ item }) => (
        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.tenmh}</Text>
            <Text>Thứ: {item.Thu}</Text>
            <Text>Buổi học: {item.BuoiHoc}</Text>
            <Button 
            title="Xem Chấm Điểm"
            onPress={() => navigation.navigate('GradesScreen', { classId: item.Malop })} // Điều hướng đến màn hình chấm điểm
            />
        </View>
    );

    return (
        <View style={{ padding: 20 }}>
            <FlatList
                data={classes}
                renderItem={renderItem}
                keyExtractor={(item) => item.Malop} 
            />
        </View>
    );
};

export default EnterGrades;
