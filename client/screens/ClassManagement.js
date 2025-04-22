import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TextInput, Alert, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClassManagement = () => {
    const [classes, setClasses] = useState([]);
    const [newClass, setNewClass] = useState({
        TenMH: '',
        SiSoLop: '',
        MaNganh: '',
        SoTietHoc: '',
        ThoiGianHoc: [],
        BuoiHoc: 'Sáng',
        NgayBatDau: '',
        Thu: '',
        GiaTien: '',
        PhongHoc: '',
    });
    const [teacherId, setTeacherId] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editClassData, setEditClassData] = useState({ ...newClass });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTeacherAndClasses = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;
                if (user && user._id) {
                    setTeacherId(user._id);
                    const response = await fetch(`http://192.168.1.9:5000/classes/${user._id}`);
                    const data = await response.json();
                    setClasses(data);
                }
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể tải thông tin lớp học. Vui lòng thử lại.');
                console.error(error);
            }
        };

        fetchTeacherAndClasses();
    }, []);

    const addClass = async () => {
        if (!teacherId) {
            Alert.alert('Không tìm thấy ID giáo viên');
            return;
        }
        
        setLoading(true);
        try {
            const response = await fetch('http://192.168.1.9:5000/classes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newClass, MaGV: teacherId }),
            });
            const data = await response.json();
            setClasses([...classes, data]);
            resetNewClass();
            Alert.alert('Thêm lớp học thành công');
        } catch (error) {
            Alert.alert('Lỗi khi thêm lớp học', error.message);
        } finally {
            setLoading(false);
            setIsModalVisible(false);
        }
    };

    const resetNewClass = () => {
        setNewClass({
            TenMH: '',
            SiSoLop: '',
            MaNganh: '',
            SoTietHoc: '',
            ThoiGianHoc: [],
            BuoiHoc: 'Sáng',
            NgayBatDau: '',
            Thu: '',
            GiaTien: '',
            PhongHoc: '',
        });
    };

    const openEditModal = (cls) => {
        setEditClassData({
            ...cls,
            NgayBatDau: cls.NgayBatDau || '',  
            Thu: cls.Thu || '',                 
            GiaTien: cls.GiaTien ? String(cls.GiaTien) : '', 
            PhongHoc: cls.PhongHoc || '',
            SiSoLop: cls.SiSoLop ? String(cls.SiSoLop) : '', 
            SoTietHoc: cls.SoTietHoc ? String(cls.SoTietHoc) : '', 
        });
        setSelectedClass(cls);
        setIsEditModalVisible(true);
    };

    const updateClass = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://192.168.1.9:5000/classes/${selectedClass._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editClassData),
            });
            const data = await response.json();
            setClasses(classes.map((cls) => (cls._id === selectedClass._id ? data : cls)));
            Alert.alert('Cập nhật lớp học thành công');
        } catch (error) {
            Alert.alert('Lỗi khi cập nhật lớp học', error.message);
        } finally {
            setLoading(false);
            setIsEditModalVisible(false);
        }
    };

    const deleteClass = async (id) => {
        setLoading(true);
        try {
            await fetch(`http://192.168.1.9:5000/classes/${id}`, {
                method: 'DELETE',
            });
            setClasses(classes.filter((cls) => cls._id !== id));
            Alert.alert('Xóa lớp học thành công');
        } catch (error) {
            Alert.alert('Lỗi khi xóa lớp học', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quản Lý Lớp Học</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Thêm Lớp Học</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm Lớp Học Mới</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tên Môn Học"
                            value={newClass.TenMH}
                            onChangeText={(text) => setNewClass({ ...newClass, TenMH: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Sĩ Số Lớp"
                            keyboardType="numeric"
                            value={newClass.SiSoLop}
                            onChangeText={(text) => setNewClass({ ...newClass, SiSoLop: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mã Ngành"
                            value={newClass.MaNganh}
                            onChangeText={(text) => setNewClass({ ...newClass, MaNganh: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Số Tiết Học"
                            keyboardType="numeric"
                            value={newClass.SoTietHoc}
                            onChangeText={(text) => setNewClass({ ...newClass, SoTietHoc: text })}
                        />
                        <Text>Ngày Bắt Đầu:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ngày Bắt Đầu (dd/mm/yyyy)"
                            value={newClass.NgayBatDau}
                            onChangeText={(text) => setNewClass({ ...newClass, NgayBatDau: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phòng Học"
                            value={newClass.PhongHoc}
                            onChangeText={(text) => setNewClass({ ...newClass, PhongHoc: text })}
                        />
                        <Text>Thời Gian Học:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Thời Gian Học (ví dụ: 1,2,3,4) - tiết học"
                            value={newClass.ThoiGianHoc.join(', ')}
                            onChangeText={(text) => setNewClass({ ...newClass, ThoiGianHoc: text.split(',').map(t => t.trim()) })}
                        />
                        <Text>Buổi Học:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Buổi Học (Sáng, Trưa, Chiều-Tối)"
                            value={newClass.BuoiHoc}
                            onChangeText={(text) => setNewClass({ ...newClass, BuoiHoc: text })}
                        />
                        <Text>Thứ:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Thứ"
                            value={newClass.Thu}
                            onChangeText={(text) => setNewClass({ ...newClass, Thu: text })}
                        />
                        <Text>Giá Tiền:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Giá Tiền"
                            keyboardType="numeric"
                            value={newClass.GiaTien}
                            onChangeText={(text) => setNewClass({ ...newClass, GiaTien: text })}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Thêm" onPress={addClass} disabled={!newClass.TenMH || !newClass.SiSoLop || !newClass.MaNganh || !newClass.SoTietHoc || !newClass.NgayBatDau} />
                            <Button title="Hủy" onPress={() => setIsModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Cập Nhật Lớp Học</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tên Môn Học"
                            value={editClassData.TenMH}
                            onChangeText={(text) => setEditClassData({ ...editClassData, TenMH: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Sĩ Số Lớp"
                            keyboardType="numeric"
                            value={editClassData.SiSoLop}
                            onChangeText={(text) => setEditClassData({ ...editClassData, SiSoLop: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Mã Ngành"
                            value={editClassData.MaNganh}
                            onChangeText={(text) => setEditClassData({ ...editClassData, MaNganh: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Số Tiết Học"
                            keyboardType="numeric"
                            value={editClassData.SoTietHoc}
                            onChangeText={(text) => setEditClassData({ ...editClassData, SoTietHoc: text })}
                        />
                        <Text>Ngày Bắt Đầu:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ngày Bắt Đầu (dd/mm/yyyy)"
                            value={editClassData.NgayBatDau}
                            onChangeText={(text) => setEditClassData({ ...editClassData, NgayBatDau: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phòng Học"
                            value={editClassData.PhongHoc}
                            onChangeText={(text) => setEditClassData({ ...editClassData, PhongHoc: text })}
                        />
                        <Text>Thời Gian Học:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Thời Gian Học (ví dụ: 1,2,3,4) - tiết học"
                            value={editClassData.ThoiGianHoc.join(', ')}
                            onChangeText={(text) => setEditClassData({ ...editClassData, ThoiGianHoc: text.split(',').map(t => t.trim()) })}
                        />
                        <Text>Buổi Học:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Buổi Học (Sáng, Trưa, Chiều-Tối)"
                            value={editClassData.BuoiHoc}
                            onChangeText={(text) => setEditClassData({ ...editClassData, BuoiHoc: text })}
                        />
                        <Text>Thứ:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Thứ"
                            value={editClassData.Thu}
                            onChangeText={(text) => setEditClassData({ ...editClassData, Thu: text })}
                        />
                        <Text>Giá Tiền:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Giá Tiền"
                            keyboardType="numeric"
                            value={editClassData.GiaTien}
                            onChangeText={(text) => setEditClassData({ ...editClassData, GiaTien: text })}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cập Nhật" onPress={updateClass} />
                            <Button title="Hủy" onPress={() => setIsEditModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>

            <FlatList
            data={classes}
            keyExtractor={(item) => item._id} // Ensure _id is unique
            renderItem={({ item }) => (
                <View style={styles.classItem}>
                    <Text style={styles.classText}>{item.TenMH}</Text>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                        <Text style={styles.editButton}>Cập Nhật</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteClass(item._id)}>
                        <Text style={styles.deleteButton}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: '#4CAF50',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        margin: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    classItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    classText: {
        fontSize: 18,
    },
    editButton: {
        color: '#007BFF',
    },
    deleteButton: {
        color: '#FF0000',
    },
});

export default ClassManagement;