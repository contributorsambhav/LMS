filepath = "/home/sambhav/TBT/Lms/Tech/client/src/app/dashboard/courses/[id]/page.tsx"
with open(filepath, "r") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "{showEditModal && (" in line:
        start_idx = i
        break

for i in range(len(lines)-1, -1, -1):
    if "</main>" in lines[i]:
        end_idx = i - 1
        break

print(f"Modals start at: {start_idx}")
print(f"Modals end at: {end_idx}")
