import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    text = f.read()

# Imports
text = text.replace("import ProgressTab from './_tabs/ProgressTab';", "import TasksTab from './_tabs/TasksTab';\nimport GradingTab from './_tabs/GradingTab';")

# Replace Tasks Tab
tasks_replacement = """        {/* PENDING TASKS TAB */}
        {activeTab === 'tasks' && isStudent && (
          <TasksTab
            assignments={assignments}
            quizzes={quizzes}
            studentCourseProgress={studentCourseProgress}
            setActiveTab={setActiveTab}
            setSelectedAssignment={setSelectedAssignment}
            setSelectedQuiz={setSelectedQuiz}
            fetchQuizAttempts={fetchQuizAttempts}
          />
        )}"""

text = re.sub(r"        \{\/\* PENDING TASKS TAB \*\/\}.*?(?=        \{\/\* PENDING GRADING TAB \(FACULTY\) \*\/\})", tasks_replacement + "\n\n", text, flags=re.DOTALL)

# Replace Grading Tab
grading_replacement = """        {/* PENDING GRADING TAB (FACULTY) */}
        {activeTab === 'grading' && !isStudent && (
          <GradingTab
            pendingGrading={pendingGrading}
            setActiveTab={setActiveTab}
            setSelectedAssignment={setSelectedAssignment}
            fetchSubmissions={fetchSubmissions}
            setSelectedQuiz={setSelectedQuiz}
            fetchQuizAttempts={fetchQuizAttempts}
          />
        )}"""

text = re.sub(r"        \{\/\* PENDING GRADING TAB \(FACULTY\) \*\/\}.*?(?=        \{\/\* 0\. RECORDED LESSONS TAB \*\/\})", grading_replacement + "\n\n", text, flags=re.DOTALL)


with open(filepath, "w") as f:
    f.write(text)

print("page.tsx updated with Tasks and Grading tabs.")
