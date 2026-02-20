var commands = [];
var replyHandlers = [];

function cmd(info = {}, func = () => {}) {
    const data = { ...info };

    data.function = func;

    // Default fields
    data.dontAddCommandList = data.dontAddCommandList ?? false;
    data.desc = data.desc ?? '';
    data.category = data.category ?? 'misc';
    data.filename = data.filename ?? "Not Provided";
    data.fromMe = data.fromMe ?? false;

    // Prevent duplicate pattern registration
    if (data.pattern) {
        const exists = commands.find(c => c.pattern === data.pattern);
        if (exists) {
            console.warn(`⚠️ Command "${data.pattern}" already registered — skipping`);
            return;
        }
    }

    // Register reply handler
    if (!data.pattern && typeof data.filter === "function") {
        replyHandlers.push(data);
    } else {
        commands.push(data);
    }

    return data;
}

module.exports = {
    cmd,
    AddCommand: cmd,
    Function: cmd,
    Module: cmd,
    commands,
    replyHandlers,
};
