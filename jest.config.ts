import type { Config } from 'jest';

export default async (): Promise<Config> => {
	return {
		verbose: true,
		preset: 'ts-jest',
		testEnvironment: 'node',
		collectCoverage: true,
		coverageDirectory: 'coverage',
		coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
		coverageReporters: ['text', 'lcov'],
	};
};
