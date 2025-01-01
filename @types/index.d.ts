import * as djs from 'discord.js';
import { REST } from '@discordjs/rest';
type ComponentType = djs.ButtonBuilder | djs.ContextMenuCommandBuilder | djs.SelectMenuBuilder | djs.ModalBuilder;
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
    constructor(name: string, info: ComponentInfo, data: ComponentType);
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
    });
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
    });
}
/**
 * A class that represents the execution conditions dealing with roles for a trigger
 */
declare class TriggerRole extends TriggerBase {
    /** The IDs of the roles that can activate the trigger */
    id: string[];
    constructor(activated: boolean, prefix: boolean, config: {
        id: string[] | null;
    });
}
/**
 * A class that represents the execution conditions dealing with users for a trigger
 */
declare class TriggerUser extends TriggerBase {
    /** The IDs of the users that can activate the trigger */
    id: string[];
    constructor(activated: boolean, prefix: boolean, config: {
        id: string[] | null;
    });
}
/**
 * A class that represents the restrictions that can be placed on a command
 */
declare class CommandRestrictions {
    /** The permission that is required to execute the command */
    perm: djs.PermissionFlags | undefined;
    /** The types of channels the command can be executed in */
    channels: djs.ChannelType[];
    /** The IDs of the roles that can execute the command */
    roles: string[];
    /** The IDs of the users that can execute the command */
    users: string[];
    /** Whether or not the command can be executed in DMs */
    dms: boolean;
    constructor(data: {
        perm?: djs.PermissionFlags;
        channels?: djs.ChannelType[];
        roles?: string[];
        users?: string[];
        dms?: boolean;
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
type ClientInteraction<T extends djs.BaseInteraction | djs.Message> = (client: Bot, interaction: T) => void;
/**
 * A class that represents a Button component
 */
declare class ButtonComponent extends BaseComponent {
    execute: ClientInteraction<djs.ButtonInteraction>;
    constructor(name: string, info: ComponentInfo, data: djs.ButtonBuilder, handler: ClientInteraction<djs.ButtonInteraction>);
}
/**
 * A class that represents a Context Menu component
 */
declare class ContextMenuComponent extends BaseComponent {
    execute: ClientInteraction<djs.ContextMenuCommandInteraction>;
    constructor(name: string, info: ComponentInfo, data: djs.ContextMenuCommandBuilder, handler: ClientInteraction<djs.ContextMenuCommandInteraction>);
}
/**
 * A class that represents a Modal component
 */
declare class ModalComponent extends BaseComponent {
    execute: ClientInteraction<djs.ModalSubmitInteraction>;
    constructor(name: string, info: ComponentInfo, data: djs.ModalBuilder, handler: ClientInteraction<djs.ModalSubmitInteraction>);
}
/**
 * A class that represents a Select Menu component
 */
declare class SelectMenuComponent extends BaseComponent {
    execute: ClientInteraction<djs.SelectMenuInteraction>;
    constructor(name: string, info: ComponentInfo, data: djs.SelectMenuBuilder, handler: ClientInteraction<djs.SelectMenuInteraction>);
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
    static unitsToMSDict: Map<string, [string, number]>;
    static unitsToMS: (amount: string, unit: string) => number;
    static timeFormatOptions: {
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
declare class Trigger {
    /** The name of the trigger */
    name: string;
    /** Whether or not the trigger is disabled */
    disabled: boolean;
    /** The configuration for the trigger */
    triggerConfig: {
        message: TriggerMessage;
        channel: TriggerChannel;
        role: TriggerRole;
        user: TriggerUser;
    };
    /** The function that is called when the trigger is activated */
    execute: ClientInteraction<djs.Message>;
    constructor(name: string, message: TriggerMessage, channel: TriggerChannel, role: TriggerRole, user: TriggerUser, handler: ClientInteraction<djs.Message>);
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
    requiredPerm: djs.PermissionFlags | undefined;
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
    commandExecute: ClientInteraction<djs.Interaction>;
    /** The function that is called when the command is executed */
    messageExecute: ClientInteraction<djs.Message>;
    /** The function that is called when the command's autocomplete action is called */
    autocomplete: ClientInteraction<djs.AutocompleteInteraction>;
    constructor(name: string, triggers: string[], config: CommandInfo, restrictions: CommandRestrictions, types: {
        text: boolean;
        slash: boolean;
    }, data: djs.SlashCommandBuilder, messageExecuteHandler: ClientInteraction<djs.Message>, commandExecuteHandler: ClientInteraction<djs.Interaction>, autocompleteHandler: ClientInteraction<djs.AutocompleteInteraction>);
    /** The class that represents the restrictions that can be placed on a command */
    static Restrictions: typeof CommandRestrictions;
    /** The class that contains information about a command */
    static Info: typeof CommandInfo;
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
declare class UtilsClass {
    static Time: typeof Timer;
    static List: typeof List;
    static RuntimeStatistics: typeof RuntimeStatistics;
    get Time(): typeof Timer;
    set Time(_: typeof Timer);
    get List(): typeof List;
    set List(_: typeof List);
    get RuntimeStatistics(): typeof RuntimeStatistics;
    set RuntimeStatistics(_: typeof RuntimeStatistics);
}
interface BotInitalizationOptions {
    commandsDir?: string;
    eventsDir?: string;
    triggersDir?: string;
    buttonsDir?: string;
    selectMenusDir?: string;
    contextMenusDir?: string;
    modalComponentsDir?: string;
    predefinedMessagesDir?: string;
    removedIntents?: djs.GatewayIntentBits[];
    removedPartials?: djs.Partials[];
}
declare class Bot extends djs.Client {
    private botToken;
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
    Triggers: djs.Collection<string, Trigger>;
    Statuses: djs.Collection<number, djs.ActivityOptions>;
    Utils: typeof UtilsClass;
    branding: djs.EmbedData;
    RESTClient: REST;
    constructor(id: string, token: string, prefix: string, options?: BotInitalizationOptions);
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
    iDontKnowWhatThisDoes: (name: string) => Record<string, RuntimeStatistics> & {
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
export declare const Client: typeof Bot, Utils: typeof UtilsClass;
