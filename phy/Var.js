import { math } from '../phyEngine/math.js';
import { IDObject } from './idutils.js';
import { t } from '../i18n/i18n.js';
import * as Noti from '../ui/notification/notification.js';

class Variable extends IDObject {
    // metadata
    type;  // "immediate" | "derived"
    nickname;
    world = null;

    _value;
    get value() {
        if (this.type == "immediate") {
            return this._value;
        } else if (this.type == "derived") {
            return this.calc(this.world.vars);
        }
    }
    set value(val) {
        this.update(val);
    }

    expression;
    compiled_expression;
    dependencies = [];

    constructor(nickname, value, type = "immediate") {
        super();
        this.reset(nickname, value, type);
    }

    /**
     * Static factory method for creating variables with named parameters
     * @param {Object} params - Named parameters object
     * @param {string} params.nickname - Variable nickname
     * @param {*} params.value - Variable value or expression
     * @param {string} [params.type="immediate"] - Variable type ("immediate" or "derived")
     * @returns {Variable} New Variable instance
     */
    static create({ nickname, value, type = "immediate" }) {
        return new Variable(nickname, value, type);
    }

    reset(nickname, value, type = "immediate") {
        this.type = type;
        this.nickname = nickname;

        if (type === "immediate") {
            this._value = value;
            this.expression = null;
        } else if (type === "derived") {
            this.update_expression(value);
        }
    }

    /**
     * Reset variable with named parameters
     * @param {Object} params - Named parameters object
     * @param {string} params.nickname - Variable nickname
     * @param {*} params.value - Variable value or expression
     * @param {string} [params.type="immediate"] - Variable type ("immediate" or "derived")
     */
    resetWithParams({ nickname, value, type = "immediate" }) {
        this.reset(nickname || this.nickname, value, type);
    }

    _getDependencies(expression) {
        const expr = math.parse(expression);
        const deps = new Set();
        const funcs = new Set();

        expr.transform(function (node, path, parent) {
            if (node.isSymbolNode && !node.isFunctionNode) {
                // 排除内置函数，只收集变量
                const exclude_list = [
                    // built-in constants
                    'e', 'E', 'i', 'Infinity', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'NaN',
                    'null', 'phi', 'pi', 'PI', 'SQRT1_2', 'SQRT2', 'tau', 'undefined',
                    // runtime vars
                    'pos', 'v', 'mass', 'time',
                ];

                if (!exclude_list.includes(node.name)) {
                    deps.add(node.name)
                }
            }
            if (node.isFunctionNode) {
                funcs.add(node.name)
            }
            return node
        });

        return Array.from(deps.difference(funcs));
        // return Array.from(deps).filter(dep => !funcs.has(dep));
    }

    /**
     * Checks for circular dependencies in variable expressions
     * Uses Depth-First Search (DFS) to detect cycles in the dependency graph
     * 
     * @param {Object} variableRegistry - Map/Object containing all variables by name
     * @param {Set} visitedInPath - Set to track variables in current DFS path (for cycle detection)
     * @param {Set} globalVisited - Set to track all visited variables (for optimization)
     * @param {Array} currentPath - Array to track the current dependency path (for error reporting)
     * @returns {Object} - { hasCycle: boolean, cyclePath: Array }
     */
    _check_dep_loop(variableRegistry, visitedInPath = new Set(), globalVisited = new Set(), currentPath = []) {
        // If we've already fully explored this variable, no need to check again
        if (globalVisited.has(this.id)) {
            return { hasCycle: false, cyclePath: [] };
        }

        // If this variable is in the current path, we found a cycle
        if (visitedInPath.has(this.id)) {
            // Find where the cycle starts in the current path
            const cycleStartIndex = currentPath.indexOf(this.id);
            const cyclePath = currentPath.slice(cycleStartIndex).concat([this.id]);
            return {
                hasCycle: true,
                cyclePath: cyclePath
            };
        }

        // Only check dependencies for derived variables
        if (this.type !== "derived") {
            globalVisited.add(this.id);
            return { hasCycle: false, cyclePath: [] };
        }

        // Add current variable to the path tracking sets
        visitedInPath.add(this.id);
        currentPath.push(this.id);

        // Check each dependency for cycles
        for (const depName of this.dependencies) {
            // Skip if dependency doesn't exist in registry (could be external variable)
            if (!variableRegistry[depName]) {
                continue;
            }

            const dependentVar = variableRegistry[depName];

            // Recursively check this dependency
            const result = dependentVar._check_dep_loop(
                variableRegistry,
                new Set(visitedInPath), // Create new Set to avoid interference between branches
                globalVisited,
                [...currentPath] // Create new array to avoid interference between branches
            );

            // If a cycle was found in this branch, return it
            if (result.hasCycle) {
                return result;
            }
        }

        // Remove current variable from path tracking (backtrack)
        visitedInPath.delete(this.id);
        currentPath.pop();

        // Mark this variable as fully explored
        globalVisited.add(this.id);

        // No cycle found in this branch
        return { hasCycle: false, cyclePath: [] };
    }

    /**
     * Public method to check for circular dependencies
     * @param {Object} variableRegistry - Map/Object containing all variables by name
     * @returns {Object} - { hasCycle: boolean, cyclePath: Array, message: string }
     */
    checkCircularDependency(variableRegistry) {
        const result = this._check_dep_loop(variableRegistry);

        if (result.hasCycle) {
            const message = `Circular dependency detected: ${result.cyclePath.join(' -> ')}`;
            Noti.error(t("Circular Dependency Detected"), message);
            return {
                hasCycle: true,
                cyclePath: result.cyclePath,
                message: message
            };
        }

        return {
            hasCycle: false,
            cyclePath: [],
            message: "No circular dependency found"
        };
    }

    update_expression(expression) {
        if (this.type === "derived") {
            var old_expression = this.expression;

            this.compiled_expression = math.compile(expression);
            this.expression = expression;
            this.dependencies = this._getDependencies(expression);

            var circular_check = this.world && this.checkCircularDependency(this.world.vars);
            if (circular_check == null) {
                // not initialized yet.
                this.expression = "";
                return;
            } else if (circular_check.hasCycle) {
                // If a circular dependency is detected, revert to the old expression
                this.expression = old_expression;
                this.compiled_expression = math.compile(old_expression);
                this.dependencies = this._getDependencies(old_expression);

                throw new Error("Circular dependency detected. Expression reverted to previous valid state.");
            }
        }
    }

    update(value) {
        if (this.type === "immediate") {
            this._value = value;
            this.expression = null;
        } else if (this.type === "derived") {
            this.update_expression(value);
        }
    }

    calc(variableRegistry = {}) {
        if (this.type === "immediate") {
            // do nothing
        } else if (this.type === "derived") {
            const scope = {};
            // Populate scope with current values of dependencies
            for (const depName of this.dependencies) {
                if (variableRegistry[depName]) {
                    scope[depName] = variableRegistry[depName].value;
                }
                else {
                    scope[depName] = undefined;
                }
            }
            this._value = this.compiled_expression.evaluate(scope);
        }

        return this._value;
    }

    toJSON() {
        return {
            id: this.id,
            nickname: this.nickname,
            type: this.type,
            expression_or_value: this.type === "immediate" ? this._value : this.expression,
        };
    }

    static fromJSON(json, world) {
        const variable = new Variable(world);
        variable.id = json.id;
        variable.nickname = json.nickname;
        variable.type = json.type;

        if (variable.type === "immediate") {
            variable._value = json.expression_or_value;
        } else if (variable.type === "derived") {
            variable.update_expression(json.expression_or_value);
        }

        return variable;
    }
}

export { Variable };