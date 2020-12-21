const test = require('ava');
const http = require('http');
const an40 = require('@mmstudio/an000040').default;

const { default: a } = require('../dist/index');
const port = 3000;
const name = 'mm';

test('parse file', async (t) => {
	let server;
	const [file] = await (() => {
		return new Promise((res) => {
			server = http.createServer((req) => {
				res(a(req));
			}).listen(port);
			an40(`curl --form "${name}=@./tests/test.js" http://127.0.0.1:${port}`)
		});
	})();
	server.close();
	t.is(file.name, name);
});
