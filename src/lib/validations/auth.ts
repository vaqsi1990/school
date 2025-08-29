import { z } from "zod"

// Login form validation
export const loginSchema = z.object({
  email: z.string().email("გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა"),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Registration form validation
export const registrationSchema = z.object({
  userType: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
  
  // Common fields
  email: z.string().email("გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა").min(1, "ელ-ფოსტა საჭიროა"),
  password: z.string().min(6, "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს"),
  confirmPassword: z.string(),
  
  // Student specific fields
  studentName: z.string().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
  studentLastname: z.string().min(2, "გვარი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
  grade: z.number().min(1, "კლასი უნდა იყოს მინიმუმ 1").max(12, "კლასი უნდა იყოს მაქსიმუმ 12").optional(),
  school: z.string().min(2, "სკოლის სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
  studentPhone: z.string().min(9, "ტელეფონის ნომერი უნდა შეიცავდეს მინიმუმ 9 ციფრს").optional(),
  
  // Teacher specific fields
  teacherName: z.string().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
  teacherLastname: z.string().min(2, "გვარი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
  subject: z.string().min(2, "საგნის სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
  teacherSchool: z.string().min(2, "სკოლის სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
  teacherPhone: z.string().min(9, "ტელეფონის ნომერი უნდა შეიცავდეს მინიმუმ 9 ციფრს").optional(),
  
  // Admin specific fields
  adminName: z.string().min(2, "სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
  adminLastname: z.string().min(2, "გვარი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს").optional(),
}).refine((data) => {
  // Password confirmation check
  if (data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: "პაროლები არ ემთხვევა",
  path: ["confirmPassword"],
}).refine((data) => {
  // Student validation
  if (data.userType === "STUDENT") {
    return data.studentName && data.studentLastname && data.grade && data.school && data.studentPhone
  }
  return true
}, {
  message: "გთხოვთ შეავსოთ ყველა საჭირო ველი სტუდენტისთვის",
  path: ["studentName"],
}).refine((data) => {
  // Teacher validation
  if (data.userType === "TEACHER") {
    return data.teacherName && data.teacherLastname && data.subject && data.teacherSchool && data.teacherPhone
  }
  return true
}, {
  message: "გთხოვთ შეავსოთ ყველა საჭირო ველი მასწავლებლისთვის",
  path: ["teacherName"],
}).refine((data) => {
  // Admin validation
  if (data.userType === "ADMIN") {
    return data.adminName && data.adminLastname
  }
  return true
}, {
  message: "გთხოვთ შეავსოთ ყველა საჭირო ველი ადმინისტრატორისთვის",
  path: ["adminName"],
})

export type RegistrationFormData = z.infer<typeof registrationSchema>
