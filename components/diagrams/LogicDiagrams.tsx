// Diagrams for 10 Boolean logic, drawn in code with SVG.
// Gate shapes follow the standard symbols in section 4 of the 0478 syllabus.

type GateType = "NOT" | "AND" | "OR" | "NAND" | "NOR" | "XOR";

// Each gate is drawn in a 40-unit-tall box, with its top-left corner at (0, 0).
// Two-input gates take inputs at y = 12 and y = 28. NOT takes one input at y = 20.
// The output always leaves at y = 20.
const AND_BODY = "M0,0 H25 A20,20 0 0 1 25,40 H0 Z"; // flat back, round front
const OR_BODY = "M0,0 Q20,0 45,20 Q20,40 0,40 Q12,20 0,0 Z"; // curved back, pointed front
const NOT_BODY = "M0,0 L35,20 L0,40 Z"; // triangle

// Where the output line starts for each gate (after any bubble).
export const GATE_OUTPUT_X: Record<GateType, number> = {
  NOT: 43,
  AND: 45,
  OR: 45,
  NAND: 53,
  NOR: 53,
  XOR: 51,
};

// Draws one gate body at (x, y). The small circle (bubble) means "invert".
export function Gate({ type, x, y }: { type: GateType; x: number; y: number }) {
  const style = { fill: "white", stroke: "#111827", strokeWidth: 2 };
  return (
    <g transform={`translate(${x}, ${y})`}>
      {(type === "AND" || type === "NAND") && <path d={AND_BODY} {...style} />}
      {(type === "OR" || type === "NOR") && <path d={OR_BODY} {...style} />}
      {type === "XOR" && (
        <>
          {/* XOR is an OR with an extra curved line behind it */}
          <path d={OR_BODY} transform="translate(6, 0)" {...style} />
          <path d="M0,0 Q12,20 0,40" fill="none" stroke="#111827" strokeWidth={2} />
        </>
      )}
      {type === "NOT" && (
        <>
          <path d={NOT_BODY} {...style} />
          <circle cx={39} cy={20} r={4} {...style} />
        </>
      )}
      {(type === "NAND" || type === "NOR") && <circle cx={49} cy={20} r={4} {...style} />}
    </g>
  );
}

function Wire({ points }: { points: string }) {
  return <polyline points={points} fill="none" stroke="#111827" strokeWidth={2} />;
}

// All six gates with their names.
export function LogicGates() {
  const gates: GateType[] = ["NOT", "AND", "OR", "NAND", "NOR", "XOR"];

  return (
    <svg viewBox="0 0 330 200" className="w-full max-w-md" role="img" aria-label="The six logic gate symbols">
      {gates.map((type, i) => {
        const x = 30 + (i % 3) * 105; // 3 gates per row
        const y = 15 + Math.floor(i / 3) * 95;
        const outX = x + GATE_OUTPUT_X[type];
        return (
          <g key={type}>
            {/* input wires: NOT has one input, the others have two */}
            {type === "NOT" ? (
              <Wire points={`${x - 15},${y + 20} ${x},${y + 20}`} />
            ) : (
              <>
                <Wire points={`${x - 15},${y + 12} ${x + 5},${y + 12}`} />
                <Wire points={`${x - 15},${y + 28} ${x + 5},${y + 28}`} />
              </>
            )}
            <Gate type={type} x={x} y={y} />
            <Wire points={`${outX},${y + 20} ${outX + 12},${y + 20}`} />
            <text x={x + 25} y={y + 62} textAnchor="middle" fontSize="13" fontWeight="bold">
              {type}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// The circuit for X = (A AND B) OR (NOT C).
export function ExampleCircuit() {
  return (
    <svg viewBox="0 0 320 175" className="w-full max-w-md" role="img" aria-label="Circuit for X = (A AND B) OR (NOT C)">
      {/* input labels */}
      <text x={8} y={36} fontSize="14" fontWeight="bold">A</text>
      <text x={8} y={52} fontSize="14" fontWeight="bold">B</text>
      <text x={8} y={134} fontSize="14" fontWeight="bold">C</text>

      {/* A and B into the AND gate */}
      <Wire points="22,32 80,32" />
      <Wire points="22,48 80,48" />
      <Gate type="AND" x={80} y={20} />

      {/* C into the NOT gate */}
      <Wire points="22,130 80,130" />
      <Gate type="NOT" x={80} y={110} />

      {/* both results into the OR gate */}
      <Wire points="125,40 165,40 165,72 205,72" />
      <Wire points="123,130 165,130 165,88 205,88" />
      <Gate type="OR" x={200} y={60} />

      {/* output */}
      <Wire points="245,80 285,80" />
      <text x={292} y={85} fontSize="14" fontWeight="bold">X</text>

      {/* intermediate results, to help fill in a truth table */}
      <text x={130} y={30} fontSize="11" fill="#1d4ed8">A AND B</text>
      <text x={128} y={150} fontSize="11" fill="#1d4ed8">NOT C</text>
    </svg>
  );
}
