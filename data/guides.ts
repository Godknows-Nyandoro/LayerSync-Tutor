// Learning guides for the two built topics.
// Each guide follows explain -> try -> check, and every section is tagged with objective IDs.
// `diagram` names a diagram drawn in code (React + SVG), never an AI-generated image.
// The seed loads these as DRAFTS: students only see a guide after the teacher approves it.

export type DiagramName = "binary-place-values" | "hex-nibbles" | "logic-gates" | "example-circuit";

export type GuideSection = {
  kind: "explain" | "try" | "check";
  heading: string;
  body: string; // paragraphs separated by blank lines
  objectiveIds: string[];
  diagram?: DiagramName;
  answer?: string; // for "try" and "check": shown only when the student taps "Show answer"
};

export type SeedGuide = {
  topicKey: string;
  title: string;
  sections: GuideSection[];
};

export const guides: SeedGuide[] = [
  {
    topicKey: "1.1",
    title: "Number systems",
    sections: [
      {
        kind: "explain",
        heading: "Why computers use binary",
        body:
          "Inside a computer, everything is stored and processed by millions of tiny switches and logic gates. A switch is either off or on, so it can only show two values: 0 and 1.\n\nThat is why every kind of data (numbers, text, sound and images) has to be turned into binary before a computer can process it. The data is processed with logic gates and held in registers.",
        objectiveIds: ["1.1.1"],
      },
      {
        kind: "explain",
        heading: "Binary place values",
        body:
          "Denary (base 10) columns go up in tens: 1, 10, 100. Binary (base 2) columns double each time: 1, 2, 4, 8, 16, 32, 64, 128.\n\nTo turn binary into denary, add the place values of every column that has a 1. To turn denary into binary, start at 128 and ask: does it fit? If yes, write 1 and subtract it. If no, write 0. Move to the next column.\n\nNo calculator in the exam, so practise doing this by hand.",
        objectiveIds: ["1.1.2"],
        diagram: "binary-place-values",
      },
      {
        kind: "try",
        heading: "Your turn: convert 77 to binary",
        body: "Use the columns 128, 64, 32, 16, 8, 4, 2, 1. Work it out on paper before you look.",
        objectiveIds: ["1.1.2"],
        answer: "128 doesn't fit. 64 fits (13 left). 32 and 16 don't fit. 8 fits (5 left), 4 fits (1 left), 2 doesn't, 1 fits. So 77 = 01001101.",
      },
      {
        kind: "explain",
        heading: "Hexadecimal",
        body:
          "Hexadecimal (base 16) uses the digits 0-9 and then A=10, B=11, C=12, D=13, E=14, F=15.\n\nOne hex digit is exactly 4 bits (a nibble). To convert binary to hex, split it into groups of 4 from the right and convert each group. To go back, turn each hex digit into 4 bits.\n\nHex is used because it is much shorter than binary, so it is easier for people to read and fewer mistakes are made. You will see it in MAC addresses, HTML colour codes (like #FF0000) and error codes.",
        objectiveIds: ["1.1.2", "1.1.3"],
        diagram: "hex-nibbles",
      },
      {
        kind: "try",
        heading: "Your turn: convert 10111110 to hex",
        body: "Split it into two nibbles first.",
        objectiveIds: ["1.1.2"],
        answer: "1011 = 8 + 2 + 1 = 11 = B. 1110 = 8 + 4 + 2 = 14 = E. So the answer is BE.",
      },
      {
        kind: "explain",
        heading: "Binary addition and overflow",
        body:
          "Add from the right, column by column: 0+0 = 0, 0+1 = 1, 1+1 = 0 carry 1, 1+1+1 = 1 carry 1.\n\nAn 8-bit register can only hold values from 0 to 255. If the answer is bigger than 255, there is a carry out of the last column with nowhere to go. This is an overflow error: the 8 bits left behind do not show the real answer.",
        objectiveIds: ["1.1.4"],
      },
      {
        kind: "explain",
        heading: "Logical shifts",
        body:
          "A logical left shift moves every bit left. The leftmost bits are lost and 0s fill in on the right. Each place shifted left multiplies the number by 2.\n\nA logical right shift moves every bit right. The rightmost bits are lost and 0s fill in on the left. Each place shifted right divides by 2 (any remainder is lost).\n\nExample: 00010110 (22) shifted left 1 place = 00101100 (44).",
        objectiveIds: ["1.1.5"],
      },
      {
        kind: "explain",
        heading: "Two's complement (negative numbers)",
        body:
          "In 8-bit two's complement, the leftmost column is worth -128 instead of +128. The other columns are the same: 64, 32, 16, 8, 4, 2, 1. A number starting with 1 is negative.\n\nTo write a negative number such as -20: write +20 in binary (00010100), invert every bit (11101011), then add 1 (11101100).\n\nCheck it: -128 + 64 + 32 + 8 + 4 = -20.",
        objectiveIds: ["1.1.6"],
      },
      {
        kind: "check",
        heading: "Quick check",
        body: "What is 11111111 in denary (as a normal unsigned number)? What happens if you add 1 to it in an 8-bit register?",
        objectiveIds: ["1.1.2", "1.1.4"],
        answer: "11111111 = 255, the largest 8-bit value. Adding 1 needs a 9th bit, so an overflow error occurs and the register shows 00000000.",
      },
    ],
  },
  {
    topicKey: "10",
    title: "Boolean logic",
    sections: [
      {
        kind: "explain",
        heading: "The six logic gates",
        body:
          "A logic gate takes binary inputs (0 or 1) and gives one binary output. You need to know six gates and their standard symbols.\n\nNOT: one input, flips it. AND: 1 only if both inputs are 1. OR: 1 if at least one input is 1. NAND: the opposite of AND. NOR: the opposite of OR. XOR: 1 only if the inputs are different.\n\nThe small circle on NOT, NAND and NOR means 'invert the output'.",
        objectiveIds: ["10.1", "10.2"],
        diagram: "logic-gates",
      },
      {
        kind: "explain",
        heading: "Truth tables",
        body:
          "A truth table lists every possible combination of inputs and the output for each one.\n\nWith 2 inputs there are 4 rows (00, 01, 10, 11). With 3 inputs there are 8 rows, from 000 to 111. Always write the inputs in this counting order so you never miss a row.\n\nAND truth table: 00 gives 0, 01 gives 0, 10 gives 0, 11 gives 1.",
        objectiveIds: ["10.2"],
      },
      {
        kind: "try",
        heading: "Your turn: NAND",
        body: "Write the output of a NAND gate for inputs 00, 01, 10 and 11. Hint: work out AND first, then flip it.",
        objectiveIds: ["10.2"],
        answer: "AND gives 0, 0, 0, 1. Flip each one: NAND gives 1, 1, 1, 0.",
      },
      {
        kind: "explain",
        heading: "From expression to circuit",
        body:
          "A logic expression such as X = (A AND B) OR (NOT C) tells you exactly which gates to draw. Work from the brackets outwards: an AND gate for A and B, a NOT gate for C, then an OR gate that joins the two results.\n\nIn the exam, draw the circuit exactly as the statement is written. Do not simplify it. Circuits have at most three inputs and one output.\n\nTo fill in a truth table for a circuit, add a column for each gate's output (such as A AND B and NOT C) before working out X.",
        objectiveIds: ["10.3"],
        diagram: "example-circuit",
      },
      {
        kind: "try",
        heading: "Your turn: write the expression",
        body:
          "A light L turns on if the switch S is on and it is dark (D = 1), or if the motion sensor M is triggered. Write the logic expression for L.",
        objectiveIds: ["10.3"],
        answer: "L = (S AND D) OR M",
      },
      {
        kind: "check",
        heading: "Quick check",
        body: "For X = (A AND B) OR (NOT C), what is X when A = 1, B = 0 and C = 1?",
        objectiveIds: ["10.3"],
        answer: "A AND B = 0. NOT C = 0. 0 OR 0 = 0, so X = 0.",
      },
    ],
  },
];
