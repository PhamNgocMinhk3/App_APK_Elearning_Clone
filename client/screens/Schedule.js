import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ScheduleScreen = () => {
    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    const timeSlots = Array.from({ length: 15 }, (_, index) => `Tiết ${index + 1}`);

    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [scheduleData, setScheduleData] = useState({});
    const [loading, setLoading] = useState(true);
    const [cachedSchedules, setCachedSchedules] = useState({});

    const processScheduleData = (data) => {
        const scheduleMatrix = {};
        days.forEach(day => {
            scheduleMatrix[day] = {};
            timeSlots.forEach(slot => {
                scheduleMatrix[day][slot] = '-'; // Initialize all slots with '-'
            });
        });

        data.forEach((item) => {
            const day = item.Thu; 
            const subject = item.tenmh; 
            const room = item.PhongHoc; 
            const slots = item.ThoiGianHoc;  
            slots.forEach((slot) => {
                scheduleMatrix[day][`Tiết ${slot}`] = `${subject} - ${room}`;  
            });
        });

        return scheduleMatrix;
    };

    const hasSubjects = (data) => {
        return Object.values(data).some(day => 
            Object.values(day).some(subject => subject !== '-') // Check if there's any subject
        );
    };

    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;
                const userId = user?._id;

                if (!userId) {
                    Alert.alert("Không thể tải dữ liệu", "Vui lòng đăng nhập lại");
                    return;
                }

                const weekKey = selectedWeek.toISOString().slice(0, 10); 

                // Clear cache when the selected week is a new week
                if (cachedSchedules[weekKey]) {
                    setScheduleData(cachedSchedules[weekKey]);
                    setLoading(false);
                    return;
                }

                const response = await fetch('http://192.168.1.9:5000/getSchedule', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userId }),
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                // console.log('Dữ liệu từ API:', data); 

                if (data.length > 0) {
                    const processedData = processScheduleData(data);
                    // console.log('Dữ liệu sau khi xử lý:', processedData);
                    setScheduleData(processedData);
                    setCachedSchedules(prev => ({ ...prev, [weekKey]: processedData }));

                    // Check if there are no subjects in the processed data
                    if (!hasSubjects(processedData)) {
                        Alert.alert('Thông báo', 'Không có lịch học cho tuần này');
                        setScheduleData(generateEmptySchedule());
                    }
                } else {
                    Alert.alert('Thông báo', 'Không có lịch học cho tuần này');
                    setScheduleData(generateEmptySchedule());
                }
            } catch (error) {
                Alert.alert('Error', 'Không thể tải dữ liệu');
                console.error(error);
                setScheduleData(generateEmptySchedule());
            } finally {
                setLoading(false);
            }
        };

        const generateEmptySchedule = () => {
            const emptySchedule = {};
            days.forEach(day => {
                emptySchedule[day] = {};
                timeSlots.forEach(slot => {
                    emptySchedule[day][slot] = '-';
                });
            });
            return emptySchedule;
        };

        fetchScheduleData();
    }, [selectedWeek]);

    const renderItem = ({ item }) => {
        const rowIndex = timeSlots.indexOf(item);
        const rowColor = rowIndex < 5 ? '#add8e6' : rowIndex < 10 ? '#ffffe0' : '#e6e6fa'; // Light blue, light yellow, and light purple

        return (
            <View style={styles.row}>
                {days.map((day) => (
                    <View key={day} style={[styles.cell, { backgroundColor: rowColor }]}>
                        <Text style={styles.cellText}>
                            {scheduleData[day]?.[item] === '-' ? '' : scheduleData[day]?.[item]}
                        </Text>
                    </View>
                ))}
            </View>
        );
    };

    const handleWeekChange = (direction) => {
        const newDate = new Date(selectedWeek);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setSelectedWeek(newDate);
    };

    return (
        <View style={styles.container}>
            <View style={styles.weekSelector}>
                <TouchableOpacity onPress={() => handleWeekChange('prev')} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color="#007BFF" />
                </TouchableOpacity>
                <Text style={styles.selectedWeekText}>
                    {`${selectedWeek.toLocaleDateString()} - ${new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}`}
                </Text>
                <TouchableOpacity onPress={() => handleWeekChange('next')} style={styles.iconButton}>
                    <Ionicons name="arrow-forward" size={24} color="#007BFF" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : hasSubjects(scheduleData) ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <FlatList
                            data={timeSlots}
                            keyExtractor={(item) => item}
                            renderItem={renderItem}
                            ListHeaderComponent={
                                <View style={styles.header}>
                                    {days.map((day) => (
                                        <View key={day} style={styles.cell}>
                                            <Text style={styles.headerText}>{day}</Text>
                                        </View>
                                    ))}
                                </View>
                            }
                            scrollEnabled={false}
                            style={styles.flatList}
                        />
                    </ScrollView>
                </ScrollView>
            ) : (
                <Text style={styles.noScheduleText}>Không có lịch học cho tuần này</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    weekSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    selectedWeekText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        width: '100%',
    },
    cell: {
        width: 150, // Set fixed width for columns
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 50, // Ensure minimum height
    },
    cellText: {
        fontSize: 14,
        textAlign: 'center', // Center text
    },
    header: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#007BFF',
    },
    headerText: {
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 10,
    },
    flatList: {
        marginBottom: 20,
    },
    iconButton: {
        padding: 10,
    },
    noScheduleText: {
        textAlign: 'center',
        fontSize: 16,
        color: 'red',
    },
});

export default ScheduleScreen;