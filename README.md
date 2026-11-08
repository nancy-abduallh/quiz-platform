# Bytewise Exams

A desktop-only MCQ exam website with instant results, tab-leave tracking and a teacher area.

## Files
- `index.html`: page structure (student exam, results, teacher area)
- `css/style.css`: all design (colors, layout, animation, dark mode)
- `js/storage.js`: saving and loading (the only file to change if you add your own backend)
- `js/pdf-import.js`: reads a PDF and turns it into an exam
- `js/app.js`: student side (exam, tab lock, results)
- `js/teacher.js`: teacher side (PDF upload, publish, results table)
- `js/main.js`: start-up
- `favicon.svg`: the tab icon
- `build.py`: makes one single file, `dist/exam-platform.html`
- `samples/sample-exam.pdf`: a PDF in the right format to try the upload

## Run it
Open `index.html` in a browser (internet needed for fonts and the PDF reader).
Open `index.html#teacher` for the teacher area.
Opened this way, data is saved in that browser only. For results to reach you from your student's own computer you need a backend (database) and hosting, and `storage.js` is where it plugs in.

## PDF format
```
Exam: Exam 2 - Loops and Conditions

Q1. Question text
Code:
for i in range(3):
    print(i)
A) option
B) option
C) option
D) option
Answer: B
Explanation: why B is right
```
Max 15 questions, 2 to 4 options each. "Code:" is optional. The PDF needs real text, not a scanned photo.
