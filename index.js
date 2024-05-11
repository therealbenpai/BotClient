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
        this.prefix = prefix;
        this.token = token;
        this.id = id;
        const {
            buttonsDir,
            commandsDir,
            contextMenusDir,
            eventsDir,
            modalComponentsDir,
            predefinedMessagesDir,
            selectMenusDir,
            triggersDir,
        } = options;
        this.buttonsDir = buttonsDir;
        this.commandsDir = commandsDir;
        this.contextMenusDir = contextMenusDir;
        this.eventsDir = eventsDir;
        this.modalComponentsDir = modalComponentsDir;
        this.predefinedMessagesDir = predefinedMessagesDir;
        this.selectMenusDir = selectMenusDir;
        this.triggersDir = triggersDir;
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
        this.Components = Components;
        this.PredefinedMessages = PredefinedMessages;
        this.Statuses = Statuses;
        this.Utils = Utils;

        this.interactions = [];
        const operations = new Array()
            .concat(this.eventsDir ? [[
                this.eventsDir,
                (event) => {
                    Events.set(event.event, event);
                    this.regRTS('events');
                    this.gev(event.event);
                    this.on(event.event, (...args) => {
                        this.bumpRTS(`events.sEE.${event.event}`);
                        return event.execute(this, ...args);
                    });
                },
            ]] : [])
            .concat(this.commandsDir ? [[
                this.commandsDir,
                (command) => {
                    Commands.set(command.name, command);
                    if (command.type.text) this.regRTS('commands.text');
                    if (command.type.slash) {
                        this.regRTS('commands.slash');
                        this.interactions.push(command.data.toJSON());
                    }
                },
            ]] : [])
            .concat(this.triggersDir ? [[
                this.triggersDir,
                (trigger) => {
                    Triggers.set(trigger.name, trigger);
                    Object.keys(trigger.triggerConfig)
                        .forEach((key) => trigger.triggerConfig[key].activated
                            ? this.regRTS(`triggers.${key}`)
                            : null
                        );
                },
            ]] : [])
            .concat(this.buttonsDir ? [[
                this.buttonsDir,
                (command) => {
                    Components.get('buttons').set(command.name, command);
                    this.regRTS('components.buttons');
                },
            ]] : [])
            .concat(this.contextMenusDir ? [[
                this.contextMenusDir,
                (command) => {
                    Components.get('contextMenus').set(command.name, command);
                    this.regRTS('components.contextMenus');
                    this.interactions.push(command.data.toJSON());
                },
            ]] : [])
            .concat(this.selectMenusDir ? [[
                this.selectMenusDir,
                (command) => {
                    Components.get('selectMenus').set(command.name, command);
                    this.regRTS('components.selectMenus');
                },
            ]] : [])
            .concat(this.modalComponentsDir ? [[
                this.modalComponentsDir,
                (command) => {
                    Components.get('modals').set(command.name, command);
                    this.regRTS('components.modals');
                },
            ]] : [])
            .concat(this.predefinedMessagesDir ? [[
                this.predefinedMessagesDir,
                (msg) => {
                    const gv = msg.getValue;
                    PredefinedMessages.set(msg.name, Object.assign(msg, { getValue: (c) => { this.bumpRTS('predefinedMessages'); return gv(c); } }));
                    this.regRTS('predefinedMessages');
                },
            ]] : []);

        // ? Sectors:
        // ? 0: Directory,
        // ? 1: Operation

        operations.forEach((s) => fs.readdirSync(s[0]).filter((f) => f !== 'example.js').map((f) => require(`${s[0]}/${f}`)).forEach(s[1]));
    }
    embed = () => new djs.EmbedBuilder({
        footer: { text: '' },
        color: 0x2F3136,
    }).setTimestamp()
    stats = () => {
        const botRam = process.memoryUsage().heapTotal;
        const rawBRam = (botRam / 1024 ** 2);
        const globalRam = os.totalmem() - os.freemem();
        const rawGRam = (globalRam / 1024 ** 2);
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
    }
    gRTS = (key) => eval(`this.runtimeStats.${key}`);
    gev = (name) => this.runtimeStats.events.sEE[`${name}`] = new Utils.RuntimeStatistics();
    regRTS = (key) => this.gRTS(key).reg();
    bumpRTS = (key) => this.gRTS(key).exec();
    start() {
        new REST({ version: '10' })
            .setToken(this.token)
            .put(Routes.applicationCommands(this.id), { body: this.interactions })
            .catch(console.error);
        this.login(this.token);
    }
}

module.exports = Bot
