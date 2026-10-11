// Check and exam-style questions, written for this app (not copied from past papers).
// Exam rules respected: no calculators (working by hand), storage uses 1024 not 1000.
//
// MCQ:   `answer` is the correct option; markScheme[0] is the explanation shown when wrong.
// SHORT: `answer` is a model answer; `markScheme` lists the points the AI marker awards marks for.

export type SeedQuestion = {
  id: string;
  objectiveId: string;
  type: "MCQ" | "SHORT";
  prompt: string;
  options?: string[];
  answer: string;
  markScheme: string[];
  marks: number;
};

// ---------- 1.1 Number systems (built in full) ----------
const numberSystems: SeedQuestion[] = [
  {
    id: "1.1-1",
    objectiveId: "1.1.1",
    type: "MCQ",
    prompt: "Why do computers use binary to represent all data?",
    options: [
      "Their circuits are made of switches and logic gates that only have two states, on and off",
      "Binary numbers are shorter than denary numbers",
      "Binary is easier for humans to read",
      "Computers can only store numbers up to 255",
    ],
    answer: "Their circuits are made of switches and logic gates that only have two states, on and off",
    markScheme: [
      "A computer's circuits (switches, logic gates, registers) have two states, on/off, which map to 1 and 0. Binary is actually longer than denary, not shorter.",
    ],
    marks: 1,
  },
  {
    id: "1.1-2",
    objectiveId: "1.1.2",
    type: "SHORT",
    prompt: "Convert the denary number 179 into 8-bit binary. Show your working.",
    answer: "128 + 32 + 16 + 2 + 1 = 179, so 179 = 10110011",
    markScheme: [
      "1 mark: working shows the place values used (e.g. 128 + 32 + 16 + 2 + 1) or repeated division by 2",
      "1 mark: correct answer 10110011",
    ],
    marks: 2,
  },
  {
    id: "1.1-3",
    objectiveId: "1.1.2",
    type: "MCQ",
    prompt: "What is the hexadecimal number 3F in denary?",
    options: ["63", "315", "48", "53"],
    answer: "63",
    markScheme: [
      "3F means 3 sixteens and F (15) ones: 3 × 16 = 48, then 48 + 15 = 63.",
    ],
    marks: 1,
  },
  {
    id: "1.1-4",
    objectiveId: "1.1.3",
    type: "SHORT",
    prompt: "Give two reasons why programmers often use hexadecimal instead of binary.",
    answer: "Hexadecimal is much shorter than binary, so it is easier for humans to read and remember, and fewer mistakes are made when copying it.",
    markScheme: [
      "1 mark per point, maximum 2:",
      "Shorter / fewer digits than binary (one hex digit represents 4 bits)",
      "Easier for humans to read, understand or remember",
      "Fewer errors when reading, writing or typing the value",
      "Quick and simple to convert to and from binary",
    ],
    marks: 2,
  },
  {
    id: "1.1-5",
    objectiveId: "1.1.4",
    type: "SHORT",
    prompt:
      "Add the 8-bit binary numbers 10110110 and 01100101. Give the 8-bit result and explain what has happened.",
    answer:
      "The 8-bit result is 00011011 and an overflow error has occurred, because the real answer (283) is greater than 255 and needs 9 bits.",
    markScheme: [
      "1 mark: correct 8-bit result 00011011",
      "1 mark: states that an overflow (error) has occurred",
      "1 mark: explains why, e.g. the answer is greater than 255 / needs a 9th bit / a 1 is carried out of the 8-bit register",
    ],
    marks: 3,
  },
  {
    id: "1.1-6",
    objectiveId: "1.1.5",
    type: "MCQ",
    prompt: "What is the result of a logical left shift of 2 places on 00010110?",
    options: ["01011000", "00000101", "01011011", "10110000"],
    answer: "01011000",
    markScheme: [
      "Every bit moves 2 places left, the 2 leftmost bits are lost and two 0s come in on the right. The value is multiplied by 4 (22 becomes 88).",
    ],
    marks: 1,
  },
  {
    id: "1.1-7",
    objectiveId: "1.1.6",
    type: "SHORT",
    prompt: "Convert the denary number -45 into an 8-bit two's complement binary integer. Show your working.",
    answer: "+45 = 00101101. Invert the bits: 11010010. Add 1: 11010011. So -45 = 11010011.",
    markScheme: [
      "1 mark: correct binary for +45: 00101101",
      "1 mark: method shown: invert the bits and add 1, OR uses the -128 column (-128 + 83)",
      "1 mark: correct answer 11010011",
    ],
    marks: 3,
  },
  {
    id: "1.1-8",
    objectiveId: "1.1.6",
    type: "MCQ",
    prompt: "What is the denary value of the 8-bit two's complement number 11111100?",
    options: ["-4", "252", "-124", "4"],
    answer: "-4",
    markScheme: [
      "The leftmost column is worth -128: -128 + 64 + 32 + 16 + 8 + 4 = -4. 252 would be the answer if it were an unsigned number.",
    ],
    marks: 1,
  },
];

// ---------- 10 Boolean logic (built in full) ----------
const booleanLogic: SeedQuestion[] = [
  {
    id: "10-1",
    objectiveId: "10.1",
    type: "MCQ",
    prompt: "In the standard logic gate symbols, what does the small circle on a gate's output mean?",
    options: [
      "The output is inverted (a NOT is applied)",
      "The gate has three inputs",
      "The output is always 1",
      "The gate is an XOR gate",
    ],
    answer: "The output is inverted (a NOT is applied)",
    markScheme: [
      "The small circle means 'invert the output'. That is the only difference between AND and NAND, and between OR and NOR.",
    ],
    marks: 1,
  },
  {
    id: "10-2",
    objectiveId: "10.2",
    type: "MCQ",
    prompt: "Which gate gives an output of 1 only when exactly one of its two inputs is 1?",
    options: ["XOR", "OR", "NAND", "AND"],
    answer: "XOR",
    markScheme: [
      "XOR outputs 1 when the inputs are different. OR would also output 1 when both inputs are 1.",
    ],
    marks: 1,
  },
  {
    id: "10-3",
    objectiveId: "10.2",
    type: "MCQ",
    prompt: "A NOR gate has inputs A = 0 and B = 0. What is the output?",
    options: ["1", "0", "It depends on the previous output", "A NOR gate needs three inputs"],
    answer: "1",
    markScheme: [
      "OR of 0 and 0 is 0, and NOR inverts it, so the output is 1. NOR only outputs 1 when both inputs are 0.",
    ],
    marks: 1,
  },
  {
    id: "10-4",
    objectiveId: "10.2",
    type: "SHORT",
    prompt: "Explain the difference between an OR gate and an XOR gate.",
    answer:
      "An OR gate outputs 1 when either input or both inputs are 1. An XOR gate outputs 1 only when exactly one input is 1, so it outputs 0 when both inputs are 1.",
    markScheme: [
      "1 mark: OR outputs 1 when either one or both of the inputs are 1",
      "1 mark: XOR outputs 1 only when exactly one input is 1 / outputs 0 when both inputs are 1 (or when the inputs are the same)",
    ],
    marks: 2,
  },
  {
    id: "10-5",
    objectiveId: "10.3",
    type: "SHORT",
    prompt:
      "Complete the truth table for X = (A AND B) OR (NOT C). Write the 8 output values in order, for A B C = 000, 001, 010, 011, 100, 101, 110, 111.",
    answer: "1, 0, 1, 0, 1, 0, 1, 1",
    markScheme: [
      "1 mark: every row where C = 0 (000, 010, 100, 110) outputs 1",
      "1 mark: row 111 outputs 1 (because A AND B = 1)",
      "1 mark: rows 001, 011 and 101 output 0",
    ],
    marks: 3,
  },
  {
    id: "10-6",
    objectiveId: "10.3",
    type: "SHORT",
    prompt:
      "A greenhouse alarm X sounds if the temperature is too high (T = 1) and the window is closed (W = 0), or if the soil is dry (S = 1). Write the logic expression for X.",
    answer: "X = (T AND NOT W) OR S",
    markScheme: [
      "1 mark: T AND NOT W",
      "1 mark: ... OR S",
      "1 mark: complete, correct expression with brackets, e.g. X = (T AND NOT W) OR S",
    ],
    marks: 3,
  },
  {
    id: "10-7",
    objectiveId: "10.3",
    type: "MCQ",
    prompt: "How many rows (not counting the heading) does a truth table with three inputs have?",
    options: ["8", "6", "3", "9"],
    answer: "8",
    markScheme: [
      "Each input can be 0 or 1, so three inputs give 2 × 2 × 2 = 8 combinations, from 000 to 111.",
    ],
    marks: 1,
  },
];

// ---------- Other topics: short multiple-choice checks only (no guide or tutor yet) ----------
const otherTopics: SeedQuestion[] = [
  {
    id: "2-1",
    objectiveId: "2.1.1",
    type: "MCQ",
    prompt: "Which part of a data packet contains the destination address?",
    options: ["Packet header", "Payload", "Trailer", "Router"],
    answer: "Packet header",
    markScheme: ["The header holds the destination address, the packet number and the originator's address. The payload is the actual data."],
    marks: 1,
  },
  {
    id: "2-2",
    objectiveId: "2.2.2",
    type: "MCQ",
    prompt: "A system uses even parity. Which byte has been received with an error?",
    options: ["10110110", "11000011", "01010101", "11110000"],
    answer: "10110110",
    markScheme: ["With even parity every byte must contain an even number of 1s. 10110110 has five 1s, so it is wrong."],
    marks: 1,
  },
  {
    id: "3-1",
    objectiveId: "3.1.2",
    type: "MCQ",
    prompt: "Which register holds the address of the next instruction to be fetched?",
    options: ["Program counter (PC)", "Memory address register (MAR)", "Memory data register (MDR)", "Accumulator (ACC)"],
    answer: "Program counter (PC)",
    markScheme: ["The PC holds the address of the next instruction. That address is copied into the MAR during the fetch stage."],
    marks: 1,
  },
  {
    id: "3-2",
    objectiveId: "3.3.1",
    type: "MCQ",
    prompt: "Which statement about ROM is true?",
    options: [
      "It is non-volatile, so it keeps its contents when the power is off",
      "It is volatile, so it loses its contents when the power is off",
      "It is a type of secondary storage",
      "Its contents are constantly changed by running programs",
    ],
    answer: "It is non-volatile, so it keeps its contents when the power is off",
    markScheme: ["ROM is primary storage that is non-volatile and read-only. It holds things like the bootloader. RAM is the volatile one."],
    marks: 1,
  },
  {
    id: "4-1",
    objectiveId: "4.1.1",
    type: "MCQ",
    prompt: "Which of these is an example of utility (system) software?",
    options: ["Anti-virus software", "Word processor", "Web browser", "Spreadsheet"],
    answer: "Anti-virus software",
    markScheme: ["Utility software helps maintain the computer (e.g. anti-virus, defragmentation). The others are application software for the user."],
    marks: 1,
  },
  {
    id: "4-2",
    objectiveId: "4.2.3",
    type: "MCQ",
    prompt: "Which translator stops running the program as soon as it finds an error?",
    options: ["Interpreter", "Compiler", "Assembler", "IDE"],
    answer: "Interpreter",
    markScheme: ["An interpreter translates and runs one line at a time, so it stops at the first error. A compiler reports all errors after translating the whole program."],
    marks: 1,
  },
  {
    id: "5-1",
    objectiveId: "5.1.5",
    type: "MCQ",
    prompt: "What does the domain name server (DNS) do when you type a URL into a browser?",
    options: [
      "Finds the IP address that matches the domain name",
      "Stores the web page",
      "Encrypts the data being sent",
      "Renders the HTML on screen",
    ],
    answer: "Finds the IP address that matches the domain name",
    markScheme: ["The DNS looks up the domain name and returns its IP address, so the browser can contact the right web server."],
    marks: 1,
  },
  {
    id: "5-2",
    objectiveId: "5.3.1",
    type: "MCQ",
    prompt: "Which threat sends a user to a fake website even when they type the correct URL?",
    options: ["Pharming", "Phishing", "Brute-force attack", "DDoS attack"],
    answer: "Pharming",
    markScheme: ["Pharming changes the stored IP address (e.g. with malware or a poisoned DNS), so the real URL leads to a fake site. Phishing tricks the user into clicking a link."],
    marks: 1,
  },
  {
    id: "6-1",
    objectiveId: "6.1.1",
    type: "MCQ",
    prompt: "In an automated greenhouse, which component switches the sprinkler on?",
    options: ["Actuator", "Sensor", "Keyboard", "Monitor"],
    answer: "Actuator",
    markScheme: ["The sensor measures moisture, the microprocessor decides, and the actuator does the physical action (turning on the sprinkler)."],
    marks: 1,
  },
  {
    id: "6-2",
    objectiveId: "6.3.3",
    type: "MCQ",
    prompt: "Which of these is a component of an expert system?",
    options: ["Inference engine", "Compiler", "Actuator", "Router"],
    answer: "Inference engine",
    markScheme: ["An expert system has a knowledge base, a rule base, an inference engine and an interface."],
    marks: 1,
  },
  {
    id: "7-1",
    objectiveId: "7.6",
    type: "MCQ",
    prompt: "A program accepts ages from 11 to 16 inclusive. Which value is boundary data that should be rejected?",
    options: ["17", "14", "abc", "13"],
    answer: "17",
    markScheme: ["Boundary data is the largest/smallest accepted value and the value just outside it. 17 is just above 16, so it should be rejected."],
    marks: 1,
  },
  {
    id: "7-2",
    objectiveId: "7.4",
    type: "MCQ",
    prompt: "What does a linear search do?",
    options: [
      "Checks each item in turn until the item is found or the end of the list is reached",
      "Splits the list in half again and again",
      "Puts the list into order",
      "Swaps neighbouring items that are in the wrong order",
    ],
    answer: "Checks each item in turn until the item is found or the end of the list is reached",
    markScheme: ["A linear search starts at the first item and checks every item one by one. Swapping neighbours describes a bubble sort."],
    marks: 1,
  },
  {
    id: "8-1",
    objectiveId: "8.1.4",
    type: "MCQ",
    prompt: "What is the value of MOD(17, 5)?",
    options: ["2", "3", "3.4", "12"],
    answer: "2",
    markScheme: ["MOD gives the remainder: 17 ÷ 5 = 3 remainder 2. DIV(17, 5) would give 3."],
    marks: 1,
  },
  {
    id: "8-2",
    objectiveId: "8.1.4",
    type: "MCQ",
    prompt: "Which type of loop always runs its statements at least once?",
    options: ["REPEAT ... UNTIL", "WHILE ... DO", "FOR ... NEXT", "IF ... THEN"],
    answer: "REPEAT ... UNTIL",
    markScheme: ["REPEAT ... UNTIL is a post-condition loop: the condition is tested after the statements run, so they always run once."],
    marks: 1,
  },
  {
    id: "9-1",
    objectiveId: "9.3",
    type: "MCQ",
    prompt: "Why does a database table need a primary key?",
    options: [
      "To uniquely identify each record",
      "To sort the records alphabetically",
      "To encrypt the data",
      "To store the largest value in the table",
    ],
    answer: "To uniquely identify each record",
    markScheme: ["A primary key is a field whose value is different for every record, so each record can be uniquely identified."],
    marks: 1,
  },
  {
    id: "9-2",
    objectiveId: "9.4",
    type: "MCQ",
    prompt: "Which SQL keyword chooses which records are returned, based on a condition?",
    options: ["WHERE", "SELECT", "FROM", "ORDER BY"],
    answer: "WHERE",
    markScheme: ["WHERE filters records by a condition. SELECT chooses the fields, FROM chooses the table."],
    marks: 1,
  },
];

export const questions: SeedQuestion[] = [...numberSystems, ...booleanLogic, ...otherTopics];
