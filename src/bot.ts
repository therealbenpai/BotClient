import * as djs from 'discord.js';
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
import * as fs from 'fs';
import * as os from 'os';
import process from 'process';

import { Command, Event, Trigger, ButtonComponent, ContextMenuComponent, ModalComponent, SelectMenuComponent, Message } from './initializers';

import UtilsClass, { RuntimeStatistics } from './utils';

type LoopedObj<T extends Record<string, T>> = T

function processStringKey<T extends LoopedObj<Record<string, any>>>(key: string, initialObj: T) {
    let currObj = initialObj;
    while (key.includes('.')) {
        const [first, ...rest] = key.split('.');
        key = rest.join('.');
        currObj = currObj[first];
    }
    if (currObj) {
        return currObj[key];
    }
    return null;
}

interface BotInitalizationOptions {
    /** The directory the commands are located in */
    commandsDir?: string,
    /** The directory the events are located in */
    eventsDir?: string,
    /** The directory the triggers are located in */
    triggersDir?: string,
    /** The directory the buttons are located in */
    buttonsDir?: string,
    /** The directory the select menus are located in */
    selectMenusDir?: string,
    /** The directory the context menu commands are located in */
    contextMenusDir?: string,
    /** The directory the modals are located in */
    modalComponentsDir?: string,
    /** The directory the pre-defined messages are located in */
    predefinedMessagesDir?: string,
    /** Bot intents that should NOT be activated */
    removedIntents?: djs.GatewayIntentBits[],
    /** Data partials that should NOT be processed */
    removedPartials?: djs.Partials[],
}

class Bot extends djs.Client {
    private botToken: string;
    prefix: string;
    botId: string;
    private buttonsDir: string | undefined;
    private commandsDir: string | undefined;
    private contextMenusDir: string | undefined;
    private eventsDir: string | undefined;
    private modalComponentsDir: string | undefined;
    private predefinedMessagesDir: string | undefined;
    private selectMenusDir: string | undefined;
    private triggersDir: string | undefined;
    private interactions: (djs.SlashCommandBuilder | djs.ContextMenuCommandBuilder)[]
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
    Messages: djs.Collection<string, Message>;
    Statuses: djs.Collection<number, djs.ActivityOptions>;
    Utils: typeof UtilsClass;
    branding: djs.EmbedData;
    private RESTClient: REST;
    constructor(id: string, token: string, prefix: string, options?: BotInitalizationOptions) {
        super({
            intents: Object.values(djs.GatewayIntentBits) // All Intents
                .filter((value) => {
                    if (typeof value === 'string') { return false; }
                    if (options?.removedIntents) { return !options.removedIntents.includes(value); }
                    return true;
                }) as djs.GatewayIntentBits[],
            partials: Object.values(djs.Partials) // All Partials
                .filter((value) => {
                    if (typeof value === 'string') { return false; }
                    if (options?.removedPartials) { return !options.removedPartials.includes(value); }
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
        this.Messages = new djs.Collection
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
                this.generateEvent(event.event);
                this.Events.set(event.event, event);
                this.on(event.event as keyof djs.ClientEvents, async (...args) => {
                    this.bumpRTS(`events.sEE.${event.event}`);
                    await event.execute(this, ...args)
                });
            })
            .on('push.commands', (command: Command) => {
                this.Commands.set(command.name, command);
                if (command.type.text) { this.regRTS('commands.text'); }
                if (command.type.slash) {
                    this.regRTS('commands.slash');
                    this.interactions.push(command.data);
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
                this.interactions.push(contextMenu.data as djs.ContextMenuCommandBuilder);
            })
            .on('push.selectMenus', (selectMenu: SelectMenuComponent) => {
                this.SelectMenus.set(selectMenu.name, selectMenu);
                this.regRTS('components.selectMenus');
            })
            .on('push.modals', (modal: ModalComponent) => {
                this.Modals.set(modal.name, modal);
                this.regRTS('components.modals');
            })
            .on('push.predefinedMessages', (message: Message) => {
                if (!(message instanceof Message)) return;
                const gv = message.getValue;
                this.Messages.set(message.name, Object.assign(message, { getValue: (c: Bot) => { this.bumpRTS('predefinedMessages'); return gv(c); } }));
                this.regRTS('predefinedMessages');
            });
        if (this.eventsDir) {
            const events = fs.readdirSync(this.eventsDir)
                .filter((file) => file !== 'example.js')
                .map((file) => require(`${this.eventsDir}/${file}`));
            events.forEach((event) => this.emit('push.events', event));
        }
        if (this.commandsDir) {
            const commands = fs.readdirSync(this.commandsDir)
                .filter((file) => file !== 'example.js')
                .map((file) => require(`${this.commandsDir}/${file}`));
            commands.forEach((command) => this.emit('push.commands', command));
        }
        if (this.triggersDir) {
            const triggers = fs.readdirSync(this.triggersDir)
                .filter((file) => file !== 'example.js')
                .map((file) => require(`${this.triggersDir}/${file}`));
            triggers.forEach((trigger) => this.emit('push.triggers', trigger));
        }
        if (this.buttonsDir) {
            const buttons = fs.readdirSync(this.buttonsDir)
                .filter((file) => file !== 'example.js')
                .map((file) => require(`${this.buttonsDir}/${file}`));
            buttons.forEach((button) => this.emit('push.buttons', button));
        }
        if (this.contextMenusDir) {
            const contextMenus = fs.readdirSync(this.contextMenusDir)
                .filter((file) => file !== 'example.js')
                .map((file) => require(`${this.contextMenusDir}/${file}`));
            contextMenus.forEach((contextMenu) => this.emit('push.contextMenus', contextMenu));
        }
        if (this.selectMenusDir) {
            const selectMenus = fs.readdirSync(this.selectMenusDir)
                .filter((file) => file !== 'example.js')
                .map((file) => require(`${this.selectMenusDir}/${file}`));
            selectMenus.forEach((selectMenu) => this.emit('push.selectMenus', selectMenu));
        }
        if (this.modalComponentsDir) {
            const modals = fs.readdirSync(this.modalComponentsDir)
                .filter((file) => file !== 'example.js')
                .map((file) => require(`${this.modalComponentsDir}/${file}`));
            modals.forEach((modal) => this.emit('push.modals', modal));
        }
        if (this.predefinedMessagesDir) {
            const predefinedMessages = fs.readdirSync(this.predefinedMessagesDir)
                .filter((file) => file !== 'example.js')
                .map((file) => require(`${this.predefinedMessagesDir}/${file}`));
            predefinedMessages.forEach((message) => this.emit('push.predefinedMessages', message));
        }
        this.emit('push.events', {
            event: 'ready',
            execute: () => {
                console.log('Bot is ready');
                const status = this.Statuses.random()
                if (!status) { return; }
                setInterval(() => void this.user?.setPresence({ activities: [status] }), 15e3)
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
    generateEvent = (name: string) => Object.assign(this.runtimeStats.events.sEE, { [`${name}`]: new UtilsClass.RuntimeStatistics() });
    regRTS = (key: string) => {
        const final = processStringKey(key, this.runtimeStats) as RuntimeStatistics;
        if (final) {
            final?.reg();
        }
    };
    bumpRTS = (key: string) => {
        const final = processStringKey(key, this.runtimeStats) as RuntimeStatistics;
        if (final) {
            final?.exec();
        }
    }
    setBranding = (branding: djs.EmbedData) => Object.assign(this.branding, branding);
    start() {
        void this.RESTClient.put(Routes.applicationCommands(this.botId), { body: this.interactions.map((value) => value.toJSON()) });
        void this.login(this.botToken);
    }
}

export default Bot;
