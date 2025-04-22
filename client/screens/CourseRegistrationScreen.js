import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CourseRegistrationScreen = () => {
    const [availableClasses, setAvailableClasses] = useState([]);
    const [registeredClasses, setRegisteredClasses] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchInstructors = async () => {
        try {
            const response = await fetch('http://192.168.1.9:5000/api/instructors');
            if (!response.ok) throw new Error('Không thể lấy dữ liệu giảng viên');
            const instructorsData = await response.json();
            setInstructors(instructorsData);
        } catch (error) {
            console.error('Error fetching instructors:', error);
            Alert.alert('Lỗi', 'Không thể lấy danh sách giảng viên.');
        }
    };

    const fetchAvailableClasses = async () => {
        try {
            const response = await fetch('http://192.168.1.9:5000/classes');
            if (!response.ok) throw new Error('Không thể lấy dữ liệu lớp học');
            const classes = await response.json();
            setAvailableClasses(classes);
        } catch (error) {
            console.error('Error fetching classes:', error);
            Alert.alert('Lỗi', 'Không thể lấy lớp học khả dụng.');
        }
    };

    const getUserId = async () => {
        try {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            setUserId(user ? user._id : null);
        } catch (error) {
            console.error('Error getting user ID:', error);
        }
    };

    const fetchRegisteredClassesFromAPI = async () => {
        try {
            const response = await fetch(`http://192.168.1.9:5000/student/${userId}/classes`);
            if (!response.ok) throw new Error('Không thể tải lớp đã đăng ký');
            const classes = await response.json();
            setRegisteredClasses(classes);
        } catch (error) {
            console.error('Error fetching registered classes:', error);
            Alert.alert('Lỗi', 'Không thể tải lớp đã đăng ký.');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchInstructors(), fetchAvailableClasses(), getUserId()]);
            if (userId) {
                await fetchRegisteredClassesFromAPI(); // Tải lớp đã đăng ký từ API
            }
            setLoading(false);
        };

        loadData();
    }, [userId]);

    const getInstructorName = (instructorId) => {
        const instructor = instructors.find((inst) => inst._id === instructorId);
        return instructor ? instructor.name : 'Không xác định';
    };

    const checkScheduleConflict = (classItem) => {
        return registeredClasses.some((registeredClass) => {
            return (
                registeredClass.BuoiHoc === classItem.BuoiHoc &&
                registeredClass.Thu === classItem.Thu &&
                registeredClass.ThoiGianHoc.some(time => classItem.ThoiGianHoc.includes(time))
            );
        });
    };

    const handleRegisterClass = async (classItem) => {
        const alreadyRegistered = registeredClasses.some((cls) => cls._id === classItem._id);
        if (alreadyRegistered) {
            Alert.alert('Thông Báo', 'Bạn đã đăng ký lớp này rồi.');
            return;
        }

        if (checkScheduleConflict(classItem)) {
            Alert.alert('Thông Báo', 'Bạn không thể đăng ký lớp này vì đã trùng thời gian.');
            return;
        }

        try {
            const response = await fetch(`http://192.168.1.9:5000/${classItem._id}/register`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Không thể đăng ký lớp học');

            const updatedClasses = [...registeredClasses, classItem];
            setRegisteredClasses(updatedClasses);
            Alert.alert('Thành Công', `Bạn đã đăng ký lớp ${classItem.TenMH}`);
        } catch (error) {
            console.error('Error registering class:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng ký lớp.');
        }
    };

    const handleRemoveClass = async (classItem) => {
        try {
            const response = await fetch(`http://192.168.1.9:5000/${classItem._id}/remove`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) throw new Error('Không thể xóa lớp học');

            const updatedClasses = registeredClasses.filter((cls) => cls._id !== classItem._id);
            setRegisteredClasses(updatedClasses);
            Alert.alert('Thông Báo', `Bạn đã xóa lớp ${classItem.TenMH} khỏi danh sách đăng ký.`);
        } catch (error) {
            console.error('Error removing class:', error);
            Alert.alert('Lỗi', 'Có lỗi xảy ra khi xóa lớp.');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng Ký Lớp Học</Text>
            <FlatList
                data={availableClasses}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.classItem}>
                        <Text style={styles.classTitle}>{item.TenMH}</Text>
                        <Text>Mã Ngành: {item.MaNganh}</Text>
                        <Text>Sĩ Số Lớp: {item.SiSoLop}</Text>
                        <Text>Số Tiết Học: {item.SoTietHoc}</Text>
                        <Text>Buổi học: {item.BuoiHoc}</Text>
                        <Text>Thứ: {item.Thu}</Text>
                        <Text>Tiết: {item.ThoiGianHoc.join(', ')}</Text>
                        <Text>Học phí: {item.GiaTien.toLocaleString()} VNĐ</Text>
                        <Text>Giảng viên: {getInstructorName(item.MaGV)}</Text>
                        <Button title="Đăng Ký" onPress={() => handleRegisterClass(item)} />
                    </View>
                )}
                ListEmptyComponent={<Text>Không có lớp học khả dụng.</Text>}
            />
            <View style={styles.registeredSection}>
                <Text style={styles.subTitle}>Lớp Đã Đăng Ký:</Text>
                {registeredClasses.length === 0 ? (
                    <Text>Chưa có lớp nào được đăng ký.</Text>
                ) : (
                    <FlatList
                        data={registeredClasses}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={styles.registeredItem}>
                                <Text style={styles.registeredClassTitle}>{item.TenMH}</Text>
                                <Button title="Xóa" onPress={() => handleRemoveClass(item)} />
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    classItem: {
        padding: 15,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
    registeredSection: {
        marginTop: 20,
    },
    registeredItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    classTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    registeredClassTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CourseRegistrationScreen;
