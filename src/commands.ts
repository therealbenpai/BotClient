import * as djs from 'discord.js';
import type { Bot } from './bot';

type ClientInteraction<T extends djs.BaseInteraction | djs.Message> = (client: Bot, interaction: T) => void;

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
	async commandExecute(client: Bot, interaction: djs.CommandInteraction): Promise<void> { };
	/** The function that is called when the command is executed */
	async messageExecute(client: Bot, message: djs.Message): Promise<void> { };
	/** The function that is called when the command's autocomplete action is called */
	async autocomplete(client: Bot, interaction: djs.AutocompleteInteraction): Promise<void> { };
	constructor(name: string, triggers: string[], config: CommandInfo, restrictions: CommandRestrictions, types: { text: boolean, slash: boolean }, data: djs.SlashCommandBuilder) {
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
	setCommand = (handler: ClientInteraction<djs.ChatInputCommandInteraction>) => Object.assign(this, { commandExecute: handler });
	/** Set the function that is called when the text command is executed */
	setMessage = (handler: ClientInteraction<djs.Message>) => Object.assign(this, { messageExecute: handler });
	/** Set the function that is called when the autocomplete action is called */
	setAutocomplete = (handler: ClientInteraction<djs.AutocompleteInteraction>) => Object.assign(this, { autocomplete: handler });
	/** The class that represents the restrictions that can be placed on a command */
	static Restrictions = CommandRestrictions;
	/** The class that contains information about a command */
	static Info = CommandInfo;
};

export { Command, CommandRestrictions, CommandInfo };
