const { z } = require("zod");

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

const updateAttendanceSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  subjectId: z.string().min(1, "subjectId is required"),
  present: z.coerce.number().min(0),
  absent: z.coerce.number().min(0),
});

module.exports = {
  markSubjectSchema,
  uploadMarksSchema,
  updateAttendanceSchema,
};