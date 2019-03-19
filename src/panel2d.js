import {Mesh, BoxBufferGeometry, MeshLambertMaterial,
    Color, DirectionalLight, AmbientLight,
    TextureLoader, AudioListener, Audio, AudioLoader,
    Object3D,
    CanvasTexture, PlaneGeometry, MeshBasicMaterial,
    BoxGeometry,
    Vector3, BackSide, Vector2,
    SphereGeometry,
} from "../node_modules/three/build/three.module.js"


import {POINTER_RELEASE, POINTER_CLICK, POINTER_ENTER, POINTER_EXIT, POINTER_PRESS, POINTER_MOVE} from '../node_modules/webxr-boilerplate/Pointer.js'

// const $ = (sel) => document.querySelector(sel)
const on = (elem, type, cb) => elem.addEventListener(type,cb)
// const toRad = (deg) => deg * Math.PI/180

export default class Panel2D extends Object3D {
    constructor(scene,camera) {
        super()

        if(!scene) throw new Error("cannot pass empty scene to Panel2D()")
        if(!camera) throw new Error("cannot pass empty camera to Panel2D()")
        this.type = 'panel2d'
        this.listeners = {}
        this.scene = scene
        this.camera = camera
        this.canvas = document.createElement('canvas')
        this.canvas.width = 256
        this.canvas.height = 512
        this.canvasTexture = new CanvasTexture(this.canvas)
        this.redrawHandler = (e) => this.redraw()

        const c = this.canvas.getContext('2d')
        c.fillStyle = 'red'
        c.fillRect(0,0,this.canvas.width,this.canvas.height)

        this.mesh = new Mesh(
            new PlaneGeometry(1,2),
            new MeshBasicMaterial({color:'white',map:this.canvasTexture})
        )
        this.mesh.userData.clickable = true
        this.comps = []

        this.add(this.mesh)

        let inside = null
        on(this.mesh,POINTER_MOVE,(e)=>{
            const uv = e.intersection.uv
            const fpt = new Vector2(uv.x*256, 512-uv.y*512)
            if(inside && !inside.contains(fpt)) {
                inside.fire(POINTER_EXIT)
                inside = null
            }
            const comp = this.findAt(fpt)
            // for(let i=0; i<this.comps.length; i++) {
            //     const comp = this.comps[i]
            //     if(comp.contains(fpt)) {
            if(inside !== comp){
                if(inside) inside.fire(POINTER_EXIT)
                inside = null
            }
            if(comp) comp.fire(POINTER_ENTER)
            inside = comp
            // }
            // }
        })
        on(this.mesh,POINTER_CLICK,(e)=>{
            const uv = e.intersection.uv
            const fpt = new Vector2(uv.x*256, 512-uv.y*512)
            const comp = this.findAt(fpt)
            if(comp) comp.fire(POINTER_CLICK)
            // for(let i=0; i<this.comps.length; i++) {
            //     const comp = this.comps[i]
            //     if(comp.contains(fpt)) {
            //         comp.fire(POINTER_CLICK)
            //     }
            // }
        })

        this.header = new Mesh(
            new BoxGeometry(1.0,0.1,0.1),
            new MeshBasicMaterial({color:'goldenrod'})
        )
        this.header.userData.clickable = true
        this.header.position.set(0,1.1,0)
        this.add(this.header)

        on(this.header,POINTER_ENTER, e => this.header.material.color.set('yellow'))
        on(this.header,POINTER_EXIT,  e => this.header.material.color.set('goldenrod'))
        on(this.header,POINTER_PRESS, e => this.startDrag())
    }

    fire(type,payload) {
        if(!this.listeners[type]) this.listeners[type] = []
        this.listeners[type].forEach(cb => cb(payload))
    }

    findAt(pt) {
        for(let i=0; i<this.comps.length; i++) {
            const comp = this.comps[i]
            const res = comp.findAt({x:pt.x-comp.x,y:pt.y-comp.y})
            if(res) return res
        }
        return null
    }

    add(comp) {
        if(comp instanceof Object3D) {
            super.add(comp)
        } else {
            this.comps.push(comp)
            on(comp, 'changed', this.redrawHandler)
        }
    }

    redraw() {
        const ctx = this.canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
        this.comps.forEach(comp => comp.draw(ctx))
        this.canvasTexture.needsUpdate = true
    }

    startDrag() {
        this.header.userData.clickable = false
        this.mesh.userData.clickable = false

        this.dragSphere = new Mesh(
            new SphereGeometry(4,32,32),
            new MeshLambertMaterial({
                color:'green',
                wireframe:true,
                side: BackSide
            })
        )
        this.dragSphere.userData.clickable = true
        this.scene.add(this.dragSphere)

        on(this.dragSphere,POINTER_MOVE,(e)=> this.moveDrag(e))
        on(this.dragSphere,POINTER_RELEASE,(e)=> this.endDrag(e))

    }
    endDrag() {
        this.scene.remove(this.dragSphere)
        this.dragSphere.userData.clickable = false
        this.header.userData.clickable = true
        this.mesh.userData.clickable = true
    }


    moveDrag(e) {
        this.position.copy(e.point)
        this.position.add(new Vector3(0,-1,0))
        this.lookAt(this.camera.position)
    }
}
