import * as djs from 'discord.js';
import { Trigger } from './triggers';
import { Command } from './commands';
import { ButtonComponent, ContextMenuComponent, ModalComponent, SelectMenuComponent, ComponentInfo } from './components';
import { Event } from './events';
import type { Bot } from './bot';

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
		.set('s', ['second', 1e3]) as Map<string, [string, number]>;
	static stm = (v: string, k: string) => Number(v.slice(0, -1)) * (this.STMDict2.get(k)!.at(1) as number);
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
		.reduce((a, b) => a + b, 0);
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
	static longText = (joiner: string, ...value: any[]) => value.join(joiner);
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

/**
 * A class that contains methods for creating embeds
 */
class Embed {
	/** Quickly create a field for an embed */
	static Field = (name: string, value: string, inline = false) => ({ name, value, inline });
	/** Quickly create an author for an embed */
	static Author = (name: string, url: string | undefined | null = null, iconURL: string | undefined | null = null) => ({ name, url, iconURL });
	/** Quickly create a footer for an embed */
	static Footer = (text: string, url: string | undefined | null = null) => ({ text, url });
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

class Message {
	/** The name of the message */
	name: string;
	/** The display name of the message */
	displayName: string;
	/** The function that is called when the message is called */
	//@ts-expect-error
	async getValue(client: Bot): Promise<djs.APIMessage> { }
	constructor(name: string, displayName: string) {
		this.name = name;
		this.displayName = displayName;
	}
	content = (handler: (client: Bot) => djs.APIMessage) => Object.assign(this, { getValue: handler });
};

class DiscordInitializers {
	/** A class that represents a message trigger */
	static Trigger = Trigger
	/** A class that represents a command */
	static Command = Command
	/** A class that represents a message */
	static Message = Message
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
};

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

export { UtilsClass as Utils };
