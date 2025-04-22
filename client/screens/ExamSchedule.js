import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExamSchedule = () => {
    const [examData, setExamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState(null); // Thêm state để lưu ID sinh viên

    useEffect(() => {
        const fetchStudentId = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;
                const id = user._id;
                setStudentId(id); // Lưu ID vào state
                fetchExamSchedule(id); // Gọi hàm lấy lịch thi với ID sinh viên
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Could not fetch student ID.');
                setLoading(false);
            }
        };

        fetchStudentId();
    }, []);

    const fetchExamSchedule = async (id) => {
        if (!id) return; // Nếu không có ID thì không làm gì cả

        try {
            const response = await fetch(`http://192.168.1.9:5000/exam-schedule/${id}`); // Gọi API với ID sinh viên
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setExamData(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not fetch exam schedule. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.TenMH}</Text>
            <Text style={styles.cell}>{new Date(item.LichThi).toLocaleDateString()}</Text>
            <Text style={styles.cell}>{item.PhongThi}</Text>
            <Text style={styles.cell}>{item.GioBatDau}</Text>
            <Text style={styles.cell}>{item.Phut}</Text>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerCell}>Môn Học</Text>
                <Text style={styles.headerCell}>Lịch Thi</Text>
                <Text style={styles.headerCell}>Phòng Thi</Text>
                <Text style={styles.headerCell}>Giờ Bắt Đầu</Text>
                <Text style={styles.headerCell}>Phút</Text>
            </View>
            <FlatList
                data={examData}
                renderItem={renderItem}
                keyExtractor={(item) => item.TenMH}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        paddingVertical: 8, // Giảm padding vertical
        borderRadius: 8,
        marginBottom: 10,
    },
    headerCell: {
        flex: 1,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        paddingVertical: 5, // Giảm padding vertical
        fontSize: 14, // Giảm kích thước chữ
    },
    row: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 5,
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        paddingVertical: 8, // Giảm padding vertical
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 14, // Giảm kích thước chữ
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ExamSchedule;
