import * as djs from 'discord.js';
// eslint-disable-next-line import/extensions
import { Routes } from 'discord-api-types/v10';
import { REST } from '@discordjs/rest';
// import * as fs from 'fs';
import * as os from 'os';
import * as CT from 'chalk-template';

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

class BaseComponent<Interaction> {
  /** The Identifier and Name of the Component */
  name: string;
  /** The Description of the Component (What it Does, What It's Purpose Is, etc.) */
  info: ComponentInfo;
  /** The Type of Component that this is */
  data: ComponentType; // todo change into generic
  execute: (client: Bot, interaction: Interaction) => Promise<void>;

  /** The Function that is called when the Component is interacted with */

  constructor(name: string, info: ComponentInfo, data: ComponentType, handler: (client: Bot, interaction: Interaction) => Promise<void>) {
    this.name = name;
    this.info = info;
    this.data = data;
    this.execute = handler;
  }
}

/**
 * A class that represents the execution conditions dealing with messages for a trigger
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

  constructor(
    activated: boolean,
    prefix: boolean,
    config:
      | {
          prefixes: string[] | null;
          contains: string[] | null;
          suffixes: string[] | null;
          regex: RegExp[] | null;
        }
      | undefined
  ) {
    super(activated, prefix);
    this.prefixes = config!.prefixes ?? [];
    this.contains = config!.contains ?? [];
    this.suffixes = config!.suffixes ?? [];
    this.regex = config!.regex ?? [];
  }
}

/**
 * A class that represents the execution conditions dealing with channels for a trigger
 */
class TriggerChannel extends TriggerBase {
  /** The IDs of the channels that the trigger can be activated in */
  id: string[];
  /** The types of channels that the trigger can be activated in */
  types: djs.ChannelType[];

  constructor(activated: boolean, prefix: boolean, config: { id: string[] | null; types: djs.ChannelType[] | null } | undefined) {
    super(activated, prefix);
    this.id = config!.id ?? [];
    this.types = config!.types ?? [];
  }
}

/**
 * A class that represents the execution conditions dealing with roles for a trigger
 */
class TriggerRole extends TriggerBase {
  /** The IDs of the roles that can activate the trigger */
  id: string[];

  constructor(activated: boolean, prefix: boolean, config: { id: string[] | null } | undefined) {
    super(activated, prefix);
    this.id = config!.id ?? [];
  }
}

/**
 * A class that represents the execution conditions dealing with users for a trigger
 */
class TriggerUser extends TriggerBase {
  /** The IDs of the users that can activate the trigger */
  id: string[];

  constructor(activated: boolean, prefix: boolean, config: { id: string[] | null } | undefined) {
    super(activated, prefix);
    this.id = config!.id ?? [];
  }
}

/**
 * A class that represents the restrictions that can be placed on a command
 */
class CommandRestrictions {
  /** The permission that is required to execute the command */
  perm: djs.PermissionFlags;
  /** The types of channels the command can be executed in */
  channels: djs.ChannelType[];
  /** The IDs of the roles that can execute the command */
  roles: string[];
  /** The IDs of the users that can execute the command */
  users: string[];
  /** Whether or not the command can be executed in DMs */
  dms: boolean;

  constructor(data: {
    perm: bigint | undefined;
    channels: djs.ChannelType[] | undefined;
    roles: string[] | undefined;
    users: string[] | undefined;
    dms: boolean | undefined;
  }) {
    this.perm = data.perm as unknown as djs.PermissionFlags;
    this.channels = data?.channels ?? [];
    this.roles = data?.roles ?? [];
    this.users = data?.users ?? [];
    this.dms = data?.dms ?? false;
  }
}

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

  constructor(data: { type: string; description: string; usage: string; examples: string[]; disabled: boolean; aliases: string[] }) {
    this.type = data.type;
    this.description = data.description;
    this.usage = data.usage;
    this.examples = data.examples;
    this.disabled = data.disabled;
    this.aliases = data.aliases;
  }
}

/**
 * A class that represents a Button component
 */
class ButtonComponent extends BaseComponent<djs.ButtonInteraction<djs.CacheType>> {
  constructor(
    name: string,
    info: ComponentInfo,
    data: djs.ButtonBuilder,
    handler: (client: Bot, interaction: djs.ButtonInteraction<djs.CacheType>) => Promise<void>
  ) {
    super(name, info, data, handler);
  }
}

/**
 * A class that represents a Context Menu component
 */
class ContextMenuComponent extends BaseComponent<djs.ContextMenuCommandInteraction> {
  constructor(
    name: string,
    info: ComponentInfo,
    data: djs.ContextMenuCommandBuilder,
    handler: (client: Bot, interaction: djs.ContextMenuCommandInteraction) => Promise<void>
  ) {
    super(name, info, data, handler);
  }
}

/**
 * A class that represents a Modal component
 */
class ModalComponent extends BaseComponent<djs.ModalSubmitInteraction> {
  constructor(
    name: string,
    info: ComponentInfo,
    data: djs.ModalBuilder,
    handler: (client: Bot, interaction: djs.ModalSubmitInteraction) => Promise<void>
  ) {
    super(name, info, data, handler);
  }
}

/**
 * A class that represents a Select Menu component
 */
class SelectMenuComponent extends BaseComponent<djs.SelectMenuInteraction> {
  constructor(
    name: string,
    info: ComponentInfo,
    data: djs.SelectMenuBuilder,
    handler: (client: Bot, interaction: djs.SelectMenuInteraction) => Promise<void>
  ) {
    super(name, info, data, handler);
  }
}

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
}

/**
 * A class that works with times
 */
class TimeManagement {
  static STR_TO_MS_DICT = new Map<string, [string, number]>([
    ['y', ['year', 31104e6]],
    ['M', ['month', 2592e6]],
    ['d', ['day', 864e5]],
    ['h', ['hour', 36e5]],
    ['m', ['minute', 6e4]],
    ['s', ['second', 1e3]],
  ]);
  static stringToMS = (stringAmount: string, symbol: string) => Number(stringAmount.slice(0, -1)) * this.STR_TO_MS_DICT.get(symbol)![1];
  static timeFormat = {
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
  static timestamp = (value: Date | number) => new Intl.DateTimeFormat(this.timeFormat.locale, this.timeFormat.options).format(value);
  /** Converts a string to milliseconds */
  static stringToMilliseconds = (timeString: string) => timeString
      .split(' ')
      .map((value: string) => this.stringToMS(value, value.slice(-1)))
      // eslint-disable-next-line id-length
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
  static formatList = (list: string[], type: Intl.ListFormatType) => new Intl.ListFormat('en-US', { style: 'long', type }).format(list);
  /** Joins an array of strings with a comma and a space in the Conjunction style*/
  static andJoin = (value: string[]) => this.formatList(value, 'conjunction');
  /** Joins an array of strings with a comma and a space in the Disjunction style*/
  static orJoin = (value: string[]) => this.formatList(value, 'disjunction');
}

class Markdown {
  /** Quickly process a string with a prefix and suffix */
  static surroundString = (surrounding: string) => (mainString: string) => `${surrounding}${mainString}${surrounding}`;
  /** Process a string into a inline code segment */
  static inlineCode = this.surroundString('`');
  /** Make text appear as bolded */
  static bold = this.surroundString('**');
  /** Make text appear as italicized */
  static italic = this.surroundString('*');
  /** Make text appear as underlined */
  static underline = this.surroundString('__');
  /** Make text appear with a strikethrough */
  static strikethrough = this.surroundString('~~');
  /** Make text appear as a spoiler */
  static spoiler = this.surroundString('||');
  /** Make text appear as a quote */
  static quote = (value: string) => `> ${value}`;
  /** Make text appear as a code block */
  static codeBlock = (stringValue: string, language: string) => `\`\`\`${language || ''}\n${stringValue}\n\`\`\``;
  /** Make text appear as a block quote */
  static blockQuote = (value: string) => `>>> ${value}`;
  /** Make text appear as a formatted url */
  static link = (text: string, url: string) => `[${text}](${url})`;
}

class Mentions {
  /** Quickly process a string with a prefix and suffix */
  static wrapMention = (prefix: string, value: string, suffix = '') => `<${prefix}${value}${suffix}>`;
  /** Process a string into a role mention */
  static role = (id: string) => this.wrapMention('@&', id);
  /** Process a string into a user mention */
  static user = (id: string) => this.wrapMention('@', id);
  /** Process a string into a channel mention */
  static channel = (id: string) => this.wrapMention('#', id);
  /** Process a string into an emoji */
  static emoji = (name: string, id: string) => this.wrapMention(':', name, `:${id} `);
  /** Process a string into an animated emoji */
  static animatedEmoji = (name: string, id: string) => this.wrapMention('a:', name, `:${id} `);
  /** Process a string into a timestamp */
  static timestamp = (timestamp: string, format = 'f') => this.wrapMention('t:', timestamp, `:${format}`);
}

/**
 * A class that contains methods for creating embeds
 */
class Embed {
  /** Quickly create a field for an embed */
  static Field = (name: string, value: string, inline = false) => ({
    name,
    value,
    inline,
  });
  /** Quickly create an author for an embed */
  static Author = (name: string, url: string | undefined | null = null, iconURL: string | undefined | null = null) => ({
    name,
    url,
    iconURL,
  });
  /** Quickly create a footer for an embed */
  static Footer = (text: string, url: string | undefined | null = null) => ({
    text,
    url,
  });
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

class Event {
  /** The name of the event */
  event: string;

  /** The function that is called when the event is emitted */
  async execute(_client: Bot, ..._args: [unknown]): Promise<void> {}

  constructor(event: string) {
    this.event = event;
  }
  setExecute = (handler: (client: Bot, ...args: [unknown]) => Promise<void>) => Object.assign(this, { execute: handler });
}

class Trigger {
  /** The name of the trigger */
  name: string;
  /** Whether or not the trigger is disabled */
  globalDisable = false;
  /** The configuration for the trigger */
  triggerConfig: {
    message: TriggerMessage;
    channel: TriggerChannel;
    role: TriggerRole;
    user: TriggerUser;
  };

  /** The function that is called when the trigger is activated */
  async execute(_client: Bot, _message: djs.Message): Promise<void> {}

  constructor(
    name: string,
    message: TriggerMessage,
    channel: TriggerChannel,
    role: TriggerRole,
    user: TriggerUser,
    handler: (client: Bot, message: djs.Message) => Promise<void>
  ) {
    this.name = name;
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
  requiredPerm: djs.PermissionFlags;
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
  async commandExecute(_client: Bot, _interaction: djs.CommandInteraction): Promise<void> {}

  /** The function that is called when the command is executed */
  async messageExecute(_client: Bot, _message: djs.Message): Promise<void> {}

  /** The function that is called when the command's autocomplete action is called */
  async autocomplete(_client: Bot, _interaction: djs.AutocompleteInteraction): Promise<void> {}

  constructor(
    name: string,
    triggers: string[],
    config: CommandInfo,
    restrictions: CommandRestrictions,
    types: { text: boolean; slash: boolean },
    data: djs.SlashCommandBuilder
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
  }
  /** The class that represents the restrictions that can be placed on a command */
  static Restrictions = CommandRestrictions;
  /** The class that contains information about a command */
  static Info = CommandInfo;
}

class Message {
  /** The name of the message */
  name: string;
  /** The display name of the message */
  displayName: string;

  /** The function that is called when the message is called */
  async getValue(_client: Bot): Promise<djs.APIMessage> {
    return Promise.reject(new Error('message not properly initialized'));
  }

  constructor(name: string, displayName: string, handler: (client: Bot) => Promise<djs.APIMessage>) {
    this.name = name;
    this.displayName = displayName;
    this.getValue = handler;
  }
}

class DiscordInitializers {
  /** A class that represents a message trigger */
  static Trigger = Trigger;
  /** A class that represents a command */
  static Command = Command;
  /** A class that represents a message */
  static Message = Message;
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
}

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
  incrementRegistered = () => ++this.registered;
  /** Increment the number of times `X` has been executed */
  incrementExecuted = () => ++this.executed;
}
class UtilsClass {
  static Time = TimeManagement;
  static Discord = Discord;
  static List = List;
  static RuntimeStatistics = RuntimeStatistics;
}

class Bot extends djs.Client {
  // todo, abstract a lot of this away into its own subclasses or fields
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
  interactions: (
    | ComponentType
    | djs.SlashCommandBuilder
    | djs.ContextMenuCommandBuilder
    | djs.ButtonBuilder
    | djs.StringSelectMenuBuilder
  )[];
  // todo: readd line below
  // (djs.SlashCommandBuilder | djs.ContextMenuCommandBuilder | djs.ButtonBuilder | djs.StringSelectMenuBuilder)[];
  runtimeStats: {
    commands: {
      text: RuntimeStatistics;
      slash: RuntimeStatistics;
    };
    triggers: {
      registered: number;
      role: RuntimeStatistics;
      user: RuntimeStatistics;
      channel: RuntimeStatistics;
      message: RuntimeStatistics;
    };
    events: RuntimeStatistics & { eventExecution: Record<string, RuntimeStatistics> };
    components: {
      modals: RuntimeStatistics;
      buttons: RuntimeStatistics;
      selectMenus: RuntimeStatistics;
      contextMenus: RuntimeStatistics;
    };
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
  Messages: djs.Collection<string, Message>;
  Triggers: djs.Collection<string, Trigger>;
  PredefinedMessages: djs.Collection<string, Message>;
  Statuses: djs.Collection<number, djs.ActivityOptions>;
  Utils: typeof UtilsClass;
  branding: djs.EmbedData;
  RESTClient: REST;

  constructor(
    id: string,
    token: string,
    prefix: string,
    options: {
      commandsDir?: string;
      eventsDir?: string;
      triggersDir?: string;
      buttonsDir?: string;
      selectMenusDir?: string;
      contextMenusDir?: string;
      modalComponentsDir?: string;
      predefinedMessagesDir?: string;
    }
  ) {
    super({
      intents: Object.values(djs.GatewayIntentBits) as djs.GatewayIntentBits[],
      partials: Object.values(djs.Partials) as djs.Partials[],
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
      events: Object.assign(new UtilsClass.RuntimeStatistics(), {
        eventExecution: {},
      }),
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
    this.Messages = new djs.Collection();
    this.Triggers = new djs.Collection();
    this.PredefinedMessages = new djs.Collection();
    this.Statuses = new djs.Collection().set(0, {
      type: djs.ActivityType.Watching,
      name: 'The Server',
    }) as djs.Collection<number, djs.ActivityOptions>;
    this.Utils = UtilsClass;
    this.branding = {
      footer: { text: '' },
      color: 0x2f3136,
    };
    this.interactions = [];
    this.RESTClient = new REST({ version: '10' }).setToken(this.botToken);
    this.on('push.events', (event: Event) => {
      this.regRTS('events');
      this.generateEvent(event.event);
      this.Events.set(event.event, event);
      // ! fix linting rule below
      // eslint-disable-next-line ts/no-misused-promises
      this.on(event.event, async (...args: [unknown]) => {
        this.bumpRTS(`events.eventExecution.${event.event}`);
        await event.execute(this, [...args]);
      });
    })
      .on('push.commands', (command: Command) => {
        this.Commands.set(command.name, command);
        if (command.type.text) {
          this.regRTS('commands.text');
        }
        if (command.type.slash) {
          this.regRTS('commands.slash');
          this.interactions.push(command.data);
        }
      })
      .on('push.triggers', (trigger: Trigger) => {
        this.Triggers.set(trigger.name, trigger);
        Object.entries(trigger.triggerConfig).forEach((value) => (value[1].activated ? this.regRTS(`triggers.${value[0]}`) : null));
      })
      .on('push.buttons', (button: ButtonComponent) => {
        this.Buttons.set(button.name, button);
        this.regRTS('components.buttons');
      })
      .on('push.contextMenus', (contextMenu: ContextMenuComponent) => {
        this.ContextMenus.set(contextMenu.name, contextMenu);
        this.regRTS('components.contextMenus');
        this.interactions.push(contextMenu.data); // ! unsure what the type here is meant to be
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
        if (!(message instanceof Message)) {
          return;
        }
        this.PredefinedMessages.set(
          message.name,
          Object.assign(message, {
            getValue: (client: Bot) => {
              this.bumpRTS('predefinedMessages');
              return message.getValue(client);
            },
          })
        );
        this.regRTS('predefinedMessages');
      });
    // ! unsure what the code below even does? It doesn't seem to produce any returned variable even though its mapped around
    /* const rds = fs.readdirSync;
    // eslint-disable-next-line no-restricted-syntax
    Array.of(
      // ! why are so many emitting events?
      this.eventsDir
        ? [
            this.eventsDir,
            (event: string) => {
              this.emit('push.events', event);
            },
          ]
        : null,
      this.commandsDir
        ? [
            this.commandsDir,
            (command) => {
              this.emit('push.commands', command);
            },
          ]
        : null,
      this.triggersDir
        ? [
            this.triggersDir,
            (trigger) => {
              this.emit('push.triggers', trigger);
            },
          ]
        : null,
      this.buttonsDir
        ? [
            this.buttonsDir,
            (button) => {
              this.emit('push.buttons', button);
            },
          ]
        : null,
      this.contextMenusDir
        ? [
            this.contextMenusDir,
            (contextMenu) => {
              this.emit('push.contextMenus', contextMenu);
            },
          ]
        : null,
      this.selectMenusDir
        ? [
            this.selectMenusDir,
            (selectMenu) => {
              this.emit('push.selectMenus', selectMenu);
            },
          ]
        : null,
      this.modalComponentsDir
        ? [
            this.modalComponentsDir,
            (modal) => {
              this.emit('push.modals', modal);
            },
          ]
        : null,
      this.predefinedMessagesDir
        ? [
            this.predefinedMessagesDir,
            (message) => {
              this.emit('push.predefinedMessages', message);
            },
          ]
        : null
    )
      .filter((s) => s !== null && typeof s[0] !== 'function')
      .forEach((s) => rds(s![0] as string)
          .filter((f) => f !== 'example.js')
          .map((f) => require(`${s![0] as string}/${f}`))
          .forEach(s![1] as (arg0: any) => void)
      ); */
    this.emit('push.events', {
      event: 'ready',
      execute: () => {
        // eslint-disable-next-line no-console
        console.log(
          CT.template(
            // eslint-disable-next-line no-restricted-syntax
            Array.of(
              `{bold [READY]} Currently logged in as {red ${this.user!.username}}!`,
              ` Ping: {rgb(255,127,0) ${Math.max(this.ws.ping, 0)} ms}`,
              ` Guilds: {yellow ${this.guilds.cache.size}}`,
              ` Users: {green ${this.users.cache.size}}`,
              ` Channels: {blue ${this.channels.cache.size}}`,
              ` Commands: {rgb(180,0,250) ${this.Commands.size}}`,
              ` Components: {rgb(255,100,100) ${this.Modals.size + this.Buttons.size + this.SelectMenus.size + this.ContextMenus.size}}`,
              ` Events: {white ${this.Events.size}}`,
              ` Triggers: {grey ${this.Triggers.size}}`,
              ` Pre-defined messages: {cyan ${this.PredefinedMessages.size}}`,
              ` Statuses selection size: {rgb(0,255,255) ${this.Statuses.size}}`
            ).join('\n')
          )
        );
        const status = this.Statuses.random();
        if (!status) {
          return;
        }
        setInterval(() => this.user!.setPresence({ activities: [status] }), 15e3);
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
      guilds: this.guilds.cache.size.toString(),
      ram: {
        botOnly: {
          rawValue: (rawBRam > 1024 ? rawBRam / 1024 : rawBRam).toFixed(2),
          percentage: ((botRam / os.totalmem()) * 1e2).toFixed(2),
          unit: botRam / 1024 ** 3 > 1 ? 'GB' : 'MB',
        },
        global: {
          rawValue: (rawGRam > 1024 ? rawGRam / 1024 : rawGRam).toFixed(2),
          percentage: ((globalRam / os.totalmem()) * 1e2).toFixed(2),
          unit: globalRam / 1024 ** 3 > 1 ? 'GB' : 'MB',
        },
      },
    };
  };
  generateEvent = (name: string) => Object.assign(this.runtimeStats.events.eventExecution, {
      [`${name}`]: new UtilsClass.RuntimeStatistics(),
    });
  regRTS = (key: string) => (eval(`this.runtimeStats.${key}`) as RuntimeStatistics).incrementRegistered();
  // ! remove exec from production code
  bumpRTS = (key: string) => (eval(`this.runtimeStats.${key}`) as RuntimeStatistics).incrementExecuted();
  // ! remove exec from production code
  setBranding = (branding: djs.EmbedData) => Object.assign(this.branding, branding);

  start() {
    void this.RESTClient.put(Routes.applicationCommands(this.botId), {
      body: this.interactions,
    });
    void this.login(this.botToken);
  }
}

export default {
  Client: Bot,
  Utils: UtilsClass,
};
