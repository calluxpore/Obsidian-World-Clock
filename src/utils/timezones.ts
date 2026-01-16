/**
 * Timezone utilities for handling IANA timezones
 * Uses browser's built-in Intl API - no external dependencies
 */

/**
 * Get a friendly display name for a timezone
 * Format: "City / Region" (e.g., "New York / America")
 */
export function getTimezoneLabel(timezone: string): string {
	try {
		// Use Intl to get a friendly name
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			timeZoneName: "long",
		});
		
		// Extract timezone name from formatted string
		const parts = formatter.formatToParts(new Date());
		const tzName = parts.find((part) => part.type === "timeZoneName")?.value || timezone;
		
		// Try to extract city name from timezone ID
		const parts2 = timezone.split("/");
		if (parts2.length >= 2 && parts2[0]) {
			const city = parts2[parts2.length - 1]?.replace(/_/g, " ") || "";
			return `${city} / ${parts2[0]}`;
		}
		
		return timezone;
	} catch {
		return timezone;
	}
}

/**
 * Get current time in a specific timezone
 * Returns formatted parts for easy use in clocks
 */
export function getTimeInTimezone(
	timezone: string,
	options: {
		hour12?: boolean;
		showSeconds?: boolean;
	} = {}
): {
	hours: number;
	minutes: number;
	seconds: number;
	formatted: string;
} {
	const now = new Date();
	
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		hour12: options.hour12 ?? false,
		hour: "numeric",
		minute: "2-digit",
		second: options.showSeconds ? "2-digit" : undefined,
	});
	
	const formatted = formatter.format(now);
	
	// Parse the formatted string to get numeric values
	const parts = formatter.formatToParts(now);
	const hours = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
	const minutes = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
	const seconds = options.showSeconds
		? parseInt(parts.find((p) => p.type === "second")?.value || "0", 10)
		: 0;
	
	return {
		hours,
		minutes,
		seconds,
		formatted,
	};
}

/**
 * Get UTC offset string in GMT format (e.g., GMT+05:30)
 * Accounts for DST automatically
 */
function getUTCOffsetString(timezone: string): string {
	try {
		const now = new Date();
		
		// Use Intl to get timezone offset (accounts for DST)
		const utcFormatter = new Intl.DateTimeFormat("en-US", {
			timeZone: "UTC",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
		
		const tzFormatter = new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
		
		// Get UTC time parts
		const utcParts = utcFormatter.formatToParts(now);
		const utcHour = parseInt(utcParts.find((p) => p.type === "hour")?.value || "0", 10);
		const utcMinute = parseInt(utcParts.find((p) => p.type === "minute")?.value || "0", 10);
		
		// Get timezone time parts
		const tzParts = tzFormatter.formatToParts(now);
		const tzHour = parseInt(tzParts.find((p) => p.type === "hour")?.value || "0", 10);
		const tzMinute = parseInt(tzParts.find((p) => p.type === "minute")?.value || "0", 10);
		
		// Calculate offset in minutes
		const utcTotalMinutes = utcHour * 60 + utcMinute;
		const tzTotalMinutes = tzHour * 60 + tzMinute;
		let offsetMinutes = tzTotalMinutes - utcTotalMinutes;
		
		// Handle day boundary (if offset is very large, it might be wrong due to date calculation)
		// Better approach: use timezone offset directly
		const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
		const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
		offsetMinutes = Math.round((tzDate.getTime() - utcDate.getTime()) / (1000 * 60));
		
		// Normalize to -12 to +14 hours range
		while (offsetMinutes < -12 * 60) offsetMinutes += 24 * 60;
		while (offsetMinutes > 14 * 60) offsetMinutes -= 24 * 60;
		
		const sign = offsetMinutes >= 0 ? "+" : "-";
		const absOffset = Math.abs(offsetMinutes);
		const hours = Math.floor(absOffset / 60);
		const minutes = absOffset % 60;
		
		return `GMT${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
	} catch {
		return "GMT+00:00";
	}
}

/**
 * Get city name from timezone ID
 */
function getCityName(timezone: string): string {
	const parts = timezone.split("/");
	if (parts.length > 1) {
		const cityPart = parts[parts.length - 1];
		if (cityPart) {
			return cityPart.replace(/_/g, " ");
		}
	}
	return timezone;
}

/**
 * Comprehensive list of IANA timezones with UTC offset labels
 * Format: (GMT+05:30) New Delhi
 */
export const IANA_TIMEZONES: Array<{ value: string; label: string }> = [
	// UTC/GMT
	{ value: "UTC", label: "(GMT+00:00) UTC" },
	{ value: "GMT", label: "(GMT+00:00) GMT" },
	
	// India & South Asia (UTC+5:30)
	{ value: "Asia/Kolkata", label: "(GMT+05:30) New Delhi / Kolkata" },
	{ value: "Asia/Calcutta", label: "(GMT+05:30) Calcutta" },
	{ value: "Asia/Colombo", label: "(GMT+05:30) Colombo" },
	
	// Pakistan (UTC+5:00)
	{ value: "Asia/Karachi", label: "(GMT+05:00) Karachi" },
	{ value: "Asia/Islamabad", label: "(GMT+05:00) Islamabad" },
	
	// Bangladesh (UTC+6:00)
	{ value: "Asia/Dhaka", label: "(GMT+06:00) Dhaka" },
	
	// Nepal (UTC+5:45)
	{ value: "Asia/Kathmandu", label: "(GMT+05:45) Kathmandu" },
	
	// Sri Lanka (UTC+5:30)
	{ value: "Asia/Colombo", label: "(GMT+05:30) Colombo" },
	
	// Americas - US & Canada
	{ value: "America/New_York", label: "(GMT-05:00) New York" },
	{ value: "America/Chicago", label: "(GMT-06:00) Chicago" },
	{ value: "America/Denver", label: "(GMT-07:00) Denver" },
	{ value: "America/Los_Angeles", label: "(GMT-08:00) Los Angeles" },
	{ value: "America/Phoenix", label: "(GMT-07:00) Phoenix" },
	{ value: "America/Anchorage", label: "(GMT-09:00) Anchorage" },
	{ value: "America/Honolulu", label: "(GMT-10:00) Honolulu" },
	{ value: "America/Toronto", label: "(GMT-05:00) Toronto" },
	{ value: "America/Vancouver", label: "(GMT-08:00) Vancouver" },
	{ value: "America/Montreal", label: "(GMT-05:00) Montreal" },
	{ value: "America/Winnipeg", label: "(GMT-06:00) Winnipeg" },
	{ value: "America/Edmonton", label: "(GMT-07:00) Edmonton" },
	
	// Americas - Latin America
	{ value: "America/Mexico_City", label: "(GMT-06:00) Mexico City" },
	{ value: "America/Bogota", label: "(GMT-05:00) Bogotá" },
	{ value: "America/Lima", label: "(GMT-05:00) Lima" },
	{ value: "America/Caracas", label: "(GMT-04:00) Caracas" },
	{ value: "America/Santiago", label: "(GMT-03:00) Santiago" },
	{ value: "America/Buenos_Aires", label: "(GMT-03:00) Buenos Aires" },
	{ value: "America/Sao_Paulo", label: "(GMT-03:00) São Paulo" },
	{ value: "America/Rio_de_Janeiro", label: "(GMT-03:00) Rio de Janeiro" },
	
	// Europe
	{ value: "Europe/London", label: "(GMT+00:00) London" },
	{ value: "Europe/Dublin", label: "(GMT+00:00) Dublin" },
	{ value: "Europe/Lisbon", label: "(GMT+00:00) Lisbon" },
	{ value: "Europe/Paris", label: "(GMT+01:00) Paris" },
	{ value: "Europe/Berlin", label: "(GMT+01:00) Berlin" },
	{ value: "Europe/Rome", label: "(GMT+01:00) Rome" },
	{ value: "Europe/Madrid", label: "(GMT+01:00) Madrid" },
	{ value: "Europe/Amsterdam", label: "(GMT+01:00) Amsterdam" },
	{ value: "Europe/Brussels", label: "(GMT+01:00) Brussels" },
	{ value: "Europe/Vienna", label: "(GMT+01:00) Vienna" },
	{ value: "Europe/Zurich", label: "(GMT+01:00) Zurich" },
	{ value: "Europe/Stockholm", label: "(GMT+01:00) Stockholm" },
	{ value: "Europe/Oslo", label: "(GMT+01:00) Oslo" },
	{ value: "Europe/Copenhagen", label: "(GMT+01:00) Copenhagen" },
	{ value: "Europe/Helsinki", label: "(GMT+02:00) Helsinki" },
	{ value: "Europe/Athens", label: "(GMT+02:00) Athens" },
	{ value: "Europe/Warsaw", label: "(GMT+01:00) Warsaw" },
	{ value: "Europe/Prague", label: "(GMT+01:00) Prague" },
	{ value: "Europe/Budapest", label: "(GMT+01:00) Budapest" },
	{ value: "Europe/Bucharest", label: "(GMT+02:00) Bucharest" },
	{ value: "Europe/Kiev", label: "(GMT+02:00) Kiev" },
	{ value: "Europe/Moscow", label: "(GMT+03:00) Moscow" },
	{ value: "Europe/Istanbul", label: "(GMT+03:00) Istanbul" },
	
	// Asia - East
	{ value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
	{ value: "Asia/Seoul", label: "(GMT+09:00) Seoul" },
	{ value: "Asia/Shanghai", label: "(GMT+08:00) Shanghai" },
	{ value: "Asia/Beijing", label: "(GMT+08:00) Beijing" },
	{ value: "Asia/Hong_Kong", label: "(GMT+08:00) Hong Kong" },
	{ value: "Asia/Taipei", label: "(GMT+08:00) Taipei" },
	{ value: "Asia/Singapore", label: "(GMT+08:00) Singapore" },
	{ value: "Asia/Kuala_Lumpur", label: "(GMT+08:00) Kuala Lumpur" },
	{ value: "Asia/Manila", label: "(GMT+08:00) Manila" },
	{ value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok" },
	{ value: "Asia/Ho_Chi_Minh", label: "(GMT+07:00) Ho Chi Minh" },
	{ value: "Asia/Jakarta", label: "(GMT+07:00) Jakarta" },
	{ value: "Asia/Rangoon", label: "(GMT+06:30) Rangoon" },
	
	// Asia - Middle East
	{ value: "Asia/Dubai", label: "(GMT+04:00) Dubai" },
	{ value: "Asia/Abu_Dhabi", label: "(GMT+04:00) Abu Dhabi" },
	{ value: "Asia/Riyadh", label: "(GMT+03:00) Riyadh" },
	{ value: "Asia/Kuwait", label: "(GMT+03:00) Kuwait" },
	{ value: "Asia/Baghdad", label: "(GMT+03:00) Baghdad" },
	{ value: "Asia/Tehran", label: "(GMT+03:30) Tehran" },
	{ value: "Asia/Jerusalem", label: "(GMT+02:00) Jerusalem" },
	{ value: "Asia/Beirut", label: "(GMT+02:00) Beirut" },
	{ value: "Asia/Amman", label: "(GMT+02:00) Amman" },
	
	// Oceania
	{ value: "Australia/Sydney", label: "(GMT+10:00) Sydney" },
	{ value: "Australia/Melbourne", label: "(GMT+10:00) Melbourne" },
	{ value: "Australia/Brisbane", label: "(GMT+10:00) Brisbane" },
	{ value: "Australia/Perth", label: "(GMT+08:00) Perth" },
	{ value: "Australia/Adelaide", label: "(GMT+09:30) Adelaide" },
	{ value: "Australia/Darwin", label: "(GMT+09:30) Darwin" },
	{ value: "Pacific/Auckland", label: "(GMT+12:00) Auckland" },
	{ value: "Pacific/Fiji", label: "(GMT+12:00) Fiji" },
	
	// Africa
	{ value: "Africa/Cairo", label: "(GMT+02:00) Cairo" },
	{ value: "Africa/Johannesburg", label: "(GMT+02:00) Johannesburg" },
	{ value: "Africa/Cape_Town", label: "(GMT+02:00) Cape Town" },
	{ value: "Africa/Lagos", label: "(GMT+01:00) Lagos" },
	{ value: "Africa/Nairobi", label: "(GMT+03:00) Nairobi" },
	{ value: "Africa/Casablanca", label: "(GMT+01:00) Casablanca" },
	{ value: "Africa/Tunis", label: "(GMT+01:00) Tunis" },
	{ value: "Africa/Algiers", label: "(GMT+01:00) Algiers" },
];

/**
 * Get all available timezones with dynamic UTC offset calculation
 * Sorted alphabetically by label
 */
export function getAllTimezones(): Array<{ value: string; label: string }> {
	// Enhance labels with current UTC offset
	const enhanced = IANA_TIMEZONES.map((tz) => {
		const offset = getUTCOffsetString(tz.value);
		const city = getCityName(tz.value);
		
		// If label already has GMT format, use it; otherwise enhance it
		if (tz.label.includes("GMT")) {
			return tz;
		}
		
		return {
			value: tz.value,
			label: `(${offset}) ${city}`,
		};
	});
	
	return enhanced.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Find timezone option by IANA ID
 */
export function findTimezoneById(id: string): { value: string; label: string } | undefined {
	return IANA_TIMEZONES.find((tz) => tz.value === id);
}
