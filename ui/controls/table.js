
import { t } from "../../i18n/i18n.js";

/**
 * 创建一个可配置的表格组件
 * 
 * @param {Object} params - 参数对象
 * @param {string} params.field - 表格标题，将显示在第一行并覆盖所有列
 * @param {Array} params.iterator - 数据迭代器数组，表格的每一行对应数组中的一个元素
 * @param {Array<Function>} params.colums - 列函数数组，每个函数接收迭代器中的一个项和行索引，返回要在对应格子中显示的HTML节点或内容
 * 
 * @returns {HTMLElement} 返回包含表格的容器DOM元素
 * 
 * @example
 * // 基本用法
 * ColumedList({
 *   field: "用户列表", 
 *   iterator: [
 *     {name: "Alice", age: 25},
 *     {name: "Bob", age: 30}
 *   ],
 *   colums: [
 *     (user) => {
 *       const span = document.createElement("span");
 *       span.textContent = user.name;
 *       return span;
 *     },
 *     (user) => user.age
 *   ]
 * });
 */
function ColumedList({field, iterator=[], colums=[]}) {
    const container = document.createElement("div");
    container.className = "columed-list-container";
    
    // 创建表格元素
    const table = document.createElement("table");
    table.className = "columed-list-table";
    
    // 如果没有数据或列定义，显示空表格
    if (iterator.length === 0 || colums.length === 0) {
        container.innerHTML = `
            <div class="columed-list-empty">
                <span class="field-title">${field}:</span>
                <span class="empty-message">${t("No data to display")}</span>
            </div>
        `;
        return container;
    }
    
    // 创建标题行
    const thead = document.createElement("thead");
    const titleRow = document.createElement("tr");
    const titleCell = document.createElement("th");
    titleCell.textContent = field;
    titleCell.colSpan = colums.length; // 标题覆盖所有列
    titleCell.className = "columed-list-title";
    titleRow.appendChild(titleCell);
    thead.appendChild(titleRow);
    table.appendChild(thead);
    
    // 创建表格主体
    const tbody = document.createElement("tbody");
    
    // 为每个 iterator 项创建一行
    iterator.forEach((item, rowIndex) => {
        const row = document.createElement("tr");
        row.className = "columed-list-row";
        
        // 为每一列调用对应的函数
        colums.forEach((columnFunc, colIndex) => {
            const cell = document.createElement("td");
            cell.className = `columed-list-cell col-${colIndex}`;
            
            try {
                // 调用列函数计算内容
                const result = columnFunc(item, rowIndex);
                
                // 如果返回结果是DOM节点，直接插入
                if (result instanceof HTMLElement) {
                    cell.appendChild(result);
                } 
                // 如果返回结果是字符串或数字，设置为文本内容
                else if (typeof result === 'string' || typeof result === 'number') {
                    cell.textContent = result;
                }
                // 如果返回结果是对象，尝试将其转换为JSON字符串
                else if (typeof result === 'object' && result !== null) {
                    cell.textContent = JSON.stringify(result);
                }
                // 其他情况，转换为字符串
                else {
                    cell.textContent = String(result || '');
                }
            } catch (error) {
                // 如果函数执行出错，显示错误信息
                console.error(`Error in column ${colIndex} for row ${rowIndex}:`, error);
                cell.textContent = t("Error");
                cell.className += ' error';
            }
            
            row.appendChild(cell);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    return container;
}

export { ColumedList };