import { prisma } from "../lib/db";

export class EnrollmentService {
  static async enrollStudent(studentId: string, courseId: string) {
    try {
      // Check if already enrolled
      const existing = await prisma.studentEnrollment.findUnique({
        where: {
          student_id_course_id: { student_id: studentId, course_id: courseId },
        },
      });

      if (existing)
        return {
          success: false,
          message: "Student already enrolled in this course",
        };

      const enrollment = await prisma.studentEnrollment.create({
        data: {
          student_id: studentId,
          course_id: courseId,
          enrollment_date: new Date(),
          status: "enrolled",
        },
        include: { course: true, student: true },
      });

      return {
        success: true,
        data: enrollment,
        message: "Student enrolled successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async dropCourse(studentId: string, courseId: string) {
    try {
      const enrollment = await prisma.studentEnrollment.update({
        where: {
          student_id_course_id: { student_id: studentId, course_id: courseId },
        },
        data: { status: "dropped" },
        include: { course: true },
      });

      return {
        success: true,
        data: enrollment,
        message: "Course dropped successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async recordAttendance(
    studentId: string,
    courseId: string,
    status: string,
    date: Date
  ) {
    try {
      // Find existing attendance record
      const existing = await prisma.attendance.findFirst({
        where: {
          student_id: studentId,
          course_id: courseId,
          date,
        },
      });

      let attendance;
      if (existing) {
        attendance = await prisma.attendance.update({
          where: { id: existing.id },
          data: { status },
          include: { course: true, student: true },
        });
      } else {
        attendance = await prisma.attendance.create({
          data: {
            student_id: studentId,
            course_id: courseId,
            date,
            status,
            recorded_by: "system", // Should be teacher ID in reality
          },
          include: { course: true, student: true },
        });
      }

      return {
        success: true,
        data: attendance,
        message: "Attendance recorded successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async recordGrade(
    studentId: string,
    courseId: string,
    gradeData: any
  ) {
    try {
      const grade = await prisma.grade.create({
        data: {
          student_id: studentId,
          course_id: courseId,
          academic_year_id: gradeData.academic_year_id,
          assessment_type: gradeData.assessment_type,
          assessment_name: gradeData.assessment_name,
          score: gradeData.score,
          max_score: gradeData.max_score || 100,
          grade_date: gradeData.grade_date || new Date(),
          graded_by: gradeData.graded_by || "system",
          weight: gradeData.weight,
          remarks: gradeData.remarks,
        },
        include: { course: true, student: true },
      });

      return {
        success: true,
        data: grade,
        message: "Grade recorded successfully",
      };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export default EnrollmentService;
