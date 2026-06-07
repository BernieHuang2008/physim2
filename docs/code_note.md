# Math.js
- math.js中，undefined和null在表达式中会被当作0处理，所以在ForceField.js中，为了防止mathjs报错，我们将缺失的变量赋值为0，而不是undefined。
- vector的x, y坐标分别在vec[1]和vec[2]中，而不是像传统编程那样使用zero-index。

# shape绘制
- 世界的默认缩放级别是10px=1米。屏幕的平均大小为600x1000px。shape的svg中，请配合使用<svg style="transform: translate(..., ...);" viewBox="..." width="..." height="...">等属性，正确设置svg的尺寸和位置。物理引擎的质心位置为svg的父节点的(0, 0)处。且svg与物理模拟引擎（采用笛卡尔坐标系，y轴向上）不同，采用computer graphics坐标系（y轴向下）。因此在绘制shape时，需要将物理坐标转换为svg坐标，即x坐标不变，y坐标取反。若用户没有指定物体的shape的具体尺寸，请在绘制时将shape调整为屏幕上合适的大小。如果shape字段留为空字符串，则默认绘制为一个质点。
