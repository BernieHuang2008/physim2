# Math.js
- math.js中，undefined和null在表达式中会被当作0处理，所以在ForceField.js中，为了防止mathjs报错，我们将缺失的变量赋值为0，而不是undefined。
- vector的x, y坐标分别在vec[1]和vec[2]中，而不是像传统编程那样使用zero-index。
