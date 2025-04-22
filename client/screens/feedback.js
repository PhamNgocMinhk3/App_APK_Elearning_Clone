// FeedbackScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FeedbackScreen = () => {
    const [feedback, setFeedback] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');

    // Fetch user data from AsyncStorage
    useEffect(() => {
        const fetchUserData = async () => {
            const dataAll = await AsyncStorage.getItem('user'); 
            console.log(dataAll); 
            if (dataAll) {
                const userData = JSON.parse(dataAll);
                // Set the state with the retrieved values
                setName(userData.name);
                setPhoneNumber(userData.phoneNumber);
                setEmail(userData.email);
                
                console.log('Name:', userData.name); 
                console.log('Phone Number:', userData.phoneNumber); 
                console.log('Email:', userData.email); 
            } else {
                console.log('No user data found in AsyncStorage');
            }
        };
        fetchUserData();
    }, []);

    // Function to handle feedback submission
    const handleSubmit = async () => {
        if (!feedback) {
            Alert.alert('Error', 'Please enter your feedback');
            return;
        }

        const feedbackData = {
            name,
            phoneNumber,
            email,
            content: feedback,
        };
        console.log(feedbackData, "data feedback"); // Corrected log message
        
        try {
            const response = await fetch('http://192.168.1.9:5000/send-feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });
            const data = await response.json();
            if (data.success) {
                Alert.alert('Success', 'Your feedback has been sent successfully');
                setFeedback('');
            } else {
                Alert.alert('Error', 'Failed to send feedback');
            }
        } catch (error) {
            console.error('Error sending feedback:', error);
            Alert.alert('Error', 'An error occurred while sending feedback');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Feedback</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your feedback"
                multiline
                numberOfLines={4}
                value={feedback}
                onChangeText={setFeedback}
            />
            <Button title="Send Feedback" onPress={handleSubmit} color="blue" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    input: {
        height: 100,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
});

export default FeedbackScreen;
