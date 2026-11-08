// Built-in sample exam, shown until the teacher publishes one from a PDF.
const SAMPLE_EXAM={id:"sample",title:"Exam 1 · Programming Basics",qs:[
// SAMPLE QUESTIONS - replace with real ones (max 15). a = index of correct option.
{q:"What does a variable do in a program?",o:["Stores a value under a name","Draws a picture","Turns the computer off","Fixes errors automatically"],a:0,why:"A variable is a named box in memory. You can put a value in it and read or change it later."},
{q:"How many lines does this program print?",c:"for i in range(3):\n    print(i)",o:["1","2","3","4"],a:2,why:"range(3) gives 0, 1, 2. The loop body runs three times, so print runs three times."},
{q:"Which of these is a Boolean value?",o:["\"hello\"","42","True","3.14"],a:2,why:"A Boolean is only True or False. The others are text, an integer and a decimal number."},
{q:"What is printed?",c:"x = 5\nx = x + 2\nprint(x)",o:["5","7","2","x + 2"],a:1,why:"x starts at 5, then x + 2 is 7 and is stored back in x. So 7 is printed."},
{q:"What is an algorithm?",o:["A kind of keyboard","Step-by-step instructions to solve a problem","A programming error","A web browser"],a:1,why:"An algorithm is a clear list of steps that solves a problem, like a recipe."}]};
