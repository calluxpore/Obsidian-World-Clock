import { App, PluginSettingTab, Setting } from "obsidian";
import WorldClockPlugin from "./main";
import { ClockConfig, WorldClockSettings } from "./types";
import { getAllTimezones } from "./utils/timezones";

export const DEFAULT_SETTINGS: WorldClockSettings = {
	clocks: [],
	defaultType: "digital",
};

export class WorldClockSettingTab extends PluginSettingTab {
	plugin: WorldClockPlugin;

	constructor(app: App, plugin: WorldClockPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "World Clock Settings" });

		// Default clock type setting
		new Setting(containerEl)
			.setName("Default clock type")
			.setDesc("Default type for newly added clocks")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("digital", "Digital")
					.addOption("analog", "Analog")
					.setValue(this.plugin.settings.defaultType)
					.onChange(async (value: "digital" | "analog") => {
						this.plugin.settings.defaultType = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Clocks" });

		// Add clock button
		const addClockContainer = containerEl.createDiv("world-clock-add-container");
		new Setting(addClockContainer)
			.setName("")
			.addButton((button) =>
				button
					.setButtonText("Add clock")
					.setCta()
					.onClick(async () => {
						await this.addClock();
					})
			);

		// Render all clocks
		this.plugin.settings.clocks.forEach((clock, index) => {
			this.renderClockSetting(containerEl, clock, index);
		});
	}

	/**
	 * Add a new clock with default settings
	 */
	private async addClock(): Promise<void> {
		const newClock: ClockConfig = {
			id: `clock-${Date.now()}`,
			timezone: "UTC",
			label: "",
			type: this.plugin.settings.defaultType,
			hour24: false,
			showSeconds: true,
		};

		this.plugin.settings.clocks.push(newClock);
		await this.plugin.saveSettings();
		this.display(); // Refresh UI
		this.plugin.refreshView(); // Refresh the view
	}

	/**
	 * Remove a clock
	 */
	private async removeClock(clockId: string): Promise<void> {
		this.plugin.settings.clocks = this.plugin.settings.clocks.filter(
			(c) => c.id !== clockId
		);
		await this.plugin.saveSettings();
		this.display(); // Refresh UI
		this.plugin.refreshView(); // Refresh the view
	}

	/**
	 * Move a clock up or down in the list
	 */
	private async moveClock(clockId: string, direction: "up" | "down"): Promise<void> {
		const clocks = this.plugin.settings.clocks;
		const currentIndex = clocks.findIndex((c) => c.id === clockId);
		
		if (currentIndex === -1) return;

		const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		
		if (newIndex < 0 || newIndex >= clocks.length) return;

		const currentClock = clocks[currentIndex];
		const newClock = clocks[newIndex];
		
		if (!currentClock || !newClock) return;

		// Swap clocks
		clocks[currentIndex] = newClock;
		clocks[newIndex] = currentClock;
		
		await this.plugin.saveSettings();
		this.display(); // Refresh UI
		this.plugin.refreshView(); // Refresh the view
	}

	/**
	 * Render settings for a single clock
	 */
	private renderClockSetting(
		containerEl: HTMLElement,
		clock: ClockConfig,
		index: number
	): void {
		const clockContainer = containerEl.createDiv("world-clock-setting-item");
		clockContainer.addClass("world-clock-setting-item");

		// Clock header with reorder buttons and remove button
		const header = clockContainer.createDiv("world-clock-setting-header");
		const headerTitle = header.createEl("h4", {
			text: `Clock ${index + 1}${clock.label ? `: ${clock.label}` : ""}`,
		});

		// Reorder buttons container
		const reorderContainer = header.createDiv("world-clock-reorder-buttons");
		
		// Move up button
		const moveUpButton = reorderContainer.createEl("button", {
			cls: "world-clock-reorder-btn",
			attr: { "aria-label": "Move up" },
		});
		moveUpButton.innerHTML = "↑";
		moveUpButton.disabled = index === 0;
		moveUpButton.onclick = async () => {
			await this.moveClock(clock.id, "up");
		};

		// Move down button
		const moveDownButton = reorderContainer.createEl("button", {
			cls: "world-clock-reorder-btn",
			attr: { "aria-label": "Move down" },
		});
		moveDownButton.innerHTML = "↓";
		moveDownButton.disabled = index === this.plugin.settings.clocks.length - 1;
		moveDownButton.onclick = async () => {
			await this.moveClock(clock.id, "down");
		};

		// Remove button
		new Setting(header)
			.setName("")
			.addButton((button) =>
				button
					.setButtonText("Remove")
					.setWarning()
					.onClick(async () => {
						await this.removeClock(clock.id);
					})
			);

		// Label setting
		new Setting(clockContainer)
			.setName("Label")
			.setDesc("Optional friendly name for this clock")
			.addText((text) =>
				text
					.setPlaceholder("e.g., New York")
					.setValue(clock.label || "")
					.onChange(async (value) => {
						clock.label = value;
						await this.plugin.saveSettings();
						// Update header without re-rendering entire settings
						headerTitle.setText(`Clock ${index + 1}${value ? `: ${value}` : ""}`);
						this.plugin.refreshView();
					})
			);

		// Timezone setting with searchable dropdown
		const timezones = getAllTimezones();
		new Setting(clockContainer)
			.setName("Timezone")
			.setDesc("Select a timezone for this clock")
			.addDropdown((dropdown) => {
				// Populate dropdown with all timezones
				timezones.forEach((tz) => {
					dropdown.addOption(tz.value, tz.label);
				});
				dropdown.setValue(clock.timezone);
				dropdown.onChange(async (value) => {
					clock.timezone = value;
					await this.plugin.saveSettings();
					this.plugin.refreshView();
				});
			});

		// Clock type setting
		new Setting(clockContainer)
			.setName("Clock type")
			.setDesc("Digital or analog display")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("digital", "Digital")
					.addOption("analog", "Analog")
					.setValue(clock.type)
					.onChange(async (value: "digital" | "analog") => {
						clock.type = value;
						await this.plugin.saveSettings();
						this.plugin.refreshView();
					})
			);

		// 12h/24h format (only for digital clocks)
		if (clock.type === "digital") {
			new Setting(clockContainer)
				.setName("Time format")
				.setDesc("12-hour or 24-hour format")
				.addDropdown((dropdown) =>
					dropdown
						.addOption("12h", "12-hour")
						.addOption("24h", "24-hour")
						.setValue(clock.hour24 ? "24h" : "12h")
						.onChange(async (value) => {
							clock.hour24 = value === "24h";
							await this.plugin.saveSettings();
							this.plugin.refreshView();
						})
				);
		}

		// Show seconds setting
		new Setting(clockContainer)
			.setName("Show seconds")
			.setDesc("Display seconds hand/display")
			.addToggle((toggle) =>
				toggle.setValue(clock.showSeconds).onChange(async (value) => {
					clock.showSeconds = value;
					await this.plugin.saveSettings();
					this.plugin.refreshView();
				})
			);
	}
}
