import { IncomingMessage } from 'http';
import { Form } from 'multiparty';
import anylogger from 'anylogger';

const logger = anylogger('@mmstudio/an000041');

export interface IFile<T> {
	name: string;
	path: string;
	type: string;
	fields: T;
}

type ParsedFiles = Record<
	string,
	[
		{
			fieldName: string;
			path: string;
			originalFilename: string;
			headers: Record<string, string>;
			size: number;
		}
	]
>

export default function parsefiles<T = Record<string, string[]>>(req: IncomingMessage) {
	return new Promise<IFile<T>[]>((res, rej) => {
		const form = new Form({
			maxFilesSize: getMaxSize(),
		});
		form.parse(req, (err, fields: T, files: ParsedFiles) => {
			if (err) {
				logger.error(err);
				rej(err);
			} else {
				logger.debug('files parsed', files);
				res(
					Object.keys(files).map((name) => {
						const [file] = files[name];
						logger.debug('file parsed', file);
						return {
							fields,
							name: file.originalFilename || file.fieldName,
							path: file.path,
							type: file.headers['content-type'] || 'application/octet-stream',
						};
					})
				);
			}
		});
	});
}

function getMaxSize() {
	return parseInt(process.env.MAX_FILE_SIZE!, 10);
}
