// Form validation utilities and types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (international format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

// CNIC validation (Pakistan format: XXXXX-XXXXXXX-X)
export const isValidCNIC = (cnic: string): boolean => {
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  return cnicRegex.test(cnic);
};

// Date validation
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

// Student form validation
export interface StudentFormData {
  first_name: string;
  last_name: string;
  personal_email: string;
  personal_phone: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  city: string;
  postal_code: string;
  permanent_address: string;
}

export const validateStudentForm = (
  data: StudentFormData
): ValidationResult => {
  const errors: ValidationError[] = [];

  // First name validation
  if (!data.first_name?.trim()) {
    errors.push({ field: "first_name", message: "First name is required" });
  } else if (data.first_name.length < 2) {
    errors.push({
      field: "first_name",
      message: "First name must be at least 2 characters",
    });
  }

  // Last name validation
  if (!data.last_name?.trim()) {
    errors.push({ field: "last_name", message: "Last name is required" });
  } else if (data.last_name.length < 2) {
    errors.push({
      field: "last_name",
      message: "Last name must be at least 2 characters",
    });
  }

  // Email validation
  if (!data.personal_email?.trim()) {
    errors.push({ field: "personal_email", message: "Email is required" });
  } else if (!isValidEmail(data.personal_email)) {
    errors.push({
      field: "personal_email",
      message: "Please enter a valid email address",
    });
  }

  // Phone validation
  if (!data.personal_phone?.trim()) {
    errors.push({
      field: "personal_phone",
      message: "Phone number is required",
    });
  } else if (!isValidPhone(data.personal_phone)) {
    errors.push({
      field: "personal_phone",
      message: "Please enter a valid phone number",
    });
  }

  // Date of birth validation
  if (!data.date_of_birth) {
    errors.push({
      field: "date_of_birth",
      message: "Date of birth is required",
    });
  } else if (!isValidDate(data.date_of_birth)) {
    errors.push({
      field: "date_of_birth",
      message: "Please enter a valid date",
    });
  }

  // Gender validation
  if (!data.gender) {
    errors.push({ field: "gender", message: "Gender is required" });
  }

  // Nationality validation
  if (!data.nationality?.trim()) {
    errors.push({ field: "nationality", message: "Nationality is required" });
  }

  // City validation
  if (!data.city?.trim()) {
    errors.push({ field: "city", message: "City is required" });
  }

  // Postal code validation
  if (!data.postal_code?.trim()) {
    errors.push({ field: "postal_code", message: "Postal code is required" });
  } else if (!/^\d{5}(-\d{4})?$/.test(data.postal_code)) {
    errors.push({
      field: "postal_code",
      message: "Postal code format is invalid",
    });
  }

  // Address validation
  if (!data.permanent_address?.trim()) {
    errors.push({ field: "permanent_address", message: "Address is required" });
  } else if (data.permanent_address.length < 5) {
    errors.push({
      field: "permanent_address",
      message: "Address must be at least 5 characters",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Teacher form validation
export interface TeacherFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  hire_date: string;
  employment_type: string;
  department: string;
  designation: string;
  qualification_level: string;
  years_of_experience: number;
}

export const validateTeacherForm = (
  data: TeacherFormData
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.first_name?.trim()) {
    errors.push({ field: "first_name", message: "First name is required" });
  }

  if (!data.last_name?.trim()) {
    errors.push({ field: "last_name", message: "Last name is required" });
  }

  if (!data.email?.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!isValidEmail(data.email)) {
    errors.push({
      field: "email",
      message: "Please enter a valid email address",
    });
  }

  if (!data.phone?.trim()) {
    errors.push({ field: "phone", message: "Phone number is required" });
  } else if (!isValidPhone(data.phone)) {
    errors.push({
      field: "phone",
      message: "Please enter a valid phone number",
    });
  }

  if (!data.date_of_birth) {
    errors.push({
      field: "date_of_birth",
      message: "Date of birth is required",
    });
  }

  if (!data.gender) {
    errors.push({ field: "gender", message: "Gender is required" });
  }

  if (!data.department?.trim()) {
    errors.push({ field: "department", message: "Department is required" });
  }

  if (!data.designation?.trim()) {
    errors.push({ field: "designation", message: "Designation is required" });
  }

  if (!data.qualification_level) {
    errors.push({
      field: "qualification_level",
      message: "Qualification level is required",
    });
  }

  if (data.years_of_experience < 0) {
    errors.push({
      field: "years_of_experience",
      message: "Years of experience cannot be negative",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Course form validation
export interface CourseFormData {
  course_name: string;
  course_code: string;
  description: string;
  grade_level: string;
  teacher_id: string;
  max_students: number;
}

export const validateCourseForm = (data: CourseFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!data.course_name?.trim()) {
    errors.push({ field: "course_name", message: "Course name is required" });
  }

  if (!data.course_code?.trim()) {
    errors.push({ field: "course_code", message: "Course code is required" });
  }

  if (!data.description?.trim()) {
    errors.push({ field: "description", message: "Description is required" });
  }

  if (!data.grade_level) {
    errors.push({ field: "grade_level", message: "Grade level is required" });
  }

  if (!data.teacher_id) {
    errors.push({ field: "teacher_id", message: "Teacher is required" });
  }

  if (data.max_students <= 0) {
    errors.push({
      field: "max_students",
      message: "Max students must be greater than 0",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Get error message for a specific field
export const getFieldError = (
  errors: ValidationError[],
  fieldName: string
): string | undefined => {
  return errors.find((error) => error.field === fieldName)?.message;
};

// Check if a field has error
export const hasFieldError = (
  errors: ValidationError[],
  fieldName: string
): boolean => {
  return errors.some((error) => error.field === fieldName);
};
