import { Plugin, WorkspaceLeaf } from "obsidian";
import { DEFAULT_SETTINGS, WorldClockSettingTab } from "./settings";
import { WorldClockSettings } from "./types";
import { WorldClockView, VIEW_TYPE_WORLD_CLOCK } from "./view/WorldClockView";

export default class WorldClockPlugin extends Plugin {
	settings: WorldClockSettings;

	async onload() {
		await this.loadSettings();

		// Register the dockable view
		this.registerView(VIEW_TYPE_WORLD_CLOCK, (leaf: WorkspaceLeaf) => {
			return new WorldClockView(leaf, this);
		});

		// Add settings tab
		this.addSettingTab(new WorldClockSettingTab(this.app, this));

		// Add command to open the world clock view
		this.addCommand({
			id: "open-world-clock-view",
			name: "Open World Clock",
			callback: async () => {
				await this.activateView();
			},
		});

		// Try to restore the view if it was open before
		this.app.workspace.onLayoutReady(() => {
			this.restoreView();
		});
	}

	onunload() {
		// Detach all leaves of this view type
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_WORLD_CLOCK);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Activate the world clock view in the right leaf
	 */
	async activateView(): Promise<void> {
		const { workspace } = this.app;

		// Check if view is already open
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_WORLD_CLOCK);

		if (leaves.length > 0 && leaves[0]) {
			// Use existing leaf
			leaf = leaves[0];
		} else {
			// Create new leaf in right sidebar
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({
					type: VIEW_TYPE_WORLD_CLOCK,
					active: true,
				});
			}
		}

		// Reveal the leaf if we have one
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	/**
	 * Restore view if it was open in a previous session
	 */
	private async restoreView(): Promise<void> {
		// Obsidian automatically restores workspace layout
		// We just need to ensure our view is registered (which we do in onload)
		// No additional action needed
	}

	/**
	 * Refresh all active views when settings change
	 */
	refreshView(): void {
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_WORLD_CLOCK);
		leaves.forEach((leaf) => {
			const view = leaf.view;
			if (view instanceof WorldClockView) {
				view.refresh();
			}
		});
	}
}
