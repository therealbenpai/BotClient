const
    djs = require('discord.js'),
    { Routes } = require('discord-api-types/v10'),
    { REST } = require('@discordjs/rest'),
    Utils = require('./modules/util'),
    fs = require('fs'),
    os = require('os');
class Bot extends djs.Client {
    constructor(prefix, token, id, options) {
        super({
            intents: Object.values(djs.GatewayIntentBits),
            partials: Object.values(djs.Partials),
            presence: {
                activities: [],
                status: djs.PresenceUpdateStatus.Online,
            },
        });
        Object.assign(this, options, { id, prefix, token });
        const
            Buttons = new djs.Collection(),
            ContextMenus = new djs.Collection(),
            Modals = new djs.Collection(),
            SelectMenus = new djs.Collection(),
            Commands = new djs.Collection(),
            Events = new djs.Collection(),
            Triggers = new djs.Collection(),
            Components = new djs.Collection()
                .set('buttons', Buttons)
                .set('contextMenus', ContextMenus)
                .set('modals', Modals)
                .set('selectMenus', SelectMenus),
            PredefinedMessages = new djs.Collection(),
            Statuses = new djs.Collection()
                .set(0, { type: djs.ActivityType.Watching, name: 'The Server' });
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
        this.Commands = Commands;
        this.Events = Events;
        this.Triggers = Triggers;
        this.Buttons = Buttons;
        this.ContextMenus = ContextMenus;
        this.Modals = Modals;
        this.SelectMenus = SelectMenus;
        this.Components = Components;
        this.PredefinedMessages = PredefinedMessages;
        this.Statuses = Statuses;
        this.Utils = Utils;
        this.branding = {
            footer: { text: '' },
            color: 0x2F3136,
        };
        this.interactions = [];
        this
            .on('push.events', (event) => {
                this.regRTS('events');
                this.gev(event.event);
                Events.set(event.event, event);
                console.log(`[EVENT] Registered ${event.event}`);
                this.on(event.event, (...args) => {
                    this.bumpRTS(`events.sEE.${event.event}`);
                    event.execute(this, ...args);
                });
            })
            .on('push.commands', (command) => {
                Commands.set(command.name, command);
                if (command.type.text) {
                    this.regRTS('commands.text');
                }
                if (command.type.slash) {
                    this.regRTS('commands.slash');
                    this.interactions.push(command.data.toJSON());
                }
            })
            .on('push.triggers', (trigger) => {
                Triggers.set(trigger.name, trigger);
                Object.keys(trigger.triggerConfig)
                    .forEach((key) => trigger.triggerConfig[key].activated
                        ? this.regRTS(`triggers.${key}`)
                        : null);
            })
            .on('push.buttons', (button) => {
                Buttons.set(button.name, button);
                Components.get('buttons').set(button.name, button);
                this.regRTS('components.buttons');
            })
            .on('push.contextMenus', (contextMenu) => {
                ContextMenus.set(contextMenu.name, contextMenu);
                Components.get('contextMenus').set(contextMenu.name, contextMenu);
                this.regRTS('components.contextMenus');
                this.interactions.push(contextMenu.data.toJSON());
            })
            .on('push.selectMenus', (selectMenu) => {
                SelectMenus.set(selectMenu.name, selectMenu);
                Components.get('selectMenus').set(selectMenu.name, selectMenu);
                this.regRTS('components.selectMenus');
            })
            .on('push.modals', (modal) => {
                Modals.set(modal.name, modal);
                Components.get('modals').set(modal.name, modal);
                this.regRTS('components.modals');
            })
            .on('push.predefinedMessages', (message) => {
                const gv = message.getValue;
                PredefinedMessages.set(message.name, Object.assign(message, { getValue: (c) => {
                    this.bumpRTS('predefinedMessages'); return gv(c);
                } }));
                this.regRTS('predefinedMessages');
            });
        const rds = fs.readdirSync;
        Array.of(
            this.eventsDir
                ? [this.eventsDir, (event) => {
                    this.emit('push.events', event);
                }]
                : null,
            this.commandsDir
                ? [this.commandsDir, (command) => {
                    this.emit('push.commands', command);
                }]
                : null,
            this.triggersDir
                ? [this.triggersDir, (trigger) => {
                    this.emit('push.triggers', trigger);
                }]
                : null,
            this.buttonsDir
                ? [this.buttonsDir, (button) => {
                    this.emit('push.buttons', button);
                }]
                : null,
            this.contextMenusDir
                ? [this.contextMenusDir, (contextMenu) => {
                    this.emit('push.contextMenus', contextMenu);
                }]
                : null,
            this.selectMenusDir
                ? [this.selectMenusDir, (selectMenu) => {
                    this.emit('push.selectMenus', selectMenu);
                }]
                : null,
            this.modalComponentsDir
                ? [this.modalComponentsDir, (modal) => {
                    this.emit('push.modals', modal);
                }]
                : null,
            this.predefinedMessagesDir
                ? [this.predefinedMessagesDir, (message) => {
                    this.emit('push.predefinedMessages', message);
                }]
                : null,
        )
            .filter((s) => s !== null)
            .forEach((s) => rds(s[0]).filter((f) => f !== 'example.js')
                .map((f) => require(`${s[0]}/${f}`))
                .forEach(s[1]));
        this.emit('push.events', {
            event: 'ready',
            execute: (client) => {
                import('chalk-template')
                    .then(({ template }) => console.log(template(
                        Array.of(
                            `ly logged in as {red ${this.user.username}}!`,
                            `Ping: {rgb(255,127,0) ${Math.max(this.ws.ping, 0)} ms}`,
                            `Guilds: {yellow ${this.guilds.cache.size}}`,
                            `Users: {green ${this.users.cache.size}}`,
                            `Channels: {blue ${this.channels.cache.size}}`,
                            `Commands: {rgb(180,0,250) ${Commands.size}}`,
                            `Components: {rgb(255,100,100) ${Modals.size + Buttons.size + SelectMenus.size + ContextMenus.size}}`,
                            `Events: {white ${Events.size}}`,
                            `Triggers: {grey ${Triggers.size}}`,
                            `Pre-defined messages: {cyan ${this.PredefinedMessages.size}}`,
                            `Statuses selection size: {rgb(0,255,255) ${this.Statuses.size}}`,
                        ).map((m, i) => `{bold [READY]} Current${i == 0 ? '' : ' '}${m}`)
                            .join('\n'),
                    )));
                setInterval(() => this.user.setPresence({ activities: [this.Statuses.random()] }), 15e3);
            },
        });
    }
    embed = () => new djs.EmbedBuilder(this.branding).setTimestamp();
    stats = () => {
        const botRam = process.memoryUsage().heapTotal;
        const rawBRam = botRam / 1024 ** 2;
        const globalRam = os.totalmem() - os.freemem();
        const rawGRam = globalRam / 1024 ** 2;
        return {
            ping: this.ws.ping,
            uptime: Utils.List.and(Utils.Time.elapsedTime(Math.floor(process.uptime())).split(', ')),
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
    };
    gRTS = (key) => eval(`this.runtimeStats.${key}`);
    gev = (name) => Object.assign(this.runtimeStats.events.sEE, { [`${name}`]: new Utils.RuntimeStatistics() });
    regRTS = (key) => this.gRTS(key).reg();
    bumpRTS = (key) => this.gRTS(key).exec();
    setBranding = (branding) => Object.assign(this.branding, branding);

    start() {
        new REST({ version: '10' })
            .setToken(this.token)
            .put(Routes.applicationCommands(this.id), { body: this.interactions })
            .catch(console.error);
        this.login(this.token);
    }
}

Object.assign(module.exports, {
    Client: Bot,
    Utils,
});
