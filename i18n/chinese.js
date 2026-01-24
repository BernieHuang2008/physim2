const translations = {
    // ===============================
    // 基础术语 (General Terms)
    // ===============================
    "Untitled": "未命名",
    "Particle": "质点",
    "Untitled Section": "未命名部分",
    "Untitled Particle": "未命名质点",
    "Untitled Basic PhyObject": "未命名基础物理对象",
    "World Settings": "世界设置",
    "Untitled Force Field": "未命名力场",

    // ===============================
    // 物理量与属性 (Physical Properties)
    // ===============================
    "Basic Properties": "基本属性",
    "Mass": "质量",
    "Position": "位置",
    "Velocity": "速度",
    "Acceleration": "加速度",
    "Variables": "变量",
    "Vars": "变量",
    "Force Fields": "力场",
    "Application Scope": "适用范围",
    "Expression": "表达式",
    "Strength": "强度",
    "Direction": "方向",

    // 向量组件标签 (Vector Component Labels)
    "X": "X",
    "Y": "Y",
    "Len": "长度",
    "α": "α",
    "Magnitude": "大小",
    "Angle": "角度",

    // 物理常数 (Physics Constants)
    "Gravity": "重力",
    "Universal Gravitational": "万有引力",
    "Electrostatic": "静电力",
    "Gravitational Acceleration (g)": "重力加速度 (g)",
    "Gravitational Constant (G)": "引力常数 (G)",
    "Coulomb's Constant (k)": "库仑常数 (k)",

    // ===============================
    // 数据类型 (Data Types)
    // ===============================
    // 变量类型 (Variable Types)
    "immediate": "立即值",
    "derived": "派生值",

    // 力场类型 (Force Field Types)
    "FF": "力场",

    // 物理对象类型 (Physics Object Types)
    "BasicPO": "基础物理对象",
    "ParticlePO": "质点",
    "WorldAnchorPO": "世界锚点",

    // UI元素类型 (UI Element Types)
    "section": "章节",
    "subsection": "子章节",
    "html": "HTML",
    "ui-control": "UI控件",

    // ===============================
    // 用户界面 (User Interface)
    // ===============================
    // UI区域名称 (UI Section Names)
    "Inspector": "检查器",
    "Force Field Editor": "力场编辑器",
    "Monitor": "监视器",
    "[Monitor]": "[监视器]",
    "Info": "信息",

    // 按钮标签和操作 (Button Labels and Actions)
    "Add New": "添加新项",
    "Copy": "复制",
    "Edit": "编辑",
    "View": "查看",
    "Delete": "删除",
    "Close": "关闭",
    "Return": "返回",
    "Add Particle": "添加质点",

    // 模板相关 (Template Related)
    "Choose Template": "选择模板",
    "Template Settings": "模板设置",
    "Advanced Settings": "高级设置",
    "Preview & Operation": "预览与操作",

    // 通用UI (General UI)
    "ID": "ID",
    "Error": "错误",
    "No data to display": "无数据显示",
    "Notifications": "通知",
    "No notifications.": "暂无通知。",

    // Var info display
    "VAR": "变量",
    "Master": "宿主对象",
    "Type": "类型",
    "Value": "值",
    "Expression": "表达式",

    // ===============================
    // 向量显示 (Vector Display)
    // ===============================
    "Vector Summary": "所有向量",
    "Count": "数量",
    "All Component Forces": "所有分力",
    "Force Analysis": "受力分析",
    "No vectors to display": "没有向量",
    "Vector": "向量",

    // ===============================
    // 文件操作 (File Operations)
    // ===============================
    "File": "文件",
    "Save World (static)": "保存世界（静态）",
    "Load World (static)": "加载世界（静态）",
    "Failed to load world": "加载世界失败",

    // ===============================
    // 通知消息 (Notification Messages)
    // ===============================
    // 成功消息 (Success Messages)
    "A new particle has been added to the world.": "一个新的质点已被添加到世界中。",

    // ===============================
    // 确认消息 (Confirmation Messages)
    // ===============================
    "Use New Template? By doing this, current settings will be LOST.": "使用新模板？这样做会丢失当前设置。",
    "Are you sure you want to delete this force field?": "您确定要删除此力场吗？",
    "Enter new variable nickname:": "新变量的名称：",
    "new_var": "new_var",
    "Handle Noti.": "处理通知",

    // ===============================
    // 错误消息 (Error Messages)
    // ===============================
    // 计算错误 (Calculation Errors)
    "Force Calculation Failed": "力计算失败",
    "Potential Calculation Failed": "势能计算失败",
    "Invalid expression": "无效的表达式",
    "Table Cell Error": "表格单元格错误",
    "Simulation Error: Overlapping FFDs": "仿真错误：多重FFD",
    "Detected multiple FFDs on one object!": "检测到一个对象上同时作用多个 FF Derived（被动力场）！",

    // 依赖错误 (Dependency Errors)
    "Circular Dependency Detected": "检测到循环依赖",
    "Circular dependency detected": "检测到循环依赖",
    "Expression reverted to previous valid state": "表达式已恢复到最近的有效状态",
    "No circular dependency found": "未发现循环依赖",

    // 对象查找错误 (Object Not Found Errors)
    "Force Field Not Found": "力场未找到",
    "Physics Object Not Found": "物理对象未找到",
    "Force field not found": "未找到力场",
    "No force field with id": "未找到标识符对应的力场",
    "No phyobj with id": "未找到标识符对应的物理对象",

    // 操作限制错误 (Operation Restriction Errors)
    "Cannot modify id after initialization": "初始化后无法修改标识符",
    "Math input can only be used with derived variables": "数学输入只能用于派生变量",

    // 渲染错误 (Rendering Errors)
    "MathJax Load Failed": "MathJax加载失败",
    "MathJax Init Failed": "MathJax初始化失败",
    "MathJax Render Failed": "MathJax渲染失败",
    "LaTeX Conversion Failed": "LaTeX转换失败",

    // ===============================
    // 模式切换 (Mode Switching)
    // ===============================
    "EDIT": "编辑",
    "SIMULATE": "仿真",
    "KEYFRAME": "关键帧",
    "Mode": "模式",
    "Edit Mode": "编辑模式",
    "Simulation Mode": "仿真模式",
    "Keyframe Mode": "关键帧模式",
    "Mode Switch Aborted": "模式切换失败",
    "Current mode failed to clean up properly: ": "当前模式未能正确关闭：",

    // ===============================
    // 仿真控制 (Simulation Control)
    // ===============================
    // 仿真菜单 (Simulation Menu)
    "Simulate": "仿真",
    "Start Animation (60 FPS)": "开始动画 (60 FPS)",
    "Stop Animation": "停止动画",
    "Toggle Animation": "切换动画",
    "Step Animation (1 step)": "步进动画 (1 步)",
    "Step Animation (10 steps)": "步进动画 (10 步)",
    "Simulate to 1 second": "仿真到 1 秒",
    "Simulate to 5 seconds": "仿真到 5 秒",
    "Reset Simulation": "重置仿真",
    "Monit": "监视",
    "Open External Monitor": "打开外置监视器",

    // 仿真通知 (Simulation Notifications)
    "Animation Started": "动画已开始",
    "Animation started at 60 FPS": "动画以 60 FPS 开始",
    "Animation Stopped": "动画已停止",
    "Animation has been stopped": "动画已被停止",
    "Animation Toggled": "动画已切换",
    "No Animation": "无动画",
    "No animation is currently running": "当前没有运行的动画",
    "Step Complete": "步进完成",
    "Stepped 1 physics frame": "已步进 1 个物理帧",
    "Stepped 10 physics frames": "已步进 10 个物理帧",
    "Simulation Complete": "仿真完成",
    "Simulated to 1 second": "已仿真到 1 秒",
    "Simulated to 5 seconds": "已仿真到 5 秒",
    "Simulation Reset": "仿真已重置",
    "Simulation reset to time 0": "仿真已重置到时间 0",
    "The simulation has been reset to the initial state.": "仿真已重置到初始状态",

    // 仿真错误 (Simulation Errors)
    "Animation Error": "动画错误",
    "Step Error": "步进错误",
    "Simulation Error": "仿真错误",
    "Reset Error": "重置错误",

    // ===============================
    // 其他页面 (Other Pages)
    // ===============================
    "About": "关于",
    "Time / s": "时间 / 秒",

    // ===============================
    // 帮助文档 (Help Documentation)
    // ===============================
    // 帮助内容 (Help Content)
    "HELP_MATHINPUT": `
        <b>公式输入</b>
        <hr>
        使用 <code>=</code> 作为前缀，输入数学表达式。
        完全支持 <a h='#A/MathJsSyntax'>标准 MathJS 语法</a> 和 <a h='#V/VarRef'>VAR 引用</a>。
        <br>
        示例： <code>= 2 * pi</code>
    `,
    "HELP_FFMATH": `
        <b>力场数学表达式</b>
        <hr>
        <b>*注意：表达式的结果必须是一个 <code> 二维向量 </code>，表示一个作用力。</b>
        <br><br>
        使用 <code>=</code> 前缀，输入数学表达式。
        完全支持 <a h='#A/MathJsSyntax'>标准 MathJS 语法</a> 和 <a h='#X/VarTarRef'>拓展 VAR/TARGET 引用</a>。
        <br>
        示例： <code>= pos ^ 2 * [0, 1]</code>
        <br><br>
    `,
    "HELP_FFCOND": `
        <b>力场应用条件</b>
        <hr>
        判断力场是否作用于某个物体的“条件表达式”。返回 <code>真值</code> 则作用，返回 <code>0/false/null</code> 等假值则不作用。
        <br>
        <b>*注意：使用“双等号 <code>==</code>”进行相等判断。</b>
        <br><br>
        使用 <code>=</code> 前缀，输入数学表达式。
        完全支持 <a h='#A/MathJsSyntax'>标准 MathJS 语法</a> 和 <a h='#X/VarTarRef'>拓展 VAR/TARGET 引用</a>。
        <br>
        示例： <code>= norm(pos) != 0</code>
    `,

    // ===============================
    // 手册文档 (Manual Documentation)
    // ===============================
    // MathJS语法手册 (MathJS Syntax Manual)
    "MAN_MathJsSyntax": `
        <h2>标准 MathJS 语法</h2>
        <hr>
        <p>MathJS 是一个强大的数学库，支持广泛的数学运算和函数。</p>

        <h4>基本运算符</h4>
            <ul>
                <li>加法: <code>+</code></li>
                <li>减法: <code>-</code></li>
                <li>乘法: <code>*</code></li>
                <li>除法: <code>/</code></li>
                <li>幂运算: <code>^</code></li>
            </ul>

        <h4>常用函数</h4>
            <ul>
                <li>平方根: <code>sqrt(x)</code></li>
                <li>三角函数: <code>sin(x)</code> / <code>cos(x)</code> / <code>tan(x)</code></li>
                <li>反三角函数: <code>asin(x)</code> / <code>acos(x)</code> / <code>atan(x)</code></li>
                <li>指数/对数: <code>pow(x, exponent)</code> / <code>log(x, base)</code></li>
            </ul>

        <p>有关 MathJS 语法和功能的全面指南，请参考官方文档：<a href="https://mathjs.org/docs/expressions/syntax.html" target="_blank">MathJS 语法文档</a></p>
        
        <hr>

        <h4>常量</h4>
        <table>
            <tr>
                <th>常量</th>
                <th>描述</th>
                <th>值</th>
            </tr>
            <tr>
                <td><code>e</code>, <code>E</code></td>
                <td>欧拉数，自然对数的底数</td>
                <td>2.718281828459045</td>
            </tr>
            <tr>
                <td><code>i</code></td>
                <td>虚数单位，定义为 <code>i * i = -1</code>。复数表示为 <code>a + b * i</code>，其中 <code>a</code> 是实部，<code>b</code> 是虚部</td>
                <td>sqrt(-1)</td>
            </tr>
            <tr>
                <td><code>Infinity</code></td>
                <td>无穷大，大于浮点数能处理的最大数值</td>
                <td>Infinity</td>
            </tr>
            <tr>
                <td><code>LN2</code></td>
                <td>返回 2 的自然对数</td>
                <td>0.6931471805599453</td>
            </tr>
            <tr>
                <td><code>LN10</code></td>
                <td>返回 10 的自然对数</td>
                <td>2.302585092994046</td>
            </tr>
            <tr>
                <td><code>LOG2E</code></td>
                <td>返回 <code>E</code> 的以 2 为底的对数</td>
                <td>1.4426950408889634</td>
            </tr>
            <tr>
                <td><code>LOG10E</code></td>
                <td>返回 <code>E</code> 的以 10 为底的对数</td>
                <td>0.4342944819032518</td>
            </tr>
            <tr>
                <td><code>NaN</code></td>
                <td>非数值</td>
                <td>NaN</td>
            </tr>
            <tr>
                <td><code>null</code></td>
                <td>空值</td>
                <td>null</td>
            </tr>
            <tr>
                <td><code>phi</code></td>
                <td>黄金比例。两个量的比值等于它们的和与较大量的比值时，称为黄金比例。<code>φ</code> 定义为 <code>(1 + sqrt(5)) / 2</code></td>
                <td>1.618033988749895</td>
            </tr>
            <tr>
                <td><code>pi</code>, <code>PI</code></td>
                <td>圆周率，圆的周长与直径的比值</td>
                <td>3.141592653589793</td>
            </tr>
            <tr>
                <td><code>SQRT1_2</code></td>
                <td>返回 1/2 的平方根</td>
                <td>0.7071067811865476</td>
            </tr>
            <tr>
                <td><code>SQRT2</code></td>
                <td>返回 2 的平方根</td>
                <td>1.4142135623730951</td>
            </tr>
            <tr>
                <td><code>tau</code></td>
                <td>圆的周长与半径的比值常数，等于 <code>2 * pi</code></td>
                <td>6.283185307179586</td>
            </tr>
            <tr>
                <td><code>undefined</code></td>
                <td>未定义值。建议使用 <code>null</code> 表示未定义值</td>
                <td>undefined</td>
            </tr>
            <tr>
                <td><code>version</code></td>
                <td>返回 math.js 的版本号</td>
                <td>例如 0.24.1</td>
            </tr>
        </table>

        <p>以上仅为 MathJS 支持的部分运算符和函数。有关完整列表，请参阅 <a href="https://mathjs.org/docs/reference/functions.html" target="_blank">MathJS 函数参考</a>。</p>
        `,

    // 变量引用手册 (Variable Reference Manual)
    "MAN_VarRef": `
        <h2>数学表达式中的变量引用</h2>
        <hr>
        <p>在表达式中，您可以引用世界中定义的其他变量。</p>
        <p>要引用变量，请使用其ID。ID可以在变量定义处复制，由<code>VAR_</code>前缀开始。
        例如，如果您有一个ID为 <code>VAR_123456789</code> 的变量，您可以在表达式中对其进行平方操作： <code>= VAR_123456789 ^ 2</code>。</p>
        `,

    // 扩展变量引用手册 (Extended Variable Reference Manual)
    "MAN_VarTarRef": `
        <h2>数学表达式中的拓展 VAR/TARGET 引用</h2>
        <hr>
        <h4>VAR 引用</h4>
        <p>在表达式中，您可以引用世界中定义的其他变量。</p>
        <p>要引用变量，请使用其ID。ID可以在变量定义处复制，由<code>VAR_</code>前缀开始。
        例如，如果您有一个ID为 <code>VAR_123456789</code> 的变量，您可以在表达式中对其进行平方操作： <code>= VAR_123456789 ^ 2</code>。</p>
        <h4>TARGET 引用</h4>
        <p>此外，您还可以使用<code>TARGET_</code>前缀，快捷地引用 <b>被作用对象</b> 的变量。
        例如，引用 <i>被作用对象</i> 的名为 <code>q</code> 的变量： <code>= TARGET_q + 10</code>。</p>
        <p>另有一些特殊的变量，可以直接访问 <i>被作用对象</i> 的一些属性：</p>
        <ul>
            <li><code>pos</code>: <i>被作用对象</i> 的位置向量</li>
            <li><code>v</code>: <i>被作用对象</i> 的速度向量</li>
            <li><code>mass</code>: <i>被作用对象</i> 的质量</li>
            <li><code>time</code>: 当前的模拟时间</li>
        </ul>
        </p>
        `,
};

export default translations;