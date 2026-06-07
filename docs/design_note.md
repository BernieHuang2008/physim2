# 计算/更新顺序：

Var -> ForceFieldInitiative -> ForceFieldPassive -> Obj State

同级不可访问原则：
- Var 同级可访问，但是引用不能有环。
- ForceField 同级不可访问

# PhyObject:
everything is a Var. Everything must be able to access via Var.
