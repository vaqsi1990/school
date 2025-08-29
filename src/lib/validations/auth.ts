import { z } from "zod"

// Login form validation
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration form validation
export const registrationSchema = z.object({
  userType: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
  
  // Common fields
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  
  // Student specific fields
  studentName: z.string().min(2, "First name must be at least 2 characters").optional(),
  studentLastname: z.string().min(2, "Last name must be at least 2 characters").optional(),
  grade: z.number().min(1, "Grade must be at least 1").max(12, "Grade must be at most 12").optional(),
  school: z.string().min(2, "School name must be at least 2 characters").optional(),
  studentPhone: z.string().min(9, "Phone number must be at least 9 digits").optional(),
  
  // Teacher specific fields
  teacherName: z.string().min(2, "First name must be at least 2 characters").optional(),
  teacherLastname: z.string().min(2, "Last name must be at least 2 characters").optional(),
  subject: z.string().min(2, "Subject name must be at least 2 characters").optional(),
  teacherSchool: z.string().min(2, "School name must be at least 2 characters").optional(),
  teacherPhone: z.string().min(9, "Phone number must be at least 9 digits").optional(),
  
  // Admin specific fields
  adminName: z.string().min(2, "First name must be at least 2 characters").optional(),
  adminLastname: z.string().min(2, "Last name must be at least 2 characters").optional(),
}).refine((data) => {
  // Password confirmation check
  if (data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => {
  // Student validation
  if (data.userType === "STUDENT") {
    return data.studentName && data.studentLastname && data.grade && data.school && data.studentPhone
  }
  return true
}, {
  message: "Please fill in all required fields for student",
  path: ["studentName"],
}).refine((data) => {
  // Teacher validation
  if (data.userType === "TEACHER") {
    return data.teacherName && data.teacherLastname && data.subject && data.teacherSchool && data.teacherPhone
  }
  return true
}, {
  message: "Please fill in all required fields for teacher",
  path: ["teacherName"],
}).refine((data) => {
  // Admin validation
  if (data.userType === "ADMIN") {
    return data.adminName && data.adminLastname
  }
  return true
}, {
  message: "Please fill in all required fields for admin",
  path: ["adminName"],
})

export type RegistrationFormData = z.infer<typeof registrationSchema>
