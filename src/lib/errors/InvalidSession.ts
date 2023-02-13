export class InvalidSession extends Error {
	public constructor() {
		super( `Couldn't find session.` )
	}
}