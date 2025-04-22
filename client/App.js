import React from 'react';
import { Text, Alert, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { MenuProvider, Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SingupScreen';
import HomeScreen from './screens/HomeScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import OtpVerification from './screens/OtpVerification';
import StudentInfoScreen from './screens/StudentInfoScreen';
import ClassManagement from './screens/ClassManagement';
import CourseRegistrationScreen from './screens/CourseRegistrationScreen';
import ScheduleScreen from './screens/Schedule'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Tuition from './screens/TuitionScreen'; 
import InvoiceScreen  from './screens/InvoiceScreen ';
import EnterGrades from './screens/EnterGrades';
import Grades from './screens/GradesScreen';
import Grade from './screens/Grades';
import SetupExamSchedule from './screens/SetupExamSchedule';
import NotificationsScreen from './screens/NotificationsScreen.js';
import AddNotificationScreen from './screens/AddNotificationScreen.js';
import PermissionListScreen from './screens/PermissionListScreen.js';
import PermissionFormScreen from './screens/PermissionFormScreen.js';
import FeedbackScreen from './screens/feedback.js';
import ExamSchedule from './screens/ExamSchedule.js';

const Stack = createStackNavigator();

const App = () => {
    const handleLogout = async (navigation) => {
        await AsyncStorage.clear();
        Alert.alert("Bạn đã đăng xuất");
        navigation.navigate('Login');  // Điều hướng về Login
    };

    return (
        <MenuProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen name="Login" component={LoginScreen} 
                    options={({  }) => ({
                        headerTitle: 'Đăng Nhập', 
                    })}
                    />
                    <Stack.Screen name="Signup" component={SignupScreen} 
                    options={({  }) => ({
                        headerTitle: 'Tạo Tài Khoản', 
                    })}
                    />
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={({ navigation }) => ({
                            headerTitle: 'Trang Chủ', 
                            headerLeft: null,
                            headerRight: () => (
                                <Menu>
                                    <MenuTrigger>
                                        <Text style={styles.menuTrigger}>☰</Text>
                                    </MenuTrigger>
                                    <MenuOptions customStyles={menuStyles}>
                                        <MenuOption onSelect={() => handleLogout(navigation)}>
                                            <Text style={styles.menuText}>Đăng xuất</Text>
                                        </MenuOption>
                                    </MenuOptions>
                                </Menu>
                            ),
                        })}
                    />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} 
                    options={({  }) => ({
                        headerTitle: 'Quên mật khẩu', 
                    })}
                    />
                    <Stack.Screen name="OtpVerification" component={OtpVerification} />
                    <Stack.Screen name="StudentInfo" component={StudentInfoScreen} 
                    options={({  }) => ({
                        headerTitle: 'Thông tin cơ bản ', 
                    })}
                    />
                    <Stack.Screen name="ClassManagement" component={ClassManagement}  options={({  }) => ({
                        headerTitle: 'Quản lý lớp', 
                    })}/>
                    <Stack.Screen name="CourseRegistration" component={CourseRegistrationScreen}  options={({  }) => ({
                        headerTitle: 'Đăng ký khóa học', 
                    })}/>
                    <Stack.Screen name="Schedule" component={ScheduleScreen} 
                    options={({  }) => ({
                        headerTitle: 'Thời khóa biểu', 
                    })}
                    />
                    <Stack.Screen name="Tuition" component={Tuition} 
                    options={({  }) => ({
                        headerTitle: 'Học phí', // Tiêu đề của Header
                    })}
                    />
                    <Stack.Screen name="Invoice" component={InvoiceScreen} 
                    options={({  }) => ({
                        headerTitle: 'Hóa đơn', // Tiêu đề của Header
                    })}
                    />
                    <Stack.Screen name="EnterGrades" component={EnterGrades} 
                    options={({  }) => ({
                        headerTitle: 'Nhập điểm', // Tiêu đề của Header
                    })}
                    />
                    <Stack.Screen name="GradesScreen" component={Grades} 
                    options={({  }) => ({
                        headerTitle: 'Chấm điểm cho lớp', // Tiêu đề của Header
                    })}
                    />
                    <Stack.Screen name="Grades" component={Grade} 
                    options={({  }) => ({
                        headerTitle: 'Bản điểm', // Tiêu đề của Header
                    })}
                    />
                    <Stack.Screen name="SetupExamSchedule" component={SetupExamSchedule} 
                    options={({  }) => ({
                        headerTitle: 'Đặt lịch thi', 
                    })}
                    />
                    <Stack.Screen name="Notifications" component={NotificationsScreen} 
                    options={({  }) => ({
                        headerTitle: 'Thông báo', 
                    })}
                    />
                    <Stack.Screen name="AddNotificationScreen" component={AddNotificationScreen} 
                    options={({  }) => ({
                        headerTitle: 'Viết thông báo', 
                    })}
                    />
                    <Stack.Screen name="PermissionForm" component={PermissionListScreen} 
                    options={({  }) => ({
                        headerTitle: 'Đơn xin phép', // Tiêu đề của Header
                    })}
                    />
                    <Stack.Screen name="PermissionAdd" component={PermissionFormScreen} 
                    options={({  }) => ({
                        headerTitle: 'Viết đơn xin phép', // Tiêu đề của Header
                    })}
                    />
                    <Stack.Screen name="Feedback" component={FeedbackScreen} 
                    options={({  }) => ({
                        headerTitle: 'Phản hồi', 
                    })}
                    />
                    <Stack.Screen name="ExamSchedule" component={ExamSchedule} 
                    options={({  }) => ({
                        headerTitle: 'Lịch thi', 
                    })}
                    />
                    

                </Stack.Navigator>
            </NavigationContainer>
        </MenuProvider>
    );
};

const styles = StyleSheet.create({
    menuTrigger: {
        marginRight: 15,
        fontSize: 16,
        color: '#007AFF',  // Màu xanh nhạt của iOS
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
});

const menuStyles = {
    optionsContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0',  // Màu nền cho menu
        borderRadius: 10,  // Làm tròn góc
        marginTop: 40,
    },
    optionWrapper: {
        padding: 10,
    },
    optionText: {
        color: '#007AFF',  // Màu chữ của các tùy chọn
    },
};

export default App;
