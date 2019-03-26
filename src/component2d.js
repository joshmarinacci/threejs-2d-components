export default class Component2D {
    constructor() {
        this.listeners = {}
    }
    set(key,value) {
        this[key] = value
        this.fire('changed',{type:'changed',target:this})
        return this
    }
    get(key) {
        return this[key]
    }
    addEventListener(type,cb) {
        if(!this.listeners[type]) this.listeners[type] = []
        this.listeners[type].push(cb)
        return this
    }
    removeEventListener(type,cb) {
        if(!this.listeners[type]) this.listeners[type] = []
        const n = this.listeners[type].indexOf(cb)
        if(n >= 0) this.listeners[type].splice(n,1)
    }
    on(type,cb) {
        this.addEventListener(type,cb)
        return this
    }
    setAll(props) {
        Object.keys(props).forEach(key => this.set(key, props[key]))
        return this
    }
    fire(type,payload) {
        if(!this.listeners[type]) this.listeners[type] = []
        this.listeners[type].forEach(cb => cb(payload))
    }

}