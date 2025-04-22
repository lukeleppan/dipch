#!/usr/bin/env node
import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true
});

rl.stdoutMuted = true;

rl.question('Enter password to hash: ', (password) => {
	bcrypt.hash(password, 10, (err, hash) => {
		if (err) throw err;
		console.log(`\nHashed password: ${hash}`);
		rl.close();
	});
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
	if (!this.stdoutMuted) {
		this.output.write(stringToWrite);
	}
};
