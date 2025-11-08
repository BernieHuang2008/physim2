const translations = {
	// ===============================
	// General Terms
	// ===============================
	"Untitled": "Untitled",
	"Particle": "Particle",
	"Untitled Section": "Untitled Section",
	"Untitled Particle": "Untitled Particle",
	"Untitled Basic PhyObject": "Untitled Basic PhyObject",
	"World Settings": "World Settings",
	"Untitled Force Field": "Untitled Force Field",

	// ===============================
	// Physical Properties
	// ===============================
	"Basic Properties": "Basic Properties",
	"Mass": "Mass",
	"Position": "Position",
	"Velocity": "Velocity",
	"Acceleration": "Acceleration",
	"Variables": "Variables",
	"Vars": "Vars",
	"Force Fields": "Force Fields",
	"Application Scope": "Application Scope",
	"Expression": "Expression",
	"Strength": "Strength",
	"Direction": "Direction",

	// Vector Component Labels
	"X": "X",
	"Y": "Y",
	"Len": "Length",
	"α": "α",
	"Magnitude": "Magnitude",
	"Angle": "Angle",

	// Physics Constants
	"Gravity": "Gravity",
	"Universal Gravitational": "Universal Gravitation",
	"Electrostatic": "Electrostatic",
	"Gravitational Acceleration (g)": "Gravitational Acceleration (g)",
	"Gravitational Constant (G)": "Gravitational Constant (G)",
	"Coulomb's Constant (k)": "Coulomb's Constant (k)",

	// ===============================
	// Data Types
	// ===============================
	"immediate": "immediate",
	"derived": "derived",

	"FF": "Force Field",

	// Physics Object Types
	"BasicPO": "Basic PhyObject",
	"ParticlePO": "Particle",
	"WorldAnchorPO": "World Anchor",

	// UI Element Types
	"section": "section",
	"subsection": "subsection",
	"html": "HTML",
	"ui-control": "UI Control",

	// ===============================
	// User Interface
	// ===============================
	"Inspector": "Inspector",
	"Force Field Editor": "Force Field Editor",
	"Monitor": "Monitor",

	"Add New": "Add New",
	"Copy": "Copy",
	"Edit": "Edit",
	"View": "View",
	"Delete": "Delete",
	"Close": "Close",
	"Return": "Return",

	"Choose Template": "Choose Template",
	"Template Settings": "Template Settings",
	"Advanced Settings": "Advanced Settings",
	"Preview & Operation": "Preview & Operation",

	"ID": "ID",
	"Error": "Error",
	"No data to display": "No data to display",
	"Notifications": "Notifications",
	"No notifications.": "No notifications.",

	// Vector Display
	"Vector Summary": "Vector Summary",
	"Count": "Count",
	"All Component Forces": "All Component Forces",
	"Force Analysis": "Force Analysis",
	"No vectors to display": "No vectors to display",
	"Vector": "Vector",

	// File Operations
	"File": "File",
	"Save World (static)": "Save World (static)",
	"Load World (static)": "Load World (static)",
	"Failed to load world": "Failed to load world",

	// Confirmation Messages
	"Use New Template? By doing this, current settings will be LOST.": "Use New Template? By doing this, current settings will be LOST.",
	"Are you sure you want to delete this force field?": "Are you sure you want to delete this force field?",
	"Enter new variable nickname:": "Enter new variable nickname:",
	"new_var": "new_var",
	"Handle Noti.": "Handle Notification",

	// Error Messages
	"Force Calculation Failed": "Force Calculation Failed",
	"Potential Calculation Failed": "Potential Calculation Failed",
	"Invalid expression": "Invalid expression",
	"Table Cell Error": "Table Cell Error",

	"Circular Dependency Detected": "Circular Dependency Detected",
	"Circular dependency detected": "Circular dependency detected",
	"Expression reverted to previous valid state": "Expression reverted to previous valid state",
	"No circular dependency found": "No circular dependency found",

	"Force Field Not Found": "Force Field Not Found",
	"Physics Object Not Found": "Physics Object Not Found",
	"Force field not found": "Force field not found",
	"No force field with id": "No force field with id",
	"No phyobj with id": "No phyobj with id",

	"Cannot modify id after initialization": "Cannot modify id after initialization",
	"Math input can only be used with derived variables": "Math input can only be used with derived variables",

	"MathJax Load Failed": "MathJax Load Failed",
	"MathJax Init Failed": "MathJax Init Failed",
	"MathJax Render Failed": "MathJax Render Failed",
	"LaTeX Conversion Failed": "LaTeX Conversion Failed",

	// Mode Switching
	"EDIT": "EDIT",
	"SIMULATE": "SIMULATE",
	"KEYFRAME": "KEYFRAME",
	"Mode": "Mode",
	"Edit Mode": "Edit Mode",
	"Simulation Mode": "Simulation Mode",
	"Keyframe Mode": "Keyframe Mode",

	// Simulation Control
	"Simulate": "Simulate",
	"Start Animation (60 FPS)": "Start Animation (60 FPS)",
	"Stop Animation": "Stop Animation",
	"Toggle Animation": "Toggle Animation",
	"Step Animation (1 step)": "Step Animation (1 step)",
	"Step Animation (10 steps)": "Step Animation (10 steps)",
	"Simulate to 1 second": "Simulate to 1 second",
	"Simulate to 5 seconds": "Simulate to 5 seconds",
	"Reset Simulation": "Reset Simulation",

	"Animation Started": "Animation Started",
	"Animation started at 60 FPS": "Animation started at 60 FPS",
	"Animation Stopped": "Animation Stopped",
	"Animation has been stopped": "Animation has been stopped",
	"Animation Toggled": "Animation Toggled",
	"No Animation": "No Animation",
	"No animation is currently running": "No animation is currently running",
	"Step Complete": "Step Complete",
	"Stepped 1 physics frame": "Stepped 1 physics frame",
	"Stepped 10 physics frames": "Stepped 10 physics frames",
	"Simulation Complete": "Simulation Complete",
	"Simulated to 1 second": "Simulated to 1 second",
	"Simulated to 5 seconds": "Simulated to 5 seconds",
	"Simulation Reset": "Simulation Reset",
	"Simulation reset to time 0": "Simulation reset to time 0",
	"The simulation has been reset to the initial state.": "The simulation has been reset to the initial state.",

	"Animation Error": "Animation Error",
	"Step Error": "Step Error",
	"Simulation Error": "Simulation Error",
	"Reset Error": "Reset Error",

	// Other Pages
	"About": "About",

	// Help Documentation
	"HELP_MATHINPUT": `
		<b>Formula Input</b>
		<hr>
		Prefix your input with <code>=</code> to enter a mathematical expression.
		Standard <a h='#A/MathJsSyntax'>MathJS syntax</a> and <a h='#V/VarRef'>VAR references</a> are fully supported.
		<br>
		Example: <code>= 2 * pi</code>
	`,

	"HELP_FFMATH": `
		<b>Force Field Math Expression</b>
		<hr>
		<b>Note: the expression must return a <code>2D vector</code> representing a force.</b>
		<br><br>
		Prefix your input with <code>=</code> to enter a mathematical expression.
		Standard <a h='#A/MathJsSyntax'>MathJS syntax</a> and extended <a h='#X/VarTarRef'>VAR/TARGET references</a> are supported.
		<br>
		Example: <code>= pos ^ 2 * [0, 1]</code>
		<br><br>
	`,

	"HELP_FFCOND": `
		<b>Force Field Application Condition</b>
		<hr>
		A condition expression that determines whether a force field applies to an object. Return a truthy value to apply; return <code>0/false/null</code> (falsy) to not apply.
		<br>
		<b>Note: use double equals <code>==</code> for equality checks.</b>
		<br><br>
		Prefix your input with <code>=</code> to enter a mathematical expression.
		Standard <a h='#A/MathJsSyntax'>MathJS syntax</a> and extended <a h='#X/VarTarRef'>VAR/TARGET references</a> are supported.
		<br>
		Example: <code>= norm(pos) != 0</code>
	`,

	// Manual Documentation
	"MAN_MathJsSyntax": `
		<h2>Standard MathJS Syntax</h2>
		<hr>
		<p>MathJS is a powerful math library supporting a wide range of operations and functions.</p>

		<h4>Basic operators</h4>
			<ul>
				<li>Add: <code>+</code></li>
				<li>Subtract: <code>-</code></li>
				<li>Multiply: <code>*</code></li>
				<li>Divide: <code>/</code></li>
				<li>Power: <code>^</code></li>
			</ul>

		<h4>Common functions</h4>
			<ul>
				<li>Square root: <code>sqrt(x)</code></li>
				<li>Trigonometric: <code>sin(x)</code> / <code>cos(x)</code> / <code>tan(x)</code></li>
				<li>Inverse trig: <code>asin(x)</code> / <code>acos(x)</code> / <code>atan(x)</code></li>
				<li>Power/log: <code>pow(x, exponent)</code> / <code>log(x, base)</code></li>
			</ul>

		<p>For full MathJS syntax and features see the official docs: <a href="https://mathjs.org/docs/expressions/syntax.html" target="_blank">MathJS Syntax</a></p>
        
		<hr>

		<h4>Constants</h4>
		<table>
			<tr>
				<th>Constant</th>
				<th>Description</th>
				<th>Value</th>
			</tr>
			<tr>
				<td><code>e</code>, <code>E</code></td>
				<td>Euler's number, base of natural logarithm</td>
				<td>2.718281828459045</td>
			</tr>
			<tr>
				<td><code>i</code></td>
				<td>Imaginary unit, where <code>i * i = -1</code></td>
				<td>sqrt(-1)</td>
			</tr>
			<tr>
				<td><code>Infinity</code></td>
				<td>Infinity</td>
				<td>Infinity</td>
			</tr>
			<tr>
				<td><code>LN2</code></td>
				<td>Natural log of 2</td>
				<td>0.6931471805599453</td>
			</tr>
			<tr>
				<td><code>LN10</code></td>
				<td>Natural log of 10</td>
				<td>2.302585092994046</td>
			</tr>
			<tr>
				<td><code>LOG2E</code></td>
				<td>Log base 2 of e</td>
				<td>1.4426950408889634</td>
			</tr>
			<tr>
				<td><code>LOG10E</code></td>
				<td>Log base 10 of e</td>
				<td>0.4342944819032518</td>
			</tr>
			<tr>
				<td><code>NaN</code></td>
				<td>Not a number</td>
				<td>NaN</td>
			</tr>
			<tr>
				<td><code>null</code></td>
				<td>Null</td>
				<td>null</td>
			</tr>
			<tr>
				<td><code>phi</code></td>
				<td>Golden ratio</td>
				<td>1.618033988749895</td>
			</tr>
			<tr>
				<td><code>pi</code>, <code>PI</code></td>
				<td>Pi</td>
				<td>3.141592653589793</td>
			</tr>
			<tr>
				<td><code>SQRT1_2</code></td>
				<td>Square root of 1/2</td>
				<td>0.7071067811865476</td>
			</tr>
			<tr>
				<td><code>SQRT2</code></td>
				<td>Square root of 2</td>
				<td>1.4142135623730951</td>
			</tr>
			<tr>
				<td><code>tau</code></td>
				<td>Tau (2 * pi)</td>
				<td>6.283185307179586</td>
			</tr>
			<tr>
				<td><code>undefined</code></td>
				<td>Undefined</td>
				<td>undefined</td>
			</tr>
			<tr>
				<td><code>version</code></td>
				<td>math.js version</td>
				<td>e.g. 0.24.1</td>
			</tr>
		</table>

		<p>For a full list of functions see <a href="https://mathjs.org/docs/reference/functions.html" target="_blank">MathJS Function Reference</a>.</p>
		`,

	"MAN_VarRef": `
		<h2>Variable references in expressions</h2>
		<hr>
		<p>You can reference other variables defined in the world by their ID.</p>
		<p>Use the <code>VAR_</code> prefix. For example: <code>= VAR_123456789 ^ 2</code>.</p>
		`,

	"MAN_VarTarRef": `
		<h2>Extended VAR/TARGET references in expressions</h2>
		<hr>
		<h4>VAR references</h4>
		<p>Reference other variables by ID using the <code>VAR_</code> prefix. Example: <code>= VAR_123456789 ^ 2</code>.</p>
		<h4>TARGET references</h4>
		<p>Use the <code>TARGET_</code> prefix to reference variables of the target object. Example: <code>= TARGET_q + 10</code>.</p>
		<p>Special target properties available:</p>
		<ul>
			<li><code>pos</code>: target position vector</li>
			<li><code>v</code>: target velocity vector</li>
			<li><code>mass</code>: target mass</li>
			<li><code>time</code>: current simulation time</li>
		</ul>
		`,
};

export default translations;