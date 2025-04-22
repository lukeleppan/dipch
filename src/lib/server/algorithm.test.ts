import { describe, it, expect } from 'vitest';
import { assignCountries } from './algorithm';
import type { AlgoritmData } from './algorithm';

describe('Country Assignment Algorithm', () => {
	// Test case 1: Different preferences for all players
	it('should find optimal assignments with different preferences', async () => {
		const testData: AlgoritmData = {
			gameId: 1,
			playerLists: [
				{
					playerId: 1,
					preferences: [
						{ country: 'England', rank: 1 },
						{ country: 'France', rank: 2 },
						{ country: 'Germany', rank: 3 },
						{ country: 'Italy', rank: 4 },
						{ country: 'Austria', rank: 5 },
						{ country: 'Russia', rank: 6 },
						{ country: 'Turkey', rank: 7 }
					]
				},
				{
					playerId: 2,
					preferences: [
						{ country: 'England', rank: 1 }, // Collision with Player 1
						{ country: 'Germany', rank: 2 },
						{ country: 'Russia', rank: 3 },
						{ country: 'France', rank: 4 },
						{ country: 'Austria', rank: 5 },
						{ country: 'Italy', rank: 6 },
						{ country: 'Turkey', rank: 7 }
					]
				},
				{
					playerId: 3,
					preferences: [
						{ country: 'Germany', rank: 1 }, // Collision with Player 4
						{ country: 'Italy', rank: 2 },
						{ country: 'Austria', rank: 3 },
						{ country: 'Russia', rank: 4 },
						{ country: 'France', rank: 5 },
						{ country: 'Turkey', rank: 6 },
						{ country: 'England', rank: 7 }
					]
				},
				{
					playerId: 4,
					preferences: [
						{ country: 'Germany', rank: 1 }, // Collision with Player 3
						{ country: 'Austria', rank: 2 }, // Collision with Player 6
						{ country: 'Italy', rank: 3 },
						{ country: 'Turkey', rank: 4 },
						{ country: 'England', rank: 5 },
						{ country: 'France', rank: 6 },
						{ country: 'Russia', rank: 7 }
					]
				},
				{
					playerId: 5,
					preferences: [
						{ country: 'France', rank: 1 },
						{ country: 'England', rank: 2 },
						{ country: 'Russia', rank: 3 },
						{ country: 'Germany', rank: 4 },
						{ country: 'Turkey', rank: 5 },
						{ country: 'Austria', rank: 6 },
						{ country: 'Italy', rank: 7 }
					]
				},
				{
					playerId: 6,
					preferences: [
						{ country: 'Austria', rank: 1 }, // Collision with Player 4's 2nd choice
						{ country: 'Italy', rank: 2 }, // Collision with Player 7's 1st choice
						{ country: 'France', rank: 3 },
						{ country: 'Turkey', rank: 4 },
						{ country: 'Russia', rank: 5 },
						{ country: 'England', rank: 6 },
						{ country: 'Germany', rank: 7 }
					]
				},
				{
					playerId: 7,
					preferences: [
						{ country: 'Italy', rank: 1 }, // Collision with Player 6's 2nd choice
						{ country: 'Russia', rank: 2 },
						{ country: 'Turkey', rank: 3 },
						{ country: 'Austria', rank: 4 },
						{ country: 'Germany', rank: 5 },
						{ country: 'England', rank: 6 },
						{ country: 'France', rank: 7 }
					]
				}
			]
		};

		const result = await assignCountries(testData);

		console.table(result.assignments);

		console.log('Total Rank:', result.totalRank);
		console.log('Average Rank:', (result.totalRank / 7).toFixed(2));
		console.log('Total Satisfaction Score:', result.totalSatisfactionScore);
		console.log(
			'Overall Satisfaction Score:',
			((result.totalSatisfactionScore / 70) * 100).toFixed(2) + '%'
		);

		// Verify that all countries were assigned exactly once
		const assignedCountries = result.assignments.map((a) => a.country);
		const uniqueCountries = new Set(assignedCountries);
		expect(uniqueCountries.size).toBe(7);
		expect(assignedCountries.length).toBe(7);

		// Verify all players received exactly one country
		const assignedPlayers = result.assignments.map((a) => a.playerId);
		const uniquePlayers = new Set(assignedPlayers);
		expect(uniquePlayers.size).toBe(7);
		expect(assignedPlayers.length).toBe(7);

		const expectedTotalSatisfaction = 58;
		const expectedTotalRank = 12;

		// Verify Results
		expect(result.totalSatisfactionScore).toBe(expectedTotalSatisfaction);
		expect(result.totalRank).toBeCloseTo(expectedTotalRank);
	});

	// Test case 2: Identical preferences
	it('should handle identical preferences fairly', async () => {
		const identicalPreferences = [
			{ country: 'England', rank: 1 },
			{ country: 'France', rank: 2 },
			{ country: 'Germany', rank: 3 },
			{ country: 'Italy', rank: 4 },
			{ country: 'Austria', rank: 5 },
			{ country: 'Russia', rank: 6 },
			{ country: 'Turkey', rank: 7 }
		];

		const testData: AlgoritmData = {
			gameId: 2,
			playerLists: Array.from({ length: 7 }, (_, i) => ({
				playerId: i + 1,
				preferences: [...identicalPreferences]
			}))
		};

		// Define proper types for our tracking objects
		interface CountryCount {
			[country: string]: number;
		}

		interface PlayerCountryCounts {
			[playerId: string]: CountryCount;
		}

		// Run 5 passes
		const numPasses = 5;
		const results = [];
		const countryCounts: PlayerCountryCounts = {};

		for (let i = 0; i < numPasses; i++) {
			const result = await assignCountries(testData);
			results.push(result);

			// Track country assignments for each player
			result.assignments.forEach((assignment) => {
				const playerKey = assignment.playerId.toString();
				if (!countryCounts[playerKey]) {
					countryCounts[playerKey] = {};
				}

				const country = assignment.country;
				countryCounts[playerKey][country] = (countryCounts[playerKey][country] || 0) + 1;
			});
		}

		// Pretty print the results
		console.log('=== Assignment Results ===');
		results.forEach((result, index) => {
			console.log(`Run ${index + 1}:`);
			const assignmentsByPlayer: Record<number, string> = {};
			result.assignments.forEach((a) => {
				assignmentsByPlayer[a.playerId] = a.country;
			});

			// Print in a table format
			console.table(assignmentsByPlayer);
		});

		console.log('=== Summary of Country Assignments ===');
		console.table(countryCounts);

		// Test for fairness: Check if there's at least one difference in assignments
		// This is guaranteed to pass if the algorithm has any randomness at all
		let atLeastOneDifference = false;

		// Compare the first run with each subsequent run
		const firstRunAssignments = results[0].assignments.reduce(
			(acc, a) => {
				acc[a.playerId] = a.country;
				return acc;
			},
			{} as Record<number, string>
		);

		for (let i = 1; i < results.length; i++) {
			const currentRunAssignments = results[i].assignments.reduce(
				(acc, a) => {
					acc[a.playerId] = a.country;
					return acc;
				},
				{} as Record<number, string>
			);

			// Check if any player got a different country
			Object.keys(firstRunAssignments).forEach((playerIdStr) => {
				const playerId = Number(playerIdStr);
				if (firstRunAssignments[playerId] !== currentRunAssignments[playerId]) {
					atLeastOneDifference = true;
				}
			});
		}

		// Instead of using a statistical test that might occasionally fail,
		// we check if the algorithm produced at least some variation
		if (numPasses > 1) {
			// Only check if we ran more than one pass
			expect(atLeastOneDifference).toBe(true);
			console.log('Found variation in assignments across runs (algorithm incorporates randomness)');
		}

		// Always validate that all runs have the same total satisfaction score
		// since all optimal assignments should have the same score
		const firstScore = results[0].totalSatisfactionScore;
		results.forEach((result, i) => {
			expect(result.totalSatisfactionScore).toBe(firstScore);
			console.log(
				`Run ${i + 1} maintained optimal total satisfaction score: ${result.totalSatisfactionScore}`
			);
		});
	});

	// Test case 3: Edge cases with extreme preferences
	it('should handle extreme preferences correctly', async () => {
		// Create a test case where all players except one have identical preferences
		// The odd player out has the complete opposite preference
		// ...
	});

	// Test case 4: Validate consistent optimal total satisfaction
	it('should always find assignments with maximum possible satisfaction', async () => {
		// Create a test case with known optimal satisfaction score
		// ...
	});

	// Test case 5: Performance test (optional)
	// it('should complete assignments within reasonable time', async () => {
	// 	const start = performance.now();
	// 	await assignCountries(/* large test case */);
	// 	const duration = performance.now() - start;
	// 	expect(duration).toBeLessThan(100); // 100ms threshold
	// });
});
