/**
 * Test Data Generator Utility
 * Generates realistic test data for all Phase 2 components
 * Used for development, testing, and demo purposes
 */

/**
 * Generate mock analytics dashboard data
 */
export const generateDashboardData = (branchId = 'branch-001') => {
  return {
    success: true,
    message: 'Dashboard data generated',
    data: {
      branchId,
      totalStudents: 342,
      totalTeachers: 28,
      totalCourses: 12,
      activeEnrollments: 1256,
      averageAttendance: 87.5,
      totalFeeCollected: 2850000,
      pendingFees: 450000,
      updatedAt: new Date().toISOString()
    }
  }
}

/**
 * Generate mock enrollment metrics
 */
export const generateEnrollmentMetrics = (branchId = 'branch-001') => {
  const courses = [
    { courseId: 'course-001', courseName: 'Mathematics - Grade 9', enrollments: 45 },
    { courseId: 'course-002', courseName: 'English - Grade 9', enrollments: 48 },
    { courseId: 'course-003', courseName: 'Science - Grade 9', enrollments: 42 },
    { courseId: 'course-004', courseName: 'History - Grade 10', enrollments: 38 },
    { courseId: 'course-005', courseName: 'Computer Science - Grade 10', enrollments: 55 }
  ]

  return {
    success: true,
    message: 'Enrollment metrics calculated',
    data: {
      totalEnrollments: courses.reduce((sum, c) => sum + c.enrollments, 0),
      enrollmentsByGrade: courses,
      enrollmentTrend: [
        { month: 'Jan', enrollments: 180 },
        { month: 'Feb', enrollments: 195 },
        { month: 'Mar', enrollments: 210 },
        { month: 'Apr', enrollments: 228 }
      ],
      branchId
    }
  }
}

/**
 * Generate mock attendance metrics
 */
export const generateAttendanceMetrics = (branchId = 'branch-001', startDate, endDate) => {
  return {
    success: true,
    message: 'Attendance metrics calculated',
    data: {
      totalRecords: 2450,
      presentCount: 2320,
      absentCount: 130,
      attendancePercentage: 94.67,
      averageAttendance: 87.5,
      attendanceByGrade: [
        { grade: '9A', percentage: 92.5, presentCount: 310, absentCount: 25 },
        { grade: '9B', percentage: 91.2, presentCount: 285, absentCount: 28 },
        { grade: '10A', percentage: 95.8, presentCount: 325, absentCount: 14 },
        { grade: '10B', percentage: 94.1, presentCount: 400, absentCount: 23 }
      ],
      dateRange: { startDate, endDate },
      branchId
    }
  }
}

/**
 * Generate mock fee metrics
 */
export const generateFeeMetrics = (branchId = 'branch-001') => {
  return {
    success: true,
    message: 'Fee metrics calculated',
    data: {
      totalStudents: 342,
      totalFeeAmount: 3300000,
      feeCollected: 2850000,
      feePending: 450000,
      collectionPercentage: 86.36,
      collectionByMonth: [
        { month: 'January', collected: 180000, pending: 50000 },
        { month: 'February', collected: 185000, pending: 45000 },
        { month: 'March', collected: 190000, pending: 40000 },
        { month: 'April', collected: 1945000, pending: 315000 }
      ],
      feeStatus: {
        fullPaid: 245,
        partiallyPaid: 82,
        notPaid: 15
      },
      branchId
    }
  }
}

/**
 * Generate mock teacher metrics
 */
export const generateTeacherMetrics = (branchId = 'branch-001') => {
  const teachers = [
    {
      teacherId: 'teacher-001',
      name: 'Dr. Fatima Khan',
      subject: 'Mathematics',
      coursesTeaching: 4,
      averageRating: 4.8,
      studentFeedback: 245,
      classesTaken: 142,
      performanceScore: 92
    },
    {
      teacherId: 'teacher-002',
      name: 'Mr. Ahmed Hassan',
      subject: 'Physics',
      coursesTeaching: 3,
      averageRating: 4.6,
      studentFeedback: 198,
      classesTaken: 128,
      performanceScore: 88
    },
    {
      teacherId: 'teacher-003',
      name: 'Ms. Zainab Ali',
      subject: 'English',
      coursesTeaching: 3,
      averageRating: 4.7,
      studentFeedback: 212,
      classesTaken: 135,
      performanceScore: 90
    },
    {
      teacherId: 'teacher-004',
      name: 'Mr. Hassan Malik',
      subject: 'Chemistry',
      coursesTeaching: 2,
      averageRating: 4.5,
      studentFeedback: 167,
      classesTaken: 98,
      performanceScore: 85
    }
  ]

  return {
    success: true,
    message: 'Teacher metrics calculated',
    data: {
      totalTeachers: teachers.length,
      averageRating: 4.65,
      teachers,
      branchId
    }
  }
}

/**
 * Generate mock trend analysis
 */
export const generateTrendAnalysis = (metricType = 'attendance', branchId = 'branch-001', days = 30) => {
  const generateTrendData = () => {
    const data = []
    const today = new Date()
    for (let i = days; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const value = Math.floor(Math.random() * 40) + 60 // 60-100

      data.push({
        date: date.toISOString().split('T')[0],
        value,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }
    return data
  }

  return {
    success: true,
    message: 'Trend analysis completed',
    data: {
      metricType,
      period: `Last ${days} days`,
      branchId,
      trends: generateTrendData(),
      summary: {
        average: 82.5,
        highest: 98,
        lowest: 65,
        changePercentage: 5.2
      }
    }
  }
}

/**
 * Generate mock messages
 */
export const generateMessages = (userId = 'user-001') => {
  const senders = [
    { senderId: 'user-002', senderName: 'Dr. Fatima Khan', avatar: 'FK' },
    { senderId: 'user-003', senderName: 'Mr. Ahmed Hassan', avatar: 'AH' },
    { senderId: 'user-004', senderName: 'Ms. Zainab Ali', avatar: 'ZA' }
  ]

  const generateMessage = (index, isReceived) => {
    const sender = senders[Math.floor(Math.random() * senders.length)]
    const today = new Date()
    today.setHours(today.getHours() - index)

    return {
      messageId: `msg-${index}`,
      senderId: isReceived ? sender.senderId : userId,
      senderName: isReceived ? sender.senderName : 'You',
      recipientId: isReceived ? userId : sender.senderId,
      subject: `Message ${index}`,
      body: `This is a test message ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      timestamp: today.toISOString(),
      isRead: Math.random() > 0.3,
      attachment: Math.random() > 0.7 ? 'document.pdf' : null
    }
  }

  return {
    inbox: Array.from({ length: 15 }, (_, i) => generateMessage(i, true)),
    sent: Array.from({ length: 8 }, (_, i) => generateMessage(i, false))
  }
}

/**
 * Generate mock announcements
 */
export const generateAnnouncements = (courseId = 'course-001') => {
  const announcements = [
    {
      announcementId: 'ann-001',
      title: 'Exam Schedule Released',
      content: 'Final examinations for Grade 9 will be held from May 15-25, 2025.',
      priority: 'urgent',
      type: 'exam',
      postedBy: 'Dr. Fatima Khan',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 342,
      isPinned: true
    },
    {
      announcementId: 'ann-002',
      title: 'Holiday Announcement',
      content: 'School will remain closed on Eid-ul-Fitr (April 10, 2025).',
      priority: 'high',
      type: 'holiday',
      postedBy: 'Principal Office',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 523,
      isPinned: true
    },
    {
      announcementId: 'ann-003',
      title: 'Assignment Submission Deadline',
      content: 'Please submit your project on "Sustainable Development" by April 30, 2025.',
      priority: 'normal',
      type: 'assignment',
      postedBy: 'Mr. Ahmed Hassan',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 285,
      isPinned: false
    },
    {
      announcementId: 'ann-004',
      title: 'Science Fair 2025',
      content: 'Annual Science Fair will be held on May 5, 2025. Register your project now!',
      priority: 'normal',
      type: 'event',
      postedBy: 'Ms. Zainab Ali',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 412,
      isPinned: false
    }
  ]

  return {
    success: true,
    data: {
      announcements,
      total: announcements.length,
      courseId,
      statistics: {
        byPriority: {
          urgent: 1,
          high: 1,
          normal: 2,
          low: 0
        },
        byType: {
          exam: 1,
          holiday: 1,
          assignment: 1,
          event: 1,
          general: 0
        }
      }
    }
  }
}

/**
 * Generate mock course content
 */
export const generateCourseContent = (courseId = 'course-001') => {
  const content = [
    {
      contentId: 'content-001',
      title: 'Introduction to Algebra',
      type: 'video',
      duration: '25 minutes',
      uploadedBy: 'Dr. Fatima Khan',
      uploadDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 342,
      downloads: 85,
      size: '250 MB',
      url: '/videos/intro-algebra.mp4',
      isPinned: true
    },
    {
      contentId: 'content-002',
      title: 'Algebra Worksheet PDF',
      type: 'document',
      uploadedBy: 'Dr. Fatima Khan',
      uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 287,
      downloads: 156,
      size: '2.5 MB',
      url: '/documents/algebra-worksheet.pdf',
      isPinned: false
    },
    {
      contentId: 'content-003',
      title: 'Algebra Lecture Audio',
      type: 'audio',
      duration: '45 minutes',
      uploadedBy: 'Dr. Fatima Khan',
      uploadDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 156,
      downloads: 42,
      size: '180 MB',
      url: '/audio/algebra-lecture.mp3',
      isPinned: false
    },
    {
      contentId: 'content-004',
      title: 'Algebra Concept Diagram',
      type: 'image',
      uploadedBy: 'Dr. Fatima Khan',
      uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 412,
      downloads: 198,
      size: '5 MB',
      url: '/images/algebra-diagram.png',
      isPinned: false
    },
    {
      contentId: 'content-005',
      title: 'Algebra Fundamentals Presentation',
      type: 'presentation',
      uploadedBy: 'Dr. Fatima Khan',
      uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      viewCount: 325,
      downloads: 128,
      size: '8.5 MB',
      url: '/presentations/algebra-ppt.pptx',
      isPinned: true
    }
  ]

  return {
    success: true,
    data: {
      content,
      total: content.length,
      courseId,
      statistics: {
        byType: {
          video: 1,
          document: 1,
          audio: 1,
          image: 1,
          presentation: 1
        },
        totalSize: '265.5 MB',
        totalViews: 1522,
        totalDownloads: 609
      }
    }
  }
}

/**
 * Generate mock reports
 */
export const generateReports = (branchId = 'branch-001') => {
  const reports = [
    {
      reportId: 'report-001',
      type: 'student-progress',
      title: 'Grade 9 - April 2025 Progress Report',
      status: 'completed',
      generatedBy: 'Admin',
      generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '5.2 MB',
      url: '/reports/progress-grade9.pdf',
      studentCount: 245
    },
    {
      reportId: 'report-002',
      type: 'teacher-performance',
      title: 'Teacher Performance Q1 2025',
      status: 'completed',
      generatedBy: 'Admin',
      generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '3.8 MB',
      url: '/reports/teacher-performance-q1.pdf',
      teacherCount: 28
    },
    {
      reportId: 'report-003',
      type: 'fee-collection',
      title: 'Fee Collection Report - April 2025',
      status: 'pending',
      generatedBy: 'Finance Team',
      generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: null,
      url: null,
      studentCount: 342
    },
    {
      reportId: 'report-004',
      type: 'attendance',
      title: 'Monthly Attendance Summary',
      status: 'completed',
      generatedBy: 'Admin',
      generatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      fileSize: '2.1 MB',
      url: '/reports/attendance-summary.pdf',
      studentCount: 342
    }
  ]

  return {
    success: true,
    data: {
      reports,
      total: reports.length,
      branchId,
      statistics: {
        total: 4,
        completed: 3,
        pending: 1,
        failed: 0
      }
    }
  }
}

/**
 * Simulate API delay for realistic testing
 */
export const simulateDelay = (ms = 800) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get all test data
 */
export const getAllTestData = () => {
  return {
    dashboard: generateDashboardData(),
    enrollment: generateEnrollmentMetrics(),
    attendance: generateAttendanceMetrics(),
    fees: generateFeeMetrics(),
    teachers: generateTeacherMetrics(),
    trends: generateTrendAnalysis(),
    messages: generateMessages(),
    announcements: generateAnnouncements(),
    courseContent: generateCourseContent(),
    reports: generateReports()
  }
}
