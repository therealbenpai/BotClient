import * as djs from 'discord.js';

import Bot from './bot';

type ComponentType = djs.ButtonBuilder | djs.ContextMenuCommandBuilder | djs.SelectMenuBuilder | djs.ModalBuilder;

class TriggerBase {
    /** Whether or not the trigger is activated */
    activated: boolean;
    /** Whether or not the trigger requires that the message be prefixed to be activated */
    prefix: boolean;
    constructor(activated: boolean, prefix: boolean) {
        this.activated = activated;
        this.prefix = prefix;
    }
}

class BaseComponent {
    /** The Identifier and Name of the Component */
    name: string;
    /** The Description of the Component (What it Does, What It's Purpose Is, etc.) */
    info: ComponentInfo;
    /** The Type of Component that this is */
    data: ComponentType;
    constructor(name: string, info: ComponentInfo, data: ComponentType) {
        this.name = name;
        this.info = info;
        this.data = data;
    }
}

/**
 * A class that represents the exection conditions dealing with messages for a trigger
 */
class TriggerMessage extends TriggerBase {
    /** The prefixes that the message can start with */
    prefixes: string[];
    /** The substrings that the message can contain */
    contains: string[];
    /** The suffixes that the message can end with */
    suffixes: string[];
    /** The regular expressions that the message can match */
    regex: RegExp[];
    constructor(activated: boolean, prefix: boolean, config: { prefixes: string[] | null; contains: string[] | null; suffixes: string[] | null; regex: RegExp[] | null; }) {
        super(activated, prefix);
        this.prefixes = config.prefixes ?? [];
        this.contains = config.contains ?? [];
        this.suffixes = config.suffixes ?? [];
        this.regex = config.regex ?? [];
    }
};

/**
 * A class that represents the execution conditions dealing with channels for a trigger
 */
class TriggerChannel extends TriggerBase {
    /** The IDs of the channels that the trigger can be activated in */
    id: string[];
    /** The types of channels that the trigger can be activated in */
    types: djs.ChannelType[];
    constructor(activated: boolean, prefix: boolean, config: { id: string[] | null; types: djs.ChannelType[] | null; }) {
        super(activated, prefix);
        this.id = config.id ?? [];
        this.types = config.types ?? [];
    }
};

/**
 * A class that represents the execution conditions dealing with roles for a trigger
 */
class TriggerRole extends TriggerBase {
    /** The IDs of the roles that can activate the trigger */
    id: string[];
    constructor(activated: boolean, prefix: boolean, config: { id: string[] | null; }) {
        super(activated, prefix);
        this.id = config.id ?? [];
    }
};

/**
 * A class that represents the execution conditions dealing with users for a trigger
 */
class TriggerUser extends TriggerBase {
    /** The IDs of the users that can activate the trigger */
    id: string[];
    constructor(activated: boolean, prefix: boolean, config: { id: string[] | null; }) {
        super(activated, prefix);
        this.id = config.id ?? [];
    }
};

/**
 * A class that represents the restrictions that can be placed on a command
 */
class CommandRestrictions {
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
    constructor(data: { perm?: djs.PermissionFlags, channels?: djs.ChannelType[], roles?: string[], users?: string[], dms?: boolean }) {
        this.perm = data?.perm;
        this.channels = data?.channels ?? [];
        this.roles = data?.roles ?? [];
        this.users = data?.users ?? [];
        this.dms = data?.dms ?? false;
    }
};

/**
 * Information about a command
 */
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
    examples: string[];
    /** Whether or not the command is disabled */
    disabled: boolean;
    /** Aliases for the command */
    aliases: string[];
    constructor(data: { type: string, description: string, usage: string, examples: string[], disabled: boolean, aliases: string[] }) {
        this.type = data.type;
        this.description = data.description;
        this.usage = data.usage;
        this.examples = data.examples;
        this.disabled = data.disabled;
        this.aliases = data.aliases;
    }
};

type ClientInteraction<T extends djs.BaseInteraction | djs.Message> = (client: Bot, interaction: T) => void

/**
 * A class that represents a Button component
 */
class ButtonComponent extends BaseComponent {
    execute: ClientInteraction<djs.ButtonInteraction>;
    constructor(name: string, info: ComponentInfo, data: djs.ButtonBuilder, handler: ClientInteraction<djs.ButtonInteraction>) {
        super(name, info, data);
        this.execute = handler;
    }
};

/**
 * A class that represents a Context Menu component
 */
class ContextMenuComponent extends BaseComponent {
    execute: ClientInteraction<djs.ContextMenuCommandInteraction>;
    constructor(name: string, info: ComponentInfo, data: djs.ContextMenuCommandBuilder, handler: ClientInteraction<djs.ContextMenuCommandInteraction>) {
        super(name, info, data);
        this.execute = handler;
    }
};

/**
 * A class that represents a Modal component
 */
class ModalComponent extends BaseComponent {
    execute: ClientInteraction<djs.ModalSubmitInteraction>;
    constructor(name: string, info: ComponentInfo, data: djs.ModalBuilder, handler: ClientInteraction<djs.ModalSubmitInteraction>) {
        super(name, info, data);
        this.execute = handler;
    }
};

/**
 * A class that represents a Select Menu component
 */
class SelectMenuComponent extends BaseComponent {
    execute: ClientInteraction<djs.SelectMenuInteraction>;
    constructor(name: string, info: ComponentInfo, data: djs.SelectMenuBuilder, handler: ClientInteraction<djs.SelectMenuInteraction>) {
        super(name, info, data);
        this.execute = handler;
    }
};

/**
 * A class that contains information about a component
 */
class ComponentInfo {
    /** The name of the component */
    name: string;
    /** The description of the component */
    description: string;
    /** The type of component */
    type: string;
    constructor(name: string, description: string, type: string) {
        this.name = name;
        this.description = description;
        this.type = type;
    }
};

class Event {
	/** The name of the event */
	event: djs.Events;
	/** The function that is called when the event is emitted */
	execute: ClientInteraction<any>;
	constructor(event: djs.Events, handler: ClientInteraction<any>) {
		this.event = event;
        this.execute = handler;
	}
};

class Trigger {
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
    constructor(name: string, message: TriggerMessage, channel: TriggerChannel, role: TriggerRole, user: TriggerUser, handler: ClientInteraction<djs.Message>) {
        this.name = name;
        this.disabled = false;
        this.triggerConfig = {
            message,
            channel,
            role,
            user,
        };
        this.execute = handler;
    }
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
    constructor(
        name: string,
        triggers: string[],
        config: CommandInfo,
        restrictions: CommandRestrictions,
        types: { text: boolean, slash: boolean },
        data: djs.SlashCommandBuilder,
        messageExecuteHandler: ClientInteraction<djs.Message>,
        commandExecuteHandler: ClientInteraction<djs.Interaction>,
        autocompleteHandler: ClientInteraction<djs.AutocompleteInteraction>
    ) {
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
        this.messageExecute = messageExecuteHandler;
        this.commandExecute = commandExecuteHandler;
        this.autocomplete = autocompleteHandler;
    }
    /** The class that represents the restrictions that can be placed on a command */
    static Restrictions = CommandRestrictions;
    /** The class that contains information about a command */
    static Info = CommandInfo;
};

class Message {
	/** The name of the message */
	name: string;
	/** The display name of the message */
	displayName: string;
	/** The function that is called when the message is called */
    // @ts-expect-error The function is implemented in the initialization of the class
	async getValue(client: Bot): Promise<djs.APIMessage>
	constructor(name: string, displayName: string, handler: (client: Bot) => Promise<djs.APIMessage>) {
		this.name = name;
		this.displayName = displayName;
        this.getValue = handler;
	}
};

class Initializers {
    static Command = Command;
    static Event = Event;
    static Trigger = Trigger;
    static Message = Message;
    static ButtonComponent = ButtonComponent;
    static ContextMenuComponent = ContextMenuComponent;
    static ModalComponent = ModalComponent;
    static SelectMenuComponent = SelectMenuComponent;
}

export default Initializers;

export {
    Command,
    Event,
    Trigger,
    Message,
    ButtonComponent,
    ContextMenuComponent,
    ModalComponent,
    SelectMenuComponent,
    CommandRestrictions,
    CommandInfo,
    ComponentInfo,
    TriggerMessage,
    TriggerChannel,
    TriggerRole,
    TriggerUser,
    ClientInteraction,
    TriggerBase,
    BaseComponent,
    ComponentType,
}
