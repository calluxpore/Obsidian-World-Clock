import { ClockConfig } from "../types";
import { getTimeInTimezone } from "../utils/timezones";

/**
 * Analog clock component using SVG
 * Renders a clock face with hour, minute, and optional second hands
 */
export class AnalogClock {
	private containerEl: HTMLElement;
	private config: ClockConfig;
	private updateInterval: number | null = null;
	private svg: SVGElement | null = null;

	// Clock dimensions
	private readonly size = 140;
	private readonly center = 70;
	private readonly radius = 60;

	constructor(containerEl: HTMLElement, config: ClockConfig) {
		this.containerEl = containerEl;
		this.config = config;
		this.render();
	}

	/**
	 * Render the analog clock UI
	 */
	private render(): void {
		this.containerEl.empty();
		this.containerEl.addClass("world-clock-analog");

		// Clock label
		const labelEl = this.containerEl.createDiv("world-clock-label");
		labelEl.setText(this.config.label || this.config.timezone);

		// SVG container
		const svgContainer = this.containerEl.createDiv("world-clock-svg-container");
		this.svg = this.createSVG();
		svgContainer.appendChild(this.svg);

		// Initial render
		this.updateClock();

		// Update every second if showing seconds, otherwise every minute
		const intervalMs = this.config.showSeconds ? 1000 : 60000;
		this.updateInterval = window.setInterval(() => {
			this.updateClock();
		}, intervalMs);
	}

	/**
	 * Create the SVG clock face
	 */
	private createSVG(): SVGElement {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("width", String(this.size));
		svg.setAttribute("height", String(this.size));
		svg.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`);
		svg.addClass("world-clock-svg");

		// Clock face circle - minimal design with day/night indication
		const face = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		face.setAttribute("cx", String(this.center));
		face.setAttribute("cy", String(this.center));
		face.setAttribute("r", String(this.radius));
		face.setAttribute("id", "clock-face");
		face.setAttribute("fill", "var(--world-clock-face-day)");
		face.setAttribute("stroke", "var(--background-modifier-border)");
		face.setAttribute("stroke-width", "1.5");
		svg.appendChild(face);

		// Minimal hour markers - small dots for a clean look
		// Use 12 dots positioned at hour marks
		for (let i = 0; i < 12; i++) {
			const angle = (i * 30 - 90) * (Math.PI / 180);
			const markerRadius = this.radius - 4;
			const x = this.center + markerRadius * Math.cos(angle);
			const y = this.center + markerRadius * Math.sin(angle);

			const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			marker.setAttribute("cx", String(x));
			marker.setAttribute("cy", String(y));
			marker.setAttribute("r", "2");
			marker.setAttribute("fill", "var(--text-muted)");
			svg.appendChild(marker);
		}

		// Hour hand (will be updated) - modern, slightly thicker
		const hourHand = document.createElementNS("http://www.w3.org/2000/svg", "line");
		hourHand.setAttribute("id", "hour-hand");
		hourHand.setAttribute("stroke", "var(--text-normal)");
		hourHand.setAttribute("stroke-width", "3.5");
		hourHand.setAttribute("stroke-linecap", "round");
		svg.appendChild(hourHand);

		// Minute hand (will be updated) - modern, medium thickness
		const minuteHand = document.createElementNS("http://www.w3.org/2000/svg", "line");
		minuteHand.setAttribute("id", "minute-hand");
		minuteHand.setAttribute("stroke", "var(--text-normal)");
		minuteHand.setAttribute("stroke-width", "2.5");
		minuteHand.setAttribute("stroke-linecap", "round");
		svg.appendChild(minuteHand);

		// Second hand (optional, will be updated) - accent color for visibility
		if (this.config.showSeconds) {
			const secondHand = document.createElementNS("http://www.w3.org/2000/svg", "line");
			secondHand.setAttribute("id", "second-hand");
			secondHand.setAttribute("stroke", "var(--text-accent)");
			secondHand.setAttribute("stroke-width", "1.5");
			secondHand.setAttribute("stroke-linecap", "round");
			svg.appendChild(secondHand);
		}

		// Center dot - modern, slightly larger for better visibility
		const centerDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		centerDot.setAttribute("cx", String(this.center));
		centerDot.setAttribute("cy", String(this.center));
		centerDot.setAttribute("r", "3.5");
		centerDot.setAttribute("fill", "var(--text-normal)");
		centerDot.setAttribute("id", "clock-center");
		svg.appendChild(centerDot);

		return svg;
	}

	/**
	 * Determine if it's day or night in the timezone
	 * Day: 6 AM to 6 PM (6:00 to 18:00)
	 * Night: 6 PM to 6 AM (18:00 to 6:00)
	 */
	private isDayTime(hours: number): boolean {
		return hours >= 6 && hours < 18;
	}

	/**
	 * Update clock hands based on current time in timezone
	 */
	private updateClock(): void {
		if (!this.svg) return;

		const time = getTimeInTimezone(this.config.timezone, {
			showSeconds: this.config.showSeconds,
		});

		// Update day/night styling
		const isDay = this.isDayTime(time.hours);
		if (isDay) {
			this.svg.classList.remove("world-clock-night");
			this.svg.classList.add("world-clock-day");
		} else {
			this.svg.classList.remove("world-clock-day");
			this.svg.classList.add("world-clock-night");
		}

		// Calculate angles (0° = 12 o'clock, clockwise)
		// Hours: 12 hours = 360°, so 1 hour = 30°
		const hourAngle = ((time.hours % 12) * 30 + time.minutes * 0.5 - 90) * (Math.PI / 180);
		// Minutes: 60 minutes = 360°, so 1 minute = 6°
		const minuteAngle = (time.minutes * 6 - 90) * (Math.PI / 180);
		// Seconds: 60 seconds = 360°, so 1 second = 6°
		const secondAngle = (time.seconds * 6 - 90) * (Math.PI / 180);

		// Update hour hand (45% of radius) - modern proportions
		const hourHand = this.svg.querySelector("#hour-hand") as SVGLineElement;
		if (hourHand) {
			const hourLength = this.radius * 0.45;
			hourHand.setAttribute("x1", String(this.center));
			hourHand.setAttribute("y1", String(this.center));
			hourHand.setAttribute("x2", String(this.center + hourLength * Math.cos(hourAngle)));
			hourHand.setAttribute("y2", String(this.center + hourLength * Math.sin(hourAngle)));
		}

		// Update minute hand (65% of radius) - modern proportions
		const minuteHand = this.svg.querySelector("#minute-hand") as SVGLineElement;
		if (minuteHand) {
			const minuteLength = this.radius * 0.65;
			minuteHand.setAttribute("x1", String(this.center));
			minuteHand.setAttribute("y1", String(this.center));
			minuteHand.setAttribute("x2", String(this.center + minuteLength * Math.cos(minuteAngle)));
			minuteHand.setAttribute("y2", String(this.center + minuteLength * Math.sin(minuteAngle)));
		}

		// Update second hand (75% of radius) if enabled - modern proportions
		if (this.config.showSeconds) {
			const secondHand = this.svg.querySelector("#second-hand") as SVGLineElement;
			if (secondHand) {
				const secondLength = this.radius * 0.75;
				secondHand.setAttribute("x1", String(this.center));
				secondHand.setAttribute("y1", String(this.center));
				secondHand.setAttribute("x2", String(this.center + secondLength * Math.cos(secondAngle)));
				secondHand.setAttribute("y2", String(this.center + secondLength * Math.sin(secondAngle)));
			}
		}
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
