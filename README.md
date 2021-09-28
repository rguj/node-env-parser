# node-env-parser
No more headaches! Your best utility for parsing .env variables in Node JS. Code was built based from Laravel's ENV parsing principle.

Instruction:
  1) Put this file at the root of the project folder the same level as "main.js" and ".env" file
  2) Prepend this code at the most top of your main.js file:
      global.env = require('./env').parse()
  3) You can access your ENV variables anywhere in your project (server-side)
  4) Please suggest revisions of this code to enhance it
