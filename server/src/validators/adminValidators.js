const { z } = require("zod");

// ---------- Students ----------

const addStudentSchema = z.object({
  fullName: z.string().min(1, "fullName is required"),
  email: z.string().email("Invalid email address"),
  universityId: z.string().min(1, "universityId is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rollNumber: z.string().min(1, "rollNumber is required"),
  branch: z.string().min(1, "branch is required"),
  semester: z.coerce.number().int().min(1).max(12),
  section: z.string().min(1, "section is required"),
  batch: z.string().min(1, "batch is required"),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  backlogs: z.coerce.number().int().min(0).optional(),
  totalCredits: z.coerce.number().min(0).optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  bloodGroup: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianPhone: z.string().optional(),
});

const updateStudentSchema = addStudentSchema.partial();

// ---------- Faculty ----------

const addFacultySchema = z.object({
  fullName: z.string().min(1, "fullName is required"),
  email: z.string().email("Invalid email address"),
  universityId: z.string().min(1, "universityId is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  employeeId: z.string().min(1, "employeeId is required"),
  department: z.string().min(1, "department is required"),
  designation: z.string().min(1, "designation is required"),
  assignedSubjects: z.array(z.string()).optional(),
});

const updateFacultySchema = addFacultySchema.partial();

// ---------- Subjects ----------

const addSubjectSchema = z.object({
  code: z.string().min(1, "code is required"),
  name: z.string().min(1, "name is required"),
  credits: z.coerce.number().min(1).max(10),
  semester: z.coerce.number().int().min(1).max(12),
  branch: z.string().min(1, "branch is required"),
  faculty: z.string().optional(),
});

const updateSubjectSchema = addSubjectSchema.partial().strict();

// ---------- Marks ----------

const markSubjectSchema = z.object({
  subjectCode: z.string().min(1),
  subjectName: z.string().min(1),
  credits: z.coerce.number().min(0).optional(),
  grade: z.string().optional(),
  marks: z.coerce.number().min(0).optional(),
});

const uploadMarksSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  semester: z.coerce.number().int().min(1).max(12),
  subjects: z.array(markSubjectSchema).min(1, "At least one subject is required"),
  sgpa: z.coerce.number().min(0).max(10).optional(),
  cgpa: z.coerce.number().min(0).max(10).optional(),
});

// ---------- Attendance ----------

const updateAttendanceSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  subjectId: z.string().min(1, "subjectId is required"),
  present: z.coerce.number().min(0),
  absent: z.coerce.number().min(0),
});

// ---------- Fees ----------

const updateFeeSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  semester: z.coerce.number().int().min(1).max(12),
  totalAmount: z.coerce.number().min(0),
  paidAmount: z.coerce.number().min(0),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "partial", "paid"]).optional(),
  transaction: z
    .object({
      amount: z.coerce.number().min(0),
      mode: z.string().optional(),
      reference: z.string().optional(),
      paidOn: z.string().optional(),
    })
    .optional(),
});

module.exports = {
  addStudentSchema,
  updateStudentSchema,
  addFacultySchema,
  updateFacultySchema,
  addSubjectSchema,
  updateSubjectSchema,
  uploadMarksSchema,
  updateAttendanceSchema,
  updateFeeSchema,
};