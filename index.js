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
        }
        this.interactions = [];
        const operations = Array
            .of(
                this.commandsDir ? [[
                    this.commandsDir,
                    (command) => {
                        Commands.set(command.name, command);
                        if (command.type.text) this.regRTS('commands.text');
                        if (command.type.slash) {
                            this.regRTS('commands.slash');
                            this.interactions.push(command.data.toJSON());
                        }
                    },
                ]] : [],
                this.triggersDir ? [[
                    this.triggersDir,
                    (trigger) => {
                        Triggers.set(trigger.name, trigger);
                        Object.keys(trigger.triggerConfig)
                            .forEach((key) => trigger.triggerConfig[key].activated
                                ? this.regRTS(`triggers.${key}`)
                                : null
                            );
                    },
                ]] : [],
                this.buttonsDir ? [[
                    this.buttonsDir,
                    (command) => {
                        Buttons.set(command.name, command);
                        Components.get('buttons').set(command.name, command);
                        this.regRTS('components.buttons');
                    },
                ]] : [],
                this.contextMenusDir ? [[
                    this.contextMenusDir,
                    (command) => {
                        ContextMenus.set(command.name, command);
                        Components.get('contextMenus').set(command.name, command);
                        this.regRTS('components.contextMenus');
                        this.interactions.push(command.data.toJSON());
                    },
                ]] : [],
                this.selectMenusDir ? [[
                    this.selectMenusDir,
                    (command) => {
                        SelectMenus.set(command.name, command);
                        Components.get('selectMenus').set(command.name, command);
                        this.regRTS('components.selectMenus');
                    },
                ]] : [],
                this.modalComponentsDir ? [[
                    this.modalComponentsDir,
                    (command) => {
                        Modals.set(command.name, command);
                        Components.get('modals').set(command.name, command);
                        this.regRTS('components.modals');
                    },
                ]] : [],
                this.predefinedMessagesDir ? [[
                    this.predefinedMessagesDir,
                    (msg) => {
                        const gv = msg.getValue;
                        PredefinedMessages.set(msg.name, Object.assign(msg, { getValue: (c) => { this.bumpRTS('predefinedMessages'); return gv(c); } }));
                        this.regRTS('predefinedMessages');
                    },
                ]] : [],
            )
            .filter((s) => s.length > 0)
            .flat(1);
        // ? Sectors:
        // ? 0: Directory,
        // ? 1: Operation
        operations.forEach((s) => fs.readdirSync(s[0]).filter((f) => f !== 'example.js').map((f) => require(`${s[0]}/${f}`)).forEach(s[1]));
        this.on('ready', () => {
            this.regRTS('events');
            this.gev('ready');
            this.bumpRTS(`events.sEE.ready`);
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
                    ).map((m) => `{bold [READY]} Current ${m}`).join('\n')
                )))
            setInterval(() => client.user.setPresence({ activities: [this.Statuses.random()] }), 15e3)
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
})