import * as djs from 'discord.js';
import { REST } from '@discordjs/rest';
type ComponentType = djs.ButtonBuilder | djs.ContextMenuCommandBuilder | djs.SelectMenuBuilder | djs.ModalBuilder;
declare class General {
    static Reduce: {
        new (): {};
        /** Adds two numbers together */
        add: (a: number, b: number) => number;
        /** Subtracts the second number from the first */
        subtract: (a: number, b: number) => number;
        /** Multiplies two numbers together */
        multiply: (a: number, b: number) => number;
        /** Divides the first number by the second */
        divide: (a: number, b: number) => number;
        /** Raises the first number to the power of the second */
        exponent: (a: number, b: number) => number;
        /** Returns the remainder of the first number divided by the second */
        modulo: (a: number, b: number) => number;
    };
}
declare class TriggerBase {
    /** Whether or not the trigger is activated */
    activated: boolean;
    /** Whether or not the trigger requires that the message be prefixed to be activated */
    prefix: boolean;
    constructor(activated: boolean, prefix: boolean);
}
declare class BaseComponent {
    /** The Identifier and Name of the Component */
    name: string;
    /** The Description of the Component (What it Does, What It's Purpose Is, etc.) */
    info: ComponentInfo;
    /** The Type of Component that this is */
    data: ComponentType;
    /** The Function that is called when the Component is interacted with */
    execute(client: Bot, interaction: djs.BaseInteraction): Promise<void>;
    constructor(name: string, info: ComponentInfo, data: ComponentType);
    setExecute(handler: (client: Bot, interaction: djs.BaseInteraction) => void): void;
}
/**
 * A class that represents the exection conditions dealing with messages for a trigger
 */
declare class TriggerMessage extends TriggerBase {
    /** The prefixes that the message can start with */
    prefixes: string[];
    /** The substrings that the message can contain */
    contains: string[];
    /** The suffixes that the message can end with */
    suffixes: string[];
    /** The regular expressions that the message can match */
    regex: RegExp[];
    constructor(activated: boolean, prefix: boolean, config: {
        prefixes: string[] | null;
        contains: string[] | null;
        suffixes: string[] | null;
        regex: RegExp[] | null;
    } | undefined);
}
/**
 * A class that represents the execution conditions dealing with channels for a trigger
 */
declare class TriggerChannel extends TriggerBase {
    /** The IDs of the channels that the trigger can be activated in */
    id: string[];
    /** The types of channels that the trigger can be activated in */
    types: djs.ChannelType[];
    constructor(activated: boolean, prefix: boolean, config: {
        id: string[] | null;
        types: djs.ChannelType[] | null;
    } | undefined);
}
/**
 * A class that represents the execution conditions dealing with roles for a trigger
 */
declare class TriggerRole extends TriggerBase {
    /** The IDs of the roles that can activate the trigger */
    id: string[];
    constructor(activated: boolean, prefix: boolean, config: {
        id: string[] | null;
    } | undefined);
}
/**
 * A class that represents the execution conditions dealing with users for a trigger
 */
declare class TriggerUser extends TriggerBase {
    /** The IDs of the users that can activate the trigger */
    id: string[];
    constructor(activated: boolean, prefix: boolean, config: {
        id: string[] | null;
    } | undefined);
}
/**
 * A class that represents the restrictions that can be placed on a command
 */
declare class CommandRestrictions {
    /** The permission that is required to execute the command */
    perm: djs.PermissionFlags;
    /** The types of channels the command can be executed in */
    channels: djs.ChannelType[];
    /** The IDs of the roles that can execute the command */
    roles: string[];
    /** The IDs of the users that can execute the command */
    users: string[];
    /** Whether or not the command can be executed in DMs */
    dms: boolean;
    constructor(data: {
        perm: bigint | undefined;
        channels: djs.ChannelType[] | undefined;
        roles: string[] | undefined;
        users: string[] | undefined;
        dms: boolean | undefined;
    });
}
/**
 * Information about a command
 */
declare class CommandInfo {
    /** The type of command */
    type: string;
    /** The description of the command */
    description: string;
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
    usage: string;
    /** Examples of how to use the command */
    examples: string[];
    /** Whether or not the command is disabled */
    disabled: boolean;
    /** Aliases for the command */
    aliases: string[];
    constructor(data: {
        type: string;
        description: string;
        usage: string;
        examples: string[];
        disabled: boolean;
        aliases: string[];
    });
}
/**
 * A class that represents a Button component
 */
declare class ButtonComponent extends BaseComponent {
    constructor(name: string, info: ComponentInfo, data: djs.ButtonBuilder);
    setExecute: (handler: (client: Bot, interaction: djs.ButtonInteraction) => void) => this & {
        execute: (client: Bot, interaction: djs.ButtonInteraction) => void;
    };
}
/**
 * A class that represents a Context Menu component
 */
declare class ContextMenuComponent extends BaseComponent {
    constructor(name: string, info: ComponentInfo, data: djs.ContextMenuCommandBuilder);
    setExecute: (handler: (client: Bot, interaction: djs.ContextMenuCommandInteraction) => void) => this & {
        execute: (client: Bot, interaction: djs.ContextMenuCommandInteraction) => void;
    };
}
/**
 * A class that represents a Modal component
 */
declare class ModalComponent extends BaseComponent {
    constructor(name: string, info: ComponentInfo, data: djs.ModalBuilder);
    setExecute: (handler: (client: Bot, interaction: djs.ModalSubmitInteraction) => void) => this & {
        execute: (client: Bot, interaction: djs.ModalSubmitInteraction) => void;
    };
}
/**
 * A class that represents a Select Menu component
 */
declare class SelectMenuComponent extends BaseComponent {
    constructor(name: string, info: ComponentInfo, data: djs.SelectMenuBuilder);
    setExecute: (handler: (client: Bot, interaction: djs.SelectMenuInteraction) => void) => this & {
        execute: (client: Bot, interaction: djs.SelectMenuInteraction) => void;
    };
}
/**
 * A class that contains information about a component
 */
declare class ComponentInfo {
    /** The name of the component */
    name: string;
    /** The description of the component */
    description: string;
    /** The type of component */
    type: string;
    constructor(name: string, description: string, type: string);
}
/**
 * A class that works with times
 */
declare class Timer {
    static STMDict2: Map<string, [string, number]>;
    static stm: (v: string, k: string) => number;
    static ts: {
        locale: string;
        options: Intl.DateTimeFormatOptions;
    };
    /** Converts a Date or number to a timestamp */
    static timestamp: (value: Date | number) => string;
    /** Converts a string to milliseconds */
    static stringToMilliseconds: (timeString: string) => number;
    /** Converts a string to seconds */
    static stringToSeconds: (timeString: string) => number;
    /** Converts a string to minutes */
    static unixTime: (date: Date) => number;
}
/**
 * A class that contains methods for processing text
 */
declare class List {
    /** Joins an array of strings with a comma and a space */
    static quick: (v: string[], type: Intl.ListFormatType) => string;
    /** Joins an array of strings with a comma and a space in the Conjunction style*/
    static and: (value: string[]) => string;
    /** Joins an array of strings with a comma and a space in the Disjunction style*/
    static or: (value: string[]) => string;
}
/**
 * A class that contains methods for processing text
 */
declare class TextSym {
    /** Quickly process a yes/no boolean value */
    static quickProcess: (value: any, yes: string, no: string) => string;
    /** Process a boolean value into a yes/no string */
    static yn: (value: any) => string;
    /** Process a boolean value into a true/false string */
    static tf: (value: any) => string;
    /** Process a boolean value into an on/off string */
    static onOff: (value: any) => string;
    /** Process a boolean value into an enabled/disabled string */
    static enabledDisabled: (value: any) => string;
    /** Process a boolean value into an active/inactive string */
    static activeInactive: (value: any) => string;
    /** Process a boolean value into a success/failure string */
    static successFailure: (value: any) => string;
    /** Process a boolean value into a pass/fail string */
    static passFail: (value: any) => string;
    /** Process a string into a pluralized string based on a value */
    static pluralize: (value: any, text: string) => string;
    /** Join a long set of text into a single string value */
    static longText: (joiner: string, ...value: any[]) => string;
}
declare class Markdown {
    /** Quickly process a string with a prefix and suffix */
    static quickProcess: (a: string) => (v: string) => string;
    /** Process a string into a inline code segment */
    static inlineCode: (v: string) => string;
    /** Make text appear as bolded */
    static bold: (v: string) => string;
    /** Make text appear as italicized */
    static italic: (v: string) => string;
    /** Make text appear as underlined */
    static underline: (v: string) => string;
    /** Make text appear with a strikethrough */
    static strikethrough: (v: string) => string;
    /** Make text appear as a spoiler */
    static spoiler: (v: string) => string;
    /** Make text appear as a quote */
    static quote: (value: string) => string;
    /** Make text appear as a code block */
    static codeBlock: (stringValue: string, language: string) => string;
    /** Make text appear as a block quote */
    static blockQuote: (value: string) => string;
    /** Make text appear as a formatted url */
    static link: (text: string, url: string) => string;
}
declare class Mentions {
    /** Quickly process a string with a prefix and suffix */
    static quickProcess: (prefix: string, value: string, suffix?: string) => string;
    /** Process a string into a role mention */
    static role: (id: string) => string;
    /** Process a string into a user mention */
    static user: (id: string) => string;
    /** Process a string into a channel mention */
    static channel: (id: string) => string;
    /** Process a string into an emoji */
    static emoji: (name: string, id: string) => string;
    /** Process a string into an animated emoji */
    static animatedEmoji: (name: string, id: string) => string;
    /** Process a string into a timestamp */
    static timestamp: (timestamp: string, format?: string) => string;
}
/**
 * A class that contains methods for creating embeds
 */
declare class Embed {
    /** Quickly create a field for an embed */
    static Field: (name: string, value: string, inline?: boolean) => {
        name: string;
        value: string;
        inline: boolean;
    };
    /** Quickly create an author for an embed */
    static Author: (name: string, url?: string | undefined | null, iconURL?: string | undefined | null) => {
        name: string;
        url: string | null;
        iconURL: string | null;
    };
    /** Quickly create a footer for an embed */
    static Footer: (text: string, url?: string | undefined | null) => {
        text: string;
        url: string | null;
    };
}
declare class DiscordUtils {
    /**
     * A class that contains methods for creating markdown text
     */
    static Markdown: typeof Markdown;
    /**
     * A class that contains methods for creating mentions
     */
    static Mentions: typeof Mentions;
    /**
     * A class that contains methods for creating embeds
     */
    static Embed: typeof Embed;
}
declare class Event {
    /** The name of the event */
    event: string;
    /** The function that is called when the event is emitted */
    execute(client: Bot, ...args: any): Promise<void>;
    constructor(event: string);
    setExecute: (handler: (client: Bot, ...args: any) => void) => this & {
        execute: (client: Bot, ...args: any) => void;
    };
}
declare class Trigger {
    /** The name of the trigger */
    name: string;
    /** Whether or not the trigger is disabled */
    globalDisable: boolean;
    /** The configuration for the trigger */
    triggerConfig: {
        message: TriggerMessage;
        channel: TriggerChannel;
        role: TriggerRole;
        user: TriggerUser;
    };
    /** The function that is called when the trigger is activated */
    execute(client: Bot, message: djs.Message): Promise<void>;
    constructor(name: string, message: TriggerMessage, channel: TriggerChannel, role: TriggerRole, user: TriggerUser);
    /** Set whether or not the trigger is disabled */
    setGlobalDisable: (newValue: Boolean) => this & {
        globalDisable: Boolean;
    };
    /** Set the function that is called when the trigger is activated */
    setExecute: (handler: (client: Bot, message: djs.Message) => void) => this & {
        execute: (client: Bot, message: djs.Message) => void;
    };
    /** The class that represents the execution conditions dealing with messages for a trigger */
    static Message: typeof TriggerMessage;
    /** The class that represents the execution conditions dealing with channels for a trigger */
    static Channel: typeof TriggerChannel;
    /** The class that represents the execution conditions dealing with roles for a trigger */
    static Role: typeof TriggerRole;
    /** The class that represents the execution conditions dealing with users for a trigger */
    static User: typeof TriggerUser;
}
declare class Command {
    /** The name of the command */
    name: string;
    /** The triggers that can activate the command */
    triggers: string[];
    /** The information about the command */
    info: CommandInfo;
    /** The permissions required to execute the command */
    requiredPerm: djs.PermissionFlags;
    /** The channels that the command can be executed in */
    channelLimits: djs.ChannelType[];
    /** The roles that can execute the command */
    allowedRoles: string[];
    /** The users that can execute the command */
    allowedUsers: string[];
    /** Whether or not the command can be executed in DMs */
    blockDM: boolean;
    /** Whether or not the command is disabled */
    disabled: boolean;
    /** The type of command */
    type: {
        text: boolean;
        slash: boolean;
    };
    /** The data for the command */
    data: djs.SlashCommandBuilder;
    /** The function that is called when the command is executed */
    commandExecute(client: Bot, interaction: djs.CommandInteraction): Promise<void>;
    /** The function that is called when the command is executed */
    messageExecute(client: Bot, message: djs.Message): Promise<void>;
    /** The function that is called when the command's autocomplete action is called */
    autocomplete(client: Bot, interaction: djs.AutocompleteInteraction): Promise<void>;
    constructor(name: string, triggers: string[], config: CommandInfo, restrictions: CommandRestrictions, types: {
        text: boolean;
        slash: boolean;
    }, data: djs.SlashCommandBuilder);
    /** Set the function that is called when the slash command is executed */
    setCommand: (handler: (client: Bot, interaction: djs.CommandInteraction) => void) => this & {
        commandExecute: (client: Bot, interaction: djs.CommandInteraction) => void;
    };
    /** Set the function that is called when the text command is executed */
    setMessage: (handler: (client: Bot, message: djs.Message) => void) => this & {
        messageExecute: (client: Bot, message: djs.Message) => void;
    };
    /** Set the function that is called when the autocomplete action is called */
    setAutocomplete: (handler: (client: Bot, interaction: djs.AutocompleteInteraction) => void) => this & {
        autocomplete: (client: Bot, interaction: djs.AutocompleteInteraction) => void;
    };
    /** The class that represents the restrictions that can be placed on a command */
    static Restrictions: typeof CommandRestrictions;
    /** The class that contains information about a command */
    static Info: typeof CommandInfo;
}
declare class Message {
    /** The name of the message */
    name: string;
    /** The display name of the message */
    displayName: string;
    /** The function that is called when the message is called */
    getValue(client: Bot): Promise<djs.APIMessage>;
    constructor(name: string, displayName: string);
    content: (handler: (client: Bot) => djs.APIMessage) => this & {
        getValue: (client: Bot) => djs.APIMessage;
    };
}
declare class DiscordInitializers {
    /** A class that represents a message trigger */
    static Trigger: typeof Trigger;
    /** A class that represents a command */
    static Command: typeof Command;
    /** A class that represents a message */
    static Message: typeof Message;
    /** A class that represents a button */
    static Button: typeof ButtonComponent;
    /** A class that represents a context menu */
    static ContextMenu: typeof ContextMenuComponent;
    /** A class that represents a modal */
    static Modal: typeof ModalComponent;
    /** A class that represents a select menu */
    static SelectMenu: typeof SelectMenuComponent;
    /** A class that represents the information for a component */
    static ComponentInfo: typeof ComponentInfo;
    /** A class that represents an event */
    static Event: typeof Event;
}
/**
 * A class that contains methods for interacting with the Discord API
 */
declare class Discord {
    static Utils: typeof DiscordUtils;
    /** A class that contains methods for interacting with the Discord API */
    static Initializers: typeof DiscordInitializers;
}
declare class RuntimeStatistics {
    /** The number of times `X` has been registered */
    registered: number;
    /** The number of times `X` has been executed */
    executed: number;
    constructor();
    /** Increment the number of times `X` has been registered */
    reg: () => number;
    /** Increment the number of times `X` has been executed */
    exec: () => number;
}
declare class UtilsClass extends General {
    static Time: typeof Timer;
    static Discord: typeof Discord;
    static Text: typeof TextSym;
    static List: typeof List;
    static RuntimeStatistics: typeof RuntimeStatistics;
    get Time(): typeof Timer;
    set Time(_: typeof Timer);
    get Discord(): typeof Discord;
    set Discord(_: typeof Discord);
    get Text(): typeof TextSym;
    set Text(_: typeof TextSym);
    get List(): typeof List;
    set List(_: typeof List);
    get RuntimeStatistics(): typeof RuntimeStatistics;
    set RuntimeStatistics(_: typeof RuntimeStatistics);
}
declare class Bot extends djs.Client {
    botToken: string;
    prefix: string;
    botId: string;
    buttonsDir: string | undefined;
    commandsDir: string | undefined;
    contextMenusDir: string | undefined;
    eventsDir: string | undefined;
    modalComponentsDir: string | undefined;
    predefinedMessagesDir: string | undefined;
    selectMenusDir: string | undefined;
    triggersDir: string | undefined;
    interactions: (djs.SlashCommandBuilder | djs.ContextMenuCommandBuilder)[];
    runtimeStats: {
        commands: {
            text: RuntimeStatistics;
            slash: RuntimeStatistics;
        };
        triggers: {
            registered: number;
            role: RuntimeStatistics;
            user: RuntimeStatistics;
            channel: RuntimeStatistics;
            message: RuntimeStatistics;
        };
        events: RuntimeStatistics & {
            sEE: Record<string, RuntimeStatistics>;
        };
        components: {
            modals: RuntimeStatistics;
            buttons: RuntimeStatistics;
            selectMenus: RuntimeStatistics;
            contextMenus: RuntimeStatistics;
        };
        predefinedMessages: RuntimeStatistics;
    };
    baseDir: string;
    configs: {
        prefix: string;
        defaults: {
            disabled: string;
            noPerms: string;
            dmDisabled: string;
            invalidChannelType: string;
        };
    };
    Commands: djs.Collection<string, Command>;
    Events: djs.Collection<string, Event>;
    Modals: djs.Collection<string, ModalComponent>;
    Buttons: djs.Collection<string, ButtonComponent>;
    SelectMenus: djs.Collection<string, SelectMenuComponent>;
    ContextMenus: djs.Collection<string, ContextMenuComponent>;
    Messages: djs.Collection<string, Message>;
    Triggers: djs.Collection<string, Trigger>;
    PredefinedMessages: djs.Collection<string, Message>;
    Statuses: djs.Collection<number, djs.ActivityOptions>;
    Utils: typeof UtilsClass;
    branding: djs.EmbedData;
    RESTClient: REST;
    constructor(id: string, token: string, prefix: string, options: {
        commandsDir?: string;
        eventsDir?: string;
        triggersDir?: string;
        buttonsDir?: string;
        selectMenusDir?: string;
        contextMenusDir?: string;
        modalComponentsDir?: string;
        predefinedMessagesDir?: string;
    });
    embed: () => djs.EmbedBuilder;
    stats: () => {
        ping: number;
        guilds: string;
        ram: {
            botOnly: {
                rawValue: string;
                percentage: string;
                unit: string;
            };
            global: {
                rawValue: string;
                percentage: string;
                unit: string;
            };
        };
    };
    gev: (name: string) => Record<string, RuntimeStatistics> & {
        [x: string]: RuntimeStatistics;
    };
    regRTS: (key: string) => number;
    bumpRTS: (key: string) => number;
    setBranding: (branding: djs.EmbedData) => djs.EmbedData;
    start(): void;
}
declare const _default: {
    Client: typeof Bot;
    Utils: typeof UtilsClass;
};
export default _default;
export declare const Client: typeof Bot;
export declare const Utils: typeof UtilsClass;
