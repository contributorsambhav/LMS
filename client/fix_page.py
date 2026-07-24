import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    text = f.read()

# Imports
imports_replacement = """import FacultyProgress from '../../../../components/FacultyProgress';
import LessonsTab from './_tabs/LessonsTab';
import SessionsTab from './_tabs/SessionsTab';
import MaterialsTab from './_tabs/MaterialsTab';
import QuizzesTab from './_tabs/QuizzesTab';
import AssignmentsTab from './_tabs/AssignmentsTab';
import RosterTab from './_tabs/RosterTab';
import ProgressTab from './_tabs/ProgressTab';
import CourseDoubts from '../../../../components/CourseDoubts';"""

# Fix import replacements: `import FacultyProgress from '../../../../components/FacultyProgress';` is at the end of imports, we'll replace it to include all.
text = text.replace("import FacultyProgress from '../../../../components/FacultyProgress';", imports_replacement)

# Replace 0. RECORDED LESSONS TAB
lessons_replacement = """        {/* 0. RECORDED LESSONS TAB */}
        {activeTab === 'lessons' && (
          <LessonsTab
            lessons={lessons}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            isStudent={isStudent}
            setShowAddLessonModal={setShowAddLessonModal}
            handleDeleteLesson={handleDeleteLesson}
            handleUpdateProgress={handleUpdateProgress}
          />
        )}"""

text = re.sub(r"        \{\/\* 0\. RECORDED LESSONS TAB \*\/\}.*?(?=        \{\/\* 1\. SESSIONS TAB \*\/\})", lessons_replacement + "\n\n", text, flags=re.DOTALL)

# Replace 1. SESSIONS TAB
sessions_replacement = """        {/* 1. SESSIONS TAB */}
        {activeTab === 'sessions' && (
          <SessionsTab
            sessions={sessions}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            setShowAddSessionModal={setShowAddSessionModal}
            setSessionStart={setSessionStart}
            setSessionEnd={setSessionEnd}
          />
        )}"""

text = re.sub(r"        \{\/\* 1\. SESSIONS TAB \*\/\}.*?(?=        \{\/\* 2\. MATERIALS TAB \*\/\})", sessions_replacement + "\n\n", text, flags=re.DOTALL)

# Replace 2. MATERIALS TAB
materials_replacement = """        {/* 2. MATERIALS TAB */}
        {activeTab === 'materials' && (
          <MaterialsTab
            materials={materials}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            setShowAddMaterialModal={setShowAddMaterialModal}
          />
        )}"""

text = re.sub(r"        \{\/\* 2\. MATERIALS TAB \*\/\}.*?(?=        \{\/\* QUIZZES TAB \*\/\})", materials_replacement + "\n\n", text, flags=re.DOTALL)

# Replace QUIZZES TAB
quizzes_replacement = """        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && (
          <QuizzesTab
            quizzes={quizzes}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            isStudent={isStudent}
            selectedQuiz={selectedQuiz}
            setSelectedQuiz={setSelectedQuiz}
            quizAttempts={quizAttempts}
            quizAttemptsLoading={quizAttemptsLoading}
            quizAttemptsError={quizAttemptsError}
            fetchQuizAttempts={fetchQuizAttempts}
            studentCourseProgress={studentCourseProgress}
            setShowAddQuizModal={setShowAddQuizModal}
            setQuizQuestions={setQuizQuestions}
            setQuizTitle={setQuizTitle}
            setQuizDesc={setQuizDesc}
            setQuizTimeLimit={setQuizTimeLimit}
            handleOpenEditQuiz={handleOpenEditQuiz}
            handleDeleteQuiz={handleDeleteQuiz}
            setShowTakeQuizModal={setShowTakeQuizModal}
            setShowViewAttemptsModal={setShowViewAttemptsModal}
            setShowGradeAttemptModal={setShowGradeAttemptModal}
            setSelectedAttempt={setSelectedAttempt}
            handleStartQuizAttempt={handleStartQuizAttempt}
            setQuizAnswers={setQuizAnswers}
            setQuizTimeRemaining={setQuizTimeRemaining}
            setGradeQuizScore={setGradeQuizScore}
            setGradeQuizFeedback={setGradeQuizFeedback}
            setSubjectiveGrades={setSubjectiveGrades}
            handleSubmitQuizAttempt={handleSubmitQuizAttempt}
          />
        )}"""

text = re.sub(r"        \{\/\* QUIZZES TAB \*\/\}.*?(?=        \{\/\* ASSIGNMENTS TAB \*\/\})", quizzes_replacement + "\n\n", text, flags=re.DOTALL)

# Replace ASSIGNMENTS TAB
assignments_replacement = """        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <AssignmentsTab
            assignments={assignments}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            isStudent={isStudent}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={setSelectedAssignment}
            setShowAddAssignmentModal={setShowAddAssignmentModal}
            handleDeleteAssignment={handleDeleteAssignment}
            studentCourseProgress={studentCourseProgress}
            setShowSubmitAssignmentModal={setShowSubmitAssignmentModal}
            submissions={submissions}
            submissionsLoading={submissionsLoading}
            fetchSubmissions={fetchSubmissions}
            setShowGradeSubmissionModal={setShowGradeSubmissionModal}
            setSelectedSubmission={setSelectedSubmission}
            setAssignmentTitle={setAssignmentTitle}
            setAssignmentDesc={setAssignmentDesc}
            setAssignmentDeadline={setAssignmentDeadline}
            setAssignmentTotalMarks={setAssignmentTotalMarks}
            setSelectedSubmissionsAssignment={setSelectedSubmissionsAssignment}
            setGradeSubmissionScore={setGradeSubmissionScore}
            setGradeSubmissionFeedback={setGradeSubmissionFeedback}
          />
        )}"""

text = re.sub(r"        \{\/\* ASSIGNMENTS TAB \*\/\}.*?(?=        \{\/\* 3\. ROSTER TAB \*\/\})", assignments_replacement + "\n\n", text, flags=re.DOTALL)

# Replace ROSTER TAB
roster_replacement = """        {/* 3. ROSTER TAB */}
        {activeTab === 'roster' && (
          <RosterTab
            students={students}
            isAdmin={isAdmin}
            isFaculty={isFaculty}
            course={course}
            setShowAddStudentModal={setShowAddStudentModal}
            handleRemoveStudent={handleRemoveStudent}
            setShowAssignFacultyModal={setShowAssignFacultyModal}
            handleRemoveFaculty={handleRemoveFaculty}
            pendingEnrollments={pendingRequests}
            handleResolveEnrollment={handleResolveEnrollment}
            courseFaculty={courseFaculty}
            handleUnassignFaculty={handleUnassignFaculty}
          />
        )}"""

text = re.sub(r"        \{\/\* 3\. ROSTER TAB \*\/\}.*?(?=        \{\/\* 4\. PROGRESS \/ ANALYTICS TAB \*\/\})", roster_replacement + "\n\n", text, flags=re.DOTALL)

# Replace PROGRESS TAB
progress_replacement = """        {/* 4. PROGRESS / ANALYTICS TAB */}
        {activeTab === 'progress' && (
          isStudent ? (
            <StudentProgress courseId={courseId} />
          ) : (
            <FacultyProgress courseId={courseId} />
          )
        )}
        
        {/* 5. DOUBT PORTAL TAB */}
        {activeTab === 'doubts' && (
          <CourseDoubts courseId={courseId} />
        )}
      </div>"""

text = re.sub(r"        \{\/\* 4\. PROGRESS \/ ANALYTICS TAB \*\/\}.*?      <\/div>", progress_replacement, text, flags=re.DOTALL)


with open(filepath, "w") as f:
    f.write(text)

print("page.tsx updated with ALL tabs components.")
