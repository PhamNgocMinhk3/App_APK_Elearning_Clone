import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TuitionScreen = () => {
    const [tuitionData, setTuitionData] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [database, setDatabase] = useState([]);
    const [paidMalops, setPaidMalops] = useState([]); // State to store paid Malops

    // Fetch tuition data from the server
    const fetchTuitionData = async (userId) => {
        try {
            const response = await fetch('http://192.168.1.9:5000/getSchedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_user: userId }),
            });

            const data = await response.json();
            setDatabase(data);
            const combinedData = combineTuitionData(data); // Combine tuition data
            setTuitionData(combinedData);
            calculateTotalAmount(combinedData); // Calculate total amount based on filtered data
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể lấy dữ liệu học phí');
        }
    };

    // Fetch already paid subjects from the server
    const fetchPaidSubjects = async (userId) => {
        try {
            const response = await fetch(`http://192.168.1.9:5000/getPaymentsByStatus/${userId}`);
            const result = await response.json();

            if (result.success) {
                const malops = result.data.map(payment => payment.Malop).flat(); // Extract Malop from payments
                setPaidMalops(malops); // Set the paid Malops to state
                calculateTotalAmount(tuitionData); // Recalculate total amount based on new paid subjects
            }
        } catch (error) {
            console.error('Error fetching paid subjects:', error);
            Alert.alert('Lỗi', 'Không thể lấy thông tin thanh toán');
        }
    };

    // Combine tuition data based on year and subject
    const combineTuitionData = (data) => {
        const combined = {};

        data.forEach(item => {
            const key = `${item.year}-${item.tenmh}`; // Unique key based on year and subject

            if (combined[key]) {
                combined[key].totalAmount += item.Gia || 0; // Safeguard against undefined
                combined[key].count += 1; // Count how many subjects are combined
            } else {
                combined[key] = {
                    year: new Date(item.NgayBatDau).getFullYear(),
                    tenmh: item.tenmh,
                    totalAmount: item.Gia || 0, // Safeguard against undefined
                    Malop: item.Malop, // Include Malop for filtering
                    count: 1, // Initialize count for this subject
                };
            }
        });

        return Object.values(combined); // Convert back to array
    };

    const calculateTotalAmount = (combinedData) => {
        // Filter out paid subjects from combined data and calculate total amount
        const total = combinedData.reduce((sum, item) => {
            if (!paidMalops.includes(item.Malop)) { // Only include subjects that are not paid
                return sum + (item.totalAmount || 0);
            }
            return sum;
        }, 0);
        setTotalAmount(total);
    };

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;
                if (user && user._id) {
                    fetchTuitionData(user._id);
                    fetchPaidSubjects(user._id); // Fetch paid subjects for the user
                } else {
                    Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
                }
            } catch (error) {
                console.error('Lỗi lấy thông tin người dùng', error);
                Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy thông tin người dùng');
            }
        };

        loadUserData();
    }, []);

    // Handle payment action
    const handlePayment = async () => {
        const unpaidTuitionData = tuitionData.filter(item => !paidMalops.includes(item.Malop)); // Get unpaid subjects
        if (unpaidTuitionData.length === 0) {
            Alert.alert('Thông báo', 'Bạn đã thanh toán cho tất cả các môn học.');
            return;
        }

        const amount = unpaidTuitionData.reduce((sum, item) => sum + item.totalAmount, 0); // Calculate amount to pay
        const qrCodeUrl = `https://img.vietqr.io/image/BIDV-6504398529-compact2.png?amount=${amount}`;
        setQrCodeUrl(qrCodeUrl);

        // Call API to save the payment details
        await savePaymentDetails(amount);
    };

    // Save payment details to the server
    const savePaymentDetails = async (amount) => {
        const userJson = await AsyncStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;

        if (user && user._id) {
            const paymentDetails = {
                userId: user._id,
                subject: tuitionData.map(item => item.tenmh).join(', '), // Join subjects into a string
                amount: amount,
                timestamp: new Date(),
                Malop: database.map(item => item.Malop) // Save directly as an array
            };
            console.log(paymentDetails);
            try {
                const response = await fetch('http://192.168.1.9:5000/savePayment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(paymentDetails),
                });
                const result = await response.json();
                if (result.success) {
                    Alert.alert('Thông báo', 'Thanh toán thành công Vui lòng chờ duyệt');
                    fetchPaidSubjects(user._id); // Refresh paid subjects after successful payment
                } else {
                    Alert.alert('Lỗi', 'Có lỗi xảy ra khi thanh toán');
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Lỗi', 'Không thể lưu thông tin thanh toán');
            }
        } else {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        }
    };

    // Filter out paid subjects from tuition data
    const filteredTuitionData = tuitionData.filter(item =>
        !paidMalops.includes(item.Malop) // Exclude subjects that are already paid for
    );

    // Render each item in the FlatList
    const renderItem = ({ item }) => {
        const isPaid = paidMalops.includes(item.Malop); // Check if the subject is paid

        return (
            <View style={styles.row}>
                <Text style={styles.cell}>{item.year}</Text>
                <View style={styles.subjectsCell}>
                    <Text style={styles.subjectText}>{item.tenmh}</Text>
                </View>
                {/* Only show totalAmount if the subject is not paid */}
                {!isPaid ? (
                    <Text style={styles.cell}>{item.totalAmount.toLocaleString()} VNĐ</Text>
                ) : (
                    <Text style={styles.cell}>Đã thanh toán</Text> // Indicate that the subject is paid
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Thông Tin Học Phí</Text>
            <Text style={styles.totalAmount}>
                Tổng tiền: {totalAmount ? totalAmount.toLocaleString() : 0} VNĐ
            </Text>
            <View style={styles.table}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerCell}>Năm Học</Text>
                    <Text style={styles.headerCell}>Tên môn học</Text>
                    <Text style={styles.headerCell}>Tổng tiền</Text>
                </View>
                <FlatList
                    data={tuitionData} // Use the original tuition data for rendering
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${item.year}-${item.tenmh}-${index}`}
                />
                <TouchableOpacity style={styles.button} onPress={handlePayment}>
                    <Text style={styles.buttonText}>Thanh Toán</Text>
                </TouchableOpacity>
                {qrCodeUrl ? (
                    <Image style={styles.qrCode} source={{ uri: qrCodeUrl }} />
                ) : null}
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
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    table: {
        borderWidth: 1,
        borderColor: '#e1e1e1',
        borderRadius: 5,
        overflow: 'hidden',
    },
    headerRow: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
    },
    headerCell: {
        flex: 1,
        padding: 10,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e1e1e1',
    },
    cell: {
        flex: 1,
    },
    subjectsCell: {
        flex: 2,
    },
    subjectText: {
        fontSize: 16,
    },
    button: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    qrCode: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginTop: 20,
    },
});

export default TuitionScreen;
