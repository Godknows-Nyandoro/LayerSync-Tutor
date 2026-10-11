// Cambridge IGCSE Computer Science 0478 (exams 2026-2028, version 6).
// All 10 topics and their learning objectives, typed in by hand from the syllabus.
// Topics 7, 9 and 10 have no sub-topics in the syllabus, so their objective IDs
// are just topic.objective (e.g. "10.2"), exactly as the syllabus numbers them.

export type SyllabusObjective = {
  id: string; // e.g. "1.1.4"
  statement: string; // "Candidates should be able to..."
  notes: string[]; // "Notes and guidance" column
};

export type SyllabusSubtopic = {
  id: string; // e.g. "1.1"
  title: string;
  objectives: SyllabusObjective[];
};

export type SyllabusTopic = {
  number: number;
  title: string;
  paper: 1 | 2;
  subtopics: SyllabusSubtopic[];
};

export const syllabus: SyllabusTopic[] = [
  {
    number: 1,
    title: "Data representation",
    paper: 1,
    subtopics: [
      {
        id: "1.1",
        title: "Number systems",
        objectives: [
          {
            id: "1.1.1",
            statement: "Understand how and why computers use binary to represent all forms of data",
            notes: [
              "Any form of data needs to be converted to binary to be processed by a computer",
              "Data is processed using logic gates and stored in registers",
            ],
          },
          {
            id: "1.1.2",
            statement:
              "(a) Understand the denary, binary and hexadecimal number systems (b) Convert between (i) positive denary and positive binary (ii) positive denary and positive hexadecimal (iii) positive hexadecimal and positive binary",
            notes: [
              "Denary is a base 10 system",
              "Binary is a base 2 system",
              "Hexadecimal is a base 16 system",
              "Values used will be integers only",
              "Conversions in both directions, e.g. denary to binary or binary to denary",
              "Maximum binary number length of 16-bit",
            ],
          },
          {
            id: "1.1.3",
            statement: "Understand how and why hexadecimal is used as a beneficial method of data representation",
            notes: [
              "Areas within computer science that hexadecimal is used should be identified",
              "Hexadecimal is easier for humans to understand than binary, as it is a shorter representation of binary",
            ],
          },
          {
            id: "1.1.4",
            statement:
              "(a) Add two positive 8-bit binary integers (b) Understand the concept of overflow and why it occurs in binary addition",
            notes: [
              "An overflow error will occur if the value is greater than 255 in an 8-bit register",
              "A computer or a device has a predefined limit that it can represent or store, for example 16-bit",
              "An overflow error occurs when a value outside this limit should be returned",
            ],
          },
          {
            id: "1.1.5",
            statement:
              "Perform a logical binary shift on a positive 8-bit binary integer and understand the effect this has on the positive binary integer",
            notes: [
              "Perform logical left shifts, logical right shifts and multiple shifts",
              "Bits shifted from the end of the register are lost and zeros are shifted in at the opposite end of the register",
              "The positive binary integer is multiplied or divided according to the shift performed",
              "The most significant bit(s) or least significant bit(s) are lost",
            ],
          },
          {
            id: "1.1.6",
            statement:
              "Use the two's complement number system to represent positive and negative 8-bit binary integers",
            notes: [
              "Convert a positive binary or denary integer to a two's complement 8-bit integer and vice versa",
              "Convert a negative binary or denary integer to a two's complement 8-bit integer and vice versa",
            ],
          },
        ],
      },
      {
        id: "1.2",
        title: "Text, sound and images",
        objectives: [
          {
            id: "1.2.1",
            statement:
              "Understand how and why a computer represents text and the use of character sets, including American standard code for information interchange (ASCII) and Unicode",
            notes: [
              "Text is converted to binary to be processed by a computer",
              "Unicode allows for a greater range of characters and symbols than ASCII, including different languages and emojis",
              "Unicode requires more bits per character than ASCII",
            ],
          },
          {
            id: "1.2.2",
            statement:
              "Understand how and why a computer represents sound, including the effects of the sample rate and sample resolution",
            notes: [
              "A sound wave is sampled for sound to be converted to binary, which is processed by a computer",
              "The sample rate is the number of samples taken in a second",
              "The sample resolution is the number of bits per sample",
              "The accuracy of the recording and the file size increases as the sample rate and resolution increase",
            ],
          },
          {
            id: "1.2.3",
            statement:
              "Understand how and why a computer represents an image, including the effects of the resolution and colour depth",
            notes: [
              "An image is a series of pixels that are converted to binary, which is processed by a computer",
              "The resolution is the number of pixels in the image",
              "The colour depth is the number of bits used to represent each colour",
              "The file size and quality of the image increase as the resolution and colour depth increase",
            ],
          },
        ],
      },
      {
        id: "1.3",
        title: "Data storage and compression",
        objectives: [
          {
            id: "1.3.1",
            statement: "Understand how data storage is measured",
            notes: [
              "Including bit, nibble, byte, kibibyte (KiB), mebibyte (MiB), gibibyte (GiB), tebibyte (TiB), pebibyte (PiB) and exbibyte (EiB)",
              "The amount of the previous denomination present in the data storage size, e.g. 8 bits in a byte, 1024 mebibytes in a gibibyte",
            ],
          },
          {
            id: "1.3.2",
            statement: "Calculate the file size of an image file and a sound file, using information given",
            notes: [
              "Answers must be given in the units specified in the question",
              "Calculations must use the measurement of 1024 and not 1000",
              "Information given may include image resolution and colour depth, or sound sample rate, resolution and length of track",
            ],
          },
          {
            id: "1.3.3",
            statement: "Understand the purpose of and need for data compression",
            notes: [
              "Compression exists to reduce the size of the file",
              "The impact of this, e.g. less bandwidth required, less storage space required, shorter transmission time",
            ],
          },
          {
            id: "1.3.4",
            statement: "Understand how files are compressed using lossy and lossless compression methods",
            notes: [
              "Lossy compression reduces the file size by permanently removing data, e.g. reducing resolution or colour depth, reducing sample rate or resolution",
              "Lossless compression reduces the file size without permanent loss of data, e.g. run length encoding (RLE)",
            ],
          },
        ],
      },
    ],
  },
  {
    number: 2,
    title: "Data transmission",
    paper: 1,
    subtopics: [
      {
        id: "2.1",
        title: "Types and methods of data transmission",
        objectives: [
          {
            id: "2.1.1",
            statement:
              "(a) Understand that data is broken down into packets to be transmitted (b) Describe the structure of a packet (c) Describe the process of packet switching",
            notes: [
              "A packet of data contains a packet header, payload and trailer",
              "The packet header includes the destination address, packet number and originator's address",
              "Data is broken down into packets and each packet could take a different route",
              "A router controls the route a packet takes",
              "Packets may arrive out of order; once the last packet has arrived, packets are reordered",
            ],
          },
          {
            id: "2.1.2",
            statement:
              "(a) Describe how data is transmitted from one device to another using different methods of data transmission (b) Explain the suitability of each method of data transmission, for a given scenario",
            notes: [
              "Including serial, parallel, simplex, half-duplex and full-duplex",
              "Including the advantages and disadvantages of each method",
            ],
          },
          {
            id: "2.1.3",
            statement:
              "Understand the universal serial bus (USB) interface and explain how it is used to transmit data",
            notes: ["Including the benefits and drawbacks of the interface"],
          },
        ],
      },
      {
        id: "2.2",
        title: "Methods of error detection",
        objectives: [
          {
            id: "2.2.1",
            statement:
              "Understand the need to check for errors after data transmission and how these errors can occur",
            notes: [
              "Errors can occur during data transmission due to interference, e.g. data loss, data gain and data change",
            ],
          },
          {
            id: "2.2.2",
            statement:
              "Describe the processes involved in each of the following error detection methods for detecting errors in data after transmission: parity check (odd and even), checksum and echo check",
            notes: ["Including parity byte and parity block check"],
          },
          {
            id: "2.2.3",
            statement:
              "Describe how a check digit is used to detect errors in data entry and identify examples of when a check digit is used, including international standard book numbers (ISBN) and bar codes",
            notes: [],
          },
          {
            id: "2.2.4",
            statement:
              "Describe how an automatic repeat query (ARQ) can be used to establish that data is received without error",
            notes: ["Including the use of positive/negative acknowledgements and timeout"],
          },
        ],
      },
      {
        id: "2.3",
        title: "Encryption",
        objectives: [
          {
            id: "2.3.1",
            statement: "Understand the need for and purpose of encryption when transmitting data",
            notes: [],
          },
          {
            id: "2.3.2",
            statement: "Understand how data is encrypted using symmetric and asymmetric encryption",
            notes: ["Asymmetric encryption includes the use of public and private keys"],
          },
        ],
      },
    ],
  },
  {
    number: 3,
    title: "Hardware",
    paper: 1,
    subtopics: [
      {
        id: "3.1",
        title: "Computer architecture",
        objectives: [
          {
            id: "3.1.1",
            statement:
              "(a) Understand the role of the central processing unit (CPU) in a computer (b) Understand what is meant by a microprocessor",
            notes: [
              "The CPU processes instructions and data that are input into the computer so that the result can be output",
              "A microprocessor is a type of integrated circuit on a single chip",
            ],
          },
          {
            id: "3.1.2",
            statement:
              "(a) Understand the purpose of the components in a CPU, in a computer that has a Von Neumann architecture (b) Describe the process of the fetch-decode-execute (FDE) cycle, including the role of each component in the process",
            notes: [
              "Units: arithmetic logic unit (ALU) and control unit (CU)",
              "Registers: program counter (PC), memory address register (MAR), memory data register (MDR), current instruction register (CIR) and accumulator (ACC)",
              "Buses: address bus, data bus and control bus",
              "How instructions and data are fetched from RAM into the CPU, how they are processed using each component and how they are then executed",
              "Storing data and addresses into specific registers; using buses to transmit data, addresses and signals; using units to fetch, decode and execute data and instructions",
            ],
          },
          {
            id: "3.1.3",
            statement:
              "Understand what is meant by a core, cache and clock in a CPU and explain how they can affect the performance of a CPU",
            notes: ["The number of cores, size of the cache and speed of the clock can affect the performance of a CPU"],
          },
          {
            id: "3.1.4",
            statement: "Understand the purpose and use of an instruction set for a CPU",
            notes: [
              "An instruction set is a list of all the commands that can be processed by a CPU, and the commands are machine code",
            ],
          },
          {
            id: "3.1.5",
            statement:
              "Describe the purpose and characteristics of an embedded system and identify devices in which they are commonly used",
            notes: [
              "An embedded system is used to perform a dedicated function, e.g. in domestic appliances, cars, security systems, lighting systems or vending machines",
              "This is different to a general purpose computer that is used to perform many different functions, e.g. a personal computer (PC) or a laptop",
            ],
          },
        ],
      },
      {
        id: "3.2",
        title: "Input and output devices",
        objectives: [
          {
            id: "3.2.1",
            statement: "Understand what is meant by an input device and why it is required",
            notes: [
              "Including barcode scanner, digital camera, keyboard, microphone, optical mouse, QR code scanner, touch screen (resistive, capacitive and infra-red), 2D and 3D scanners",
            ],
          },
          {
            id: "3.2.2",
            statement: "Understand what is meant by an output device and why it is required",
            notes: [
              "Including actuator, digital light processing (DLP) projector, inkjet printer, laser printer, LED screen, LCD projector, LCD screen, speaker and 3D printer",
            ],
          },
          {
            id: "3.2.3",
            statement:
              "(a) Understand what is meant by a sensor and the purposes of sensors (b) Identify the type of data captured by each sensor and understand when each sensor would be used, including selecting the most suitable sensor for a given context",
            notes: [
              "Limited to acoustic, accelerometer, flow, gas, humidity, infra-red, level, light, magnetic field, moisture, pH, pressure, proximity and temperature",
            ],
          },
        ],
      },
      {
        id: "3.3",
        title: "Data storage",
        objectives: [
          {
            id: "3.3.1",
            statement: "Understand what is meant by primary storage",
            notes: [
              "Primary storage is directly accessed by the CPU",
              "Including the role of random access memory (RAM) and read only memory (ROM)",
              "Including why a computer needs both RAM and ROM, and the difference between them",
            ],
          },
          {
            id: "3.3.2",
            statement: "Understand what is meant by secondary storage",
            notes: [
              "Secondary storage is not directly accessed by the CPU and is necessary for more permanent storage of data",
            ],
          },
          {
            id: "3.3.3",
            statement:
              "Describe the operation of magnetic, optical and solid-state (flash memory) storage and give examples of each",
            notes: [
              "Magnetic storage uses platters which are divided into tracks and sectors; data is read and written using electromagnets, e.g. hard disk drive (HDD)",
              "Optical storage uses lasers to create and read pits and lands, e.g. CD, DVD and Blu-ray",
              "Solid-state (flash memory) uses NAND or NOR technology; transistors are used as control gates and floating gates, e.g. SSD, SD card and USB drive",
            ],
          },
          {
            id: "3.3.4",
            statement: "Describe what is meant by virtual memory, how it is created and used and why it is necessary",
            notes: ["Pages of data are transferred between RAM and virtual memory when needed"],
          },
          {
            id: "3.3.5",
            statement: "Understand what is meant by cloud storage",
            notes: ["Cloud storage can be accessed remotely in comparison to storing data locally"],
          },
          {
            id: "3.3.6",
            statement:
              "Explain the advantages and disadvantages of storing data on the cloud in comparison to storing it locally",
            notes: ["Physical servers and storage are needed to store data in cloud storage"],
          },
        ],
      },
      {
        id: "3.4",
        title: "Network hardware",
        objectives: [
          {
            id: "3.4.1",
            statement: "Understand that a computer needs a network interface card (NIC) to access a network",
            notes: [],
          },
          {
            id: "3.4.2",
            statement:
              "Understand what is meant by, and the purpose of, a media access control (MAC) address, including its structure",
            notes: [
              "A network interface card is given a MAC address at the point of manufacture",
              "MAC addresses are usually written as hexadecimal",
              "MAC addresses are created using the manufacturer code and the serial code",
            ],
          },
          {
            id: "3.4.3",
            statement:
              "(a) Understand what is meant by, and the purpose of, an internet protocol (IP) address (b) Understand that there are different types of IP address",
            notes: [
              "An IP address is allocated by the network and it can be static or dynamic",
              "Including the characteristics of, and differences between, IPv4 and IPv6",
            ],
          },
          {
            id: "3.4.4",
            statement: "Describe the role of a router in a network",
            notes: [
              "A router sends data to a specific destination on a network",
              "A router can assign IP addresses",
              "A router can connect a local network to the internet",
            ],
          },
        ],
      },
    ],
  },
  {
    number: 4,
    title: "Software",
    paper: 1,
    subtopics: [
      {
        id: "4.1",
        title: "Types of software and interrupts",
        objectives: [
          {
            id: "4.1.1",
            statement:
              "Describe the difference between system software and application software and provide examples of each",
            notes: [
              "System software provides the services that the computer requires, including operating system and utility software",
              "Application software provides the services that the user requires",
            ],
          },
          {
            id: "4.1.2",
            statement: "Describe the role and basic functions of an operating system",
            notes: [
              "Including managing files, handling interrupts, providing an interface, managing peripherals and drivers, managing memory, managing multitasking, providing a platform for running applications, providing system security and managing user accounts",
            ],
          },
          {
            id: "4.1.3",
            statement:
              "Understand how hardware, firmware and an operating system are required to run applications software",
            notes: [
              "Applications are run on the operating system",
              "The operating system is run on the firmware",
              "The bootloader (firmware) is run on the hardware",
            ],
          },
          {
            id: "4.1.4",
            statement: "Describe the role and operation of interrupts",
            notes: [
              "Including how an interrupt is generated, how it is handled using an interrupt service routine, and what happens as a result of the interrupts",
              "Software interrupts include division by zero and two processes trying to access the same memory location",
              "Hardware interrupts include pressing a key on the keyboard and moving the mouse",
            ],
          },
        ],
      },
      {
        id: "4.2",
        title: "Types of programming language, translators and integrated development environments (IDEs)",
        objectives: [
          {
            id: "4.2.1",
            statement:
              "Explain what is meant by a high-level language and a low-level language, including the advantages and disadvantages of each",
            notes: [
              "Advantages and disadvantages include ease of reading and writing code (e.g. low-level is hard to read), ease of debugging code, machine independence and direct manipulation of hardware",
            ],
          },
          {
            id: "4.2.2",
            statement:
              "Understand that assembly language is a form of low-level language that uses mnemonics, and that an assembler is needed to translate an assembly language program into machine code",
            notes: [],
          },
          {
            id: "4.2.3",
            statement:
              "Describe the operation of a compiler and an interpreter, including how high-level language is translated by each and how errors are reported",
            notes: [
              "A compiler translates the whole code at once before executing it, producing an executable file",
              "An interpreter translates and executes the code line-by-line",
              "A compiler provides an error report for the whole code if errors are detected",
              "An interpreter stops execution when an error is found",
            ],
          },
          {
            id: "4.2.4",
            statement: "Explain the advantages and disadvantages of a compiler and an interpreter",
            notes: [
              "Including an understanding that an interpreter is mostly used when developing a program and a compiler is used to translate the final program",
            ],
          },
          {
            id: "4.2.5",
            statement: "Explain the role of an IDE in writing program code and the common functions IDEs provide",
            notes: [
              "Including code editors, run-time environment, translators, error diagnostics, auto-completion, auto-correction and prettyprint",
            ],
          },
        ],
      },
    ],
  },
  {
    number: 5,
    title: "The internet and its uses",
    paper: 1,
    subtopics: [
      {
        id: "5.1",
        title: "The internet and the world wide web",
        objectives: [
          {
            id: "5.1.1",
            statement: "Understand the difference between the internet and the world wide web",
            notes: [
              "The internet is the infrastructure",
              "The world wide web is the collection of websites and web pages accessed using the internet",
            ],
          },
          {
            id: "5.1.2",
            statement: "Understand what is meant by a uniform resource locator (URL)",
            notes: [
              "A URL is a text-based address for a web page; it can contain the protocol, the domain name and the web page/file name",
            ],
          },
          {
            id: "5.1.3",
            statement:
              "Describe the purpose and operation of hypertext transfer protocol (HTTP) and hypertext transfer protocol secure (HTTPS)",
            notes: [],
          },
          {
            id: "5.1.4",
            statement: "Explain the purpose and functions of a web browser",
            notes: [
              "The main purpose of a web browser is to render hypertext markup language (HTML) and display web pages",
              "Functions include storing bookmarks and favourites, recording user history, allowing use of multiple tabs, storing cookies, providing navigation tools and providing an address bar",
            ],
          },
          {
            id: "5.1.5",
            statement:
              "Describe how web pages are located, retrieved and displayed on a device when a user enters a URL",
            notes: [
              "Including the role of the web browser, IP addresses, the domain name server (DNS), the web server and HTML",
            ],
          },
          {
            id: "5.1.6",
            statement:
              "Explain what is meant by cookies and how they are used, including session cookies and persistent cookies",
            notes: [
              "Cookies are used for functions including saving personal details, tracking user preferences, holding items in an online shopping cart and storing login details",
            ],
          },
        ],
      },
      {
        id: "5.2",
        title: "Digital currency",
        objectives: [
          {
            id: "5.2.1",
            statement: "Understand the concept of a digital currency and how digital currencies are used",
            notes: ["A digital currency is one that only exists electronically"],
          },
          {
            id: "5.2.2",
            statement:
              "Understand the process of blockchain and how it is used to track digital currency transactions",
            notes: [
              "Blockchain, in its basic form, is a digital ledger, that is a time-stamped series of records that cannot be altered",
            ],
          },
        ],
      },
      {
        id: "5.3",
        title: "Cyber security",
        objectives: [
          {
            id: "5.3.1",
            statement:
              "Describe the processes involved in, and the aim of carrying out, a range of cyber security threats",
            notes: [
              "Including brute-force attack, data interception, distributed denial of service (DDoS) attack, hacking, malware (virus, worm, Trojan horse, spyware, adware, ransomware), pharming, phishing and social engineering",
            ],
          },
          {
            id: "5.3.2",
            statement: "Explain how a range of solutions are used to help keep data safe from security threats",
            notes: [
              "Including access levels, anti-malware (including anti-virus and anti-spyware), authentication (username and password, biometrics, two-step verification), automating software updates, checking the spelling and tone of communications, checking the URL attached to a link, firewalls, privacy settings, proxy-servers and secure socket layer (SSL) security protocol",
            ],
          },
        ],
      },
    ],
  },
  {
    number: 6,
    title: "Automated and emerging technologies",
    paper: 1,
    subtopics: [
      {
        id: "6.1",
        title: "Automated systems",
        objectives: [
          {
            id: "6.1.1",
            statement:
              "Describe how sensors, microprocessors and actuators can be used in collaboration to create automated systems",
            notes: [],
          },
          {
            id: "6.1.2",
            statement: "Describe the advantages and disadvantages of an automated system used for a given scenario",
            notes: ["Including scenarios from industry, transport, agriculture, weather, gaming, lighting and science"],
          },
        ],
      },
      {
        id: "6.2",
        title: "Robotics",
        objectives: [
          {
            id: "6.2.1",
            statement: "Understand what is meant by robotics",
            notes: [
              "Robotics is a branch of computer science that incorporates the design, construction and operation of robots",
              "Examples include factory equipment, domestic robots and drones",
            ],
          },
          {
            id: "6.2.2",
            statement: "Describe the characteristics of a robot",
            notes: [
              "Including a mechanical structure or framework, electrical components (such as sensors, microprocessors and actuators) and being programmable",
            ],
          },
          {
            id: "6.2.3",
            statement:
              "Understand the roles that robots can perform and describe the advantages and disadvantages of their use",
            notes: [
              "Robots can be used in areas including industry, transport, agriculture, medicine, domestic settings and entertainment",
            ],
          },
        ],
      },
      {
        id: "6.3",
        title: "Artificial intelligence",
        objectives: [
          {
            id: "6.3.1",
            statement: "Understand what is meant by artificial intelligence (AI)",
            notes: [
              "AI is a branch of computer science dealing with the simulation of intelligent behaviours by computers",
            ],
          },
          {
            id: "6.3.2",
            statement:
              "Describe the main characteristics of AI as the collection of data and the rules for using that data, the ability to reason, and it can include the ability to learn and adapt",
            notes: [],
          },
          {
            id: "6.3.3",
            statement: "Explain the basic operation and components of AI systems to simulate intelligent behaviour",
            notes: [
              "Limited to expert systems and machine learning",
              "Expert systems have a knowledge base, a rule base, an inference engine and an interface",
              "Machine learning is when a program has the ability to automatically adapt its own processes and/or data",
            ],
          },
        ],
      },
    ],
  },
  {
    number: 7,
    title: "Algorithm design and problem-solving",
    paper: 2,
    subtopics: [
      {
        id: "7",
        title: "Algorithm design and problem-solving",
        objectives: [
          {
            id: "7.1",
            statement:
              "Understand the program development life cycle, limited to: analysis, design, coding and testing",
            notes: [
              "Analysis: abstraction, decomposition of the problem, identification of the problem and requirements",
              "Design: decomposition, structure diagrams, flowcharts, pseudocode",
              "Coding: writing program code and iterative testing",
              "Testing: testing program code with the use of test data",
            ],
          },
          {
            id: "7.2",
            statement:
              "(a) Understand that every computer system is made up of sub-systems, which are made up of further sub-systems (b) Understand how a problem can be decomposed into its component parts (c) Use different methods to design and construct a solution to a problem",
            notes: [
              "Component parts include inputs, processes, outputs and storage",
              "Methods include structure diagrams, flowcharts and pseudocode",
            ],
          },
          {
            id: "7.3",
            statement: "Explain the purpose of a given algorithm",
            notes: ["Including stating the purpose of an algorithm and describing the processes involved in an algorithm"],
          },
          {
            id: "7.4",
            statement: "Understand standard methods of solution",
            notes: [
              "Limited to linear search, bubble sort, totalling, counting, and finding maximum, minimum and average values",
            ],
          },
          {
            id: "7.5",
            statement:
              "(a) Understand the need for validation checks to be made on input data and the different types of validation check (b) Understand the need for verification checks to be made on input data and the different types of verification check",
            notes: [
              "Validation including range check, length check, type check, presence check, format check and check digit",
              "Verification including visual check and double entry check",
            ],
          },
          {
            id: "7.6",
            statement: "Suggest and apply suitable test data",
            notes: [
              "Limited to normal, abnormal, extreme and boundary",
              "Extreme data is the largest/smallest acceptable value",
              "Boundary data is the largest/smallest acceptable value and the corresponding smallest/largest rejected value",
            ],
          },
          {
            id: "7.7",
            statement: "Complete a trace table to document a dry-run of an algorithm",
            notes: ["Including, at each step in an algorithm, variables, outputs and user prompts"],
          },
          {
            id: "7.8",
            statement: "Identify errors in given algorithms and suggest ways of correcting these errors",
            notes: [],
          },
          {
            id: "7.9",
            statement:
              "Write and amend algorithms for given problems or scenarios, using: pseudocode, program code and flowcharts",
            notes: [
              "Precision is required when writing algorithms, e.g. x > y is acceptable but x is greater than y is not acceptable",
              "See section 4 of the syllabus for flowchart symbols and pseudocode",
            ],
          },
        ],
      },
    ],
  },
  {
    number: 8,
    title: "Programming",
    paper: 2,
    subtopics: [
      {
        id: "8.1",
        title: "Programming concepts",
        objectives: [
          { id: "8.1.1", statement: "Declare and use variables and constants", notes: [] },
          {
            id: "8.1.2",
            statement: "Understand and use basic data types",
            notes: ["Including integer, real, char, string and Boolean"],
          },
          { id: "8.1.3", statement: "Understand and use input and output", notes: [] },
          {
            id: "8.1.4",
            statement:
              "Understand and use the concepts of (a) sequence (b) selection (c) iteration (d) totalling and counting (e) string handling (f) arithmetic, relational and logical operators",
            notes: [
              "Selection including IF statements and CASE statements",
              "Iteration including count-controlled loops, pre-condition loops and post-condition loops",
              "String handling including length, substring, upper and lower; the first character of the string can be position zero or one",
              "Arithmetic operators limited to +, -, /, *, ^ (raised to power of), MOD and DIV",
              "Relational operators limited to =, <, <=, >, >= and <> (not equal to)",
              "Logical operators limited to AND, OR and NOT",
            ],
          },
          {
            id: "8.1.5",
            statement: "Understand and use nested statements",
            notes: [
              "Including nested selection and iteration",
              "Candidates will not be required to write more than three levels of nested statements",
            ],
          },
          {
            id: "8.1.6",
            statement:
              "(a) Understand what is meant by procedures, functions and parameters (b) Define and use procedures and functions, with or without parameters (c) Understand and use local and global variables",
            notes: ["Procedures and functions may have up to three parameters"],
          },
          {
            id: "8.1.7",
            statement: "Understand and use library routines",
            notes: ["Including MOD, DIV, ROUND and RANDOM"],
          },
          {
            id: "8.1.8",
            statement: "Understand how to create a maintainable program",
            notes: [
              "Including appropriate use of meaningful identifiers, the commenting feature provided by the programming language, procedures and functions, and relevant and appropriate commenting of syntax",
              "Use meaningful identifiers for variables, constants, arrays, procedures and functions",
            ],
          },
        ],
      },
      {
        id: "8.2",
        title: "Arrays",
        objectives: [
          {
            id: "8.2.1",
            statement: "Declare and use one-dimensional (1D) and two-dimensional (2D) arrays",
            notes: [],
          },
          {
            id: "8.2.2",
            statement: "Understand the use of arrays",
            notes: ["Including the use of variables as indexes in arrays", "The first index can be zero or one"],
          },
          {
            id: "8.2.3",
            statement: "Write values into, and read values from, an array using iteration",
            notes: ["Including nested iteration"],
          },
        ],
      },
      {
        id: "8.3",
        title: "File handling",
        objectives: [
          {
            id: "8.3.1",
            statement: "Understand the purpose of storing data in a file to be used by a program",
            notes: [],
          },
          {
            id: "8.3.2",
            statement: "Open, close and use a file for reading and writing",
            notes: ["Including read and write single items of data, and read and write a line of text"],
          },
        ],
      },
    ],
  },
  {
    number: 9,
    title: "Databases",
    paper: 2,
    subtopics: [
      {
        id: "9",
        title: "Databases",
        objectives: [
          {
            id: "9.1",
            statement: "Define a single-table database from given data storage requirements",
            notes: ["Including fields, records and validation"],
          },
          {
            id: "9.2",
            statement: "Suggest suitable basic data types",
            notes: ["Including text/alphanumeric, character, Boolean, integer, real and date/time"],
          },
          {
            id: "9.3",
            statement:
              "Understand the purpose of a primary key and identify a suitable primary key for a given database table",
            notes: [],
          },
          {
            id: "9.4",
            statement:
              "Read, understand and complete structured query language (SQL) scripts to query data stored in a single database table",
            notes: [
              "Limited to SELECT, FROM, WHERE, ORDER BY DESCENDING, ORDER BY ASCENDING, SUM, COUNT, AND and OR",
              "Identifying the output given by an SQL statement that will query the given contents of a database table",
            ],
          },
        ],
      },
    ],
  },
  {
    number: 10,
    title: "Boolean logic",
    paper: 2,
    subtopics: [
      {
        id: "10",
        title: "Boolean logic",
        objectives: [
          {
            id: "10.1",
            statement: "Identify and use the standard symbols for logic gates",
            notes: ["See section 4 of the syllabus for logic gate symbols"],
          },
          {
            id: "10.2",
            statement: "Define and understand the functions of logic gates",
            notes: [
              "Including NOT, AND, OR, NAND, NOR and XOR (EOR)",
              "Including the binary output produced from all the possible binary inputs",
              "NOT is a single input gate; all other gates are limited to two inputs",
            ],
          },
          {
            id: "10.3",
            statement:
              "(a) Use logic gates to create given logic circuits from a (i) problem statement (ii) logic expression (iii) truth table (b) Complete a truth table from a (i) problem statement (ii) logic expression (iii) logic circuit (c) Write a logic expression from a (i) problem statement (ii) logic circuit (iii) truth table",
            notes: [
              "Circuits must be drawn for the statement given, without simplification",
              "Logic circuits will be limited to a maximum of three inputs and one output",
              "A truth table with three inputs has 8 rows, from 000 to 111",
            ],
          },
        ],
      },
    ],
  },
];
