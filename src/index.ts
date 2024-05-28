import * as djs from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import * as fs from 'fs';
import * as os from 'os';

type ComponentType = djs.ButtonBuilder | djs.ContextMenuCommandBuilder | djs.SelectMenuBuilder | djs.ModalBuilder;

class General {
	static Reduce = class {
		/** Adds two numbers together */
		static add = (a: number, b: number): number => a + b;
		/** Subtracts the second number from the first */
		static subtract = (a: number, b: number) => a - b;
		/** Multiplies two numbers together */
		static multiply = (a: number, b: number) => a * b;
		/** Divides the first number by the second */
		static divide = (a: number, b: number) => a / b;
		/** Raises the first number to the power of the second */
		static exponent = (a: number, b: number) => a ** b;
		/** Returns the remainder of the first number divided by the second */
		static modulo = (a: number, b: number) => a % b;
	}
}

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
	/** The Function that is called when the Component is interacted with */
	async execute(client: Bot, interaction: djs.BaseInteraction): Promise<void> { }
	constructor(name: string, info: ComponentInfo, data: ComponentType) {
		this.name = name;
		this.info = info;
		this.data = data;
		this.execute = async (client, interaction) => { };
	}
	setExecute(handler: (client: Bot, interaction: djs.BaseInteraction) => void) {
		Object.assign(this, { execute: handler })
	}
}

/**
 * A class that represents the exection conditions dealing with messages for a trigger
 */
class TriggerMessage extends TriggerBase {
	/** The prefixes that the message can start with */
	prefixes: Array<string>;
	/** The substrings that the message can contain */
	contains: Array<string>;
	/** The suffixes that the message can end with */
	suffixes: Array<string>;
	/** The regular expressions that the message can match */
	regex: Array<RegExp>;
	constructor(activated: boolean, prefix: boolean, config: { prefixes: Array<string> | null; contains: Array<string> | null; suffixes: Array<string> | null; regex: Array<RegExp> | null; } | undefined) {
		super(activated, prefix);
		this.prefixes = config!.prefixes ?? [];
		this.contains = config!.contains ?? [];
		this.suffixes = config!.suffixes ?? [];
		this.regex = config!.regex ?? [];
	}
};

/**
 * A class that represents the execution conditions dealing with channels for a trigger
 */
class TriggerChannel extends TriggerBase {
	/** The IDs of the channels that the trigger can be activated in */
	id: Array<string>;
	/** The types of channels that the trigger can be activated in */
	types: Array<djs.ChannelType>;
	constructor(activated: boolean, prefix: boolean, config: { id: Array<string> | null; types: Array<djs.ChannelType> | null; } | undefined) {
		super(activated, prefix);
		this.id = config!.id ?? [];
		this.types = config!.types ?? [];
	}
};

/**
 * A class that represents the execution conditions dealing with roles for a trigger
 */
class TriggerRole extends TriggerBase {
	/** The IDs of the roles that can activate the trigger */
	id: Array<string>;
	constructor(activated: boolean, prefix: boolean, config: { id: Array<string> | null; } | undefined) {
		super(activated, prefix);
		this.id = config!.id ?? [];
	}
};

/**
 * A class that represents the execution conditions dealing with users for a trigger
 */
class TriggerUser extends TriggerBase {
	/** The IDs of the users that can activate the trigger */
	id: Array<string>;
	constructor(activated: boolean, prefix: boolean, config: { id: Array<string> | null; } | undefined) {
		super(activated, prefix);
		this.id = config!.id ?? [];
	}
};

/**
 * A class that represents the restrictions that can be placed on a command
 */
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
	constructor(data: { perm: bigint | undefined, channels: djs.ChannelType[] | undefined, roles: string[] | undefined, users: string[] | undefined, dms: boolean | undefined }) {
		this.perm = data.perm as unknown as djs.PermissionFlags;
		this.channels = data?.channels || [];
		this.roles = data?.roles || [];
		this.users = data?.users || [];
		this.dms = data?.dms || false;
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
	examples: Array<string>;
	/** Whether or not the command is disabled */
	disabled: boolean;
	/** Aliases for the command */
	aliases: Array<string>;
	constructor(data: { type: string, description: string, usage: string, examples: Array<string>, disabled: boolean, aliases: Array<string> }) {
		this.type = data.type;
		this.description = data.description;
		this.usage = data.usage;
		this.examples = data.examples;
		this.disabled = data.disabled;
		this.aliases = data.aliases;
	}
};

/**
 * A class that represents a Button component
 */
class ButtonComponent extends BaseComponent {
	constructor(name: string, info: ComponentInfo, data: djs.ButtonBuilder) {
		super(name, info, data);
	}
	setExecute = (handler: (client: Bot, interaction: djs.ButtonInteraction) => void) => Object.assign(this, { execute: handler });
};

/**
 * A class that represents a Context Menu component
 */
class ContextMenuComponent extends BaseComponent {
	constructor(name: string, info: ComponentInfo, data: djs.ContextMenuCommandBuilder) {
		super(name, info, data);
	}
	setExecute = (handler: (client: Bot, interaction: djs.ContextMenuCommandInteraction) => void) => Object.assign(this, { execute: handler });
};

/**
 * A class that represents a Modal component
 */
class ModalComponent extends BaseComponent {
	constructor(name: string, info: ComponentInfo, data: djs.ModalBuilder) {
		super(name, info, data);
	}
	setExecute = (handler: (client: Bot, interaction: djs.ModalSubmitInteraction) => void) => Object.assign(this, { execute: handler });
};

/**
 * A class that represents a Select Menu component
 */
class SelectMenuComponent extends BaseComponent {
	constructor(name: string, info: ComponentInfo, data: djs.SelectMenuBuilder) {
		super(name, info, data);
	}
	setExecute = (handler: (client: Bot, interaction: djs.SelectMenuInteraction) => void) => Object.assign(this, { execute: handler });
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
	static stm = (v: string, k: string) => Number(v.slice(0, -1)) * this.STMDict2.get(k)[1];
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
		} as Intl.DateTimeFormatOptions,
	};
	/** Converts a Date or number to a timestamp */
	static timestamp = (value: Date | number) => new Intl.DateTimeFormat(this.ts.locale, this.ts.options).format(value);
	/** Converts a string to milliseconds */
	static stringToMilliseconds = (timeString: string) => timeString
		.split(' ')
		.map((value: string) => this.stm(value, value.slice(-1)))
		.reduce(General.Reduce.add);
	/** Converts a string to seconds */
	static stringToSeconds = (timeString: string) => this.stringToMilliseconds(timeString) / 1e3;
	/** Converts a string to minutes */
	static unixTime = (date: Date) => Math.round(Date.parse(date.toISOString()) / 1e3);
}

/**
 * A class that contains methods for processing text
 */
class List {
	/** Joins an array of strings with a comma and a space */
	static quick = (v: Array<string>, type: Intl.ListFormatType) => new Intl.ListFormat('en-US', { style: 'long', type }).format(v);
	/** Joins an array of strings with a comma and a space in the Conjunction style*/
	static and = (value: Array<string>) => this.quick(value, 'conjunction');
	/** Joins an array of strings with a comma and a space in the Disjunction style*/
	static or = (value: Array<string>) => this.quick(value, 'disjunction');
}

/**
 * A class that contains methods for processing text
 */
class TextSym {
	/** Quickly process a yes/no boolean value */
	static quickProcess = (value: any, yes: string, no: string) => value ? yes : no;
	/** Process a boolean value into a yes/no string */
	static yn = (value: any) => this.quickProcess(value, 'Yes', 'No');
	/** Process a boolean value into a true/false string */
	static tf = (value: any) => this.quickProcess(value, 'True', 'False');
	/** Process a boolean value into an on/off string */
	static onOff = (value: any) => this.quickProcess(value, 'On', 'Off');
	/** Process a boolean value into an enabled/disabled string */
	static enabledDisabled = (value: any) => this.quickProcess(value, 'Enabled', 'Disabled');
	/** Process a boolean value into an active/inactive string */
	static activeInactive = (value: any) => this.quickProcess(value, 'Active', 'Inactive');
	/** Process a boolean value into a success/failure string */
	static successFailure = (value: any) => this.quickProcess(value, 'Success', 'Failure');
	/** Process a boolean value into a pass/fail string */
	static passFail = (value: any) => this.quickProcess(value, 'Pass', 'Fail');
	/** Process a string into a pluralized string based on a value */
	static pluralize = (value: any, text: string) => `${text}${value > 0 ? 's' : ''}`;
	/** Join a long set of text into a single string value */
	static longText = (joiner: string, ...value: Array<any>) => value.join(joiner);
}
class Discord {
	static Utils = class {
		/**
		 * A class that contains methods for creating markdown text
		 */
		static Markdown = class {
			/** Quickly process a string with a prefix and suffix */
			static quickProcess = (a: string) => (v: string) => `${a}${v}${a}`;
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
			static quote = (value: string) => `> ${value}`;
			/** Make text appear as a code block */
			static codeBlock = (stringValue: string, language: string) => `\`\`\`${language || ''}\n${stringValue}\n\`\`\``;
			/** Make text appear as a block quote */
			static blockQuote = (value: string) => `>>> ${value}`;
			/** Make text appear as a formatted url */
			static link = (text: string, url: string) => `[${text}](${url})`;
		};

		/**
		 * A class that contains methods for creating mentions
		 */
		static Mentions = class {
			/** Quickly process a string with a prefix and suffix */
			static quickProcess = (prefix: string, value: string, suffix: string = '') => `<${prefix}${value}${suffix}>`;
			/** Process a string into a role mention */
			static role = (id: string) => this.quickProcess('@&', id);
			/** Process a string into a user mention */
			static user = (id: string) => this.quickProcess('@', id);
			/** Process a string into a channel mention */
			static channel = (id: string) => this.quickProcess('#', id);
			/** Process a string into an emoji */
			static emoji = (name: string, id: string) => this.quickProcess(':', name, `:${id} `);
			/** Process a string into an animated emoji */
			static animatedEmoji = (name: string, id: string) => this.quickProcess('a:', name, `:${id} `);
			/** Process a string into a timestamp */
			static timestamp = (timestamp: string, format: string = 'f') => this.quickProcess('t:', timestamp, `:${format}`);
		};

		/**
		 * A class that contains methods for creating embeds
		 */
		static Embed = class {
			/** Quickly create a field for an embed */
			static Field = (name: string, value: string, inline: boolean = false) => ({ name, value, inline });
			/** Quickly create an author for an embed */
			static Author = (name: string, url: string | undefined | null = null, iconURL: string | undefined | null = null) => ({ name, url, iconURL });
			/** Quickly create a footer for an embed */
			static Footer = (text: string, url: string | undefined | null = null) => ({ text, url });
		};
	};
	/**
	 * A class that contains methods for interacting with the Discord API
	 */
	static Initializers = class {
		/**
		 * A class that represents a message trigger
		 */
		static Trigger = class {
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
			async execute(client: Bot, message: djs.Message): Promise<void> { }
			constructor(name: string, message: TriggerMessage, channel: TriggerChannel, role: TriggerRole, user: TriggerUser) {
				this.name = name;
				this.globalDisable = false;
				this.triggerConfig = {
					message,
					channel,
					role,
					user,
				};
				this.execute = async (client, message) => { };
			}
			/** Set whether or not the trigger is disabled */
			setGlobalDisable = (newValue: Boolean) => Object.assign(this, { globalDisable: newValue });
			/** Set the function that is called when the trigger is activated */
			setExecute = (handler: (client: Bot, message: djs.Message) => void) => Object.assign(this, { execute: handler });
			/** The class that represents the execution conditions dealing with messages for a trigger */
			static Message = TriggerMessage;
			/** The class that represents the execution conditions dealing with channels for a trigger */
			static Channel = TriggerChannel;
			/** The class that represents the execution conditions dealing with roles for a trigger */
			static Role = TriggerRole;
			/** The class that represents the execution conditions dealing with users for a trigger */
			static User = TriggerUser;
		};

		/**
		 * A class that represents a command
		 */
		static Command = class {
			/** The name of the command */
			name: string;
			/** The triggers that can activate the command */
			triggers: Array<string>;
			/** The information about the command */
			info: CommandInfo;
			/** The permissions required to execute the command */
			requiredPerm: djs.PermissionFlags;
			/** The channels that the command can be executed in */
			channelLimits: Array<djs.ChannelType>;
			/** The roles that can execute the command */
			allowedRoles: Array<string>;
			/** The users that can execute the command */
			allowedUsers: Array<string>;
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
			async commandExecute(client: Bot, interaction: djs.CommandInteraction): Promise<void> { };
			/** The function that is called when the command is executed */
			async messageExecute(client: Bot, message: djs.Message): Promise<void> { };
			/** The function that is called when the command's autocomplete action is called */
			async autocomplete(client: Bot, interaction: djs.AutocompleteInteraction): Promise<void> { };
			constructor(name: string, triggers: Array<string>, config: CommandInfo, restrictions: CommandRestrictions, types: { text: boolean, slash: boolean }, data: djs.SlashCommandBuilder) {
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
				this.commandExecute = async (client, interaction) => { };
				this.messageExecute = async (client, message) => { };
				this.autocomplete = async (client, interaction) => { };
			}
			/** Set the function that is called when the slash command is executed */
			setCommand = (handler: (client: Bot, interaction: djs.CommandInteraction) => void) => Object.assign(this, { commandExecute: handler });
			/** Set the function that is called when the text command is executed */
			setMessage = (handler: (client: Bot, message: djs.Message) => void) => Object.assign(this, { messageExecute: handler });
			/** Set the function that is called when the autocomplete action is called */
			setAutocomplete = (handler: (client: Bot, interaction: djs.AutocompleteInteraction) => void) => Object.assign(this, { autocomplete: handler });
			/** The class that represents the restrictions that can be placed on a command */
			static Restrictions = CommandRestrictions;
			/** The class that contains information about a command */
			static Info = CommandInfo;
		};

		/**
		 * A class that represents a message
		 */
		static Message = class {
			/** The name of the message */
			name: string;
			/** The display name of the message */
			displayName: string;
			/** The function that is called when the message is called */
			async getValue(client: Bot): Promise<djs.APIMessage> { return {} as djs.APIMessage }
			constructor(name: string, displayName: string) {
				this.name = name;
				this.displayName = displayName;
				this.getValue = async (client) => { return {} as djs.APIMessage };
			}
			content = (handler: (client: Bot) => djs.APIMessage) => Object.assign(this, { getValue: handler });
		};

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

		/**
		 * A class that represents an event
		 */
		static Event = class {
			/** The name of the event */
			event: string;
			/** The function that is called when the event is emitted */
			async execute(client: Bot, ...args: any): Promise<void> { }
			constructor(event: string) {
				this.event = event;
				this.execute = async (client, ...args) => { };
			}
			setExecute = (handler: (client: Bot, ...args: any) => void) => Object.assign(this, { execute: handler });
		};
	};
}
class RuntimeStatistics {
	/** The number of times `X` has been registered */
	registered: number;
	/** The number of times `X` has been executed */
	executed: number;
	constructor() {
		this.registered = 0;
		this.executed = 0;
	}
	/** Increment the number of times `X` has been registered */
	reg = () => ++this.registered;
	/** Increment the number of times `X` has been executed */
	exec = () => ++this.executed;
}
const thisSetter = (t: any) => { throw new ReferenceError(`${t.name} is Read - Only`) };
class UtilsClass extends General {
	static Time = Timer;
	static Discord = Discord;
	static Text = TextSym;
	static List = List;
	static RuntimeStatistics = RuntimeStatistics;

	get Time() { return Timer }

	set Time(_) { thisSetter(Timer) }

	get Discord() { return Discord }

	set Discord(_) { thisSetter(Discord) }

	get Text() { return TextSym }

	set Text(_) { thisSetter(TextSym) }

	get List() { return List }

	set List(_) { thisSetter(List) }

	get RuntimeStatistics() { return RuntimeStatistics }

	set RuntimeStatistics(_) { thisSetter(RuntimeStatistics) }
}

type fixedRTS = Omit<UtilsClass["RuntimeStatistics"], "prototype"> & { reg: () => void; exec: () => void; };

class Bot extends djs.Client {
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
	interactions: Array<djs.SlashCommandBuilder | djs.ContextMenuCommandBuilder>
	runtimeStats: {
		commands: {
			text: fixedRTS
			slash: fixedRTS;
		},
		triggers: {
			registered: number;
			role: fixedRTS;
			user: fixedRTS;
			channel: fixedRTS;
			message: fixedRTS;
		},
		events: fixedRTS & { sEE: { [K: string]: fixedRTS } },
		components: {
			modals: fixedRTS;
			buttons: fixedRTS;
			selectMenus: fixedRTS;
			contextMenus: fixedRTS;
		},
		predefinedMessages: fixedRTS;
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
	Commands: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Command"]>;
	Events: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Event"]>;
	Modals: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Modal"]>;
	Buttons: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Button"]>;
	SelectMenus: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["SelectMenu"]>;
	ContextMenus: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["ContextMenu"]>;
	Messages: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Message"]>;
	Triggers: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Trigger"]>;
	PredefinedMessages: djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Message"]>;
	Statuses: djs.Collection<number, djs.ActivityOptions>;
	Utils: typeof UtilsClass;
	branding: djs.EmbedData;
	constructor(id: string, token: string, prefix: string, options: { commandsDir?: string, eventsDir?: string, triggersDir?: string, buttonsDir?: string, selectMenusDir?: string, contextMenusDir?: string, modalComponentsDir?: string, predefinedMessagesDir?: string}) {
		super({
			intents: Object.values(djs.GatewayIntentBits) as Array<djs.GatewayIntentBits>,
			partials: Object.values(djs.Partials) as Array<djs.Partials>,
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
		this.Commands = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Command"]>;
		this.Events = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Event"]>;
		this.Modals = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Modal"]>;
		this.Buttons = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Button"]>;
		this.SelectMenus = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["SelectMenu"]>;
		this.ContextMenus = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["ContextMenu"]>;
		this.Messages = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Message"]>;
		this.Triggers = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Trigger"]>;
		this.PredefinedMessages = new djs.Collection() as djs.Collection<string, UtilsClass["Discord"]["Initializers"]["Message"]>;
		this.Statuses = new djs.Collection()
			.set(0, { type: djs.ActivityType.Watching, name: 'The Server' }) as djs.Collection<number, djs.ActivityOptions>;
		this.Utils = UtilsClass;
		this.branding = {
			footer: { text: '' },
			color: 0x2F3136,
		}
		this.interactions = new Array();
		this
			.on('push.events', (event: UtilsClass["Discord"]["Initializers"]["Event"]) => {
				if (!(event instanceof UtilsClass.Discord.Initializers.Event)) return;
				this.regRTS('events');
				this.gev(event.event);
				this.Events.set(event.event, event);
				console.log(`[EVENT] Registered ${event.event}`);
				this.on(event.event, (...args) => {
					this.bumpRTS(`events.sEE.${event.event}`);
					event.execute(this, ...args)
				});
			})
			.on('push.commands', (command: UtilsClass["Discord"]["Initializers"]["Command"]) => {
				if (!(command instanceof UtilsClass.Discord.Initializers.Command)) return;
				this.Commands.set(command.name, command);
				if (command.type.text) this.regRTS('commands.text');
				if (command.type.slash) {
					this.regRTS('commands.slash');
					// @ts-expect-error
					this.interactions.push(command.data.toJSON());
				}
			})
			.on('push.triggers', (trigger: UtilsClass["Discord"]["Initializers"]["Trigger"]) => {
				if (!(trigger instanceof UtilsClass.Discord.Initializers.Trigger)) return;
				this.Triggers.set(trigger.name, trigger);
				Object.entries(trigger.triggerConfig)
					.forEach((value) => value[1].activated
						? this.regRTS(`triggers.${value[0]}`)
						: null
					);
			})
			.on('push.buttons', (button: UtilsClass["Discord"]["Initializers"]["Button"]) => {
				if (!(button instanceof UtilsClass.Discord.Initializers.Button)) return;
				this.Buttons.set(button.name, button);
				this.regRTS('components.buttons');
			})
			.on('push.contextMenus', (contextMenu: UtilsClass["Discord"]["Initializers"]["ContextMenu"]) => {
				if (!(contextMenu instanceof UtilsClass.Discord.Initializers.ContextMenu)) return;
				this.ContextMenus.set(contextMenu.name, contextMenu);
				this.regRTS('components.contextMenus');
				// @ts-expect-error
				this.interactions.push(contextMenu.data.toJSON());
			})
			.on('push.selectMenus', (selectMenu: UtilsClass["Discord"]["Initializers"]["SelectMenu"]) => {
				if (!(selectMenu instanceof UtilsClass.Discord.Initializers.SelectMenu)) return;
				this.SelectMenus.set(selectMenu.name, selectMenu);
				this.regRTS('components.selectMenus');
			})
			.on('push.modals', (modal: UtilsClass["Discord"]["Initializers"]["Modal"]) => {
				if (!(modal instanceof UtilsClass.Discord.Initializers.Modal)) return;
				this.Modals.set(modal.name, modal);
				this.regRTS('components.modals');
			})
			.on('push.predefinedMessages', (message: UtilsClass["Discord"]["Initializers"]["Message"]) => {
				if (!(message instanceof UtilsClass.Discord.Initializers.Message)) return;
				const gv = message.getValue;
				this.PredefinedMessages.set(message.name, Object.assign(message, { getValue: (c: Bot) => { this.bumpRTS('predefinedMessages'); return gv(c); } }));
				this.regRTS('predefinedMessages');
			});
		const rds = fs.readdirSync;
		Array.of(
			this.eventsDir ? [this.eventsDir, (event: string) => { this.emit('push.events', event) }] : null,
			this.commandsDir ? [this.commandsDir, (command) => { this.emit('push.commands', command) }] : null,
			this.triggersDir ? [this.triggersDir, (trigger) => { this.emit('push.triggers', trigger) }] : null,
			this.buttonsDir ? [this.buttonsDir, (button) => { this.emit('push.buttons', button) }] : null,
			this.contextMenusDir ? [this.contextMenusDir, (contextMenu) => { this.emit('push.contextMenus', contextMenu) }] : null,
			this.selectMenusDir ? [this.selectMenusDir, (selectMenu) => { this.emit('push.selectMenus', selectMenu) }] : null,
			this.modalComponentsDir ? [this.modalComponentsDir, (modal) => { this.emit('push.modals', modal) }] : null,
			this.predefinedMessagesDir ? [this.predefinedMessagesDir, (message) => { this.emit('push.predefinedMessages', message) }] : null,
		)
			.filter((s) => s !== null && typeof s[0] !== "function")
			.forEach((s) => rds(s![0] as string).filter((f) => f !== 'example.js').map((f) => require(`${s![0] as string}/${f}`)).forEach(s![1] as (arg0: any) => void));
		this.emit('push.events', {
			event: 'ready',
			execute: () => {
				import('chalk-template')
					.then(({ template }) => console.log(template(
						Array.of(
							`ly logged in as {red ${this.user!.username}}!`,
							`Ping: {rgb(255,127,0) ${Math.max(this.ws.ping, 0)} ms}`,
							`Guilds: {yellow ${this.guilds.cache.size}}`,
							`Users: {green ${this.users.cache.size}}`,
							`Channels: {blue ${this.channels.cache.size}}`,
							`Commands: {rgb(180,0,250) ${this.Commands.size}}`,
							`Components: {rgb(255,100,100) ${this.Modals.size + this.Buttons.size + this.SelectMenus.size + this.ContextMenus.size}}`,
							`Events: {white ${this.Events.size}}`,
							`Triggers: {grey ${this.Triggers.size}}`,
							`Pre-defined messages: {cyan ${this.PredefinedMessages.size}}`,
							`Statuses selection size: {rgb(0,255,255) ${this.Statuses.size}}`,
						).map((m, i) => `{bold [READY]} Current${i == 0 ? '' : ' '}${m}`).join('\n')
					)));
				const status = this.Statuses.random()
				if (!status) return;
				setInterval(() => this.user!.setPresence({ activities: [status] }), 15e3)
			}
		})
	}
	embed = () => new djs.EmbedBuilder(this.branding).setTimestamp()
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
	}
	gRTS = (key: string) => eval(`this.runtimeStats.${key}`);
	gev = (name: string) => Object.assign(this.runtimeStats.events.sEE, { [`${name}`]: new UtilsClass.RuntimeStatistics() });
	regRTS = (key: string) => this.gRTS(key).reg();
	bumpRTS = (key: string) => this.gRTS(key).exec();
	setBranding = (branding: djs.EmbedData) => Object.assign(this.branding, branding);
	start() {
		new REST({ version: '10' })
			.setToken(this.botToken)
			.put(Routes.applicationCommands(this.botId), { body: this.interactions })
			.catch(console.error);
		this.login(this.botToken);
	}
}

export default {
	Client: Bot,
	Utils: UtilsClass,
}

export const Client = Bot;
export const Utils = UtilsClass;