const knothash = require('./knothash');

const args = process.argv.slice(2);
console.log('args array has length ' + args.length);
if (args.length > 0) {
    const inputPathname = args[0];
    const inputText = fs.readFileSync(inputPathname);
    console.log('read text of length ' + inputText.length + ' from ' + inputPathname);
}
