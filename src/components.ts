import * as djs from 'discord.js';
import type { Bot } from './bot';

type ClientInteraction<T extends djs.BaseInteraction | djs.Message> = (client: Bot, interaction: T) => void;

type ComponentType = djs.ButtonBuilder | djs.ContextMenuCommandBuilder | djs.SelectMenuBuilder | djs.ModalBuilder;

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
	}
	setExecute(handler: (client: Bot, interaction: djs.BaseInteraction) => void) {
		Object.assign(this, { execute: handler })
	}
}

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

export { BaseComponent, ButtonComponent, ContextMenuComponent, ModalComponent, SelectMenuComponent, ComponentInfo };
