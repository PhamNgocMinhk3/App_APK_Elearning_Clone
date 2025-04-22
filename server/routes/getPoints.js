const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class'); // Import Class model
const Point = require('../models/Points'); // Import Point model
const router = require('./auth');

// API route to get grades for a specific user based on their enrolled classes
router.post('/getStudentGradesPoints', async (req, res) => {
    const { userId } = req.body; // Get userId from body
    console.log("User ID:", userId);
    
    try {
        // Step 1: Query all classes where the student is enrolled
        const enrolledClasses = await Class.find({
            ThanhVienLop: { $in: [userId] } // Check if userId exists in ThanhVienLop array
        });
        console.log("Enrolled Classes:", enrolledClasses);
        
        if (!enrolledClasses || enrolledClasses.length === 0) {
            return res.status(404).json({ message: "No classes found for this student." });
        }

        // Step 2: Extract all _id (class IDs) from the enrolled classes
        const classIds = enrolledClasses.map(cls => cls._id.toString());
        console.log("Class IDs:", classIds);

        // Step 3: Query the Point model to get the student's grades for these classes
        const grades = await Point.find({
            studentId: userId,
            MaLop: { $in: classIds } // Match MaLop with the classIds
        }).populate('MaLop', 'TenMH'); // Populate subject name

        // Create a mapping of grades for easier access
        const gradesMap = {};
        grades.forEach(grade => {
            gradesMap[grade.MaLop] = grade; // Use MaLop as the key
        });

        // Step 4: Construct the response with grades or default values
        const response = enrolledClasses.map(cls => {
            const grade = gradesMap[cls._id.toString()]; // Get the corresponding grade if exists
            return {
                TenMH: cls.TenMH,
                Diem: grade ? {
                    Diem1: grade.Diem1 || '0',
                    Diem2: grade.Diem2 || '0',
                    Diem3: grade.Diem3 || '0',
                    Diem4: grade.Diem4 || '0',
                    Diem5: grade.Diem5 || '0',
                    Diem6: grade.Diem6 || '0',
                    Diem7: grade.Diem7 || '0',
                } : { // If no grade exists, return defaults
                    Diem1: '0',
                    Diem2: '0',
                    Diem3: '0',
                    Diem4: '0',
                    Diem5: '0',
                    Diem6: '0',
                    Diem7: '0',
                }
            };
        });

        // Log the response for debugging purposes
        console.log("Response with Grades and Subjects:", response);

        // Step 5: Return the grades and subject names as a JSON response
        res.json(response);
    } catch (error) {
        console.error("Error retrieving grades:", error);
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;
