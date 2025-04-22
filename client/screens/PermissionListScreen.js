import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PermissionListScreen = ({ navigation }) => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);
    const [userlevel, setUserlevel] = useState(null);

    // Fake data to display when forms are null or empty
    const fakeForms = [
        {
            _id: '1',
            hinhThucDon: 'Xin Phép Nghỉ Học',
            noiDungDon: 'Tôi xin phép nghỉ học vì lý do sức khỏe.',
            ngayLapDon: new Date().toISOString(),
            status: "0", // Chờ xét duyệt
        },
        {
            _id: '2',
            hinhThucDon: 'Xin phép chứng nhận học sinh',
            noiDungDon: 'Tôi xin phép chứng nhận để nộp nghĩa vụ quân sự.',
            ngayLapDon: new Date().toISOString(),
            status: "1", // Đã phê duyệt
        },
        {
            _id: '3',
            hinhThucDon: 'Xin Phép Cấp Học Bổng',
            noiDungDon: 'Tôi xin phép cấp học bổng.',
            ngayLapDon: new Date().toISOString(),
            status: "0", // Chờ xét duyệt
        },
    ];

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                if (!userJson) {
                    setError('User not found');
                    return;
                }

                const user = JSON.parse(userJson);
                setUserlevel(user.level)
                if (!user || !user._id) {
                    setError('Invalid user data');
                    return;
                }

                setUserId(user._id);
            } catch (error) {
                setError('Error fetching user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchForms = async () => {
            if (userId) {
                try {
                    const response = await fetch(`http://192.168.1.9:5000/student/${userId}`);
                    const data = await response.json();

                    if (data.success && Array.isArray(data.forms)) {
                        setForms(data.forms);
                    } else {
                        setError('No forms found for this user');
                    }
                } catch (error) {
                    setError('Error fetching forms');
                }
            }
        };

        fetchForms();
    }, [userId]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    const getStatusInfo = (status) => {
        switch (status) {
            case "1":
                return { text: 'Đã phê duyệt', color: 'green' }; // Đã phê duyệt
            case "2":
                return { text: 'Đã từ chối', color: 'red' }; // Từ chối
            default:
                return { text: 'Đang chờ xét duyệt', color: '#00ebc7' }; // Đang chờ
        }
    };

    const handleViewDetails = (item) => {
        navigation.navigate('PermissionDetails', { form: item });
    };

    const handleDeleteForm = async (item) => {
        try {
            const response = await fetch(`http://192.168.1.9:5000/delete/${item._id}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                setForms((prevForms) => prevForms.filter((form) => form._id !== item._id));
            } else {
                setError('Failed to delete the form');
            }
        } catch (error) {
            setError('Error deleting the form');
        }
    };

    const handleApproveForm = async (item) => {
        const newStatus = "1"; // Assuming '2' is for approved
        try {
            console.log("id and status :",item._id,newStatus);
            
            const response = await fetch(`http://192.168.1.9:5000/approve/${item._id}/${newStatus}`, { method: 'PUT' });
            const data = await response.json();
    
            if (data.success) {
                setForms((prevForms) => prevForms.map((form) => (form._id === item._id ? { ...form, status: newStatus } : form)));
            } else {
                setError('Failed to approve the form');
            }
        } catch (error) {
            console.error('Error approving form:', error);
            setError('Error approving the form');
        }
    };
    
    const handleRejectForm = async (item) => {
        const newStatus = "2"; // Assuming '1' is for rejected
        try {
            const response = await fetch(`http://192.168.1.9:5000/approve/${item._id}/${newStatus}`, { method: 'PUT' });
            const data = await response.json();
    
            if (data.success) {
                setForms((prevForms) => prevForms.map((form) => (form._id === item._id ? { ...form, status: newStatus } : form)));
            } else {
                setError('Failed to reject the form');
            }
        } catch (error) {
            console.error('Error rejecting form:', error);
            setError('Error rejecting the form');
        }
    };
    

    const renderItem = ({ item }) => {
        const { text, color } = getStatusInfo(item.status);
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.itemText}>Hình Thức: {item.hinhThucDon || 'Không có dữ liệu'}</Text>
                <Text style={styles.itemText}>Nội Dung: {item.noiDungDon || 'Không có dữ liệu'}</Text>
                <Text style={styles.itemText}>
                    Ngày Lập: {item.ngayLapDon ? new Date(item.ngayLapDon).toLocaleDateString() : 'Không có dữ liệu'}
                </Text>
                <Text style={{ color }}>{text}</Text>
                <View style={styles.buttonContainer}>
                    {/* Kiểm tra nếu maSV của đơn trùng với userId, nếu đúng thì hiển thị nút xóa */}
                    {item.maSV === userId && (
                        <Button title="Xóa" onPress={() => handleDeleteForm(item)} color="red" />
                    )}
                    {userlevel == "2" && ( // Chỉ hiển thị nút Phê Duyệt và Từ Chối khi trạng thái là "Đang chờ xét duyệt"
                        <>
                            <Button title="Phê Duyệt" onPress={() => handleApproveForm(item)} color="green" />
                            <Button title="Từ Chối" onPress={() => handleRejectForm(item)} color="orange" />
                        </>
                    )}
                </View>
            </View>
        );
    };
    

    return (
        <View style={styles.container}>
            <Button title="Tạo Đơn Xin Phép" onPress={() => navigation.navigate('PermissionAdd')} />
            <Text style={styles.title}>Danh sách đơn đã tạo:</Text>

            <FlatList
                data={forms.length === 0 ? fakeForms : forms}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        marginVertical: 20,
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    itemText: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
    },
});

export default PermissionListScreen;
