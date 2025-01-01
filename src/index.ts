import * as djs from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import * as fs from 'fs';
import * as os from 'os';
import process from 'process';

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
	/** The Function that is called when the Component is interacted with */
	async execute(_client: Bot, _interaction: djs.BaseInteraction): Promise<void> { }
	constructor(name: string, info: ComponentInfo, data: ComponentType) {
		this.name = name;
		this.info = info;
		this.data = data;
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
	prefixes: string[];
	/** The substrings that the message can contain */
	contains: string[];
	/** The suffixes that the message can end with */
	suffixes: string[];
	/** The regular expressions that the message can match */
	regex: RegExp[];
	constructor(activated: boolean, prefix: boolean, config: { prefixes: string[] | null; contains: string[] | null; suffixes: string[] | null; regex: RegExp[] | null; } ) {
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
	constructor(activated: boolean, prefix: boolean, config: { id: string[] | null; types: djs.ChannelType[] | null; } | undefined) {
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
	id: string[];
	constructor(activated: boolean, prefix: boolean, config: { id: string[] | null; } | undefined) {
		super(activated, prefix);
		this.id = config!.id ?? [];
	}
};

/**
 * A class that represents the execution conditions dealing with users for a trigger
 */
class TriggerUser extends TriggerBase {
	/** The IDs of the users that can activate the trigger */
	id: string[];
	constructor(activated: boolean, prefix: boolean, config: { id: string[] | null; } | undefined) {
		super(activated, prefix);
		this.id = config!.id ?? [];
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
	constructor(name: string, info: ComponentInfo, data: djs.ButtonBuilder) {
		super(name, info, data);
	}
	setExecute = (handler: ClientInteraction<djs.ButtonInteraction>) => Object.assign(this, { execute: handler });
};

/**
 * A class that represents a Context Menu component
 */
class ContextMenuComponent extends BaseComponent {
	constructor(name: string, info: ComponentInfo, data: djs.ContextMenuCommandBuilder) {
		super(name, info, data);
	}
	setExecute = (handler: ClientInteraction<djs.ContextMenuCommandInteraction>) => Object.assign(this, { execute: handler });
};

/**
 * A class that represents a Modal component
 */
class ModalComponent extends BaseComponent {
	constructor(name: string, info: ComponentInfo, data: djs.ModalBuilder) {
		super(name, info, data);
	}
	setExecute = (handler: ClientInteraction<djs.ModalSubmitInteraction>) => Object.assign(this, { execute: handler });
};

/**
 * A class that represents a Select Menu component
 */
class SelectMenuComponent extends BaseComponent {
	constructor(name: string, info: ComponentInfo, data: djs.SelectMenuBuilder) {
		super(name, info, data);
	}
	setExecute = (handler: ClientInteraction<djs.SelectMenuInteraction>) => Object.assign(this, { execute: handler });
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
	static unitsToMSDict = new Map()
		.set('y', ['year', 365 * 24 * 60 * 60 * 1000])
		.set('M', ['month', 30 * 24 * 60 * 60 * 1000])
		.set('d', ['day', 24 * 60 * 60 * 1000])
		.set('h', ['hour', 60 * 60 * 1000])
		.set('m', ['minute', 60 * 1000])
		.set('s', ['second', 1 * 1000]) as Map<string, [string, number]>;
	static unitsToMS = (amount: string, unit: string) => Number(amount.slice(0, -1)) * (this.unitsToMSDict.get(unit)!.at(1) as number);
	static timeFormatOptions = {
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
	static timestamp = (value: Date | number) => new Intl.DateTimeFormat(this.timeFormatOptions.locale, this.timeFormatOptions.options).format(value);
	/** Converts a string to milliseconds */
	static stringToMilliseconds = (timeString: string) => timeString
		.split(' ')
		.map((value: string) => this.unitsToMS(value, value.slice(-1)))
		.reduce((a, b) => a + b);
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
	static quick = (v: string[], type: Intl.ListFormatType) => new Intl.ListFormat('en-US', { style: 'long', type }).format(v);
	/** Joins an array of strings with a comma and a space in the Conjunction style*/
	static and = (value: string[]) => this.quick(value, 'conjunction');
	/** Joins an array of strings with a comma and a space in the Disjunction style*/
	static or = (value: string[]) => this.quick(value, 'disjunction');
}


class Markdown {
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

class Mentions {
	/** Quickly process a string with a prefix and suffix */
	static quickProcess = (prefix: string, value: string, suffix = '') => `<${prefix}${value}${suffix}>`;
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
	static timestamp = (timestamp: string, format = 'f') => this.quickProcess('t:', timestamp, `:${format}`);
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

}

class Event {
	/** The name of the event */
	event: string;
	/** The function that is called when the event is emitted */
	async execute(_client: Bot, ..._args: any): Promise<void> { }
	constructor(event: string) {
		this.event = event;
	}
	setExecute = (handler: (client: Bot, ...args: any) => void) => Object.assign(this, { execute: handler });
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
	constructor(name: string, triggers: string[], config: CommandInfo, restrictions: CommandRestrictions, types: { text: boolean, slash: boolean }, data: djs.SlashCommandBuilder, messageExecuteHandler: ClientInteraction<djs.Message>, commandExecuteHandler: ClientInteraction<djs.Interaction>, autocompleteHandler: ClientInteraction<djs.AutocompleteInteraction>) {
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
const thisSetter = (t: { name: string }) => { throw new ReferenceError(`${t.name} is Read - Only`) };
class UtilsClass {
	static Time = Timer;

	static List = List;
	static RuntimeStatistics = RuntimeStatistics;

	get Time() { return Timer }

	set Time(_) { thisSetter(Timer) }

	get List() { return List }

	set List(_) { thisSetter(List) }

	get RuntimeStatistics() { return RuntimeStatistics }

	set RuntimeStatistics(_) { thisSetter(RuntimeStatistics) }
}

interface BotInitalizationOptions {
	commandsDir?: string,
	eventsDir?: string,
	triggersDir?: string,
	buttonsDir?: string,
	selectMenusDir?: string,
	contextMenusDir?: string,
	modalComponentsDir?: string,
	predefinedMessagesDir?: string,
	removedIntents?: djs.GatewayIntentBits[],
	removedPartials?: djs.Partials[],
}

class Bot extends djs.Client {
	private botToken: string;
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
	interactions: (djs.SlashCommandBuilder | djs.ContextMenuCommandBuilder)[]
	runtimeStats: {
		commands: {
			text: RuntimeStatistics
			slash: RuntimeStatistics;
		},
		triggers: {
			registered: number;
			role: RuntimeStatistics;
			user: RuntimeStatistics;
			channel: RuntimeStatistics;
			message: RuntimeStatistics;
		},
		events: RuntimeStatistics & { sEE: Record<string, RuntimeStatistics> },
		components: {
			modals: RuntimeStatistics;
			buttons: RuntimeStatistics;
			selectMenus: RuntimeStatistics;
			contextMenus: RuntimeStatistics;
		},
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
	constructor(id: string, token: string, prefix: string, options?: BotInitalizationOptions) {
		super({
			intents: Object.values(djs.GatewayIntentBits) // All Intents
			.filter((value) => {
				if (typeof value === 'string') {return false;}
				if (options?.removedIntents) {return !options.removedIntents.includes(value);}
				return true;
			}) as djs.GatewayIntentBits[],
			partials: Object.values(djs.Partials) // All Partials
			.filter((value) => {
				if (typeof value === 'string') {return false;}
				if (options?.removedPartials) {return !options.removedPartials.includes(value);}
				return true;
			}) as djs.Partials[],
			presence: {
				activities: [],
				status: djs.PresenceUpdateStatus.Online,
			},
		});
		this.botId = id;
		this.prefix = prefix;
		this.botToken = token;
		this.commandsDir = options?.commandsDir;
		this.eventsDir = options?.eventsDir;
		this.triggersDir = options?.triggersDir;
		this.buttonsDir = options?.buttonsDir;
		this.selectMenusDir = options?.selectMenusDir;
		this.contextMenusDir = options?.contextMenusDir;
		this.modalComponentsDir = options?.modalComponentsDir;
		this.predefinedMessagesDir = options?.predefinedMessagesDir;
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
		this.Triggers = new djs.Collection();
		this.Statuses = new djs.Collection();
		this.Utils = UtilsClass;
		this.branding = {
			footer: { text: '' },
			color: 0x2F3136,
		}
		this.interactions = [];
		this.RESTClient = new REST({ version: '10' }).setToken(this.botToken);
		this
			.on('push.events', (event: Event) => {
				this.regRTS('events');
				this.iDontKnowWhatThisDoes(event.event);
				this.Events.set(event.event, event);
				this.on(event.event, async (...args) => {
					this.bumpRTS(`events.sEE.${event.event}`);
					await event.execute(this, ...args)
				});
			})
			.on('push.commands', (command: Command) => {
				this.Commands.set(command.name, command);
				if (command.type.text) {this.regRTS('commands.text');}
				if (command.type.slash) {
					this.regRTS('commands.slash');
					// @ts-expect-error
					this.interactions.push(command.data.toJSON());
				}
			})
			.on('push.triggers', (trigger: Trigger) => {
				this.Triggers.set(trigger.name, trigger);
				Object.entries(trigger.triggerConfig)
					.forEach((value) => value[1].activated
						? this.regRTS(`triggers.${value[0]}`)
						: null
					);
			})
			.on('push.buttons', (button: ButtonComponent) => {
				this.Buttons.set(button.name, button);
				this.regRTS('components.buttons');
			})
			.on('push.contextMenus', (contextMenu: ContextMenuComponent) => {
				this.ContextMenus.set(contextMenu.name, contextMenu);
				this.regRTS('components.contextMenus');
				// @ts-expect-error
				this.interactions.push(contextMenu.data.toJSON());
			})
			.on('push.selectMenus', (selectMenu: SelectMenuComponent) => {
				this.SelectMenus.set(selectMenu.name, selectMenu);
				this.regRTS('components.selectMenus');
			})
			.on('push.modals', (modal: ModalComponent) => {
				this.Modals.set(modal.name, modal);
				this.regRTS('components.modals');
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
			.forEach((s) => rds(s![0] as string).filter((f) => f !== 'example.js').map((f: any) => require(`${s![0] as string}/${f}`)).forEach(s![1] as (arg0: any) => void));
		this.emit('push.events', {
			event: 'ready',
			execute: () => {
				console.log('Bot is ready');
				const status = this.Statuses.random()
				if (!status) {return;}
				setInterval(() => this.user!.setPresence({ activities: [status] }), 15e3)
			},
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
	iDontKnowWhatThisDoes  = (name: string) => Object.assign(this.runtimeStats.events.sEE, { [`${name}`]: new UtilsClass.RuntimeStatistics() });
	// @ts-expect-error
	regRTS = (key: string) => (this.runtimeStats[key] as RuntimeStatistics).reg();
	// @ts-expect-error
	bumpRTS = (key: string) => (this.runtimeStats[key] as RuntimeStatistics).exec();
	setBranding = (branding: djs.EmbedData) => Object.assign(this.branding, branding);
	start() {
		void this.RESTClient.put(Routes.applicationCommands(this.botId), { body: this.interactions });
		void this.login(this.botToken);
	}
}

export default {
	Client: Bot,
	Utils: UtilsClass,
}

export const
	Client = Bot,
	Utils = UtilsClass;
