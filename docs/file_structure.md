
# Physim 存档文件结构文档 (Project Save File Schema)

本文档旨在说明 Physim 导出的 `.json` 格式存档文件的数据字段与结构。该文件完整记录了物理仿真工程的全貌，包括场景中的物理对象（质点、锚点等）、数学变量、力场以及用户界面中的可视化图表（变量监视器）。

## 📁 根目录层级 (Root Node)

工程文件的最外层是一个 JSON 对象，包含三大核心模块：

| 字段名称 | 类型 | 说明 |
| :--- | :--- | :--- |
| `version` | String | 当前工程文件的数据版本格式，示例中为 `"file-v2"`，用于向后兼容与版本迁移解析。 |
| `world` | Object | **物理世界核心数据**，保存物理仿真场景中所有的实体对象、变量表、力场等数据。 |
| `varmon` | Object | **变量监视器 (Variable Monitor)**，保存用户创建的数据图表（示波器、散点图）的渲染配置与数据缓存。 |

---

## 🌍 World: 物理世界核心数据 (`world`)

`world` 节点用于定义整个物理模拟过程的逻辑和实体，拥有以下主要分支：

```json
"world": {
    "phyobjs": { ... },
    "vars": { ... },
    "ffs": { ... },
    "used_ids": [ ... ],
    "anchor": "OBJ_KDII6HVKU"
}
```

*   **`used_ids`** `(Array<String>)`: ID 登记表。记录当前场景中所分配的所有唯一标识符（OBJ_..., VAR_..., FFI_...），以防止创建新对象时产生 ID 冲突。
*   **`anchor`** `(String)`: 参考系锚点。指向当前世界中充当基础参考系的 `WorldAnchorPO` 对象的 ID。

### 1. 物理对象集合 (`phyobjs`)
以对象的唯一 ID 为键名，登记场景中的所有的物理基本元素。

*   **`id`** `(String)`: 全局唯一的对象标识（例如 `"OBJ_T13DDJ16U"`）。
*   **`type`** `(String)`: 对象的类别，例如：
    *   `"ParticlePO"`: 质点对象。
    *   `"WorldAnchorPO"`: 世界锚点（场景画布容器）。
*   **`nickname`** `(String)`: 用户在 UI 中自定义的可读名称（如：“太阳”、“地球”）。
*   **`mass`** `(Number | String)`: 对象质量。如果是特殊无穷大小，系统支持用特殊的字符串代号，如 `"🥒Infinity"`。
*   **`pos`** `(Array)`: 当前的位置坐标张量（2D通常为 `[x, y]`）。
*   **`velocity`** `(Array)`: 当前的速度矢量 `[vx, vy]`。
*   **`vars`** `(Array<String>)`: 记录挂载/作用在该对象上的自定义变量 ID 列表。
*   **`ffs`** `(Array<String>)`: 记录生效于该对象或其参与定义的力场 (Force Field) ID 列表。
*   **`style`** `(Object)`: 视觉外观样式，包含：
  -  `color`（颜色 Hex 码）
  -  `size`（渲染尺寸大小）
  -  `shape`（SVG 图形字符串，空字符串表示绘制默认质点）。采用CG坐标系（y轴向下），10px=1米，质心在(0, 0)。

example:
```json
"phyobjs": {
    "OBJ_KDII6HVKU": {
        "id": "OBJ_KDII6HVKU",
        "type": "WorldAnchorPO",
        "nickname": "世界设置",
        "mass": "🥒Infinity",
        "pos": [
            0,
            0
        ],
        "velocity": [
            0,
            0
        ],
        "vars": [],
        "ffs": [],
        "style": {
            "color": "#ff0000",
            "size": 1,
            "shape": ""
        }
    },
    "OBJ_T13DDJ16U": {
        "id": "OBJ_T13DDJ16U",
        "type": "ParticlePO",
        "nickname": "太阳",
        "mass": 100,
        "pos": [
            0,
            0
        ],
        "velocity": [
            0,
            0
        ],
        "vars": [
            "VAR_OPVGUJHKZ"
        ],
        "ffs": [
            "FFI_SGYNTAV06"
        ],
        "style": {
            "color": "#ff0000",
            "size": 1,
            "shape": "<svg style=\"transform: translate(-20px, -30px);\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"...\" fill=\"var(--postyle-color)表示使用color属性中设置的颜色\"></path></svg>"
        }
    },
}
```


### 2. 变量注册表 (`vars`)
为了支持强大的数学公式运算，所有的属性数据本身也会被注册为独立的“变量”。以此实现对象属性和自定义常量之间的联动计算。
特殊属性有特殊的命名规范，比如"OBJ_XXXXXXXXX_mass"表示OBJ_XXXXXXXXX物体的质量；"_pos"表示物体的位置；"_velocity"表示物体的速度。特殊属性由系统维护，不需要特别维护，且均为只读变量。

*   **`id`** `(String)`: 变量的唯一识别码。某些对象属性的变量 ID 会遵从 `<对象ID>_<属性名>` 的格式（如 `VAR_OBJ_T13DDJ16U_mass`），而独立设定的常数变量（如引力常数 `G`）则拥有独立 ID（如 `VAR_OPVGUJHKZ`）。
*   **`nickname`** `(String)`: 变量指代名称（如 `"m"`, `"pos"`, `"velocity"`, `"G"`）。
*   **`type`** `(String)`: 变量的求值模式，例如：
    *   `"immediate"`: 立即数（常规纯数值或者固定数组）。
    *   `"derived"`: 派生变量（根据表达式动态推导求值）。
*   **`expression_or_value`** `(Any)`: 变量当前的值或是字符串类型的数学表达式。

仅当type=derived时，表达式可以直接引用 `world.vars` 中的变量 ID，或是更复杂的math.js数学表达式。用 `t`变量来访问时间（当前仿真时间）。

注意：添加变量时，不仅要注册ID，还要同步修改宿主对象的"vars"字段，以形成交叉引用。删除时亦须维护交叉引用。

example:
```json
"vars": {
    "VAR_OBJ_T13DDJ16U_mass": {
        "id": "VAR_OBJ_T13DDJ16U_mass",
        "nickname": "m",
        "type": "immediate",
        "expression_or_value": 100
    },
    "VAR_OPVGUJHKZ": {
        "id": "VAR_OPVGUJHKZ",
        "nickname": "G",
        "type": "immediate",
        "expression_or_value": 10
    },
    "VAR_DERIVED_EXAMPLE": {
        "id": "VAR_123456789",
        "nickname": "derived_var_example",
        "type": "derived",
        "expression_or_value": "sqrt(VAR_OPVGUJHKZ * 2)"
    }
}
```

### 3. 力场系统 (`ffs`)
定义作用在物理对象上的受力或物理规则。注意！力场的定义为“一个条件+一个公式”，引擎会遍历场上所有物理对象（包括宿主对象自己），先检查condition是否被满足。如果被满足（即表达式结果为真），则对expression进行解析与运算，并对当前遍历到的物理对象施加对应的力、**对宿主对象施加大小相等、方向相反的反作用力**。（注：FF在计算时将自动通过交叉引用计算master，所以不需要特别指明master字段）

*   **`id`** `(String)`: 力场节点唯一 ID。
*   **`type`** `(String)`: 力场类型器（目前仅可设置为 `"FFI"`）。
*   **`nickname`** `(String)`: 力场名称。
*   **`expression`** `(String)`: **核心物理计算表达式**。这是一个代数式字符串，引擎会将其解析并用对象当前的局部变量（如坐标 `pos`）及对应的宏变量（如代表引力常数 G 的变量）代入计算，支持向量和标量计算（如 `norm()` 函数，四则运算）。expression的计算结果必须为一个二维向量，代表作用在当前对象上的力的大小和方向。
*   **`condition`** `(String)`: 作用条件，用逻辑表达式表示，如 `"true"` 表示永远生效。
*   **`template`** `(Object)`: [可选] 记录该力场从哪个自带模板生成：
    *   `type`: 模板类别，如 `"universal_gravitational"`（万有引力模板）。
    *   `params`: 模板内形式参数向当前世界变量 ID 的映射配置。

AI ASSISTANT 在生成时不需要填写template字段，留为空对象即可。

表达式可以直接引用 `world.vars` 中的变量 ID，或是更复杂的math.js数学表达式。也可以用 `t`变量来访问时间（当前仿真时间）。特别的，仅在condition中，可使用`self`变量（boolean）来判断当前遍历到的物理对象是否为力场的master对象，以防止某些力场（如万有引力）对自己产生无穷影响。在其他一些场中，可能还需要判断`mass!=Infinity`，以防止锚点等无穷大质量的对象所产生的反作用力产生无穷影响。

注意：添加力场时，不仅要要注册ID，还要同步修改宿主对象的"ffs"字段，以形成交叉引用。删除时亦须维护交叉引用。（注：FF在计算时将自动通过交叉引用计算master，所以不需要特别指明master字段。这也体现了交叉引用的重要性）。

example:
```json
"ffs": {
    "FFI_SGYNTAV06": {
        "id": "FFI_SGYNTAV06",
        "type": "FFI",
        "nickname": "未命名力场",
        "expression": "- VAR_OPVGUJHKZ * mass * VAR_OBJ_T13DDJ16U_mass / (norm(pos - VAR_OBJ_T13DDJ16U_pos) ^ 2) * ((pos - VAR_OBJ_T13DDJ16U_pos) / norm(pos - VAR_OBJ_T13DDJ16U_pos))",
        "condition": "true",
        "template": {}
    }
},
```
---

## 📈 界面与可视化组: 变量监视器 (`varmon`)

用于存储在仿真时侧边栏或悬浮窗上的绘图组件配置和缓存图表数据。

```json
"varmon": {
    "VAR_OBJ_M3KT0DMCN_pos_vec": {
        "settings": { ... },
        "data": { ... }
    }
}
```

每个属性监视窗口以自己的唯一 ID 为键，包含：

### 1. 渲染与图表配置 (`settings`)
*   **`id`** / **`title`**: 图表的内部标识及弹窗栏标题。
*   **`annoX`** / **`annoY`**: 坐标系轴向标注名称（例如 `"X坐标 / m"`，`"Y坐标 / m"`）。
*   **`exprX`** `(String)`: 横轴 (X轴) 要追踪的数据表达式（例如使用对象的某一个坐标值作 X）。exprX 的表达式可以直接引用 `world.vars` 中的变量 ID，或是更复杂的math.js数学表达式。用 `t`变量来访问时间（当前仿真时间）。
*   **`ySeries`** `(Array<Object>)`: 图表上可以覆盖并列展示多条曲线（因此为数组类型）。每一项代表一条曲线的数据来源：
    *   `name`: 曲线名称（图例）。
    *   `expr`: 纵坐标数据的计算表达式（例如 `VAR_OBJ_M3KT0DMCN_pos[2]`）。表达式可以直接引用 `world.vars` 中的变量 ID，或是更复杂的math.js数学表达式。用 `t`变量来访问时间（当前仿真时间）。
    *   `color`: 当前线条色彩。
*   **`display`** `(Object)`: UI 层视觉参数：
    *   `pos`: 弹窗的位置坐标 `[X, Y]`。
    *   `size`: 弹窗的大小尺寸宽高 `[Width, Height]`。
    *   `disp_type`: 选用的渲染引擎及模式（比如 `"plotly/scatter"` 使用 Plotly 渲染散点连续图）。
    *   `axis_match`: 布尔值，标识由于单位等效时，是否强制匹配 X 和 Y 的比例尺（如描绘运动轨迹时）。
*   **`datatype`** `(String)`: 数据约束类型声明（例如 `"REAL"` 指实数类型）。

example:
```json
"varmon": {
    "VAR_OBJ_M3KT0DMCN_pos_vec": {
        "settings": {
            "id": "VAR_OBJ_M3KT0DMCN_pos_vec",
            "title": "VAR_OBJ_M3KT0DMCN_pos_vec",
            "annoX": "X坐标 / m",
            "annoY": "Y坐标 / m",
            "exprX": "VAR_OBJ_M3KT0DMCN_pos[1]",
            "ySeries": [
                {
                    "name": "Y",
                    "expr": "VAR_OBJ_M3KT0DMCN_pos[2]",
                    "exprVar": {
                        "id": "UNKNOWN",
                        "nickname": "Y",
                        "type": "derived",
                        "expression_or_value": "VAR_OBJ_M3KT0DMCN_pos[2]"
                    },
                    "color": "#1F77B4"
                }
            ],
            "display": {
                "pos": [
                    506,
                    218
                ],
                "size": [
                    600,
                    400
                ],
                "disp_type": "plotly/scatter",
                "axis_match": true
            },
            "datatype": "REAL"
        }
    }
}
```

# example file
```json
{
    "version": "file-v2",
    "world": {
        "phyobjs": {
            "OBJ_KDII6HVKU": {
                "id": "OBJ_KDII6HVKU",
                "type": "WorldAnchorPO",
                "nickname": "世界设置",
                "mass": "🥒Infinity",
                "pos": [
                    0,
                    0
                ],
                "velocity": [
                    0,
                    0
                ],
                "vars": [],
                "ffs": [],
                "style": {
                    "color": "#ff0000",
                    "size": 1,
                    "shape": ""
                }
            },
            "OBJ_T13DDJ16U": {
                "id": "OBJ_T13DDJ16U",
                "type": "ParticlePO",
                "nickname": "太阳",
                "mass": 100,
                "pos": [
                    0,
                    0
                ],
                "velocity": [
                    0,
                    0
                ],
                "vars": [
                    "VAR_OPVGUJHKZ"
                ],
                "ffs": [
                    "FFI_SGYNTAV06"
                ],
                "style": {
                    "color": "#ff0000",
                    "size": 1,
                    "shape": ""
                }
            },
            "OBJ_M3KT0DMCN": {
                "id": "OBJ_M3KT0DMCN",
                "type": "ParticlePO",
                "nickname": "地球",
                "mass": 1,
                "pos": [
                    0,
                    10
                ],
                "velocity": [
                    10,
                    0
                ],
                "vars": [],
                "ffs": [],
                "style": {
                    "color": "#009dff",
                    "size": 1,
                    "shape": ""
                }
            }
        },
        "vars": {
            "VAR_OBJ_KDII6HVKU_mass": {
                "id": "VAR_OBJ_KDII6HVKU_mass",
                "nickname": "m",
                "type": "immediate",
                "expression_or_value": "🥒Infinity"
            },
            "VAR_OBJ_KDII6HVKU_pos": {
                "id": "VAR_OBJ_KDII6HVKU_pos",
                "nickname": "pos",
                "type": "immediate",
                "expression_or_value": [
                    0,
                    0
                ]
            },
            "VAR_OBJ_KDII6HVKU_velocity": {
                "id": "VAR_OBJ_KDII6HVKU_velocity",
                "nickname": "velocity",
                "type": "immediate",
                "expression_or_value": [
                    0,
                    0
                ]
            },
            "VAR_OBJ_T13DDJ16U_mass": {
                "id": "VAR_OBJ_T13DDJ16U_mass",
                "nickname": "m",
                "type": "immediate",
                "expression_or_value": 100
            },
            "VAR_OBJ_T13DDJ16U_pos": {
                "id": "VAR_OBJ_T13DDJ16U_pos",
                "nickname": "pos",
                "type": "immediate",
                "expression_or_value": [
                    0,
                    0
                ]
            },
            "VAR_OBJ_T13DDJ16U_velocity": {
                "id": "VAR_OBJ_T13DDJ16U_velocity",
                "nickname": "velocity",
                "type": "immediate",
                "expression_or_value": [
                    0,
                    0
                ]
            },
            "VAR_OBJ_M3KT0DMCN_mass": {
                "id": "VAR_OBJ_M3KT0DMCN_mass",
                "nickname": "m",
                "type": "immediate",
                "expression_or_value": 1
            },
            "VAR_OBJ_M3KT0DMCN_pos": {
                "id": "VAR_OBJ_M3KT0DMCN_pos",
                "nickname": "pos",
                "type": "immediate",
                "expression_or_value": [
                    0,
                    10
                ]
            },
            "VAR_OBJ_M3KT0DMCN_velocity": {
                "id": "VAR_OBJ_M3KT0DMCN_velocity",
                "nickname": "velocity",
                "type": "immediate",
                "expression_or_value": [
                    10,
                    0
                ]
            },
            "VAR_OPVGUJHKZ": {
                "id": "VAR_OPVGUJHKZ",
                "nickname": "G",
                "type": "immediate",
                "expression_or_value": 10
            }
        },
        "ffs": {
            "FFI_SGYNTAV06": {
                "id": "FFI_SGYNTAV06",
                "type": "FFI",
                "nickname": "未命名力场",
                "expression": "- VAR_OPVGUJHKZ * mass * VAR_OBJ_T13DDJ16U_mass / (norm(pos - VAR_OBJ_T13DDJ16U_pos) ^ 2) * ((pos - VAR_OBJ_T13DDJ16U_pos) / norm(pos - VAR_OBJ_T13DDJ16U_pos))",
                "condition": "true",
                "template": {
                    "type": "universal_gravitational",
                    "params": {
                        "G": "VAR_OPVGUJHKZ"
                    }
                }
            }
        },
        "used_ids": [
            "OBJ_KDII6HVKU",
            "OBJ_T13DDJ16U",
            "OBJ_M3KT0DMCN",
            "FFI_SGYNTAV06",
            "VAR_OPVGUJHKZ"
        ],
        "anchor": "OBJ_KDII6HVKU"
    },
    "varmon": {
        "VAR_OBJ_M3KT0DMCN_pos_vec": {
            "settings": {
                "id": "VAR_OBJ_M3KT0DMCN_pos_vec",
                "title": "VAR_OBJ_M3KT0DMCN_pos_vec",
                "annoX": "X坐标 / m",
                "annoY": "Y坐标 / m",
                "exprX": "VAR_OBJ_M3KT0DMCN_pos[1]",
                "ySeries": [
                    {
                        "name": "Y",
                        "expr": "VAR_OBJ_M3KT0DMCN_pos[2]",
                        "exprVar": {
                            "id": "UNKNOWN",
                            "nickname": "Y",
                            "type": "derived",
                            "expression_or_value": "VAR_OBJ_M3KT0DMCN_pos[2]"
                        },
                        "color": "#1F77B4"
                    }
                ],
                "display": {
                    "pos": [
                        506,
                        218
                    ],
                    "size": [
                        600,
                        400
                    ],
                    "disp_type": "plotly/scatter",
                    "axis_match": true
                },
                "datatype": "REAL"
            }
        }
    }
}
```
