import re

filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    text = f.read()

# Remove imports
text = text.replace("import TasksTab from './_tabs/TasksTab';\n", "")
text = text.replace("import GradingTab from './_tabs/GradingTab';\n", "")

# Remove activeTab types
text = text.replace("'tasks' | 'grading' | ", "")

# Remove the tabs rendering
text = re.sub(r"        \{\/\* PENDING TASKS TAB \*\/\}.*?<\/TasksTab>\n        \)\}\n", "", text, flags=re.DOTALL)
text = re.sub(r"        \{\/\* PENDING GRADING TAB \(FACULTY\) \*\/\}.*?<\/GradingTab>\n        \)\}\n\n", "", text, flags=re.DOTALL)

# Remove from tab buttons
text = re.sub(r"\s*\{\(isStudent \? \['lessons'.*?\)\.map\(\(tab\) => \(\n.*?\)\)\}", """
              {(isStudent 
                ? ['lessons', 'sessions', 'materials', 'quizzes', 'assignments', 'progress', 'doubts']
                : ['overview', 'lessons', 'sessions', 'materials', 'quizzes', 'assignments', 'roster', 'progress', 'doubts']
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-all border-b-2 ${
                    activeTab === tab 
                      ? 'border-primary text-primary bg-primary/5' 
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                  }`}
                >
                  {tab === 'lessons' ? 'Recorded Lessons' : tab === 'sessions' ? 'Live Sessions' : tab === 'materials' ? `Materials (${materials.length})` : tab === 'quizzes' ? `Quizzes (${quizzes.length})` : tab === 'assignments' ? `Assignments (${assignments.length})` : tab === 'progress' ? (isStudent ? 'My Progress' : 'Course Analytics') : tab === 'doubts' ? 'Doubt Portal' : `Class Roster (${students.length + courseFaculty.length})`}
                </button>
              ))}
""", text, flags=re.DOTALL)

with open(filepath, "w") as f:
    f.write(text)

print("Tasks and Grading tabs removed.")
