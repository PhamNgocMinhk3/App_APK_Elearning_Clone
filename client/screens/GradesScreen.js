import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, ActivityIndicator, TextInput, ScrollView, Button } from 'react-native';

const GradesScreen = ({ route }) => {
    const { classId } = route.params; // Get classId from route params
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]); // Store list of students from API
    const [matchedStudents, setMatchedStudents] = useState([]); // Matched students with class
    const [grades, setGrades] = useState({}); // Store grades of students

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            console.log(classId);
            
            try {
                // Fetch all students
                const userResponse = await fetch('http://192.168.1.9:5000/alluser');
                const allStudents = await userResponse.json();

                const classResponse = await fetch('http://192.168.1.9:5000/getStudent/teacher', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ classId }),
                });

                if (classResponse.ok) {
                    const classData = await classResponse.json();
                    const studentIdsInClass = classData[0].ThanhVienLop;

                    const matched = allStudents.filter((student) =>
                        studentIdsInClass.includes(student._id)
                    );
                    setMatchedStudents(matched);

                    // Fetch existing grades for matched students
                    const gradesResponse = await fetch('http://192.168.1.9:5000/getGrades', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ studentIds: matched.map(s => s._id) }), // Send matched student IDs
                    });

                    if (gradesResponse.ok) {
                        const fetchedGrades = await gradesResponse.json();
                        const gradesMap = fetchedGrades.reduce((acc, grade) => {
                            acc[grade.studentId] = [
                                grade.Diem1,
                                grade.Diem2,
                                grade.Diem3,
                                grade.Diem4,
                                grade.Diem5,
                                grade.Diem6,
                                grade.Diem7,
                            ];
                            return acc;
                        }, {});
                        setGrades(gradesMap); // Set the fetched grades
                    }
                } else {
                    const errorData = await classResponse.json();
                    Alert.alert('Error', errorData.message);
                }
            } catch (error) {
                Alert.alert('Error', 'Có lỗi xảy ra khi lấy dữ liệu.');
            } finally {
                setLoading(false);
            }
        };

        fetchData(); 
    }, [classId]);

    const handleGradeChange = (studentId, value, gradeIndex) => {
        setGrades({
            ...grades,
            [studentId]: { ...grades[studentId], [gradeIndex]: value }
        });
    };

    const handleConfirmGrades = async () => {
        console.log("Bạn đã click nút");
        const formattedGrades = {};
        // Format grades to match the expected structure
        matchedStudents.forEach(student => {
            formattedGrades[student._id] = {
                TenSV: student.name,
                EmailSV: student.email,
                Diem1: grades[student._id]?.[0] ? Number(grades[student._id][0]) : 0,
                Diem2: grades[student._id]?.[1] ? Number(grades[student._id][1]) : 0,
                Diem3: grades[student._id]?.[2] ? Number(grades[student._id][2]) : 0,
                Diem4: grades[student._id]?.[3] ? Number(grades[student._id][3]) : 0,
                Diem5: grades[student._id]?.[4] ? Number(grades[student._id][4]) : 0,
                Diem6: grades[student._id]?.[5] ? Number(grades[student._id][5]) : 0,
                Diem7: grades[student._id]?.[6] ? Number(grades[student._id][6]) : 0,
            };
        });
        console.log("data điểm cần lưu :", formattedGrades);
        try {
            const response = await fetch('http://192.168.1.9:5000/saveGrades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ grades: formattedGrades, classId }), // Send grades with classId
            });
    
            if (response.ok) {
                console.log("Bạn đã click nút và log thành công");
                Alert.alert('Success', 'Đã lưu điểm thành công!');
            } else {
                const errorData = await response.json();
                Alert.alert('Error', errorData.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Có lỗi xảy ra khi lưu điểm.');
        }
    };
    

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const renderTableHeader = () => (
        <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.nameEmailColumn]}>Tên</Text>
            <Text style={[styles.tableHeaderText, styles.nameEmailColumn]}>Email</Text>
            {Array.from({ length: 7 }).map((_, index) => (
                <Text key={index} style={styles.tableHeaderText}>{`Điểm ${index + 1}`}</Text>
            ))}
        </View>
    );

    const renderItem = ({ item }) => (
        <View style={styles.tableRow}>
            <View style={styles.nameEmailColumn}>
                <Text style={styles.tableCell}>{item.name}</Text>
            </View>
            <View style={styles.nameEmailColumn}>
                <Text style={styles.tableCell}>{item.email}</Text>
            </View>
            {Array.from({ length: 7 }).map((_, index) => (
                <TextInput
                    key={index}
                    style={[styles.gradeInput, { marginHorizontal: 7 }]}
                    value={grades[item._id]?.[index] ? String(grades[item._id][index]) : '0'} // Set default value to 0 if not available
                    onChangeText={(value) => handleGradeChange(item._id, value, index)}
                    keyboardType="numeric"
                    placeholder="Điểm"
                />
            ))}
        </View>
    );

    return (
        <ScrollView horizontal>
            <View style={{ flex: 1, padding: 20 }}>
                {renderTableHeader()}
                <FlatList
                    data={matchedStudents}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                />
                <View style={styles.confirmButtonContainer}>
                    <Button
                        title="Xác nhận"
                        onPress={handleConfirmGrades}
                        color="#1976D2"
                        accessibilityLabel="Xác nhận điểm"
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = {
    tableHeader: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#1976D2',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    tableHeaderText: {
        flex: 1,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginHorizontal: 5,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
    },
    nameEmailColumn: {
        flex: 150,
        paddingHorizontal: 5,
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
    },
    gradeInput: {
        width: 60,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 5,
        textAlign: 'center',
    },
    confirmButtonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
};

export default GradesScreen;
