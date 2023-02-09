export class InvalidSession extends Error {
	public constructor( userId: string ) {
		super( `Couldn't find session ${ userId }.` )
	}
}