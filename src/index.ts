import { IncomingMessage } from 'http';
import { Form } from 'multiparty';
import anylogger from 'anylogger';
import config from '@mmstudio/config';

const logger = anylogger('@mmstudio/an000041');

const maxFilesSize = config.max_file_size as number;

export interface IFile {
	name: string;
	path: string;
	type: string;
}

type ParsedFiles = Record<
	string,
	[
		{
			fieldName: string
			path: string
			originalFilename: string
			headers: Record<string, string>
			size: number
		}
	]
>

export default function parsefiles(req: IncomingMessage) {
	return new Promise<IFile[]>((res, rej) => {
		const form = new Form({
			maxFilesSize,
		});
		form.parse(req, (err, _fields, files: ParsedFiles) => {
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
							name: file.fieldName,
							path: file.path,
							type: file.headers['content-type'] || 'application/octet-stream',
						};
					})
				);
			}
		});
	});
}
