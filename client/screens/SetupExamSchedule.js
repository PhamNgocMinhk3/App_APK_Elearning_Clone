import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator, TouchableOpacity, Modal, TextInput, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SetupExamSchedule = () => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]); 
    const [selectedClass, setSelectedClass] = useState(null); 
    const [modalVisible, setModalVisible] = useState(false); 
    const [examData, setExamData] = useState({ LichThi: '', PhongThi: '', GioBatDau: '', Phut: '' });

    const navigation = useNavigation(); 

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;
                const userId = user ? user._id : null;
                const userlevel = user ? user.level : null;
                console.log(userlevel);
                
                const response = await fetch('http://192.168.1.9:5000/getSchedule/teacher', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id_user: userId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setClasses(data || []); 
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

        fetchClasses();
    }, []);

    const handleAddExamSchedule = (item) => {
        setSelectedClass(item); 
        setModalVisible(true);  
    };

    const submitExamSchedule = async () => {
        try {
            const response = await fetch('http://192.168.1.9:5000/updateExamSchedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ MaLop: selectedClass.Malop, ...examData }),
            });

            if (response.ok) {
                Alert.alert('Thành công', 'Lịch thi đã được cập nhật.');
                setModalVisible(false);
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Có lỗi xảy ra khi cập nhật lịch thi.');
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itemContainer} onPress={() => handleAddExamSchedule(item)}>
            <Text style={styles.itemTitle}>{item.tenmh}</Text>
            <Text style={styles.itemDetails}>Thứ: {item.Thu}</Text>
            <Text style={styles.itemDetails}>Buổi học: {item.BuoiHoc}</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleAddExamSchedule(item)}>
                <Text style={styles.buttonText}>Add Lịch Thi</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={classes}
                renderItem={renderItem}
                keyExtractor={(item) => item.Malop} 
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Nhập thông tin lịch thi</Text>
                        <TextInput
                            placeholder="Ngày thi (YYYY-MM-DD)"
                            style={styles.input}
                            value={examData.LichThi}
                            onChangeText={(text) => setExamData({ ...examData, LichThi: text })}
                        />
                        <TextInput
                            placeholder="Phòng thi"
                            style={styles.input}
                            value={examData.PhongThi}
                            onChangeText={(text) => setExamData({ ...examData, PhongThi: text })}
                        />
                        <TextInput
                            placeholder="Giờ bắt đầu"
                            style={styles.input}
                            value={examData.GioBatDau}
                            onChangeText={(text) => setExamData({ ...examData, GioBatDau: text })}
                        />
                        <TextInput
                            placeholder="Phút"
                            style={styles.input}
                            value={examData.Phut}
                            onChangeText={(text) => setExamData({ ...examData, Phut: text })}
                        />

                        <TouchableOpacity style={styles.submitButton} onPress={submitExamSchedule}>
                            <Text style={styles.submitButtonText}>Lưu Lịch Thi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        flex: 1,
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    itemTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    itemDetails: {
        fontSize: 16,
        color: '#666',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 5,
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 12,
        borderRadius: 5,
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default SetupExamSchedule;
