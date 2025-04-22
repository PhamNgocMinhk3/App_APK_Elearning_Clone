import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InvoiceScreen = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userLevel, setUserLevel] = useState(null); // State to hold user level

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const userJson = await AsyncStorage.getItem('user');
                const user = userJson ? JSON.parse(userJson) : null;

                if (!user || !user._id) {
                    Alert.alert('Error', 'User ID not found');
                    return;
                }

                // Store user level
                setUserLevel(user.level);

                let apiUrl = '';
                if (user.level === 1) {
                    // If user level is 1, fetch payments by userId
                    apiUrl = `http://192.168.1.9:5000/getAllPayments/${user._id}`;
                } else if (user.level === 2) {
                    // If user level is 2, fetch all payments
                    apiUrl = `http://192.168.1.9:5000/getAllPayments`;
                }

                const response = await fetch(apiUrl);
                const result = await response.json();

                if (result.success) {
                    setPayments(result.data);
                } else {
                    setError('Failed to load payments');
                }
            } catch (error) {
                setError('Error fetching payments');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    // Function to update payment status
    const updatePaymentStatus = async (paymentId) => {
        try {
            const response = await fetch(`http://192.168.1.9:5000/updatePaymentStatus/${paymentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tinhtrang: '1' }), // Update to '1' for payment complete
            });

            const result = await response.json();

            if (result.success) {
                // Update local state
                setPayments((prevPayments) =>
                    prevPayments.map((payment) =>
                        payment._id === paymentId ? { ...payment, tinhtrang: '1' } : payment
                    )
                );
                Alert.alert('Success', 'Payment status updated successfully!');
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to update payment status');
            console.error(error);
        }
    };

    // Function to delete payment
    const deletePayment = async (paymentId) => {
        try {
            const response = await fetch(`http://192.168.1.9:5000/deletePayment/${paymentId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                // Update local state by removing the deleted payment
                setPayments((prevPayments) =>
                    prevPayments.filter((payment) => payment._id !== paymentId)
                );
                Alert.alert('Success', 'Payment deleted successfully!');
            } else {
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to delete payment');
            console.error(error);
        }
    };

    // Show loading indicator
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // Show error message
    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    // Render payments list
    return (
        <View style={styles.container}>
            <FlatList
                data={payments}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.invoiceItem}>
                        <Text style={styles.subject}>
                            Môn: {Array.isArray(item.subject) ? item.subject.join(', ') : item.subject || 'N/A'}
                        </Text>
                        <Text>Giá Tiền: {item.amount} VND</Text>
                        <Text>Trạng Thái: {item.tinhtrang === '1' ? 'Thanh Toán' : 'Đang Chờ Duyệt'}</Text>
                        <Text>Ngày Lập Đơn: {new Date(item.timestamp).toLocaleDateString()}</Text>

                        {userLevel === 2 && (
                            <Button
                                title="Duyệt Thanh Toán"
                                onPress={() => updatePaymentStatus(item._id)} // Call update function
                            />
                        )}
                        {/* Add delete button */}
                        <Button
                            title="Xóa"
                            color="red"
                            onPress={() => deletePayment(item._id)} // Call delete function
                        />
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    invoiceItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 8,
        elevation: 2,
    },
    subject: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    error: {
        color: 'red',
        fontSize: 18,
    },
});

export default InvoiceScreen;
