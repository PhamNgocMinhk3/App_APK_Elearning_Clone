import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const AddNotificationScreen = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [notificationType, setNotificationType] = useState('1'); // Default to type 1
    const [classOptions, setClassOptions] = useState([]); // Store class options
    const [selectedClass, setSelectedClass] = useState(''); // Selected class for special notifications
    const [userId, setUserId] = useState(''); // Declare userId state

    useEffect(() => {
        const getUserLevel = async () => {
            const userJson = await AsyncStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            if (user) {
                setUserName(user.name);
                setUserEmail(user.email);
                setUserId(user._id); // Set userId state
            }
        };

        getUserLevel();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await fetch('http://192.168.1.9:5000/getSchedule/teacher', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_user: userId }), // Use userId from state
            });

            const classes = await response.json();
            console.log(classes);

            // Format class options for the Picker
            const options = classes.map((cls) => ({
                label: cls.tenmh, // Assuming tenmh is the class name
                value: cls.Malop // Assuming Malop is the class code
            }));

            setClassOptions(options); // Update class options
        } catch (error) {
            console.error('Error fetching classes:', error);
            Alert.alert('Error', 'Failed to fetch classes.');
        }
    };

    // Fetch classes when userId changes
    useEffect(() => {
        if (userId) {
            fetchClasses(); // Fetch classes when userId is available
        }
    }, [userId]);

    const handleSubmit = () => {
        if (!title || !content) {
            Alert.alert('Error', 'Please enter both title and content.');
            return;
        }

        // Create the notification object with additional fields
        const notificationData = {
            title,
            content,
            by: userName,
            email: userEmail,
            type: notificationType, // Add notification type
            malop: notificationType === '2' ? selectedClass : null // Include class code for type 2
        };

        // API call to add the notification (can replace with your backend API)
        fetch('http://192.168.1.9:5000/add-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notificationData),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Alert.alert('Success', 'Notification added successfully.');
                setTitle(''); // Clear the fields
                setContent('');
                setSelectedClass(''); // Reset selected class
            } else {
                Alert.alert('Error', 'Failed to add notification.');
            }
        })
        .catch(error => {
            console.error('Error adding notification:', error);
            Alert.alert('Error', 'Server error.');
        });
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Picker
                selectedValue={notificationType}
                onValueChange={(itemValue) => {
                    setNotificationType(itemValue);
                    if (itemValue !== '2') setSelectedClass(''); // Reset selected class if not special type
                }}
                style={{ marginBottom: 20 }}
            >
                <Picker.Item label="Thông báo Toàn Trường" value="1" />
                <Picker.Item label="Gửi Thông Báo Đến Lớp" value="2" />
            </Picker>

            {notificationType === '2' && (
                <Picker
                    selectedValue={selectedClass}
                    onValueChange={(itemValue) => setSelectedClass(itemValue)}
                    style={{ marginBottom: 20 }}
                >
                    {classOptions.map((classOption, index) => (
                        <Picker.Item key={index} label={classOption.label} value={classOption.value} />
                    ))}
                </Picker>
            )}

            <TextInput
                placeholder="Notification Title"
                value={title}
                onChangeText={setTitle}
                style={{ borderWidth: 1, marginBottom: 20, padding: 10, borderRadius: 5 }}
            />
            <TextInput
                placeholder="Notification Content"
                value={content}
                onChangeText={setContent}
                style={{ borderWidth: 1, marginBottom: 20, padding: 10, borderRadius: 5 }}
                multiline
            />
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
};

export default AddNotificationScreen;
