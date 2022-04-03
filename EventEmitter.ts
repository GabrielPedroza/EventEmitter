export default class EventEmitter {
	callbacks: {
		[namespace: string]: {
			[value: string]: Function[]
		}
	}

	constructor() {
		this.callbacks = {}
	}

	on(_names: string, callback: Function) {
		// Resolve names
		const names = this.resolveNames(_names)

		// Each name
		names.forEach((_name: string) => {
			// Resolve name
			const name = this.resolveName(_name)

			// Create namespace if not exist
			if (!(this.callbacks[name.namespace] instanceof Object))
				this.callbacks[name.namespace] = {}

			// Create callback if not exist
			if (!(this.callbacks[name.namespace][name.value] instanceof Array))
				this.callbacks[name.namespace][name.value] = []

			// Add callback
			this.callbacks[name.namespace][name.value].push(callback)
		})

		return this
	}

	off(_names: string) {
		// Resolve names
		const names = this.resolveNames(_names)

		// Each name
		names.forEach((_name: string) => {
			// Resolve name
			const name = this.resolveName(_name)

			// Remove namespace
			if (name.namespace !== "base" && name.value === "") {
				delete this.callbacks[name.namespace]
			}

			// Remove specific callback in namespace
			else {
				// Default
				if (name.namespace === "base") {
					// Try to remove from each namespace
					for (const namespace in this.callbacks) {
						if (
							this.callbacks[namespace] instanceof Object &&
							this.callbacks[namespace][name.value] instanceof Array
						) {
							delete this.callbacks[namespace][name.value]

							// Remove namespace if empty
							if (Object.keys(this.callbacks[namespace]).length === 0)
								delete this.callbacks[namespace]
						}
					}
				}

				// Specified namespace
				else if (
					this.callbacks[name.namespace] instanceof Object &&
					this.callbacks[name.namespace][name.value] instanceof Array
				) {
					delete this.callbacks[name.namespace][name.value]

					// Remove namespace if empty
					if (Object.keys(this.callbacks[name.namespace]).length === 0)
						delete this.callbacks[name.namespace]
				}
			}
		})

		return this
	}

	trigger(_name: string, _args?: Function) {
		let result = null
		let finalResult: null | typeof result = null

		// Default args
		const args = !(_args instanceof Array) ? [] : _args

		// Resolve names (should on have one event)
		let name = this.resolveName(this.resolveNames(_name)[0])

		// Default namespace
		if (name.namespace === "base") {
			// Try to find callback in each namespace
			for (const namespace in this.callbacks) {
				if (
					this.callbacks[namespace] instanceof Object &&
					this.callbacks[namespace][name.value] instanceof Array
				) {
					this.callbacks[namespace][name.value].forEach((callback) => {
						result = callback.apply(this, args)

						if (typeof finalResult === "undefined") {
							finalResult = result
						}
					})
				}
			}
		}

		// Specified namespace
		else if (this.callbacks[name.namespace] instanceof Object) {
			this.callbacks[name.namespace][name.value].forEach((callback) => {
				result = callback.apply(this, args)

				if (typeof finalResult === "undefined") finalResult = result
			})
		}

		return finalResult
	}

	resolveNames(_names: string) {
		return _names
			.replace(/[^a-zA-Z0-9 ,/.]/g, "")
			.replace(/[,/]+/g, " ")
			.split(" ")
	}

	resolveName(name: string) {
		const newName = {
			namespace: "base", // Default namespace
			value: "",
			original: name,
		}
		const parts = name.split(".")

		// Specified namespace
		if (parts.length > 1 && parts[1] !== "") {
			newName.namespace = parts[1]
		}

		return newName
	}
}
