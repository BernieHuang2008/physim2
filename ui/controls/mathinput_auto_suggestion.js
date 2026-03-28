import Fuse from 'https://cdn.jsdelivr.net/npm/fuse.js@7.1.0/dist/fuse.mjs'
import { t } from '../../i18n/i18n.js';

/* Auto Suggestion */
const itemListDefault_builtin = [
    { cate: t("target property"), nickname: "type", value: "type", desc: "target type" },
    { cate: t("target property"), nickname: "pos", value: "pos", desc: "target position" },
    { cate: t("target property"), nickname: "v", value: "v", desc: "target velocity" },
    { cate: t("target property"), nickname: "mass", value: "mass", desc: "target mass" },
    { cate: t("target property"), nickname: "time", value: "time", desc: "current simulation time" },
    { cate: t("system param."), nickname: "dt", value: "dt", desc: "simulation time step" },
    { cate: t("target property"), nickname: "F", value: "F", desc: "target force" },
    { cate: t("target property"), nickname: "a", value: "a", desc: "target acceleration" }
];

const itemListDefault_mathjs = [
    // prioritize some commonly used math.js items
    { cate: t("math const."), nickname: "e", value: "e", desc: "Euler's number / Natural logarithm base" },
    { cate: t("math const."), nickname: "PI", value: "PI", desc: "Pi" },
    { cate: t("math func."), nickname: "sqrt()", value: "sqrt(&)", desc: "计算一个值的平方根" },


    // math.js constants. [ref: https://mathjs.org/docs/reference/constants.html]
    { cate: t("math const."), nickname: "i", value: "i", desc: "Imaginary unit" },
    { cate: t("math const."), nickname: "Infinity", value: "Infinity", desc: "Infinity" },
    { cate: t("math const."), nickname: "LN2", value: "LN2", desc: "ln(2)" },
    { cate: t("math const."), nickname: "LN10", value: "LN10", desc: "ln(10)" },
    { cate: t("math const."), nickname: "LOG2E", value: "LOG2E", desc: "log₂(e)" },
    { cate: t("math const."), nickname: "LOG10E", value: "LOG10E", desc: "log₁₀(e)" },
    { cate: t("math const."), nickname: "NaN", value: "NaN", desc: "Not a Number" },
    { cate: t("math const."), nickname: "null", value: "null", desc: "Null value" },
    { cate: t("math const."), nickname: "phi", value: "phi", desc: "Golden ratio" },
    { cate: t("math const."), nickname: "SQRT1/2", value: "SQRT1_2", desc: "sqrt(1/2)" },
    { cate: t("math const."), nickname: "SQRT2", value: "SQRT2", desc: "sqrt(2)" },
    { cate: t("math const."), nickname: "tau", value: "tau", desc: "Tau" },
    { cate: t("math const."), nickname: "undefined", value: "undefined", desc: "Undefined value" },

    // math.js functions
    { cate: t("math func."), nickname: "acos()", value: "acos(&)", desc: "计算一个值的反余弦" },
    { cate: t("math func."), nickname: "acosh()", value: "acosh(&)", desc: "计算一个值的反双曲余弦，定义为 acosh(x) = ln(sqrt(x^2 - 1) + x)" },
    { cate: t("math func."), nickname: "acot()", value: "acot(&)", desc: "计算一个值的反余切，定义为 acot(x) = atan(1/x)" },
    { cate: t("math func."), nickname: "acoth()", value: "acoth(&)", desc: "计算一个值的反双曲正切，定义为 acoth(x) = atanh(1/x) = (ln((x+1)/x) + ln(x/(x-1))) / 2" },
    { cate: t("math func."), nickname: "acsc()", value: "acsc(&)", desc: "计算一个值的反余割，定义为 acsc(x) = asin(1/x)" },
    { cate: t("math func."), nickname: "acsch()", value: "acsch(&)", desc: "计算一个值的反双曲余割，定义为 acsch(x) = asinh(1/x) = ln(1/x + sqrt(1/x^2 + 1))" },
    { cate: t("math func."), nickname: "asec()", value: "asec(&)", desc: "计算一个值的反正割" },
    { cate: t("math func."), nickname: "asech()", value: "asech(&)", desc: "计算一个值的反双曲正割，定义为 asech(x) = acosh(1/x) = ln(sqrt(1/x^2 - 1) + 1/x)" },
    { cate: t("math func."), nickname: "asin()", value: "asin(&)", desc: "计算一个值的反正弦" },
    { cate: t("math func."), nickname: "asinh()", value: "asinh(&)", desc: "计算一个值的反双曲正弦，定义为 asinh(x) = ln(x + sqrt(x^2 + 1))" },
    { cate: t("math func."), nickname: "atan()", value: "atan(&)", desc: "计算一个值的反正切" },
    { cate: t("math func."), nickname: "atan2()", value: "atan2(&, x)", desc: "计算两个参数 y/x 的反正切" },
    { cate: t("math func."), nickname: "atanh()", value: "atanh(&)", desc: "计算一个值的反双曲正切，定义为 atanh(x) = ln((1 + x)/(1 - x)) / 2" },
    { cate: t("math func."), nickname: "cos()", value: "cos(&)", desc: "计算一个值的余弦" },
    { cate: t("math func."), nickname: "cosh()", value: "cosh(&)", desc: "计算一个值的双曲余弦，定义为 cosh(x) = 1/2 * (exp(x) + exp(-x))" },
    { cate: t("math func."), nickname: "cot()", value: "cot(&)", desc: "计算一个值的余切" },
    { cate: t("math func."), nickname: "coth()", value: "coth(&)", desc: "计算一个值的双曲余切，定义为 coth(x) = 1 / tanh(x)" },
    { cate: t("math func."), nickname: "csc()", value: "csc(&)", desc: "计算一个值的余割，定义为 csc(x) = 1/sin(x)" },
    { cate: t("math func."), nickname: "csch()", value: "csch(&)", desc: "计算一个值的双曲余割，定义为 csch(x) = 1 / sinh(x)" },
    { cate: t("math func."), nickname: "sec()", value: "sec(&)", desc: "计算一个值的正割，定义为 sec(x) = 1/cos(x)" },
    { cate: t("math func."), nickname: "sech()", value: "sech(&)", desc: "计算一个值的双曲正割，定义为 sech(x) = 1 / cosh(x)" },
    { cate: t("math func."), nickname: "sin()", value: "sin(&)", desc: "计算一个值的正弦" },
    { cate: t("math func."), nickname: "sinh()", value: "sinh(&)", desc: "计算一个值的双曲正弦，定义为 sinh(x) = 1/2 * (exp(x) - exp(-x))" },
    { cate: t("math func."), nickname: "tan()", value: "tan(&)", desc: "计算一个值的正切" },
    { cate: t("math func."), nickname: "tanh()", value: "tanh(&)", desc: "计算一个值的双曲正切，定义为 tanh(x) = (exp(2 * x) - 1) / (exp(2 * x) + 1)" },
    { cate: t("math func."), nickname: "compare()", value: "compare(&, y)", desc: "比较两个值" },
    { cate: t("math func."), nickname: "compareNatural()", value: "compareNatural(&, y)", desc: "以确定、自然的方式比较任意类型的两个值" },
    { cate: t("math func."), nickname: "compareText()", value: "compareText(&, y)", desc: "按字典序比较两个字符串" },
    { cate: t("math func."), nickname: "deepEqual()", value: "deepEqual(&, y)", desc: "逐元素测试两个矩阵是否相等" },
    { cate: t("math func."), nickname: "equal()", value: "equal(&, y)", desc: "测试两个值是否相等" },
    { cate: t("math func."), nickname: "equalText()", value: "equalText(&, y)", desc: "检查两个字符串是否相等" },
    { cate: t("math func."), nickname: "larger()", value: "larger(&, y)", desc: "测试值 x 是否大于 y" },
    { cate: t("math func."), nickname: "largerEq()", value: "largerEq(&, y)", desc: "测试值 x 是否大于或等于 y" },
    { cate: t("math func."), nickname: "smaller()", value: "smaller(&, y)", desc: "测试值 x 是否小于 y" },
    { cate: t("math func."), nickname: "smallerEq()", value: "smallerEq(&, y)", desc: "测试值 x 是否小于或等于 y" },
    { cate: t("math func."), nickname: "unequal()", value: "unequal(&, y)", desc: "测试两个值是否不相等" },
    { cate: t("math func."), nickname: "bernoulli()", value: "bernoulli(&)", desc: "返回第 n 个伯努利数，n 为正整数" },
    { cate: t("math func."), nickname: "combinations()", value: "combinations(&, k)", desc: "计算从 n 个可能性中选取 k 个无序结果的方法数" },
    { cate: t("math func."), nickname: "combinationsWithRep()", value: "combinationsWithRep(&, k)", desc: "允许包含重复项的情况下，计算从 n 个可能性中选取 k 个无序结果的方法数" },
    { cate: t("math func."), nickname: "factorial()", value: "factorial(&)", desc: "计算一个值的阶乘。参数仅支持整数" },
    { cate: t("math func."), nickname: "gamma()", value: "gamma(&)", desc: "计算伽马函数，较小值使用 Lanczos 近似，较大值使用扩展 Stirling 近似" },
    { cate: t("math func."), nickname: "kldivergence()", value: "kldivergence(&, y)", desc: "计算两个分布之间的 Kullback-Leibler (KL) 散度" },
    { cate: t("math func."), nickname: "lgamma()", value: "lgamma(&)", desc: "计算实数、正数和复数伽马函数的对数" },
    { cate: t("math func."), nickname: "multinomial()", value: "multinomial(&)", desc: "计算多项式系数，即选取 a1, a2, ... 的方法数" },
    { cate: t("math func."), nickname: "permutations()", value: "permutations(&, k)", desc: "计算从 n 个元素的集合中选取 k 个元素的有序子集的方法数" },
    { cate: t("math func."), nickname: "pickRandom()", value: "pickRandom(&)", desc: "从一维数组中随机选取一个或多个值" },
    { cate: t("math func."), nickname: "random()", value: "random(&, max)", desc: "使用均匀分布返回一个大于或等于 min 且小于 max 的随机数" },
    { cate: t("math func."), nickname: "randomInt()", value: "randomInt(&, max)", desc: "使用均匀分布返回一个大于或等于 min 且小于 max 的随机整数" },
    { cate: t("math func."), nickname: "solveODE()", value: "solveODE(&, tspan, y0)", desc: "常微分方程的数值积分。提供 RK23、RK45 变步长方法，默认使用 RK5(4)7M" },
    { cate: t("math func."), nickname: "derivative()", value: "derivative(&, variable)", desc: "计算用解析器节点表示的表达式的导数" },
    { cate: t("math func."), nickname: "lsolve()", value: "lsolve(&, b)", desc: "通过前向替换寻找线性方程组的一个解" },
    { cate: t("math func."), nickname: "lu()", value: "lu(&)", desc: "计算具有部分主元消去法的矩阵 LU 分解" },
    { cate: t("math func."), nickname: "qr()", value: "qr(&)", desc: "计算矩阵的 QR 分解" },
    { cate: t("math func."), nickname: "simplify()", value: "simplify(&)", desc: "简化表达式树" },
    { cate: t("math func."), nickname: "abs()", value: "abs(&)", desc: "计算一个数字的绝对值" },
    { cate: t("math func."), nickname: "add()", value: "add(&, y)", desc: "将两个或多个值相加：x + y" },
    { cate: t("math func."), nickname: "cbrt()", value: "cbrt(&, allRoots)", desc: "计算一个值的立方根" },
    { cate: t("math func."), nickname: "ceil()", value: "ceil(&)", desc: "向正无穷方向对一个值取整。如果是复数则实部和虚部均取整" },
    { cate: t("math func."), nickname: "cube()", value: "cube(&)", desc: "计算一个值的立方：x * x * x" },
    { cate: t("math func."), nickname: "divide()", value: "divide(&, y)", desc: "将两个值相除：x / y" },
    { cate: t("math func."), nickname: "dotDivide()", value: "dotDivide(&, y)", desc: "逐元素对两个矩阵相除" },
    { cate: t("math func."), nickname: "dotMultiply()", value: "dotMultiply(&, y)", desc: "逐元素对两个矩阵相乘" },
    { cate: t("math func."), nickname: "dotPow()", value: "dotPow(&, y)", desc: "逐元素计算 x 的 y 次幂" },
    { cate: t("math func."), nickname: "exp()", value: "exp(&)", desc: "计算一个值的指数" },
    { cate: t("math func."), nickname: "gcd()", value: "gcd(&, b)", desc: "计算两个或多个值（或数组）的最大公约数" },
    { cate: t("math func."), nickname: "lcm()", value: "lcm(&, b)", desc: "计算两个或多个值（或数组）的最小公倍数" },
    { cate: t("math func."), nickname: "log()", value: "log(&, base)", desc: "计算一个值的对数" },
    { cate: t("math func."), nickname: "log10()", value: "log10(&)", desc: "计算一个值的以 10 为底的对数" },
    { cate: t("math func."), nickname: "log2()", value: "log2(&)", desc: "计算一个值的以 2 为底的对数" },
    { cate: t("math func."), nickname: "mod()", value: "mod(&, y)", desc: "计算整数除法的模（余数）" },
    { cate: t("math func."), nickname: "multiply()", value: "multiply(&, y)", desc: "将两个或多个值相乘：x * y" },
    { cate: t("math func."), nickname: "norm()", value: "norm(&, p)", desc: "计算数字、向量或矩阵的范数" },
    { cate: t("math func."), nickname: "nthRoot()", value: "nthRoot(&)", desc: "计算一个值的 n 次方根" },
    { cate: t("math func."), nickname: "nthRoots()", value: "nthRoots(&)", desc: "计算一个值的所有 n 次方根" },
    { cate: t("math func."), nickname: "pow()", value: "pow(&, y)", desc: "计算 x 的 y 次方：x ^ y" },
    { cate: t("math func."), nickname: "round()", value: "round(&, n)", desc: "将一个值四舍五入到最接近的数值" },
    { cate: t("math func."), nickname: "sign()", value: "sign(&)", desc: "计算一个值的符号" },
    { cate: t("math func."), nickname: "square()", value: "square(&)", desc: "计算一个值的平方：x * x" },
    { cate: t("math func."), nickname: "subtract()", value: "subtract(&, y)", desc: "将两个值相减：x - y" },
    { cate: t("math func."), nickname: "distance()", value: "distance([&, y1], [x2, y2])", desc: "计算 N 维空间中两点之间的欧几里得距离" },
    { cate: t("math func."), nickname: "intersect()", value: "intersect(&, endPoint2Line1, endPoint1Line2, endPoint2Line2)", desc: "计算两维或三维空间中两条直线的交点，或三维空间中直线和平面的交点" },
    { cate: t("math func."), nickname: "and()", value: "and(&, y)", desc: "逻辑与" },
    { cate: t("math func."), nickname: "not()", value: "not(&)", desc: "逻辑非" },
    { cate: t("math func."), nickname: "or()", value: "or(&, y)", desc: "逻辑或" },
    { cate: t("math func."), nickname: "xor()", value: "xor(&, y)", desc: "逻辑异或" },
    { cate: t("math func."), nickname: "concat()", value: "concat(&, b, c, dim)", desc: "连接两个或多个矩阵" },
    { cate: t("math func."), nickname: "count()", value: "count(&)", desc: "计算矩阵、数组或字符串的元素数量" },
    { cate: t("math func."), nickname: "cross()", value: "cross(&, y)", desc: "计算三维空间中两个向量的叉积" },
    { cate: t("math func."), nickname: "det()", value: "det(&)", desc: "计算矩阵的行列式" },
    { cate: t("math func."), nickname: "dot()", value: "dot(&, y)", desc: "计算两个向量的点积" },
    { cate: t("math func."), nickname: "filter()", value: "filter(&, test)", desc: "过滤数组或一维矩阵中的项" },
    { cate: t("math func."), nickname: "flatten()", value: "flatten(&)", desc: "将多维矩阵展平为一维矩阵" },
    { cate: t("math func."), nickname: "identity()", value: "identity(&)", desc: "创建一个大小为 m x n 或 n x n 的二维单位矩阵" },
    { cate: t("math func."), nickname: "inv()", value: "inv(&)", desc: "计算方阵的逆" },
    { cate: t("math func."), nickname: "map()", value: "map(&, callback)", desc: "创建一个新矩阵或数组，其结果是对给定矩阵/数组每个条目执行的回调函数" },
    { cate: t("math func."), nickname: "ones()", value: "ones(&, n, p)", desc: "创建一个全为一的矩阵" },
    { cate: t("math func."), nickname: "range()", value: "range(&, end, step)", desc: "创建一个包含值范围的矩阵或数组" },
    { cate: t("math func."), nickname: "reshape()", value: "reshape(&, sizes)", desc: "重塑多维数组以适应指定维度" },
    { cate: t("math func."), nickname: "size()", value: "size(&)", desc: "计算矩阵或标量的大小" },
    { cate: t("math func."), nickname: "sort()", value: "sort(&)", desc: "对矩阵中的项进行排序" },
    { cate: t("math func."), nickname: "squeeze()", value: "squeeze(&)", desc: "压缩矩阵，移除内部和外部的单例维度" },
    { cate: t("math func."), nickname: "transpose()", value: "transpose(&)", desc: "转置矩阵" },
    { cate: t("math func."), nickname: "zeros()", value: "zeros(&, n, p)", desc: "创建一个全为零的矩阵" },
];

var fuse_world = null;
var cache_world_varnum = -1;

function auto_suggest(world, input) {
    if (Object.keys(world.vars).length !== cache_world_varnum) {
        console.log("Updating auto-suggest cache for world vars...");
        cache_world_varnum = Object.keys(world.vars).length;
        fuse_world = new Fuse(
            [
                // 1. built-in items
                ...itemListDefault_builtin,
                // 2. math.js items
                ...itemListDefault_mathjs,
                // 3. world vars
                ...Object.values(world.vars).map((v) => ({
                    cate: "VAR/" + v.master_phyobj.nickname,
                    nickname: v.nickname,
                    value: v.id,
                    desc: `${t("Master")}: ${v.master_phyobj.nickname} (${v.master_phyobj.id})\n${t("Value")}: ${v.value}`
                })),
                // // 4. target vars (by nickname)
                // ...Object.values(world.vars).map((v) => ({
                //     cate: "TARGET_VAR/" + v.master_phyobj.nickname,
                //     nickname: "TARGET_" + v.nickname,
                //     value: v.id,
                //     desc: `${t("Master")}: ${v.master_phyobj.nickname} (${v.master_phyobj.id})\n${t("Value")}: ${v.value}`
                // }))

            ], {
            keys: ["nickname", "value"],
            threshold: 0.3,
            includeMatches: true
        });
        window.fuse_world = fuse_world;
    }
    const worldResults = fuse_world.search(input);

    return worldResults;
}

export { auto_suggest };