/**
 * Configuration for a single clock instance
 */
export interface ClockConfig {
	id: string; // Unique identifier for the clock
	timezone: string; // IANA timezone ID (e.g., "America/New_York")
	label?: string; // Optional friendly label (e.g., "New York")
	type: "digital" | "analog"; // Clock display type
	hour24: boolean; // Use 24-hour format (digital only)
	showSeconds: boolean; // Show seconds hand/display
}

/**
 * Plugin settings structure
 */
export interface WorldClockSettings {
	clocks: ClockConfig[];
	defaultType: "digital" | "analog";
}

/**
 * IANA timezone with friendly display name
 */
export interface TimezoneOption {
	value: string; // IANA timezone ID
	label: string; // Friendly display name (City / Region)
}
