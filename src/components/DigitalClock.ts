import { ClockConfig } from "../types";
import { getTimeInTimezone } from "../utils/timezones";

/**
 * Digital clock component
 * Displays time in HH:MM:SS or HH:MM format
 */
export class DigitalClock {
	private containerEl: HTMLElement;
	private config: ClockConfig;
	private updateInterval: number | null = null;

	constructor(containerEl: HTMLElement, config: ClockConfig) {
		this.containerEl = containerEl;
		this.config = config;
		this.render();
	}

	/**
	 * Render the digital clock UI
	 */
	private render(): void {
		this.containerEl.empty();
		this.containerEl.addClass("world-clock-digital");

		// Clock label
		const labelEl = this.containerEl.createDiv("world-clock-label");
		labelEl.setText(this.config.label || this.config.timezone);

		// Time display
		const timeEl = this.containerEl.createDiv("world-clock-time");
		this.updateTime(timeEl);

		// Update every second if showing seconds, otherwise every minute
		const intervalMs = this.config.showSeconds ? 1000 : 60000;
		this.updateInterval = window.setInterval(() => {
			this.updateTime(timeEl);
		}, intervalMs);
	}

	/**
	 * Update the displayed time
	 */
	private updateTime(timeEl: HTMLElement): void {
		const time = getTimeInTimezone(this.config.timezone, {
			hour12: !this.config.hour24,
			showSeconds: this.config.showSeconds,
		});

		// Format time based on 12h/24h preference
		let displayTime: string;
		if (this.config.showSeconds) {
			// Format with seconds
			const formatter = new Intl.DateTimeFormat("en-US", {
				timeZone: this.config.timezone,
				hour12: !this.config.hour24,
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			displayTime = formatter.format(new Date());
		} else {
			// Format without seconds
			const formatter = new Intl.DateTimeFormat("en-US", {
				timeZone: this.config.timezone,
				hour12: !this.config.hour24,
				hour: "2-digit",
				minute: "2-digit",
			});
			displayTime = formatter.format(new Date());
		}

		timeEl.setText(displayTime);
	}

	/**
	 * Update configuration and re-render
	 */
	updateConfig(config: ClockConfig): void {
		this.config = config;
		this.destroy();
		this.render();
	}

	/**
	 * Clean up intervals
	 */
	destroy(): void {
		if (this.updateInterval !== null) {
			window.clearInterval(this.updateInterval);
			this.updateInterval = null;
		}
	}
}
