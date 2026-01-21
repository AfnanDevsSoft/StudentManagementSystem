import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Afnan Devs SMS API',
      version: '1.0.0',
      description: 'Comprehensive REST API for managing educational institutions with multi-branch support, student enrollment, academic management, and administrative functions.',
      contact: {
        name: 'Afnan Devs SMS Support',
        email: 'support@afnandevssms.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password', 'first_name', 'last_name', 'branch_id', 'role_id'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            branch_id: {
              type: 'string',
              format: 'uuid',
              description: 'Branch ID',
            },
            role_id: {
              type: 'string',
              format: 'uuid',
              description: 'Role ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            first_name: {
              type: 'string',
              description: 'First name',
            },
            last_name: {
              type: 'string',
              description: 'Last name',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            is_active: {
              type: 'boolean',
              default: true,
              description: 'User active status',
            },
            last_login: {
              type: 'string',
              format: 'date-time',
              description: 'Last login timestamp',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        Branch: {
          type: 'object',
          required: ['name', 'code'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            name: {
              type: 'string',
              description: 'Branch name',
            },
            code: {
              type: 'string',
              description: 'Unique branch code',
            },
            address: {
              type: 'string',
              description: 'Physical address',
            },
            city: {
              type: 'string',
              description: 'City',
            },
            state: {
              type: 'string',
              description: 'State/Province',
            },
            country: {
              type: 'string',
              description: 'Country',
            },
            phone: {
              type: 'string',
              description: 'Contact phone',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Contact email',
            },
            principal_name: {
              type: 'string',
              description: 'Principal name',
            },
            principal_email: {
              type: 'string',
              format: 'email',
              description: 'Principal email',
            },
            timezone: {
              type: 'string',
              description: 'Timezone',
            },
            currency: {
              type: 'string',
              description: 'Currency code',
            },
            is_active: {
              type: 'boolean',
              default: true,
              description: 'Branch active status',
            },
          },
        },
        Student: {
          type: 'object',
          required: ['branch_id', 'student_code', 'first_name', 'last_name', 'date_of_birth', 'admission_date'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            branch_id: {
              type: 'string',
              format: 'uuid',
              description: 'Branch ID',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'Associated user ID',
            },
            student_code: {
              type: 'string',
              description: 'Unique student code',
            },
            first_name: {
              type: 'string',
              description: 'First name',
            },
            last_name: {
              type: 'string',
              description: 'Last name',
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              description: 'Date of birth',
            },
            gender: {
              type: 'string',
              enum: ['Male', 'Female', 'Other'],
              description: 'Gender',
            },
            admission_date: {
              type: 'string',
              format: 'date',
              description: 'Admission date',
            },
            admission_status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              default: 'pending',
              description: 'Admission status',
            },
            is_active: {
              type: 'boolean',
              default: true,
              description: 'Student active status',
            },
          },
        },
        Teacher: {
          type: 'object',
          required: ['branch_id', 'employee_code', 'first_name', 'last_name', 'email', 'hire_date'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            branch_id: {
              type: 'string',
              format: 'uuid',
              description: 'Branch ID',
            },
            user_id: {
              type: 'string',
              format: 'uuid',
              description: 'Associated user ID',
            },
            employee_code: {
              type: 'string',
              description: 'Unique employee code',
            },
            first_name: {
              type: 'string',
              description: 'First name',
            },
            last_name: {
              type: 'string',
              description: 'Last name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
            },
            hire_date: {
              type: 'string',
              format: 'date',
              description: 'Hire date',
            },
            designation: {
              type: 'string',
              description: 'Job designation',
            },
            is_active: {
              type: 'boolean',
              default: true,
              description: 'Teacher active status',
            },
          },
        },
        Course: {
          type: 'object',
          required: ['branch_id', 'academic_year_id', 'subject_id', 'grade_level_id', 'teacher_id', 'course_name', 'course_code'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            branch_id: {
              type: 'string',
              format: 'uuid',
              description: 'Branch ID',
            },
            academic_year_id: {
              type: 'string',
              format: 'uuid',
              description: 'Academic year ID',
            },
            subject_id: {
              type: 'string',
              format: 'uuid',
              description: 'Subject ID',
            },
            grade_level_id: {
              type: 'string',
              format: 'uuid',
              description: 'Grade level ID',
            },
            teacher_id: {
              type: 'string',
              format: 'uuid',
              description: 'Assigned teacher ID',
            },
            course_code: {
              type: 'string',
              description: 'Unique course code',
            },
            course_name: {
              type: 'string',
              description: 'Course name',
            },
            description: {
              type: 'string',
              description: 'Course description',
            },
            max_students: {
              type: 'integer',
              default: 40,
              description: 'Maximum enrollment',
            },
            room_number: {
              type: 'string',
              description: 'Classroom number',
            },
            credits: {
              type: 'number',
              description: 'Course credits',
            },
          },
        },
        StudentEnrollment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            student_id: {
              type: 'string',
              format: 'uuid',
              description: 'Student ID',
            },
            course_id: {
              type: 'string',
              format: 'uuid',
              description: 'Course ID',
            },
            enrollment_date: {
              type: 'string',
              format: 'date',
              description: 'Enrollment date',
            },
            status: {
              type: 'string',
              enum: ['active', 'completed', 'dropped', 'suspended'],
              description: 'Enrollment status',
            },
          },
        },
        Grade: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            student_id: {
              type: 'string',
              format: 'uuid',
              description: 'Student ID',
            },
            course_id: {
              type: 'string',
              format: 'uuid',
              description: 'Course ID',
            },
            marks_obtained: {
              type: 'number',
              description: 'Marks obtained',
            },
            total_marks: {
              type: 'number',
              description: 'Total marks',
            },
            grade: {
              type: 'string',
              description: 'Letter grade (A, B, C, etc)',
            },
            assessment_type: {
              type: 'string',
              description: 'Type of assessment',
            },
          },
        },
        Attendance: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            student_id: {
              type: 'string',
              format: 'uuid',
              description: 'Student ID',
            },
            course_id: {
              type: 'string',
              format: 'uuid',
              description: 'Course ID',
            },
            attendance_date: {
              type: 'string',
              format: 'date',
              description: 'Attendance date',
            },
            status: {
              type: 'string',
              enum: ['present', 'absent', 'leave', 'late'],
              description: 'Attendance status',
            },
            remarks: {
              type: 'string',
              description: 'Attendance remarks',
            },
          },
        },
        TeacherAttendance: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Unique identifier',
            },
            teacher_id: {
              type: 'string',
              format: 'uuid',
              description: 'Teacher ID',
            },
            attendance_date: {
              type: 'string',
              format: 'date',
              description: 'Attendance date',
            },
            check_in_time: {
              type: 'string',
              format: 'time',
              description: 'Check-in time',
            },
            check_out_time: {
              type: 'string',
              format: 'time',
              description: 'Check-out time',
            },
            status: {
              type: 'string',
              enum: ['present', 'absent', 'leave', 'late'],
              description: 'Attendance status',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'Password',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              description: 'JWT access token',
            },
            refresh_token: {
              type: 'string',
              description: 'JWT refresh token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            expires_in: {
              type: 'integer',
              description: 'Token expiration time in seconds',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1,
                },
                limit: {
                  type: 'integer',
                  example: 20,
                },
                total: {
                  type: 'integer',
                  example: 100,
                },
                pages: {
                  type: 'integer',
                  example: 5,
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login',
          description: 'Authenticate user and receive JWT tokens',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest',
                },
                example: {
                  username: 'admin1',
                  password: 'password123',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse',
                  },
                },
              },
            },
            401: {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh JWT token',
          description: 'Get a new access token using refresh token',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/AuthResponse',
                  },
                },
              },
            },
            401: {
              description: 'Invalid or expired refresh token',
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'User logout',
          description: 'Invalidate user session',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Logout successful',
            },
          },
        },
      },
      '/branches': {
        get: {
          tags: ['Branches'],
          summary: 'List all branches',
          description: 'Get paginated list of branches with optional search',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
              description: 'Items per page',
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search by name or code',
            },
          ],
          responses: {
            200: {
              description: 'List of branches',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PaginatedResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Branches'],
          summary: 'Create a new branch',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Branch',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Branch created successfully',
            },
          },
        },
      },
      '/branches/{id}': {
        get: {
          tags: ['Branches'],
          summary: 'Get branch details',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Branch ID',
            },
          ],
          responses: {
            200: {
              description: 'Branch details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Branch',
                  },
                },
              },
            },
            404: {
              description: 'Branch not found',
            },
          },
        },
        put: {
          tags: ['Branches'],
          summary: 'Update branch',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Branch',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Branch updated successfully',
            },
          },
        },
        delete: {
          tags: ['Branches'],
          summary: 'Delete branch',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Branch deleted successfully',
            },
          },
        },
      },
      '/users': {
        get: {
          tags: ['Users'],
          summary: 'List all users',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search by username, email, or name',
            },
          ],
          responses: {
            200: {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PaginatedResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'User created successfully',
            },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get user details',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'User details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User',
                  },
                },
              },
            },
            404: {
              description: 'User not found',
            },
          },
        },
        put: {
          tags: ['Users'],
          summary: 'Update user',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'User updated successfully',
            },
          },
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete user',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'User deleted successfully',
            },
          },
        },
      },
      '/students': {
        get: {
          tags: ['Students'],
          summary: 'List all students',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search by name or email',
            },
          ],
          responses: {
            200: {
              description: 'List of students',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PaginatedResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Students'],
          summary: 'Create a new student',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Student',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Student created successfully',
            },
          },
        },
      },
      '/students/{id}': {
        get: {
          tags: ['Students'],
          summary: 'Get student details',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Student details with enrollments',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Student',
                  },
                },
              },
            },
            404: {
              description: 'Student not found',
            },
          },
        },
        put: {
          tags: ['Students'],
          summary: 'Update student',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Student',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Student updated successfully',
            },
          },
        },
      },
      '/students/{id}/enrollment': {
        get: {
          tags: ['Students'],
          summary: 'Get student enrollments',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Student ID',
            },
          ],
          responses: {
            200: {
              description: 'List of student enrollments',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/StudentEnrollment',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/students/{id}/grades': {
        get: {
          tags: ['Students'],
          summary: 'Get student grades',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Student ID',
            },
          ],
          responses: {
            200: {
              description: 'List of student grades',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Grade',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/students/{id}/attendance': {
        get: {
          tags: ['Students'],
          summary: 'Get student attendance records',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Student ID',
            },
          ],
          responses: {
            200: {
              description: 'List of attendance records',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Attendance',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/teachers': {
        get: {
          tags: ['Teachers'],
          summary: 'List all teachers',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search by name or email',
            },
          ],
          responses: {
            200: {
              description: 'List of teachers',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PaginatedResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Teachers'],
          summary: 'Create a new teacher',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Teacher',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Teacher created successfully',
            },
          },
        },
      },
      '/teachers/{id}': {
        get: {
          tags: ['Teachers'],
          summary: 'Get teacher details',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Teacher details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Teacher',
                  },
                },
              },
            },
            404: {
              description: 'Teacher not found',
            },
          },
        },
        put: {
          tags: ['Teachers'],
          summary: 'Update teacher',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Teacher',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Teacher updated successfully',
            },
          },
        },
      },
      '/teachers/{id}/courses': {
        get: {
          tags: ['Teachers'],
          summary: "Get teacher's courses",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Teacher ID',
            },
          ],
          responses: {
            200: {
              description: 'List of courses taught by teacher',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Course',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/teachers/{id}/attendance': {
        get: {
          tags: ['Teachers'],
          summary: "Get teacher's attendance records",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Teacher ID',
            },
          ],
          responses: {
            200: {
              description: 'List of attendance records',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/TeacherAttendance',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/courses': {
        get: {
          tags: ['Courses'],
          summary: 'List all courses',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search by course name or code',
            },
          ],
          responses: {
            200: {
              description: 'List of courses',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PaginatedResponse',
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Courses'],
          summary: 'Create a new course',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Course',
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Course created successfully',
            },
          },
        },
      },
      '/courses/{id}': {
        get: {
          tags: ['Courses'],
          summary: 'Get course details',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            200: {
              description: 'Course details with enrollments',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Course',
                  },
                },
              },
            },
            404: {
              description: 'Course not found',
            },
          },
        },
        put: {
          tags: ['Courses'],
          summary: 'Update course',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Course',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Course updated successfully',
            },
          },
        },
      },
      '/courses/{id}/enrollments': {
        get: {
          tags: ['Courses'],
          summary: 'Get course enrollments',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Course ID',
            },
          ],
          responses: {
            200: {
              description: 'List of course enrollments',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/StudentEnrollment',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/courses/{id}/students': {
        get: {
          tags: ['Courses'],
          summary: 'Get students enrolled in course',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Course ID',
            },
          ],
          responses: {
            200: {
              description: 'List of enrolled students',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Student',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Courses'],
          summary: 'Enroll student in course',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Course ID',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    student_id: {
                      type: 'string',
                      format: 'uuid',
                      description: 'Student ID',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Student enrolled successfully',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
