// Diagrams for 1.1 Number systems, drawn in code with SVG (no images to download).

const PLACE_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];

// 77 in binary, column by column, with the 1s highlighted.
export function BinaryPlaceValues() {
  const bits = [0, 1, 0, 0, 1, 1, 0, 1]; // 77 = 01001101
  const cell = 40;

  return (
    <svg viewBox="0 0 340 130" className="w-full max-w-md" role="img" aria-label="Binary place values for 77">
      {PLACE_VALUES.map((value, i) => {
        const x = 10 + i * cell;
        const isOne = bits[i] === 1;
        return (
          <g key={value}>
            {/* place value heading */}
            <text x={x + cell / 2} y={20} textAnchor="middle" fontSize="13" fill="#4b5563">
              {value}
            </text>
            {/* the bit */}
            <rect x={x} y={30} width={cell - 4} height={36} rx={4} fill={isOne ? "#c2410c" : "#f3f4f6"} stroke="#9ca3af" />
            <text x={x + cell / 2 - 2} y={54} textAnchor="middle" fontSize="18" fontWeight="bold" fill={isOne ? "white" : "#6b7280"}>
              {bits[i]}
            </text>
          </g>
        );
      })}
      <text x={170} y={95} textAnchor="middle" fontSize="14" fill="#111827">
        64 + 8 + 4 + 1 = 77
      </text>
      <text x={170} y={118} textAnchor="middle" fontSize="12" fill="#6b7280">
        Add the place values of the columns that hold a 1
      </text>
    </svg>
  );
}

// 10111110 split into two nibbles, each turned into one hex digit.
export function HexNibbles() {
  const nibbles = [
    { bits: "1011", sum: "8 + 2 + 1 = 11", hex: "B" },
    { bits: "1110", sum: "8 + 4 + 2 = 14", hex: "E" },
  ];

  return (
    <svg viewBox="0 0 340 170" className="w-full max-w-md" role="img" aria-label="Converting 10111110 to hexadecimal BE">
      {nibbles.map((nibble, i) => {
        const x = 20 + i * 160;
        return (
          <g key={nibble.bits}>
            <rect x={x} y={26} width={140} height={34} rx={4} fill="#fff7ed" stroke="#c2410c" />
            {/* each bit with its place value (8, 4, 2, 1) directly above it */}
            {nibble.bits.split("").map((bit, j) => (
              <g key={j}>
                <text x={x + 20 + j * 33} y={18} textAnchor="middle" fontSize="11" fill="#6b7280">
                  {[8, 4, 2, 1][j]}
                </text>
                <text x={x + 20 + j * 33} y={50} textAnchor="middle" fontSize="18" fontFamily="monospace">
                  {bit}
                </text>
              </g>
            ))}
            {/* arrow down */}
            <line x1={x + 70} y1={64} x2={x + 70} y2={92} stroke="#374151" strokeWidth={2} />
            <polygon points={`${x + 64},88 ${x + 76},88 ${x + 70},98`} fill="#374151" />
            <text x={x + 70} y={116} textAnchor="middle" fontSize="12" fill="#4b5563">
              {nibble.sum}
            </text>
            <text x={x + 70} y={150} textAnchor="middle" fontSize="26" fontWeight="bold" fill="#c2410c">
              {nibble.hex}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
