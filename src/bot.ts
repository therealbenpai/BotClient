import * as djs from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import * as fs from 'fs';
import * as os from 'os';
import process from 'process';
import { Trigger } from './triggers';
import { Command } from './commands';
import { ButtonComponent, ContextMenuComponent, ModalComponent, SelectMenuComponent } from './components';
import { Event } from './events';
import { Utils } from './utils';

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
			text: InstanceType<typeof Utils.RuntimeStatistics>;
			slash: InstanceType<typeof Utils.RuntimeStatistics>;
		},
		triggers: {
			registered: number;
			role: InstanceType<typeof Utils.RuntimeStatistics>;
			user: InstanceType<typeof Utils.RuntimeStatistics>;
			channel: InstanceType<typeof Utils.RuntimeStatistics>;
			message: InstanceType<typeof Utils.RuntimeStatistics>;
		},
		events: InstanceType<typeof Utils.RuntimeStatistics> & {
			sEE: Record<string, InstanceType<typeof Utils.RuntimeStatistics>>
		},
		components: {
			modals: InstanceType<typeof Utils.RuntimeStatistics>;
			buttons: InstanceType<typeof Utils.RuntimeStatistics>;
			selectMenus: InstanceType<typeof Utils.RuntimeStatistics>;
			contextMenus: InstanceType<typeof Utils.RuntimeStatistics>;
		},
		predefinedMessages: InstanceType<typeof Utils.RuntimeStatistics>;
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
	Messages: djs.Collection<string, InstanceType<typeof Utils.Discord.Initializers.Message>>;
	Triggers: djs.Collection<string, Trigger>;
	PredefinedMessages: djs.Collection<string, InstanceType<typeof Utils.Discord.Initializers.Message>>;
	Statuses: djs.Collection<number, djs.ActivityOptions>;
	Utils = Utils;
	branding: djs.EmbedData;
	RESTClient: REST;
	constructor(id: string, token: string, prefix: string, options?: BotInitalizationOptions) {
		super({
			intents: Object.values(djs.GatewayIntentBits) // All Intents
				.filter(value => {
					if (typeof value === 'string') return false;
					if (options?.removedIntents) return !options.removedIntents.includes(value);
					return true;
				}) as djs.GatewayIntentBits[],
			partials: Object.values(djs.Partials) // All Partials
				.filter(value => {
					if (typeof value === 'string') return false;
					if (options?.removedPartials) return !options.removedPartials.includes(value);
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
				text: new Utils.RuntimeStatistics(),
				slash: new Utils.RuntimeStatistics(),
			},
			triggers: {
				registered: 0,
				role: new Utils.RuntimeStatistics(),
				user: new Utils.RuntimeStatistics(),
				channel: new Utils.RuntimeStatistics(),
				message: new Utils.RuntimeStatistics(),
			},
			events: Object.assign(new Utils.RuntimeStatistics(), { sEE: {} }),
			components: {
				modals: new Utils.RuntimeStatistics(),
				buttons: new Utils.RuntimeStatistics(),
				selectMenus: new Utils.RuntimeStatistics(),
				contextMenus: new Utils.RuntimeStatistics(),
			},
			predefinedMessages: new Utils.RuntimeStatistics(),
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
		this.Statuses = new djs.Collection();
		this.branding = {
			footer: { text: '' },
			color: 0x2F3136,
		}
		this.interactions = [];
		this.RESTClient = new REST({ version: '10' }).setToken(this.botToken);
		this
			.on('push.events', (event: Event) => {
				this.regRTS('events');
				this.gev(event.event);
				this.Events.set(event.event, event);
				// eslint-disable-next-line ts/no-misused-promises
				this.on(event.event, async (...args) => {
					this.bumpRTS(`events.sEE.${event.event}`);
					await event.execute(this, ...args)
				});
			})
			.on('push.commands', (command: Command) => {
				this.Commands.set(command.name, command);
				if (command.type.text) this.regRTS('commands.text');
				if (command.type.slash) {
					this.regRTS('commands.slash');
					// @ts-expect-error
					this.interactions.push(command.data.toJSON());
				}
			})
			.on('push.triggers', (trigger: Trigger) => {
				this.Triggers.set(trigger.name, trigger);
				Object.entries(trigger.triggerConfig)
					.forEach(value => value[1].activated
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
			})
			.on('push.predefinedMessages', (message: InstanceType<typeof Utils.Discord.Initializers.Message>) => {
				if (!(message instanceof Utils.Discord.Initializers.Message)) return;
				// eslint-disable-next-line ts/unbound-method
				const gv = message.getValue;
				this.PredefinedMessages.set(message.name, Object.assign(message, { getValue: (c: Bot) => { this.bumpRTS('predefinedMessages'); return gv(c); } }));
				this.regRTS('predefinedMessages');
			});
		Array.of(
			this.eventsDir ? [this.eventsDir, (event: string) => { this.emit('push.events', event) }] : null,
			this.commandsDir ? [this.commandsDir, command => { this.emit('push.commands', command) }] : null,
			this.triggersDir ? [this.triggersDir, trigger => { this.emit('push.triggers', trigger) }] : null,
			this.buttonsDir ? [this.buttonsDir, button => { this.emit('push.buttons', button) }] : null,
			this.contextMenusDir ? [this.contextMenusDir, contextMenu => { this.emit('push.contextMenus', contextMenu) }] : null,
			this.selectMenusDir ? [this.selectMenusDir, selectMenu => { this.emit('push.selectMenus', selectMenu) }] : null,
			this.modalComponentsDir ? [this.modalComponentsDir, modal => { this.emit('push.modals', modal) }] : null,
			this.predefinedMessagesDir ? [this.predefinedMessagesDir, message => { this.emit('push.predefinedMessages', message) }] : null,
		)
			.filter(s => s !== null && typeof s[0] !== "function")
			.forEach(s => fs.readdirSync(s![0] as string)
				.filter(file => file !== 'example.js')
				.map((file: any) => require(`${s![0] as string}/${file}`))
				.forEach(s![1] as (arg0: any) => void)
			);
		this.emit('push.events', {
			event: 'ready',
			execute: () => {
				// eslint-disable-next-line no-console
				console.log('Bot is ready');
				const status = this.Statuses.random()
				if (!status) return;
				setInterval(() => this.user!.setPresence({ activities: [status] }), 15e3)
			},
		})
	}
	embed = () => new djs.EmbedBuilder(this.branding).setTimestamp()
	stats = () => {
		const getStats = (main: number) => {
			const getFixed = (n: number) => n.toFixed(2);
			const raw = main / 1024 ** 2;
			return {
				rawValue: getFixed(raw > 1024 ? raw / 1024 : raw),
				percentage: getFixed(main / os.totalmem() * 1e2),
				unit: main / 1024 ** 3 > 1 ? 'GB' : 'MB',
			}
		};
		return {
			ping: this.ws.ping,
			guilds: this.guilds.cache.size.toString(),
			ram: {
				botOnly: getStats(process.memoryUsage().heapTotal),
				global: getStats(os.totalmem() - os.freemem()),
			},
		};
	}
	gev = (name: string) => Object.assign(this.runtimeStats.events.sEE, { [`${name}`]: new Utils.RuntimeStatistics() });
	regRTS = (key: string) => (eval(`this.runtimeStats.${key}`) as InstanceType<typeof Utils.RuntimeStatistics>).reg();
	bumpRTS = (key: string) => (eval(`this.runtimeStats.${key}`) as InstanceType<typeof Utils.RuntimeStatistics>).exec();
	setBranding = (branding: djs.EmbedData) => Object.assign(this.branding, branding);
	start() {
		void this.RESTClient.put(Routes.applicationCommands(this.botId), { body: this.interactions });
		void this.login(this.botToken);
	}
}

export { Bot };
