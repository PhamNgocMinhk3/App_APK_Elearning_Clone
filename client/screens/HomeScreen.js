import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Mảng các mục menu với tên, biểu tượng, và màn hình tương ứng
const menus = [
    { name: 'Quản Lý Thông Tin', icon: 'information-circle', screen: 'StudentInfo', level: "0" },
    { name: 'Đăng ký khóa học', icon: 'clipboard', screen: 'CourseRegistration', level: "1" },
    { name: 'Thời khóa biểu', icon: 'calendar', screen: 'Schedule', level: "1" },
    { name: 'Học phí', icon: 'cash', screen: 'Tuition', level: "1" },
    { name: 'Điểm số', icon: 'stats-chart', screen: 'Grades', level: "1" },
    { name: 'Thông báo', icon: 'notifications', screen: 'Notifications', level: "0" },
    { name: 'Đơn xin phép', icon: 'document', screen: 'PermissionForm', level: "0" },
    { name: 'Góp ý', icon: 'chatbubble-ellipses', screen: 'Feedback', level: "0" },
    { name: 'Quản lý lớp (Giảng viên)', icon: 'school', screen: 'ClassManagement', level: "2" },
    { name: 'Nhập điểm', icon: 'create', screen: 'EnterGrades', level: "2" },
    { name: 'Lịch thi', icon: 'timer', screen: 'ExamSchedule', level: "1" },
    { name: 'Hóa đơn', icon: 'document-text', screen: 'Invoice', level: "0" },
    { name: 'Setup Lịch Thi', icon: 'settings', screen: 'SetupExamSchedule', level: "2" }
];

const HomeScreen = ({ navigation }) => {
    const [userLevel, setUserLevel] = useState(null);
    const [filteredMenus, setFilteredMenus] = useState([]);

    useEffect(() => {
        const checkTokens = async () => {
            try {
                const tokenAccess = await AsyncStorage.getItem('tokenAccess');
                const tokenRefresh = await AsyncStorage.getItem('tokenRefresh');
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;

                // Nếu không có token hoặc user, thông báo đăng nhập lại
                if (!tokenAccess || !tokenRefresh || !user) {
                    Alert.alert('Vui lòng đăng nhập lại');
                    navigation.navigate('Login');
                    return;
                }

                console.log('Checking tokens...');

                // Lấy cấp độ của người dùng
                setUserLevel(user.level);
                console.log(user.level);
                
                // Kiểm tra token
                const response = await fetch('http://192.168.1.9:5000/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tokenAccess, tokenRefresh, user: user._id }),
                });

                // Kiểm tra token hợp lệ
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Verification failed: ${errorData.message || 'Unknown error'}`);
                } else {
                    console.log('Tokens are valid');
                }
            } catch (error) {
                console.error('Error during token check:', error);
                Alert.alert('Có lỗi xảy ra:', error.message);
            }
        };

        // Kiểm tra token ngay khi màn hình mở
        checkTokens();
    }, [navigation]);

    useEffect(() => {
        // Lọc các mục menu dựa trên cấp độ người dùng
        if (userLevel !== null) {
            const filtered = menus.filter(item => {
                const itemLevel = parseInt(item.level);
                const userLevelInt = parseInt(userLevel);
                return (
                    (userLevelInt === 0) || // Hiển thị tất cả nếu cấp độ 0
                    (userLevelInt === 1 && itemLevel <= 1) || // Hiển thị 0 và 1 nếu cấp độ 1
                    (userLevelInt === 2 && (itemLevel === 0 || itemLevel === 2)) // Hiển thị 0 và 2 nếu cấp độ 2
                );
            });
            setFilteredMenus(filtered); // Cập nhật danh sách menu đã lọc
        }
    }, [userLevel]);

    // Hàm render mỗi item menu
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={30} color="#fff" />
            </View>
            <Text style={styles.menuText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredMenus} // Sử dụng danh sách đã lọc
                renderItem={renderItem}
                keyExtractor={(item) => item.screen}
                numColumns={3} // Số cột
                contentContainerStyle={styles.menuContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    menuContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItem: {
        width: 110, // Tăng chiều rộng của item
        margin: 5, // Giữ khoảng cách giữa các item
        alignItems: 'center',
        backgroundColor: '#2c7c87',
        borderRadius: 10,
        paddingVertical: 15, // Tăng khoảng cách trên dưới cho item
    },
    iconContainer: {
        backgroundColor: '#117a8b',
        padding: 15, // Tăng padding cho icon
        borderRadius: 50,
        marginBottom: 5, // Giảm khoảng cách dưới icon
    },
    menuText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 12, // Tăng kích thước font chữ
        fontWeight: '600',
    },
});

export default HomeScreen;
