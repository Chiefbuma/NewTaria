// This file is the entry point for Passenger on shared hosting.
// It redirects to the standalone production build of Next.js.

const path = require('path');

// Next.js standalone build exports its own server logic.
// Passenger handles the process.env.PORT, so we ensure the standalone server respects it.
process.env.NODE_ENV = 'production';
process.chdir(__dirname);

// Standalone mode creates a server.js in .next/standalone.
// We execute it here.
require('./.next/standalone/server.js');
