"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = exports.Client = void 0;
const djs = __importStar(require("discord.js"));
const v10_1 = require("discord-api-types/v10");
const rest_1 = require("@discordjs/rest");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const CT = __importStar(require("chalk-template"));
class General {
    static Reduce = class {
        /** Adds two numbers together */
        static add = (a, b) => a + b;
        /** Subtracts the second number from the first */
        static subtract = (a, b) => a - b;
        /** Multiplies two numbers together */
        static multiply = (a, b) => a * b;
        /** Divides the first number by the second */
        static divide = (a, b) => a / b;
        /** Raises the first number to the power of the second */
        static exponent = (a, b) => a ** b;
        /** Returns the remainder of the first number divided by the second */
        static modulo = (a, b) => a % b;
    };
}
class TriggerBase {
    /** Whether or not the trigger is activated */
    activated;
    /** Whether or not the trigger requires that the message be prefixed to be activated */
    prefix;
    constructor(activated, prefix) {
        this.activated = activated;
        this.prefix = prefix;
    }
}
class BaseComponent {
    /** The Identifier and Name of the Component */
    name;
    /** The Description of the Component (What it Does, What It's Purpose Is, etc.) */
    info;
    /** The Type of Component that this is */
    data;
    /** The Function that is called when the Component is interacted with */
    async execute(client, interaction) { }
    constructor(name, info, data) {
        this.name = name;
        this.info = info;
        this.data = data;
    }
    setExecute(handler) {
        Object.assign(this, { execute: handler });
    }
}
/**
 * A class that represents the exection conditions dealing with messages for a trigger
 */
class TriggerMessage extends TriggerBase {
    /** The prefixes that the message can start with */
    prefixes;
    /** The substrings that the message can contain */
    contains;
    /** The suffixes that the message can end with */
    suffixes;
    /** The regular expressions that the message can match */
    regex;
    constructor(activated, prefix, config) {
        super(activated, prefix);
        this.prefixes = config.prefixes ?? [];
        this.contains = config.contains ?? [];
        this.suffixes = config.suffixes ?? [];
        this.regex = config.regex ?? [];
    }
}
;
/**
 * A class that represents the execution conditions dealing with channels for a trigger
 */
class TriggerChannel extends TriggerBase {
    /** The IDs of the channels that the trigger can be activated in */
    id;
    /** The types of channels that the trigger can be activated in */
    types;
    constructor(activated, prefix, config) {
        super(activated, prefix);
        this.id = config.id ?? [];
        this.types = config.types ?? [];
    }
}
;
/**
 * A class that represents the execution conditions dealing with roles for a trigger
 */
class TriggerRole extends TriggerBase {
    /** The IDs of the roles that can activate the trigger */
    id;
    constructor(activated, prefix, config) {
        super(activated, prefix);
        this.id = config.id ?? [];
    }
}
;
/**
 * A class that represents the execution conditions dealing with users for a trigger
 */
class TriggerUser extends TriggerBase {
    /** The IDs of the users that can activate the trigger */
    id;
    constructor(activated, prefix, config) {
        super(activated, prefix);
        this.id = config.id ?? [];
    }
}
;
/**
 * A class that represents the restrictions that can be placed on a command
 */
class CommandRestrictions {
    /** The permission that is required to execute the command */
    perm;
    /** The types of channels the command can be executed in */
    channels;
    /** The IDs of the roles that can execute the command */
    roles;
    /** The IDs of the users that can execute the command */
    users;
    /** Whether or not the command can be executed in DMs */
    dms;
    constructor(data) {
        this.perm = data.perm;
        this.channels = data?.channels ?? [];
        this.roles = data?.roles ?? [];
        this.users = data?.users ?? [];
        this.dms = data?.dms ?? false;
    }
}
;
/**
 * Information about a command
 */
class CommandInfo {
    /** The type of command */
    type;
    /** The description of the command */
    description;
    /**
     * The usage of the command, using the following format:
     * ```markdown
     * `[...]` is used to denote optional arguments
     *
     * `<...>` is used to denote required arguments
     *
     * `|` is used to denote a choice between arguments
     *
     * `...` is used to denote a rest argument
     * ```
    */
    usage;
    /** Examples of how to use the command */
    examples;
    /** Whether or not the command is disabled */
    disabled;
    /** Aliases for the command */
    aliases;
    constructor(data) {
        this.type = data.type;
        this.description = data.description;
        this.usage = data.usage;
        this.examples = data.examples;
        this.disabled = data.disabled;
        this.aliases = data.aliases;
    }
}
;
/**
 * A class that represents a Button component
 */
class ButtonComponent extends BaseComponent {
    constructor(name, info, data) {
        super(name, info, data);
    }
    setExecute = (handler) => Object.assign(this, { execute: handler });
}
;
/**
 * A class that represents a Context Menu component
 */
class ContextMenuComponent extends BaseComponent {
    constructor(name, info, data) {
        super(name, info, data);
    }
    setExecute = (handler) => Object.assign(this, { execute: handler });
}
;
/**
 * A class that represents a Modal component
 */
class ModalComponent extends BaseComponent {
    constructor(name, info, data) {
        super(name, info, data);
    }
    setExecute = (handler) => Object.assign(this, { execute: handler });
}
;
/**
 * A class that represents a Select Menu component
 */
class SelectMenuComponent extends BaseComponent {
    constructor(name, info, data) {
        super(name, info, data);
    }
    setExecute = (handler) => Object.assign(this, { execute: handler });
}
;
/**
 * A class that contains information about a component
 */
class ComponentInfo {
    /** The name of the component */
    name;
    /** The description of the component */
    description;
    /** The type of component */
    type;
    constructor(name, description, type) {
        this.name = name;
        this.description = description;
        this.type = type;
    }
}
;
/**
 * A class that works with times
 */
class Timer {
    static STMDict2 = new Map()
        .set('y', ['year', 31104e6])
        .set('M', ['month', 2592e6])
        .set('d', ['day', 864e5])
        .set('h', ['hour', 36e5])
        .set('m', ['minute', 6e4])
        .set('s', ['second', 1e3]);
    static stm = (v, k) => Number(v.slice(0, -1)) * this.STMDict2.get(k).at(1);
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
    /** Converts a Date or number to a timestamp */
    static timestamp = (value) => new Intl.DateTimeFormat(this.ts.locale, this.ts.options).format(value);
    /** Converts a string to milliseconds */
    static stringToMilliseconds = (timeString) => timeString
        .split(' ')
        .map((value) => this.stm(value, value.slice(-1)))
        .reduce(General.Reduce.add);
    /** Converts a string to seconds */
    static stringToSeconds = (timeString) => this.stringToMilliseconds(timeString) / 1e3;
    /** Converts a string to minutes */
    static unixTime = (date) => Math.round(Date.parse(date.toISOString()) / 1e3);
}
/**
 * A class that contains methods for processing text
 */
class List {
    /** Joins an array of strings with a comma and a space */
    static quick = (v, type) => new Intl.ListFormat('en-US', { style: 'long', type }).format(v);
    /** Joins an array of strings with a comma and a space in the Conjunction style*/
    static and = (value) => this.quick(value, 'conjunction');
    /** Joins an array of strings with a comma and a space in the Disjunction style*/
    static or = (value) => this.quick(value, 'disjunction');
}
/**
 * A class that contains methods for processing text
 */
class TextSym {
    /** Quickly process a yes/no boolean value */
    static quickProcess = (value, yes, no) => value ? yes : no;
    /** Process a boolean value into a yes/no string */
    static yn = (value) => this.quickProcess(value, 'Yes', 'No');
    /** Process a boolean value into a true/false string */
    static tf = (value) => this.quickProcess(value, 'True', 'False');
    /** Process a boolean value into an on/off string */
    static onOff = (value) => this.quickProcess(value, 'On', 'Off');
    /** Process a boolean value into an enabled/disabled string */
    static enabledDisabled = (value) => this.quickProcess(value, 'Enabled', 'Disabled');
    /** Process a boolean value into an active/inactive string */
    static activeInactive = (value) => this.quickProcess(value, 'Active', 'Inactive');
    /** Process a boolean value into a success/failure string */
    static successFailure = (value) => this.quickProcess(value, 'Success', 'Failure');
    /** Process a boolean value into a pass/fail string */
    static passFail = (value) => this.quickProcess(value, 'Pass', 'Fail');
    /** Process a string into a pluralized string based on a value */
    static pluralize = (value, text) => `${text}${value > 0 ? 's' : ''}`;
    /** Join a long set of text into a single string value */
    static longText = (joiner, ...value) => value.join(joiner);
}
class Markdown {
    /** Quickly process a string with a prefix and suffix */
    static quickProcess = (a) => (v) => `${a}${v}${a}`;
    /** Process a string into a inline code segment */
    static inlineCode = this.quickProcess('`');
    /** Make text appear as bolded */
    static bold = this.quickProcess('**');
    /** Make text appear as italicized */
    static italic = this.quickProcess('*');
    /** Make text appear as underlined */
    static underline = this.quickProcess('__');
    /** Make text appear with a strikethrough */
    static strikethrough = this.quickProcess('~~');
    /** Make text appear as a spoiler */
    static spoiler = this.quickProcess('||');
    /** Make text appear as a quote */
    static quote = (value) => `> ${value}`;
    /** Make text appear as a code block */
    static codeBlock = (stringValue, language) => `\`\`\`${language || ''}\n${stringValue}\n\`\`\``;
    /** Make text appear as a block quote */
    static blockQuote = (value) => `>>> ${value}`;
    /** Make text appear as a formatted url */
    static link = (text, url) => `[${text}](${url})`;
}
;
class Mentions {
    /** Quickly process a string with a prefix and suffix */
    static quickProcess = (prefix, value, suffix = '') => `<${prefix}${value}${suffix}>`;
    /** Process a string into a role mention */
    static role = (id) => this.quickProcess('@&', id);
    /** Process a string into a user mention */
    static user = (id) => this.quickProcess('@', id);
    /** Process a string into a channel mention */
    static channel = (id) => this.quickProcess('#', id);
    /** Process a string into an emoji */
    static emoji = (name, id) => this.quickProcess(':', name, `:${id} `);
    /** Process a string into an animated emoji */
    static animatedEmoji = (name, id) => this.quickProcess('a:', name, `:${id} `);
    /** Process a string into a timestamp */
    static timestamp = (timestamp, format = 'f') => this.quickProcess('t:', timestamp, `:${format}`);
}
/**
 * A class that contains methods for creating embeds
 */
class Embed {
    /** Quickly create a field for an embed */
    static Field = (name, value, inline = false) => ({ name, value, inline });
    /** Quickly create an author for an embed */
    static Author = (name, url = null, iconURL = null) => ({ name, url, iconURL });
    /** Quickly create a footer for an embed */
    static Footer = (text, url = null) => ({ text, url });
}
class DiscordUtils {
    /**
     * A class that contains methods for creating markdown text
     */
    static Markdown = Markdown;
    /**
     * A class that contains methods for creating mentions
     */
    static Mentions = Mentions;
    /**
     * A class that contains methods for creating embeds
     */
    static Embed = Embed;
}
class Event {
    /** The name of the event */
    event;
    /** The function that is called when the event is emitted */
    async execute(client, ...args) { }
    constructor(event) {
        this.event = event;
    }
    setExecute = (handler) => Object.assign(this, { execute: handler });
}
;
class Trigger {
    /** The name of the trigger */
    name;
    /** Whether or not the trigger is disabled */
    globalDisable;
    /** The configuration for the trigger */
    triggerConfig;
    /** The function that is called when the trigger is activated */
    async execute(client, message) { }
    constructor(name, message, channel, role, user) {
        this.name = name;
        this.globalDisable = false;
        this.triggerConfig = {
            message,
            channel,
            role,
            user,
        };
    }
    /** Set whether or not the trigger is disabled */
    setGlobalDisable = (newValue) => Object.assign(this, { globalDisable: newValue });
    /** Set the function that is called when the trigger is activated */
    setExecute = (handler) => Object.assign(this, { execute: handler });
    /** The class that represents the execution conditions dealing with messages for a trigger */
    static Message = TriggerMessage;
    /** The class that represents the execution conditions dealing with channels for a trigger */
    static Channel = TriggerChannel;
    /** The class that represents the execution conditions dealing with roles for a trigger */
    static Role = TriggerRole;
    /** The class that represents the execution conditions dealing with users for a trigger */
    static User = TriggerUser;
}
class Command {
    /** The name of the command */
    name;
    /** The triggers that can activate the command */
    triggers;
    /** The information about the command */
    info;
    /** The permissions required to execute the command */
    requiredPerm;
    /** The channels that the command can be executed in */
    channelLimits;
    /** The roles that can execute the command */
    allowedRoles;
    /** The users that can execute the command */
    allowedUsers;
    /** Whether or not the command can be executed in DMs */
    blockDM;
    /** Whether or not the command is disabled */
    disabled;
    /** The type of command */
    type;
    /** The data for the command */
    data;
    /** The function that is called when the command is executed */
    async commandExecute(client, interaction) { }
    ;
    /** The function that is called when the command is executed */
    async messageExecute(client, message) { }
    ;
    /** The function that is called when the command's autocomplete action is called */
    async autocomplete(client, interaction) { }
    ;
    constructor(name, triggers, config, restrictions, types, data) {
        this.name = name;
        this.triggers = triggers;
        this.info = {
            type: config.type,
            description: config.description,
            usage: config.usage,
            examples: config.examples,
            aliases: triggers,
            disabled: config.disabled,
        };
        this.requiredPerm = restrictions.perm;
        this.channelLimits = restrictions.channels;
        this.allowedRoles = restrictions.roles;
        this.allowedUsers = restrictions.users;
        this.blockDM = !restrictions.dms;
        this.disabled = config.disabled;
        this.type = types;
        this.data = data;
    }
    /** Set the function that is called when the slash command is executed */
    setCommand = (handler) => Object.assign(this, { commandExecute: handler });
    /** Set the function that is called when the text command is executed */
    setMessage = (handler) => Object.assign(this, { messageExecute: handler });
    /** Set the function that is called when the autocomplete action is called */
    setAutocomplete = (handler) => Object.assign(this, { autocomplete: handler });
    /** The class that represents the restrictions that can be placed on a command */
    static Restrictions = CommandRestrictions;
    /** The class that contains information about a command */
    static Info = CommandInfo;
}
;
class Message {
    /** The name of the message */
    name;
    /** The display name of the message */
    displayName;
    /** The function that is called when the message is called */
    // @ts-expect-error
    async getValue(client) { }
    constructor(name, displayName) {
        this.name = name;
        this.displayName = displayName;
    }
    content = (handler) => Object.assign(this, { getValue: handler });
}
;
class DiscordInitializers {
    /** A class that represents a message trigger */
    static Trigger = Trigger;
    /** A class that represents a command */
    static Command = Command;
    /** A class that represents a message */
    static Message = Message;
    /** A class that represents a button */
    static Button = ButtonComponent;
    /** A class that represents a context menu */
    static ContextMenu = ContextMenuComponent;
    /** A class that represents a modal */
    static Modal = ModalComponent;
    /** A class that represents a select menu */
    static SelectMenu = SelectMenuComponent;
    /** A class that represents the information for a component */
    static ComponentInfo = ComponentInfo;
    /** A class that represents an event */
    static Event = Event;
}
;
/**
 * A class that contains methods for interacting with the Discord API
 */
class Discord {
    static Utils = DiscordUtils;
    /** A class that contains methods for interacting with the Discord API */
    static Initializers = DiscordInitializers;
}
class RuntimeStatistics {
    /** The number of times `X` has been registered */
    registered;
    /** The number of times `X` has been executed */
    executed;
    constructor() {
        this.registered = 0;
        this.executed = 0;
    }
    /** Increment the number of times `X` has been registered */
    reg = () => ++this.registered;
    /** Increment the number of times `X` has been executed */
    exec = () => ++this.executed;
}
const thisSetter = (t) => { throw new ReferenceError(`${t.name} is Read - Only`); };
class UtilsClass extends General {
    static Time = Timer;
    static Discord = Discord;
    static Text = TextSym;
    static List = List;
    static RuntimeStatistics = RuntimeStatistics;
    get Time() { return Timer; }
    set Time(_) { thisSetter(Timer); }
    get Discord() { return Discord; }
    set Discord(_) { thisSetter(Discord); }
    get Text() { return TextSym; }
    set Text(_) { thisSetter(TextSym); }
    get List() { return List; }
    set List(_) { thisSetter(List); }
    get RuntimeStatistics() { return RuntimeStatistics; }
    set RuntimeStatistics(_) { thisSetter(RuntimeStatistics); }
}
class Bot extends djs.Client {
    botToken;
    prefix;
    botId;
    buttonsDir;
    commandsDir;
    contextMenusDir;
    eventsDir;
    modalComponentsDir;
    predefinedMessagesDir;
    selectMenusDir;
    triggersDir;
    interactions;
    runtimeStats;
    baseDir;
    configs;
    Commands;
    Events;
    Modals;
    Buttons;
    SelectMenus;
    ContextMenus;
    Messages;
    Triggers;
    PredefinedMessages;
    Statuses;
    Utils;
    branding;
    RESTClient;
    constructor(id, token, prefix, options) {
        super({
            intents: Object.values(djs.GatewayIntentBits),
            partials: Object.values(djs.Partials),
            presence: {
                activities: [],
                status: djs.PresenceUpdateStatus.Online,
            },
        });
        this.botId = id;
        this.prefix = prefix;
        this.botToken = token;
        this.commandsDir = options.commandsDir;
        this.eventsDir = options.eventsDir;
        this.triggersDir = options.triggersDir;
        this.buttonsDir = options.buttonsDir;
        this.selectMenusDir = options.selectMenusDir;
        this.contextMenusDir = options.contextMenusDir;
        this.modalComponentsDir = options.modalComponentsDir;
        this.predefinedMessagesDir = options.predefinedMessagesDir;
        Object.assign(this, options);
        this.runtimeStats = {
            commands: {
                text: new UtilsClass.RuntimeStatistics(),
                slash: new UtilsClass.RuntimeStatistics(),
            },
            triggers: {
                registered: 0,
                role: new UtilsClass.RuntimeStatistics(),
                user: new UtilsClass.RuntimeStatistics(),
                channel: new UtilsClass.RuntimeStatistics(),
                message: new UtilsClass.RuntimeStatistics(),
            },
            events: Object.assign(new UtilsClass.RuntimeStatistics(), { sEE: {} }),
            components: {
                modals: new UtilsClass.RuntimeStatistics(),
                buttons: new UtilsClass.RuntimeStatistics(),
                selectMenus: new UtilsClass.RuntimeStatistics(),
                contextMenus: new UtilsClass.RuntimeStatistics(),
            },
            predefinedMessages: new UtilsClass.RuntimeStatistics(),
        };
        this.baseDir = process.cwd();
        this.configs = {
            prefix: this.prefix,
            defaults: {
                disabled: 'This command is currently disabled',
                noPerms: 'You do not have permission to use this command.',
                dmDisabled: 'This command is disabled in DMs.',
                invalidChannelType: 'This command cannot be used in this channel type.',
            },
        };
        this.Commands = new djs.Collection();
        this.Events = new djs.Collection();
        this.Modals = new djs.Collection();
        this.Buttons = new djs.Collection();
        this.SelectMenus = new djs.Collection();
        this.ContextMenus = new djs.Collection();
        this.Messages = new djs.Collection();
        this.Triggers = new djs.Collection();
        this.PredefinedMessages = new djs.Collection();
        this.Statuses = new djs.Collection()
            .set(0, { type: djs.ActivityType.Watching, name: 'The Server' });
        this.Utils = UtilsClass;
        this.branding = {
            footer: { text: '' },
            color: 0x2F3136,
        };
        this.interactions = [];
        this.RESTClient = new rest_1.REST({ version: '10' }).setToken(this.botToken);
        this
            .on('push.events', (event) => {
            this.regRTS('events');
            this.gev(event.event);
            this.Events.set(event.event, event);
            this.on(event.event, async (...args) => {
                this.bumpRTS(`events.sEE.${event.event}`);
                await event.execute(this, ...args);
            });
        })
            .on('push.commands', (command) => {
            this.Commands.set(command.name, command);
            if (command.type.text)
                this.regRTS('commands.text');
            if (command.type.slash) {
                this.regRTS('commands.slash');
                // @ts-expect-error
                this.interactions.push(command.data.toJSON());
            }
        })
            .on('push.triggers', (trigger) => {
            this.Triggers.set(trigger.name, trigger);
            Object.entries(trigger.triggerConfig)
                .forEach(value => value[1].activated
                ? this.regRTS(`triggers.${value[0]}`)
                : null);
        })
            .on('push.buttons', (button) => {
            this.Buttons.set(button.name, button);
            this.regRTS('components.buttons');
        })
            .on('push.contextMenus', (contextMenu) => {
            this.ContextMenus.set(contextMenu.name, contextMenu);
            this.regRTS('components.contextMenus');
            // @ts-expect-error
            this.interactions.push(contextMenu.data.toJSON());
        })
            .on('push.selectMenus', (selectMenu) => {
            this.SelectMenus.set(selectMenu.name, selectMenu);
            this.regRTS('components.selectMenus');
        })
            .on('push.modals', (modal) => {
            this.Modals.set(modal.name, modal);
            this.regRTS('components.modals');
        })
            .on('push.predefinedMessages', (message) => {
            if (!(message instanceof Message))
                return;
            this.PredefinedMessages.set(message.name, Object.assign(message, { getValue: (c) => { this.bumpRTS('predefinedMessages'); return message.getValue(c); } }));
            this.regRTS('predefinedMessages');
        });
        const rds = fs.readdirSync;
        Array.of(this.eventsDir ? [this.eventsDir, (event) => { this.emit('push.events', event); }] : null, this.commandsDir ? [this.commandsDir, command => { this.emit('push.commands', command); }] : null, this.triggersDir ? [this.triggersDir, trigger => { this.emit('push.triggers', trigger); }] : null, this.buttonsDir ? [this.buttonsDir, button => { this.emit('push.buttons', button); }] : null, this.contextMenusDir ? [this.contextMenusDir, contextMenu => { this.emit('push.contextMenus', contextMenu); }] : null, this.selectMenusDir ? [this.selectMenusDir, selectMenu => { this.emit('push.selectMenus', selectMenu); }] : null, this.modalComponentsDir ? [this.modalComponentsDir, modal => { this.emit('push.modals', modal); }] : null, this.predefinedMessagesDir ? [this.predefinedMessagesDir, message => { this.emit('push.predefinedMessages', message); }] : null)
            .filter(s => s !== null && typeof s[0] !== "function")
            .forEach(s => rds(s[0]).filter(f => f !== 'example.js').map(f => require(`${s[0]}/${f}`)).forEach(s[1]));
        this.emit('push.events', {
            event: 'ready',
            execute: () => {
                // eslint-disable-next-line no-console
                console.log(CT.template(Array.of(`ly logged in as {red ${this.user.username}}!`, ` Ping: {rgb(255,127,0) ${Math.max(this.ws.ping, 0)} ms}`, ` Guilds: {yellow ${this.guilds.cache.size}}`, ` Users: {green ${this.users.cache.size}}`, ` Channels: {blue ${this.channels.cache.size}}`, ` Commands: {rgb(180,0,250) ${this.Commands.size}}`, ` Components: {rgb(255,100,100) ${this.Modals.size + this.Buttons.size + this.SelectMenus.size + this.ContextMenus.size}}`, ` Events: {white ${this.Events.size}}`, ` Triggers: {grey ${this.Triggers.size}}`, ` Pre-defined messages: {cyan ${this.PredefinedMessages.size}}`, ` Statuses selection size: {rgb(0,255,255) ${this.Statuses.size}}`).map(m => `{bold [READY]} Current${m}`).join('\n')));
                const status = this.Statuses.random();
                if (!status)
                    return;
                setInterval(() => this.user.setPresence({ activities: [status] }), 15e3);
            },
        });
    }
    embed = () => new djs.EmbedBuilder(this.branding).setTimestamp();
    stats = () => {
        const botRam = process.memoryUsage().heapTotal;
        const rawBRam = (botRam / 1024 ** 2);
        const globalRam = os.totalmem() - os.freemem();
        const rawGRam = (globalRam / 1024 ** 2);
        return {
            ping: this.ws.ping,
            guilds: this.guilds.cache.size.toString(),
            ram: {
                botOnly: {
                    rawValue: (rawBRam > 1024 ? rawBRam / 1024 : rawBRam).toFixed(2),
                    percentage: (botRam / os.totalmem() * 1e2).toFixed(2),
                    unit: botRam / 1024 ** 3 > 1 ? 'GB' : 'MB',
                },
                global: {
                    rawValue: (rawGRam > 1024 ? rawGRam / 1024 : rawGRam).toFixed(2),
                    percentage: (globalRam / os.totalmem() * 1e2).toFixed(2),
                    unit: globalRam / 1024 ** 3 > 1 ? 'GB' : 'MB',
                },
            },
        };
    };
    gev = (name) => Object.assign(this.runtimeStats.events.sEE, { [`${name}`]: new UtilsClass.RuntimeStatistics() });
    regRTS = (key) => eval(`this.runtimeStats.${key}`).reg();
    bumpRTS = (key) => eval(`this.runtimeStats.${key}`).exec();
    setBranding = (branding) => Object.assign(this.branding, branding);
    start() {
        void this.RESTClient.put(v10_1.Routes.applicationCommands(this.botId), { body: this.interactions });
        void this.login(this.botToken);
    }
}
exports.default = {
    Client: Bot,
    Utils: UtilsClass,
};
exports.Client = Bot;
exports.Utils = UtilsClass;
