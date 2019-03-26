import Component2D from './component2d.js'

export default class Label2D extends Component2D {
    constructor() {
        super()
        this.type = 'label'
        this.text = 'foo'
        this.fsize = 30
        this.x = 0
        this.y = 0
        this.w = this.text.length*this.fsize
        this.h = 20
    }
    draw(ctx) {
        const metrics = ctx.measureText(this.text)
        this.w = 5 + metrics.width + 5
        this.h = 2 + this.fsize + 2
        ctx.font = `${this.fsize}px sans-serif`
        ctx.fillStyle = 'black'
        ctx.fillText(this.text,this.x+3,this.y+this.fsize)
    }
    contains() {
        return false
    }
    findAt() {
        return null
    }
}
