import { COUNTRIES_PLAIN } from '../const';

export interface AlgoritmData {
	gameId: number;
	playerLists: PlayerList[];
}

export interface PlayerList {
	playerId: number;
	preferences: Preference[];
}
export interface Preference {
	country: string;
	rank: number;
}

/**
 * Maps choice rank to satisfaction score
 */
export const SATISFACTION_TABLE: Record<number, number> = {
	1: 10,
	2: 7,
	3: 5,
	4: 3,
	5: 2,
	6: 1,
	7: 0
};

export interface Assignment {
	playerId: number;
	country: string;
	rank: number;
	satisfactionScore: number;
}

export interface AssignmentResult {
	gameId: number;
	assignments: Assignment[];
	totalSatisfactionScore: number;
	totalRank: number;
}

/**
 * Assigns countries to players by maximizing total satisfaction score
 *
 * @param data Data containing player lists and game ID
 * @returns Promise resolving to assignment result
 */
export async function assignCountries(data: AlgoritmData): Promise<AssignmentResult> {
	const { gameId, playerLists } = data;
	const countries = COUNTRIES_PLAIN;

	// Create satisfaction matrix
	const satisfactionMatrix: Record<number, Record<string, { rank: number; score: number }>> = {};
	playerLists.forEach((player) => {
		satisfactionMatrix[player.playerId] = {};

		player.preferences.forEach((pref) => {
			satisfactionMatrix[player.playerId][pref.country] = {
				rank: pref.rank,
				score: SATISFACTION_TABLE[pref.rank]
			};
		});
	});

	const playerIds = playerLists.map((player) => player.playerId);

	let bestAssignments: Assignment[][] = [];
	let bestTotalSatisfaction = -1;

	// Generate all possible country assignment permutations
	const countryPermutations = permute(countries);

	// Evaluate each permutation
	for (const countryPermutation of countryPermutations) {
		const currentAssignment: Assignment[] = [];
		let currentTotalSatisfaction = 0;

		// Assign each country to the corresponding player in order
		for (let i = 0; i < playerIds.length; i++) {
			const playerId = playerIds[i];
			const country = countryPermutation[i];
			const { rank, score } = satisfactionMatrix[playerId][country];

			currentAssignment.push({
				playerId,
				country,
				rank,
				satisfactionScore: score
			});

			currentTotalSatisfaction += score;
		}

		// Update best assignments
		if (currentTotalSatisfaction > bestTotalSatisfaction) {
			bestTotalSatisfaction = currentTotalSatisfaction;
			bestAssignments = [currentAssignment];
		} else if (currentTotalSatisfaction === bestTotalSatisfaction) {
			bestAssignments.push(currentAssignment);
		}
	}

	/*
	   Select a random best assignment ensuring equal probability of
	   players receiving better countries.
	*/
	const randomIndex = Math.floor(Math.random() * bestAssignments.length);
	const bestAssignment = bestAssignments[randomIndex];

	const totalRank = bestAssignment.reduce((sum, a) => sum + a.rank, 0);

	return {
		gameId,
		assignments: bestAssignment,
		totalSatisfactionScore: bestTotalSatisfaction,
		totalRank: totalRank
	};
}

/**
 * Generates all permutations of an array
 *
 * @param arr Array to generate permutations for
 * @returns Array of all permutations
 */
function permute<T>(arr: T[]): T[][] {
	const result: T[][] = [];

	// Helper function for the recursive permutation generation
	function permutationHelper(currentPermutation: T[], remaining: T[]) {
		if (remaining.length === 0) {
			result.push([...currentPermutation]);
			return;
		}

		for (let i = 0; i < remaining.length; i++) {
			const next = remaining[i];

			// Add the current element to the current permutation
			currentPermutation.push(next);

			// Create the new remaining array without the current element
			const newRemaining = [...remaining.slice(0, i), ...remaining.slice(i + 1)];

			// Recurse with the new state
			permutationHelper(currentPermutation, newRemaining);

			// Backtrack
			currentPermutation.pop();
		}
	}

	permutationHelper([], arr);
	return result;
}
