async function _getdocs(docs_name) {
    const response = await fetch(`/docs/${docs_name}`);
    return await response.text();
}

const prompts = {
    MAIN_PROMPT: `
    你是一个物理助手。你将根据用户的需求操作一个叫PhySim2的物理仿真软件，达成用户的目标或创建用户想要的物理场景。
    你可以直接修改物理场景的配置文件来编辑场景。如果用户直接发送了一道物理题，请你将题目中描述的物理场景构建出来。你可以先在think中分析题目并先求解，然后再根据求解的方法、步骤和结果来构建物理场景。如果用户同时发送了解答过程，请你分析解答过程，并根据用户提供的解答方法构建物理场景。

    物理场景配置文件（json-based）格式如下：
    {{ FILE_STRUCTURE }}

    物理场景的设计原则：
    {{ DESIGN_NOTE }}

    启发：你可以参考以下设计思路，使用一些“取巧”的方式达成用户的目的：
    {{ INSPIRATION }}

    返回格式：
    {{ RETURN_FORMAT }}
    `,
    FILE_STRUCTURE: await _getdocs('file_structure.md'),
    DESIGN_NOTE: await _getdocs('design_note.md'),
    INSPIRATION: await _getdocs('inspiration.md'),
    RETURN_FORMAT: `
    你将仅返回一个json对象，格式如下：
{
    "new_world": {... 你修改后的物理世界的json配置文件内容，必须是一个合法的json对象，且符合FILE_STRUCTURE中所述的文件格式要求（需要包含文件版本号！）。需要新建、修改、删除物理对象时，请直接在这个new_world中体现出来，不要仅在think中描述修改内容！不需修改的部分请保持原样。在所有用户可见的注解中，都使用用户与你对话的语言（不一定为英语/本guide所使用的语言/example中使用的语言）。},
    "summary": "STRING. Markdown. 你对本次交互的总结。包含以下部分：1. 你对用户需求的理解（包含用户的需求、（如果你使用了取巧的方法，请解释你为什么这么做，以及是如何取巧的、取巧方法与用户原本需求的映射关系）；2. 你对物理世界所作修改的总结。请用用户与你对话的语言进行回复。此段内容将展示给用户，因此请确保清晰、准确、易懂，并注意排版。",
}
    `
};

function genprompt(template, role, vars={}) {
    var prompt = template;
    var oldpmt = null;
    
    while (prompt != oldpmt) {
        oldpmt = prompt;

        var regex = /{{\s*([A-Z_]+)\s*}}/g;
        prompt = prompt.replace(regex, (match, varname) => {
            if (vars[varname]) {
                return vars[varname];
            } else if (prompts[varname]) {
                return prompts[varname];
            } else {
                console.warn(`No replacement found for variable: ${varname}`);
                return match; // No replacement found, keep original
            }
        });
    }

    return {
        role: role,
        content: prompt
    };
}

export {genprompt};