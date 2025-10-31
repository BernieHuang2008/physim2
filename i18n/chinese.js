const translations = {
    // General Terms
    "Untitled": "未命名",
    "Particle": "质点",
    "Untitled Section": "未命名部分",
    "Untitled Particle": "未命名质点",
    "Untitled Basic PhyObject": "未命名基础物理对象",
    "World Settings": "世界设置",
    "Untitled Force Field": "未命名力场",
    
    // UI Section Names
    "Inspector": "检查器",
    "Force Field Editor": "力场编辑器",
    
    // Property Labels
    "Basic Properties": "基本属性",
    "Mass": "质量",
    "Position": "位置",
    "Velocity": "速度",
    "Variables": "变量",
    "Force Fields": "力场",
    "Application Scope": "适用范围",
    "Expression": "表达式",
    "Advanced Settings": "高级设置",
    "Vars": "变量",
    "Choose Template": "选择模板",
    
    // Vector Component Labels
    "X": "X",
    "Y": "Y",
    "Len": "长度",
    "α": "α",
    
    // UI Actions
    "Add New": "添加新项",
    "ID": "ID",
    "Error": "错误",
    "No data to display": "无数据显示",
    
    // Error Messages
    "Force Calculation Failed": "力计算失败",
    "Force Field Not Found": "力场未找到",
    "Physics Object Not Found": "物理对象未找到",
    "Potential Calculation Failed": "势能计算失败",
    "Table Cell Error": "表格单元格错误",
    "Circular Dependency Detected": "检测到循环依赖",
    "MathJax Load Failed": "MathJax加载失败",
    "MathJax Init Failed": "MathJax初始化失败",
    "MathJax Render Failed": "MathJax渲染失败",
    "LaTeX Conversion Failed": "LaTeX转换失败",
    "Invalid expression": "无效的表达式",
    "Circular dependency detected": "检测到循环依赖",
    "Expression reverted to previous valid state": "表达式已恢复到最近的有效状态",
    "No circular dependency found": "未发现循环依赖",
    "Cannot modify id after initialization": "初始化后无法修改标识符",
    "Math input can only be used with derived variables": "数学输入只能用于派生变量",
    "Force field not found": "未找到力场",
    "No force field with id": "未找到标识符对应的力场",
    "No phyobj with id": "未找到标识符对应的物理对象",
    
    // Variable Types
    "immediate": "立即值",
    "derived": "派生值",
    
    // Force Field Types
    "FF": "力场",
    
    // Physics Object Types
    "BasicPO": "基础物理对象",
    "ParticlePO": "质点",
    "WorldAnchorPO": "世界锚点",
    
    // UI Element Types
    "section": "章节",
    "subsection": "子章节", 
    "html": "HTML",
    "ui-control": "UI控件",
    
    // Button Labels and Actions
    "Copy": "复制",
    "Edit": "编辑",
    "View": "查看",
    "Delete": "删除",
    "Close": "关闭",
    "Return": "返回",
    
    // Force Field Template Related
    "Choose Template": "选择模板",
    "Template Settings": "模板设置",
    "Advanced Settings": "高级设置",
    "Application Scope": "适用范围",
    "Expression": "表达式",
    "Strength": "强度",
    "Preview & Operation": "预览与操作",
    "Notifications": "通知",
    "No notifications.": "暂无通知。",
    
    // Multi-Vector Display
    "Vector Summary": "所有向量",
    "Count": "数量",
    "Magnitude": "大小",
    "Angle": "角度",
    "All Component Forces": "所有分力",
    "Force Analysis": "受力分析",
    "Monitor": "监视器",
    "No vectors to display": "没有向量",
    "Vector": "向量",
    
    // Physics Constants and Properties
    "Gravity": "重力",
    "Universal Gravitational": "万有引力",
    "Electrostatic": "静电力",
    "Gravitational Acceleration (g)": "重力加速度 (g)",
    "Direction": "方向",
    "Gravitational Constant (G)": "引力常数 (G)",
    "Coulomb's Constant (k)": "库仑常数 (k)",
    
    // Confirmation Messages
    "Use New Template? By doing this, current settings will be LOST.": "使用新模板？这样做会丢失当前设置。",
    "Are you sure you want to delete this force field?": "您确定要删除此力场吗？",
    "Enter new variable nickname:": "新变量的名称：",
    "new_var": "new_var",
    "Handle Noti.": "处理通知",

    // Error Messages
    "Invalid expression": "无效的表达式",
    "Circular dependency detected": "检测到循环依赖",
    "Expression reverted to previous valid state": "表达式已恢复到最近的有效状态", 
    "No circular dependency found": "未发现循环依赖",
    "Cannot modify id after initialization": "初始化后无法修改标识符",
    "Math input can only be used with derived variables": "数学输入只能用于派生变量",
    "Force field not found": "未找到力场",
    "No force field with id": "未找到标识符对应的力场",
    "No phyobj with id": "未找到标识符对应的物理对象",

    "File": "文件",
    "Save World (static)": "保存世界（静态）",
    "Load World (static)": "加载世界（静态）",
    "Failed to load world": "加载世界失败",
    
    // Simulation Menu
    "Simulate": "仿真",
    "Start Animation (60 FPS)": "开始动画 (60 FPS)",
    "Stop Animation": "停止动画",
    "Toggle Animation": "切换动画",
    "Step Animation (1 step)": "步进动画 (1 步)",
    "Step Animation (10 steps)": "步进动画 (10 步)",
    "Simulate to 1 second": "仿真到 1 秒",
    "Simulate to 5 seconds": "仿真到 5 秒",
    "Reset Simulation": "重置仿真",
    
    // Simulation Notifications
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
    "Animation Error": "动画错误",
    "Step Error": "步进错误",
    "Simulation Error": "仿真错误",
    "Reset Error": "重置错误",

    "EDIT": "编辑",
    "SIMULATE": "仿真",
    "KEYFRAME": "关键帧",
    "Mode": "模式",
    "Edit Mode": "编辑模式",
    "Simulation Mode": "仿真模式",
    "Keyframe Mode": "关键帧模式"
};

export default translations;