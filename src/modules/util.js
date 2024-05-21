class General {
    static Reduce = class {
        static add = (a, b) => a + b;
        static subtract = (a, b) => a - b;
        static multiply = (a, b) => a * b;
        static divide = (a, b) => a / b;
        static exponent = (a, b) => a ** b;
        static modulo = (a, b) => a % b;
    }
}
class TriggerBase {
    activated;
    prefix;
    constructor(activated, prefix) {
        this.activated = activated;
        this.prefix = prefix;
    }
}
class BaseComponent {
    name;
    info;
    data;
    execute;
    constructor(name, info, data) {
        this.name = name;
        this.info = info;
        this.data = data;
        this.execute = async (_interaction, _client) => { };
    }
    setExecute = (handler) => Object.assign(this, { execute: handler });
}
class SubContainer {
    static TriggerMessage = class extends TriggerBase {
        prefixes;
        contains;
        suffixes;
        regex;
        constructor(activated, prefix, config) {
            super(activated, prefix);
            this.prefixes = config?.prefixes ?? [];
            this.contains = config?.contains ?? [];
            this.suffixes = config?.suffixes ?? [];
            this.regex = config?.regex ?? [];
        }
    };
    static TriggerChannel = class extends TriggerBase {
        id;
        types;
        constructor(activated, prefix, config) {
            super(activated, prefix);
            this.id = config?.id ?? [];
            this.types = config?.types ?? [];
        }
    };
    static TriggerRole = class extends TriggerBase {
        id;
        constructor(activated, prefix, config) {
            super(activated, prefix);
            this.id = config.id ?? [];
        }
    };
    static TriggerUser = class extends TriggerBase {
        id;
        constructor(activated, prefix, config) {
            super(activated, prefix);
            this.id = config?.id ?? [];
        }
    };
    static CommandRestrictions = class {
        perm;
        channels;
        roles;
        users;
        dms;
        constructor(data) {
            this.perm = data?.perm || undefined;
            this.channels = data?.channels || [];
            this.roles = data?.roles || [];
            this.users = data?.users || [];
            this.dms = data?.dms || false;
        }
    };
    static CommandInfo = class {
        type;
        description;
        usage;
        examples;
        disabled;
        constructor(data) {
            this.type = data.type;
            this.description = data.description;
            this.usage = data.usage;
            this.examples = data.examples;
            this.disabled = data.disabled;
        }
    };
    static ButtonComponent = class extends BaseComponent {
        constructor(name, info, data) {
            super(name, info, data);
        }
        setExecute = (handler) => Object.assign(this, { execute: handler });
    };
    static ContextMenuComponent = class extends BaseComponent {
        constructor(name, info, data) {
            super(name, info, data);
        }
        setExecute = (handler) => Object.assign(this, { execute: handler });
    };
    static ModalComponent = class extends BaseComponent {
        constructor(name, info, data) {
            super(name, info, data);
        }
        setExecute = (handler) => Object.assign(this, { execute: handler });
    };
    static SelectMenuComponent = class extends BaseComponent {
        constructor(name, info, data) {
            super(name, info, data);
        }
        setExecute = (handler) => Object.assign(this, { execute: handler });
    };
    static ComponentInfo = class {
        name;
        description;
        type;
        constructor(name, description, type) {
            this.name = name;
            this.description = description;
            this.type = type;
        }
    };
}
class Timer {
    static stmSTL = {
        y: 'year',
        M: 'month',
        d: 'day',
        h: 'hour',
        m: 'minute',
        s: 'second',
    };
    static stmDict = {
        y: 31104e6,
        M: 2592e6,
        d: 864e5,
        h: 36e5,
        m: 6e4,
        s: 1e3,
    };
    static stm = (v,k) => v.slice(0, -1) * this.stmDict[k];
    static et = (v, k, mod = 2**32-1) => (v / (this.stmDict[mod] / 1e3)) % this.stmDict[k];
    static ts = {
        locale: 'en-US',
        options: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            weekday: 'long',
            timeZone: 'America/Detroit',
            timeZoneName: 'longGeneric',
        },
    };
    static timestamp = (value) => new Intl.DateTimeFormat(this.ts.locale, this.ts.options).format(value);
    static elapsedTime = (t) => {
        if (isNaN(t)) throw new TypeError('Timestamp must be a number');
        t = Math.floor(t);
        return List.and(
            Object.entries({
                year: this.et(t, 'y'),
                month: this.et(t, 'M', 12),
                day: this.et(t, 'd', 30),
                hour: this.et(t, 'h', 24),
                minute: this.et(t, 'm', 60),
                second: this.et(t, 's')
            })
                .map(([k, v]) => [k, Math.floor(v)])
                .filter(([_, v]) => Boolean(v))
                .map(([k, v]) => `${v} ${Text.pluralize(v, k)}`)
                .join(', '),
        );
    };
    static stringToMilliseconds = (timeString) => typeof timeString !== 'string'
        ? TypeError('Time String must be a string')
        : timeString
            .split(' ')
            .map((value) => this.stm(value, value.slice(-1)))
            .reduce(General.Reduce.add);
    static stringToSeconds = (timeString) => this.stringToMilliseconds(timeString) / 1e3;
    static unixTime = (date) => !(date instanceof Date) && typeof date !== 'number'
        ? TypeError('Date must be a Date object')
        : Math.round(date.getTime() / 1e3);
}
class List {
    static quick = (v, type) => new Intl.ListFormat('en-US', { style: 'long', type }).format(v);
    static and = (value) => this.quick(value, 'conjunction');
    static or = (value) => this.quick(value, 'disjunction');
}
class Text {
    static quickProcess = (value, yes, no) => value ? yes : no;
    static yn = (value) => this.quickProcess(value, 'Yes', 'No');
    static tf = (value) => this.quickProcess(value, 'True', 'False');
    static onOff = (value) => this.quickProcess(value, 'On', 'Off');
    static enabledDisabled = (value) => this.quickProcess(value, 'Enabled', 'Disabled');
    static activeInactive = (value) => this.quickProcess(value, 'Active', 'Inactive');
    static successFailure = (value) => this.quickProcess(value, 'Success', 'Failure');
    static passFail = (value) => this.quickProcess(value, 'Pass', 'Fail');
    static pluralize = (value, text) => `${text}${value > 0 ? 's' : ''}`;
    static longText = (joiner, ...value) => value.join(joiner);
}
class Discord {
    static Utils = class {
        static Markdown = class {
            static quickProcess = (a) => (v) => `${a}${v}${a}`;
            static inlineCode = this.quickProcess('`');
            static bold = this.quickProcess('**');
            static italic = this.quickProcess('*');
            static underline = this.quickProcess('__');
            static strikethrough = this.quickProcess('~~');
            static spoiler = this.quickProcess('||');
            static quote = (value) => `> ${value}`;
            static codeBlock = (stringValue, language) => `\`\`\`${language || ''}\n${stringValue}\n\`\`\``;
            static blockQuote = (value) => `>>> ${value}`;
            static link = (text, url) => `[${text}](${url})`;
        };
        static Mentions = class {
            static quickProcess = (prefix, value, suffix = '') => `<${prefix}${value}${suffix}> `;
            static role = (id) => this.quickProcess('@&', id);
            static user = (id) => this.quickProcess('@', id);
            static channel = (id) => this.quickProcess('#', id);
            static emoji = (name, id) => this.quickProcess(':', name, `:${id} `);
            static animatedEmoji = (name, id) => this.quickProcess('a:', name, `:${id} `);
            static timestamp = (timestamp, format = 'f') => this.quickProcess('t:', timestamp, `:${format} `);
        };
        static Embed = class {
            static Field = (name, value, inline = false) => ({ name, value, inline });
            static Author = (name, url = null, iconURL = null) => ({ name, url, iconURL });
            static Footer = (text, url = null) => ({ text, url });
        };
    };
    static Initializers = class {
        static Trigger = class {
            name;
            globalDisable;
            triggerConfig;
            execute;
            constructor(name, message, channel, role, user) {
                this.name = name;
                this.globalDisable = false;
                this.triggerConfig = {
                    message,
                    channel,
                    role,
                    user,
                };
                this.execute = (_client, _message) => { };
            }
            setGlobalDisable(newValue) {
                this.globalDisable = newValue;
                return this;
            }
            setExecute = (handler) => Object.assign(this, { execute: handler });
            static Message = SubContainer.TriggerMessage;
            static Channel = SubContainer.TriggerChannel;
            static Role = SubContainer.TriggerRole;
            static User = SubContainer.TriggerUser;
        };
        static Command = class {
            name;
            triggers;
            info;
            requiredPerm;
            channelLimits;
            allowedRoles;
            allowedUsers;
            blockDM;
            disabled;
            type;
            data;
            commandExecute;
            messageExecute;
            autocomplete;
            constructor(name, triggers, config, restrictions, types, data) {
                this.name = name;
                this.triggers = triggers;
                this.info = {
                    type: config.type,
                    name,
                    description: config.description,
                    usage: config.usage,
                    examples: config.examples,
                    blockDM: !restrictions.dms,
                    aliases: triggers,
                };
                this.requiredPerm = restrictions.perm;
                this.channelLimits = restrictions.channels;
                this.allowedRoles = restrictions.roles;
                this.allowedUsers = restrictions.users;
                this.blockDM = !restrictions.dms;
                this.disabled = config.disabled;
                this.type = types;
                this.data = data;
                this.commandExecute = async (_interaction, _client) => { };
                this.messageExecute = async (_message, _client) => { };
                this.autocomplete = async (_interaction, _client) => { };
            }
            setCommand = (handler) => Object.assign(this, { commandExecute: handler });
            setMessage = (handler) => Object.assign(this, { messageExecute: handler });
            setAutocomplete = (handler) => Object.assign(this, { autocomplete: handler });
            static Restrictions = SubContainer.CommandRestrictions;
            static Info = SubContainer.CommandInfo;
        };
        static Message = class {
            name;
            displayName;
            getValue;
            constructor(n, dn) {
                this.name = n;
                this.displayName = dn;
                this.getValue = async (_client) => { /* Do Stuff Here */ };
            }
            content = (handler) => {
                this.getValue = handler;
                return this;
            };
        };
        static Components = class {
            static Button = SubContainer.ButtonComponent;
            static ContextMenu = SubContainer.ContextMenuComponent;
            static Modal = SubContainer.ModalComponent;
            static SelectMenu = SubContainer.SelectMenuComponent;
            static Info = SubContainer.ComponentInfo;
        };
        static Event = class {
            event;
            execute;
            constructor(event) {
                this.event = event;
                this.execute = async (_client, ..._args) => { };
            }
            setExecute = (handler) => Object.assign(this, { execute: handler });
        };
    };
}
class RuntimeStatistics {
    registered;
    executed;

    constructor() {
        this.registered = 0;
        this.executed = 0;
    }
    reg = () => ++this.registered;
    exec = () => ++this.executed;
}
const thisSetter = (t) => { throw new ReferenceError(`${t.name} is Read - Only`) };
class Utils extends General {
    static Time = Timer;
    static Discord = Discord;
    static Text = Text;
    static List = List;
    static RuntimeStatistics = RuntimeStatistics;

    get Time() { return Timer }

    set Time(_) { thisSetter(Timer) }

    get Discord() { return Discord }

    set Discord(_) { thisSetter(Discord) }

    get Text() { return Text }

    set Text(_) { thisSetter(Text) }

    get List() { return List }

    set List(_) { thisSetter(List) }

    get RuntimeStatistics() { return RuntimeStatistics }

    set RuntimeStatistics(_) { thisSetter(RuntimeStatistics) }
}
module.exports = Utils;