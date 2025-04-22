import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GradesScreen = () => {
    const [grades, setGrades] = useState([]);
    const [userId, setUserId] = useState(null);
    const [averageGrade, setAverageGrade] = useState(0); // Khai báo state cho điểm trung bình

    useEffect(() => {
        const fetchUserId = async () => {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            const userId = user ? user._id : null;
            setUserId(userId);
        };

        fetchUserId();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchGrades();
        }
    }, [userId]);

    const fetchGrades = async () => {
        try {
            const response = await fetch('http://192.168.1.9:5000/getStudentGradesPoints', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();
            setGrades(data);

            // Tính và cập nhật điểm trung bình
            calculateAverage(data); 
        } catch (error) {
            console.error("Error fetching grades:", error);
        }
    };

    const calculateAverage = (grades) => {
        const totalGrades = grades.reduce((acc, item) => {
            const diem7 = item.Diem?.Diem7 || 0; // Lấy điểm tổng kết
            return acc + diem7; // Cộng điểm 7 vào tổng
        }, 0);
        
        const average = grades.length > 0 ? (totalGrades / grades.length).toFixed(2) : 0; // Tính trung bình
        setAverageGrade(average); // Cập nhật state với điểm trung bình
    };

    const getGradeClassification = (diem7) => {
        if (diem7 < 5) return "C-";
        if (diem7 === 5) return "C";
        if (diem7 < 7) return "B";
        if (diem7 < 8) return "B+";
        if (diem7 === 8) return "A";
        if (diem7 > 8 && diem7 <= 10) return "A+";
        return "N/A";
    };

    if (!grades || grades.length === 0) {
        return <Text>Loading...</Text>;
    }

    const renderGradeItem = ({ item }) => {
        const diem = item.Diem || {}; // Extract grades object, default to empty object

        return (
            <View style={styles.row}>
                <Text style={styles.cell}>{item.TenMH}</Text>
                <Text style={styles.cell}>{diem.Diem5 !== undefined ? diem.Diem5 : 0}</Text>
                <Text style={styles.cell}>{diem.Diem6 !== undefined ? diem.Diem6 : 0}</Text>
                <Text style={styles.cell}>{diem.Diem7 !== undefined ? diem.Diem7 : 0} </Text>
                <Text style={styles.cell}>{getGradeClassification(diem.Diem7 || 0)}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bảng điểm của sinh viên</Text>
            <View style={styles.table}>
                <View style={styles.header}>
                    <Text style={styles.headerCell}>Môn học</Text>
                    <Text style={styles.headerCell}>Giữa Kỳ</Text>
                    <Text style={styles.headerCell}>Cuối Kỳ</Text>
                    <Text style={styles.headerCell}>Tổng Kết</Text>
                    <Text style={styles.headerCell}>Xếp Loại</Text>
                </View>
                <FlatList
                    data={grades}
                    renderItem={renderGradeItem}
                    keyExtractor={(item) => item.TenMH}
                />
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>Điểm trung bình học kỳ hệ 10: {averageGrade}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    table: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        padding: 10,
    },
    headerCell: {
        flex: 1,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        padding: 10,
    },
    cell: {
        flex: 1,
        textAlign: 'center',
    },
    footer: {
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    footerText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default GradesScreen;
