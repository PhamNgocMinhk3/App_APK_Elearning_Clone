import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import axios for API calls

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [userLevel, setUserLevel] = useState(null);
    const [loading, setLoading] = useState(true); // Loading state

    // Fetch notifications from the server or local storage
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://192.168.1.9:5000/getNoficationsAllSchool'); // Replace with your server URL
                setNotifications(response.data.notifications); // Update notifications state
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        const getUserLevel = async () => {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            setUserLevel(user ? user.level : null); // Set user level
        };

        const init = async () => {
            await getUserLevel(); // Get user level
            await fetchNotifications(); // Fetch notifications
        };

        init(); // Call the init function
    }, []);

    // Function to delete notification
    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`http://192.168.1.9:5000/deleteNotification/${notificationId}`); // Replace with your server URL
            // Filter out the deleted notification from the list
            setNotifications(notifications.filter((notification) => notification._id !== notificationId));
            setModalVisible(false); // Close modal after deletion
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    // Render each notification
    const renderNotification = ({ item }) => (
        <TouchableOpacity
            onPress={() => {
                setSelectedNotification(item);
                setModalVisible(true); // Open modal to show details
            }}
            style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
        >
            <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
            <Text>{item.content}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text>Thông Báo Của Bạn Nhận Được:</Text>
            {loading ? ( // Show loading indicator while fetching
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item._id} // Use _id from MongoDB as key
                />
            )}

            {/* Show Add Notification button if user level is 2 */}
            {userLevel === 2 && (
                <Button
                    title="Add Notification"
                    onPress={() => navigation.navigate('AddNotificationScreen')}
                    style={{ marginVertical: 20 }}
                />
            )}

            {/* Modal to show notification details */}
            {selectedNotification && (
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={{ padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                            {selectedNotification.title}
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                            Được Viết Bởi: {selectedNotification.by}
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                            Email: {selectedNotification.email}
                        </Text>
                        <Text style={{ marginTop: 10 }}>{selectedNotification.content}</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={{
                                marginTop: 20,
                                padding: 10,
                                backgroundColor: '#2196F3',
                                borderRadius: 5,
                            }}
                        >
                            <Text style={{ color: 'white', textAlign: 'center' }}>Close</Text>
                        </TouchableOpacity>

                        {/* Delete button */}
                        {userLevel === 2 && (
                            <TouchableOpacity
                                onPress={() => deleteNotification(selectedNotification._id)} // Call delete function
                                style={{
                                    marginTop: 20,
                                    padding: 10,
                                    backgroundColor: 'red',
                                    borderRadius: 5,
                                }}
                            >
                                <Text style={{ color: 'white', textAlign: 'center' }}>Delete Notification</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default NotificationsScreen;
