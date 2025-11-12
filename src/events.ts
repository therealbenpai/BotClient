import type { Bot } from './bot';

class Event {
	/** The name of the event */
	event: string;
	/** The function that is called when the event is emitted */
	async execute(client: Bot, ...args: any[]): Promise<void> { }
	constructor(event: string) {
		this.event = event;
	}
	setExecute = (handler: (client: Bot, ...args: any[]) => void) => Object.assign(this, { execute: handler });
};

export { Event };
