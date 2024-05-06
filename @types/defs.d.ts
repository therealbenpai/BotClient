import * as djs from 'discord.js'

declare namespace Interfaces {
    interface TriggerConfig {
        message: Classes.TriggerMessage;
        channel: Classes.TriggerChannel;
        role: Classes.TriggerRole;
        user: Classes.TriggerUser;
    }
    interface HardwareStats {
        /** */
        rawValue: number;
        /** */
        percentage: number;
        /** */
        unit: string;
    }
    interface HardwareStatsObject {
        /** */
        botOnly: HardwareStats;
        /** */
        global: HardwareStats;
    }
    interface RTSBot {
        commands: {
            text: Classes.Utilities["RuntimeStatistics"];
            slash: Classes.Utilities["RuntimeStatistics"];
        },
        triggers: {
            registered: number;
            role: Classes.Utilities["RuntimeStatistics"];
            user: Classes.Utilities["RuntimeStatistics"];
            channel: Classes.Utilities["RuntimeStatistics"];
            message: Classes.Utilities["RuntimeStatistics"];
        },
        events: Classes.Utilities["RuntimeStatistics"] & { sEE: { [K: string]: Classes.Utilities["RuntimeStatistics"] } },
        components: {
            modals: Classes.Utilities["RuntimeStatistics"];
            buttons: Classes.Utilities["RuntimeStatistics"];
            selectMenus: Classes.Utilities["RuntimeStatistics"];
            contextMenus: Classes.Utilities["RuntimeStatistics"];
        },
        predefinedMessages: Classes.Utilities["RuntimeStatistics"];
    }
    interface BotConfigs {
        prefix: string;
        defaults: {
            disabled: string;
            noPerms: string;
            dmDisabled: string;
            invalidChannelType: string;
        }
    }
    interface BotOptions {
        buttonsDir: string | undefined;
        commandsDir: string | undefined;
        contextMenusDir: string | undefined;
        eventsDir: string | undefined;
        modalComponentsDir: string | undefined;
        predefinedMessagesDir: string | undefined;
        selectMenusDir: string | undefined;
        triggersDir: string | undefined;
    }
    interface Bot<K extends boolean = boolean> extends djs.Client<K> {
        token: string;
        prefix: string;
        id: string;
        buttonsDir: string | undefined;
        commandsDir: string | undefined;
        contextMenusDir: string | undefined;
        eventsDir: string | undefined;
        modalComponentsDir: string | undefined;
        predefinedMessagesDir: string | undefined;
        selectMenusDir: string | undefined;
        triggersDir: string | undefined;
        interactions: Array<any>;
        stats(): {
            ping: number;
            guilds: number;
            uptime: string;
            ram: HardwareStatsObject;
            cpu: HardwareStatsObject;
        };
        embed: djs.EmbedBuilder;
        runtimeStats: RTSBot;
        baseDir: string;
        configs: BotConfigs;
        gRTS(key: string): Classes.Utilities["RuntimeStatistics"];
        gev(event: djs.Events): Classes.Utilities["RuntimeStatistics"];
        regRTS(key: string): number;
        bumpRTS(key: string): number;
        Commands: djs.Collection<string, Classes.Command>;
        Triggers: djs.Collection<string, Classes.Trigger>;
        Messages: djs.Collection<string, Classes.Message>;
        Components: djs.Collection<'buttons', Classes.ButtonComponent> & djs.Collection<'contextMenus', Classes.ContextMenuComponent> & djs.Collection<'modals', Classes.ModalComponent> & djs.Collection<'selectMenus', Classes.SelectMenuComponent>;
        PredefinedMessages: djs.Collection<string, Classes.Message>;
        Statuses: djs.Collection<number, djs.ActivityOptions>;
        Utils: Classes.Utilities;
        start(): void;
    }
    interface Components {
        /** @inheritdoc ButtonComponent */
        Button: Classes.ButtonComponent;
        /** @inheritdoc ContextMenuComponent */
        ContextMenu: Classes.ContextMenuComponent;
        /** @inheritdoc ModalComponent */
        Modal: Classes.ModalComponent;
        /** @inheritdoc SelectMenuComponent */
        SelectMenu: Classes.SelectMenuComponent;
        /** @inheritdoc ComponentInfo */
        Info: Classes.ComponentInfo;
    }
    interface RTS {
        /** The number of `X` that have been registered */
        registered: number;
        /** The number of `X` that have been executed */
        executed: number;
        /** Increments the registered value */
        reg(): number;
        /** Increments the executed value */
        exec(): number;
    }
    interface DiscordUtils {
        Markdown: typeof Classes.Markdown;
        Mentions: typeof Classes.Mentions;
        Embed: typeof Classes.EmbedUtils;
    }
    interface DiscordInits {
        Command: typeof Classes.Command;
        Trigger: typeof Classes.Trigger;
        Message: typeof Classes.Message;
        Components: typeof Classes.Components;
        Event: typeof Classes.Event;
    }  
    interface Discord {
        Utils: DiscordUtils;
        Initializers: DiscordInits;
    }
    interface Utils {
        Discord: Discord;
        RuntimeStatistics: Classes.RTS;
    }
}

declare namespace Classes {
    class TriggerBase {
        /** Whether or not the trigger is activated */
        activated: boolean;
        /** Whether or not the trigger requires that the message be prefixed to be activated */
        prefix: boolean;
        constructor(activated: boolean, prefix: string)
    }
    class BaseComponent {
        /** The Identifier and Name of the Component */
        name: string;
        /** The Description of the Component (What it Does, What It's Purpose Is, etc.) */
        info: ComponentInfo;
        /** The Type of Component that this is */
        data: djs.ButtonBuilder | djs.ContextMenuCommandBuilder | djs.SelectMenuBuilder | djs.ModalBuilder;
        /** The Function that is called when the Component is interacted with */
        execute(interaction: djs.BaseInteraction, client: Bot): void;
        constructor(
            name: string,
            info: ComponentInfo,
            data: djs.ButtonBuilder | djs.ContextMenuCommandBuilder | djs.SelectMenuBuilder | djs.ModalBuilder
        )
        /** Sets the execute function for the component */
        setExecute<handler>(handler: (interaction: djs.BaseInteraction, client: Bot) => void): this & { execute: handler }
    }
    /** A class that represents the message segment of the trigger data */
    class TriggerMessage extends TriggerBase {
        /** The prefixes that the message can start with */
        prefixes: Array<string>;
        /** The substrings that the message can contain */
        contains: Array<string>;
        /** The suffixes that the message can end with */
        suffixes: Array<string>;
        /** The regular expressions that the message can match */
        regex: Array<RegExp>;
        constructor(
            activated: boolean,
            prefix: string,
            config: { prefixes: Array<string> | null; contains: Array<string> | null; suffixes: Array<string> | null; regex: Array<RegExp> | null; } | undefined
        );
    }
    /** A class that represents the channel segment of the trigger data */
    class TriggerChannel extends TriggerBase {
        /** The IDs of the channels that the trigger can be activated in */
        id: Array<string>;
        /** The types of channels that the trigger can be activated in */
        types: Array<djs.ChannelType>;
        constructor(
            activated: boolean,
            prefix: string,
            config: { id: Array<string> | null; types: Array<djs.ChannelType> | null; } | undefined
        )
    }
    /** A class that represents the role segment of the trigger data */
    class TriggerRole extends TriggerBase {
        /** The IDs of the roles that can activate the trigger */
        id: Array<string>;
        constructor(
            activated: boolean,
            prefix: string,
            config: { id: Array<string> | null; } | undefined
        )
    }
    /** A class that represents the user segment of the trigger data */
    class TriggerUser extends TriggerBase {
        /** The IDs of the users that can activate the trigger */
        id: Array<string>;
        constructor(
            activated: boolean,
            prefix: string,
            config: { id: Array<string> | null; } | undefined
        )
    }
    /** A class that represents the restrictions that can be placed on a command */
    class CommandRestrictions {
        /** The permission that is required to execute the command */
        perm: djs.PermissionFlags;
        /** The types of channels the command can be executed in */
        channels: Array<djs.ChannelType>;
        /** The IDs of the roles that can execute the command */
        roles: Array<string>;
        /** The IDs of the users that can execute the command */
        users: Array<string>;
        /** Whether or not the command can be executed in DMs */
        dms: boolean;
        constructor(
            data: {
                perm: bigint | undefined,
                channels: djs.ChannelType[] | undefined,
                roles: string[] | undefined,
                users: string[] | undefined,
                dms: boolean | undefined
            }
        )
    }
    /** A class that represents the information about a command */
    class CommandInfo {
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
        examples: Array<string>;
        /** Whether or not the command is disabled */
        disabled: boolean;
        constructor(
            data: {
                type: string,
                description: string,
                usage: string,
                examples: Array<string>,
                disabled: boolean
            }
        )
    }
    /** A class that represents a button component */
    class ButtonComponent extends BaseComponent {
        constructor(
            name: string,
            info: ComponentInfo,
            data: djs.ButtonBuilder
        )
        /** @override @description Sets the execute function for the component */
        setExecute<handler>(handler: (interaction: djs.ButtonInteraction, client: Bot) => void): this & { execute: handler }
    }
    /** A class that represents a context menu component */
    class ContextMenuComponent extends BaseComponent {
        constructor(
            name: string,
            info: ComponentInfo,
            data: djs.ContextMenuCommandBuilder
        )
        /** @override @description Sets the execute function for the component */
        setExecute<handler>(handler: (interaction: djs.ContextMenuCommandInteraction, client: Bot) => void): this & { execute: handler }
    }
    /** A class that represents a modal component */
    class ModalComponent extends BaseComponent {
        constructor(
            name: string,
            info: ComponentInfo,
            data: djs.ModalBuilder
        )
        /** @override @description Sets the execute function for the component */
        setExecute<handler>(handler: (interaction: djs.ModalSubmitInteraction, client: Bot) => void): this & { execute: handler }
    }
    /** A class that represents a select menu component */
    class SelectMenuComponent extends BaseComponent {
        constructor(
            name: string,
            info: ComponentInfo,
            data: djs.SelectMenuBuilder
        )
        /** @override @description Sets the execute function for the component */
        setExecute<handler>(handler: (interaction: djs.SelectMenuInteraction, client: Bot) => void): this & { execute: handler }
    }
    /** A class that represents the information about a component */
    class ComponentInfo {
        /** The Identifier and Name of the Component */
        name: string;
        /** The Description of the Component (What it Does, What It's Purpose Is, etc.) */
        description: string;
        /** The Type of Component that this is */
        type: string | number;
        constructor(
            name: string,
            description: string,
            type: string | number
        )
    }
    /**
     * Discord Markdown
     *
     * Markdown utility functions for Discord
     * @example
     * DiscordMD.inlineCode('Hello, World!') // '`Hello, World!`'
     * DiscordMD.bold('Hello, World!') // '**Hello, World!**'
     * DiscordMD.italic('Hello, World!') // '*Hello, World!*'
     * DiscordMD.underline('Hello, World!') // '__Hello, World!__'
     * DiscordMD.strikethrough('Hello, World!') // '~~Hello, World!~~'
     * DiscordMD.spoiler('Hello, World!') // '||Hello, World!||'
     * DiscordMD.quote('Hello, World!') // '> Hello, World!'
     * DiscordMD.codeBlock('Hello, World!') // '```\nHello, World!\n```'
     * DiscordMD.blockQuote('Hello, World!') // '>>> Hello, World!'
     * DiscordMD.link('Google', 'https://google.com') // '[Google](https://google.com)'
     */
    class Markdown {
        /** Formats a string quickly */
        static quickProcess(around: string, value: string): string;
        /** Formats a string as inline code */
        static inlineCode(value: string): string;
        /** Formats a string as bold */
        static bold(value: string): string;
        /** Formats a string as italic */
        static italic(value: string): string;
        /** Formats a string as underline */
        static underline(value: string): string;
        /** Formats a string as strikethrough */
        static strikethrough(value: string): string;
        /** Formats a string as a spoiler */
        static spoiler(value: string): string;
        /** Formats a string as a quote */
        static quote(value: string): string;
        /**
         * Formats a string as a code block with a specified language
         * @see {@link https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md Supported Codeblock Languages}
        */
        static codeBlock(stringValue: string, language: string | undefined): string;
        /** Formats a string as a block quote */
        static blockQuote(value: string): string;
        /** Formats a string as a link */
        static link(text: string, url: string): string
    }
    /**
     * Discord Mentions
     *
     * Mention utility functions for Discord
     * @example
     * DiscordMentions.role('1234567890') // '<@&1234567890>'
     * DiscordMentions.user('1234567890') // '<@1234567890>'
     * DiscordMentions.channel('1234567890') // '<#1234567890>'
     * DiscordMentions.emoji('emoji', '1234567890') // '<:emoji:1234567890>'
     * DiscordMentions.animatedEmoji('emoji', '1234567890') // '<a:emoji:1234567890>'
     * DiscordMentions.timestamp(1631698800) // '<t:1631698800:f>'
     * DiscordMentions.timestamp(1631698800, 'd') // '<t:1631698800:d>'
    */
    class Mentions {
        /** Formats a string quickly */
        static quickProcess(prefix: string, value: string, suffix: string | undefined): string;
        /** Mentions a role */
        static role(value: string): string;
        /** Mentions a user */
        static user(value: string): string;
        /** Mentions a channel */
        static channel(value: string): string;
        /** Mentions an emoji */
        static emoji(value: string, id: string): string;
        /** Mentions an animated emoji */
        static animatedEmoji(value: string, id: string): string;
        /**
         * Mentions a timestamp
         * @see {@link https://discord.com/developers/docs/reference#message-formatting Timestamp Format}
        */
        static timestamp(timestamp: string, format: string | undefined): string;
    }
    /**
     * Discord Embed Utilities
     *
     * Embed utility functions for Discord
     * @example
     * EmbedUtils.qField('Field Name', 'Field Value', true)
     *  { name: 'Field Name', value: 'Field Value', inline: true }
     * EmbedUtils.qAuthor('Author Name', 'https://example.com', 'https://example.com/icon.png')
     *  { name: 'Author Name', url: 'https://example.com', iconURL: 'https://example.com/icon.png' }
     * EmbedUtils.qFooter('Footer Text', 'https://example.com')
     *  { text: 'Footer Text', url: 'https://example.com' }
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object Embed Object}
    */
    class EmbedUtils {
        /** Creates a field quickly */
        static qField<Name, Value, Inline>(name: string, value: string, inline: boolean | undefined): { name: Name, value: Value, inline: Inline };
        /** Creates an author quickly */
        static qAuthor<name, url, icon>(name: string, url: string | undefined, iconURL: string | undefined): { name: name, url: url, iconURL: icon };
        /** Creates a footer quickly */
        static qFooter<X, Y>(text: string, url: string | undefined): { text: X, url: Y };
    }
    class Bot implements Interfaces.Bot {
        token: string;
        prefix: string;
        id: string;
        client: Interfaces.Bot;
        buttonsDir: string;
        commandsDir: string | undefined;
        contextMenusDir: string | undefined;
        eventsDir: string | undefined;
        modalComponentsDir: string | undefined;
        predefinedMessagesDir: string | undefined;
        selectMenusDir: string | undefined;
        triggersDir: string | undefined;
        constructor(token: string, prefix: string, id: string, options: Interfaces.BotOptions | undefined);
        start(): void;
        stats(): {
            ping: number;
            guilds: number;
            uptime: string;
            ram: Interfaces.HardwareStatsObject;
            cpu: Interfaces.HardwareStatsObject;
        };
        embed(): djs.EmbedBuilder;
        runtimeStats: Interfaces.RTSBot;
        baseDir: string;
        configs: Interfaces.BotConfigs;
        gRTS(key: string): Interfaces.RTS;
        gev(event: djs.Events): Interfaces.RTS;
        regRTS(key: string): number;
        bumpRTS(key: string): number;
        Commands: djs.Collection<string, Classes.Command>;
        Triggers: djs.Collection<string, Classes.Trigger>;
        Messages: djs.Collection<string, Classes.Message>;
        Components: djs.Collection<'buttons', Classes.ButtonComponent> & djs.Collection<'contextMenus', Classes.ContextMenuComponent> & djs.Collection<'modals', Classes.ModalComponent> & djs.Collection<'selectMenus', Classes.SelectMenuComponent>;
        PredefinedMessages: djs.Collection<string, Classes.Message>;
        Statuses: djs.Collection<number, djs.ActivityOptions>;
        Utils: Classes.Utilities;
    }
    /** The Triggers Object */
    class Trigger {
        /** The Name of the trigger */
        name: string;
        /** Whether or not to completely disable the entire trigger function */
        globalDisable: boolean;
        /** The Configuration information of the Trigger */
        triggerConfig: Interfaces.TriggerConfig;
        /** The function to run when the trigger is activated */
        execute(client: Bot, message: djs.Message): void;
        constructor(name: string, message: TriggerMessage, channel: TriggerChannel, role: TriggerRole, user: TriggerUser)
        setGlobalDisable<nv>(newValue: boolean): this & { globalDisable: nv }
        setExecute<handler>(handler: (client: Bot, message: djs.Message) => void): this & { execute: handler }
        static Message: TriggerMessage;
        static Channel: TriggerChannel;
        static Role: TriggerRole;
        static User: TriggerUser;
    }
    /** The Commands Object */
    class Command {
        /** The Name of the command */
        name: string;
        /** The message terms that trigger the command */
        triggers: Array<string>;
        /** The information used in the help command for the command */
        info: CommandInfo;
        /** The Permission (if any) required to run the command */
        requiredPerm: djs.PermissionFlags;
        /** What channels the command is allowed to be ran in */
        channelLimits: Array<djs.ChannelType>;
        /** An array of role IDs that are allowed to run the command */
        allowedRoles: Array<string>;
        /** An array of user IDs that are allowed to run the command */
        allowedUsers: Array<string>;
        /** Whether or not the command should be blocked in DMs */
        blockDM: boolean;
        /** Whether or not the command is completely disabled */
        disabled: boolean;
        /** The types of methods that can trigger the command */
        type: { slash: boolean, text: boolean };
        /** The Discord API information on the command (used to register the slash command) */
        data: djs.SlashCommandBuilder | undefined | null;
        /** The function to be executed when the ***SLASH*** command is ran */
        commandExecute(client: Bot, interaction: djs.ChatInputCommandInteraction): void;
        /** The function to be executed when the ***MESSAGE*** command is ran */
        messageExecute(client: Bot, message: djs.Message): void;
        /** The function to be executed when ***AUTOCOMPLETE*** is used */
        autocomplete(client: Bot, interaction: djs.AutocompleteInteraction): void;
        constructor(
            name: string,
            triggers: Array<string>,
            config: CommandInfo,
            restrictions: CommandRestrictions,
            types: { slash: boolean, text: boolean },
            data: djs.SlashCommandBuilder | undefined
        )
        /** Sets the execute function for ***SLASH*** commands */
        setCommand<handler>(handler: (interaction: djs.ChatInputCommandInteraction, client: Bot) => void): this & { commandExecute: handler }
        /** Sets the execute function for ***MESSAGE*** commands */
        setMessage<handler>(handler: (message: djs.Message, client: Bot) => void): this & { messageExecute: handler }
        /** Sets the execute function for ***AUTOCOMPLETE*** interactions */
        setAutocomplete<handler>(handler: (interaction: djs.AutocompleteInteraction, client: Bot) => void): this & { autocomplete: handler }
        static Restrictions: CommandRestrictions;
        static Info: CommandInfo;
    }
    /** The Messages Object */
    class Message {
        /** The identifier of the message */
        name: string;
        /** The Human-Readable name for the message */
        displayName: string;
        /** The function to get the message data */
        getValue(client: Bot): djs.Message;
        constructor(name: string, displayName: string)
        /** Sets the function to get the message data */
        content<handler>(handler: (client: Bot) => djs.Message): this & { getValue: handler }
    }
    /** The Events Object */
    class Event {
        /** The Event this file is associated with */
        event: djs.Events;
        /** The function to be executed */
        execute(client: Bot, ...args: any): void;
        constructor(event: djs.Events);
        /** Sets the execute function for the event */
        setExecute<handler>(handler: (client: Bot, ...args: any) => void): this & { execute: handler }
    }
    /** The Components Object */
    class Components implements Interfaces.Components {
        Button: ButtonComponent;
        ContextMenu: ContextMenuComponent;
        Modal: ModalComponent;
        SelectMenu: SelectMenuComponent;
        Info: ComponentInfo;
        static Button: ButtonComponent;
        static ContextMenu: ContextMenuComponent;
        static Modal: ModalComponent;
        static SelectMenu: SelectMenuComponent;
        static Info: ComponentInfo;
    }
    class Reduce {
        static add(a: number, b: number): number;
        static subtract(a: number, b: number): number;
        static multiply(a: number, b: number): number;
        static divide(a: number, b: number): number;
        static exponent(a: number, b: number): number;
        static modulo(a: number, b: number): number;
    }
    /**
     * Timer
     *
     * Time-related utility functions
     * @example
     * Timer.timestamp(new Date()) // 'Wednesday, September 15, 2021, 12:00:00 AM EDT'
     * Timer.elapsedTime(60) // '1 minute'
     * Timer.stringToMilliseconds('1d 2h 3m 4s') // 93784000
     * Timer.unixTime(new Date()) // 1631698800
     */
    class Timer {
        static stmSTL: {
            y: string,
            M: string,
            d: string,
            h: string,
            m: string,
            s: string,
        };
        static stmDict: {
            y: number,
            M: number,
            d: number,
            h: number,
            m: number,
            s: number,
        };
        static stm(v: string, k: string): number
        static et(v: number, k: string, mod: number | undefined): number
        static ts: {
            locale: string,
            options: {
                year: string,
                month: string,
                day: string,
                hour: string,
                minute: string,
                second: string,
                weekday: string,
                timeZone: string,
                timeZoneName: string,
            },
        };
        /**
         * Intl. Date Time Formatted Timestamp
         *
         * Converts a Date-like value to a formatted timestamp using the `Intl.DateTimeFormat` API
         * @example
         * Timer.timestamp(new Date()) // 'Wednesday, September 15, 2021, 12:00:00 AM EDT'
         * Timer.timestamp(1631698800000) // 'Wednesday, September 15, 2021, 12:00:00 AM EDT'
         */
        static timestamp(value: Date | number | undefined): string;
        /**
         * Elapsed Time
         *
         * Converts a timestamp to a human-readable elapsed time
         * @example
         * Timer.elapsedTime(60) // '1 minute'
         * Timer.elapsedTime(3600) // '1 hour'
         * Timer.elapsedTime(86400) // '1 day'
         * Timer.elapsedTime(542) // '9 minutes and 2 seconds'
         * Timer.elapsedTime(65478) // '18 hours, 11 minutes, and 18 seconds'
         */
        static elapsedTime(t: number): string;
        /**
         * Converts a string to milliseconds using the inversion of the {@link Timer.elapsedTime `elapsedTime`} function
         * @throws {TypeError} If the string is not in the correct format
         */
        static stringToMilliseconds(timeString: string): number;
        /**
         * Converts a string to seconds
         * @see {@link Timer.stringToMilliseconds stringToMilliseconds} - **Base conversion function**
         */
        static stringToSeconds(timeString: string): number
        /**
         * Converts a Date object to Unix Time
         * @throws {TypeError} If the value is not a Date object
         */
        static unixTime(date: Date): number
    }
    /**
     * List Formatter
     *
     * Formats a list of items into a human-readable format
     * @example
     * List.and(['apples', 'oranges', 'bananas']) // 'apples, oranges, and bananas'
     * List.or(['apples', 'oranges', 'bananas']) // 'apples, oranges, or bananas'
     */
    class List {
        static quick(v: Array<any>, type: string): string;
        /** Formats a list of items into a human-readable format using the `conjunction` style */
        static and(value: Array<string>): string;
        /** Formats a list of items into a human-readable format using the `disjunction` style */
        static or(value: Array<string>): string;
    }
    /**
     * Text Utilities
     *
     * Text utility functions
     * @example
     * Text.yn(true) // 'Yes'
     * Text.tf(true) // 'True'
     * Text.onOff(true) // 'On'
     * Text.enabledDisabled(true) // 'Enabled'
     * Text.activeInactive(true) // 'Active'
     * Text.successFailure(true) // 'Success'
     * Text.passFail(true) // 'Pass'
     * Text.pluralize(1, 'apple') // 'apple'
     * Text.pluralize(2, 'apple') // 'apples'
     * Text.longText(', ', 'apple', 'orange', 'banana') // 'apple, orange, banana'
     */
    class Text {
        /** Formats a value quickly */
        static quickProcess(value: boolean, yes: string, no: string): string;
        /** Converts a boolean to 'Yes' or 'No' */
        static yn(value: boolean): 'Yes' | 'No';
        /** Converts a boolean to 'True' or 'False' */
        static tf(value: boolean): 'True' | 'False';
        /** Converts a boolean to 'On' or 'Off' */
        static onOff(value: boolean): 'On' | 'Off';
        /** Converts a boolean to 'Enabled' or 'Disabled' */
        static enabledDisabled(value: boolean): 'Enabled' | 'Disabled';
        /** Converts a boolean to 'Active' or 'Inactive' */
        static activeInactive(value: boolean): 'Active' | 'Inactive';
        /** Converts a boolean to 'Success' or 'Failure' */
        static successFailure(value: boolean): 'Success' | 'Failure';
        /** Converts a boolean to 'Pass' or 'Fail' */
        static passFail(value: boolean): 'Pass' | 'Fail';
        /** Converts a value to a pluralized form */
        static pluralize(value: number, text: string): string;
        /** Converts a list of values to a long text string */
        static longText(joiner: string, ...value: Array<string>): string;
    }
    class RTS implements Interfaces.RTS {
        registered: number;
        executed: number;
        constructor();
        reg(): number;
        exec(): number;
    }
    class DiscordClass implements Interfaces.Discord {
        static Utils: Interfaces.DiscordUtils;
        static Initializers: Interfaces.DiscordInits;
        Utils: Interfaces.DiscordUtils;
        Initializers: Interfaces.DiscordInits;
    }
    class Utilities implements Interfaces.Utils {
        static Discord: DiscordClass;
        static RuntimeStatistics: RTS;
        Discord: DiscordClass;
        RuntimeStatistics: RTS;
    }
}

declare namespace Enums {

}

declare namespace Types {

}

declare module "@therealbenpai/djs-client" {
    const Bot: Classes.Bot;
}