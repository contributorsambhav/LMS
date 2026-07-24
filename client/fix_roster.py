with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/RosterTab.tsx", "r") as f:
    text = f.read()

# Fix imports
text = text.replace("import { Users, UserCheck, UserMinus, Plus, Mail } from 'lucide-react';",
                    "import { Users, UserCheck, UserMinus, Plus, Mail, Trash2 } from 'lucide-react';")

# Fix props interface
missing_props = """  pendingEnrollments: any;
  handleResolveEnrollment: any;
  courseFaculty: any;
  handleUnassignFaculty: any;
  students: any;
"""
text = text.replace("  handleRemoveFaculty: any;", "  handleRemoveFaculty: any;\n" + missing_props)

missing_destructure = """    pendingEnrollments,
    handleResolveEnrollment,
    courseFaculty,
    handleUnassignFaculty,
    students,
"""
text = text.replace("    handleRemoveFaculty,", "    handleRemoveFaculty,\n" + missing_destructure)

# Fix implicit anys
text = text.replace("pendingEnrollments.map((req)", "pendingEnrollments.map((req: any)")
text = text.replace("courseFaculty.map((fac)", "courseFaculty.map((fac: any)")
text = text.replace("students.map((student)", "students.map((student: any)")

with open("/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/_tabs/RosterTab.tsx", "w") as f:
    f.write(text)

