import { ItemView, WorkspaceLeaf } from "obsidian";
import WorldClockPlugin from "../main";
import { ClockConfig } from "../types";
import { DigitalClock } from "../components/DigitalClock";
import { AnalogClock } from "../components/AnalogClock";

export const VIEW_TYPE_WORLD_CLOCK = "world-clock-view";

/**
 * Dockable view that displays multiple world clocks
 */
export class WorldClockView extends ItemView {
	plugin: WorldClockPlugin;
	private clockInstances: Map<string, DigitalClock | AnalogClock> = new Map();

	constructor(leaf: WorkspaceLeaf, plugin: WorldClockPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_WORLD_CLOCK;
	}

	getDisplayText(): string {
		return "World Clock";
	}

	getIcon(): string {
		return "clock";
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		// Clean up all clock instances
		this.clockInstances.forEach((clock) => {
			clock.destroy();
		});
		this.clockInstances.clear();
	}

	/**
	 * Render all clocks based on plugin settings
	 */
	render(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("world-clock-view");

		// If no clocks configured, show empty state
		if (this.plugin.settings.clocks.length === 0) {
			const emptyState = contentEl.createDiv("world-clock-empty");
			emptyState.createEl("p", { text: "No clocks configured." });
			emptyState.createEl("p", {
				text: "Add clocks in Settings → World Clock",
				cls: "world-clock-empty-hint",
			});
			return;
		}

		// Render each clock
		const clocksContainer = contentEl.createDiv("world-clock-clocks-container");
		this.plugin.settings.clocks.forEach((config) => {
			this.renderClock(clocksContainer, config);
		});
	}

	/**
	 * Render a single clock
	 */
	private renderClock(container: HTMLElement, config: ClockConfig): void {
		const clockContainer = container.createDiv("world-clock-item");

		// Destroy existing instance if any
		const existing = this.clockInstances.get(config.id);
		if (existing) {
			existing.destroy();
		}

		// Create new clock instance based on type
		if (config.type === "digital") {
			const digitalClock = new DigitalClock(clockContainer, config);
			this.clockInstances.set(config.id, digitalClock);
		} else {
			const analogClock = new AnalogClock(clockContainer, config);
			this.clockInstances.set(config.id, analogClock);
		}
	}

	/**
	 * Refresh the view (called when settings change)
	 */
	refresh(): void {
		// Clean up existing instances
		this.clockInstances.forEach((clock) => {
			clock.destroy();
		});
		this.clockInstances.clear();

		// Re-render
		this.render();
	}
}
