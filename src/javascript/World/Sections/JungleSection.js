import * as THREE from 'three'

export default class JungleSection
{
    constructor(_options)
    {
        // Options
        this.time = _options.time
        this.resources = _options.resources
        this.objects = _options.objects
        this.areas = _options.areas
        this.debug = _options.debug
        this.x = _options.x
        this.y = _options.y

        // Set up
        this.container = new THREE.Object3D()
        this.container.matrixAutoUpdate = false
        this.container.updateMatrix()

        this.setWorld()
    }

    setWorld()
    {
        const base = new THREE.Group()
        const collision = new THREE.Group()

        // Geometries (Rotate all to align with Z-up, translate along Z)
        
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 5)
        trunkGeo.rotateX(Math.PI * 0.5) // align to Z
        trunkGeo.translate(0, 0, 0.75) // base at Z=0
        
        const leavesGeo = new THREE.ConeGeometry(1.2, 2.5, 7)
        leavesGeo.rotateX(Math.PI * 0.5)
        leavesGeo.translate(0, 0, 2.5)

        const treeColGeo = new THREE.CylinderGeometry(0.3, 0.3, 3, 5)
        treeColGeo.rotateX(Math.PI * 0.5)
        treeColGeo.translate(0, 0, 1.5)

        const grassGeo = new THREE.ConeGeometry(0.1, 0.3, 3)
        grassGeo.rotateX(Math.PI * 0.5)
        grassGeo.translate(0, 0, 0.15)

        const pondGeo = new THREE.CylinderGeometry(4, 4, 0.1, 12)
        pondGeo.rotateX(Math.PI * 0.5)
        pondGeo.translate(0, 0, 0.05)

        const roadGeo = new THREE.PlaneGeometry(10, 10)
        // Plane is natively on X-Y, which is the ground! So we don't need to rotate it!
        // Wait, PlaneGeometry normal is Z! So it's already aligned to the ground!

        const boxGeo = new THREE.BoxGeometry(1, 1, 1)
        // Box is 1x1x1, so no rotation needed, just translate Z
        boxGeo.translate(0, 0, 0.5)

        // Helper to add static objects
        const addStatic = (geo, matName, x, y, sX, sY, sZ, rotZ, collide = true) => {
            const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial())
            mesh.name = matName
            mesh.position.set(x, y, 0) // Ground is X, Y. Height is Z (already translated).
            mesh.scale.set(sX, sY, sZ)
            if (rotZ) mesh.rotation.z = rotZ // Rotate around Z (up) axis
            base.add(mesh)

            if (collide) {
                const cMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ visible: false }))
                cMesh.position.copy(mesh.position)
                cMesh.scale.copy(mesh.scale)
                cMesh.rotation.copy(mesh.rotation)
                collision.add(cMesh)
            }
        }

        const addTree = (tx, ty) => {
            const scale = 0.5 + Math.random() * 1.5
            // Trunk
            const trunkMesh = new THREE.Mesh(trunkGeo, new THREE.MeshBasicMaterial())
            trunkMesh.name = 'shadeBrown'
            trunkMesh.position.set(tx, ty, 0)
            trunkMesh.scale.set(scale, scale, scale)
            trunkMesh.rotation.z = Math.random() * Math.PI
            base.add(trunkMesh)
            // Leaves
            const leavesMesh = new THREE.Mesh(leavesGeo, new THREE.MeshBasicMaterial())
            leavesMesh.name = 'shadeGreen'
            leavesMesh.position.copy(trunkMesh.position)
            leavesMesh.scale.copy(trunkMesh.scale)
            leavesMesh.rotation.copy(trunkMesh.rotation)
            base.add(leavesMesh)
            // Collision
            const cMesh = new THREE.Mesh(treeColGeo, new THREE.MeshBasicMaterial({ visible: false }))
            cMesh.position.copy(trunkMesh.position)
            cMesh.scale.copy(trunkMesh.scale)
            cMesh.rotation.copy(trunkMesh.rotation)
            collision.add(cMesh)
        }

        const inProtectedArea = (x, y) => {
            // Adjust bounds (Y is forward/backward ground coordinate)
            if (x > -20 && x < 20 && y > -20 && y < 20) return true; // Intro
            if (x > -20 && x < 20 && y > -50 && y < -10) return true; // Crossroads
            if (x > 10 && x < 70 && y > -50 && y < -10) return true; // Projects
            if (x > -60 && x < -20 && y > -60 && y < -10) return true; // Playground
            if (x > -15 && x < 15 && y > -70 && y < -40) return true; // Information
            return false;
        }

        // BOUNDARIES (Size: 300x300, from -150 to 150)
        // Walls scale: sX, sY, sZ (Z is height)
        addStatic(boxGeo, 'shadeBlack', 0, -150, 300, 2, 20, 0)
        addStatic(boxGeo, 'shadeBlack', 0, 150, 300, 2, 20, 0)
        addStatic(boxGeo, 'shadeBlack', -150, 0, 2, 300, 20, 0)
        addStatic(boxGeo, 'shadeBlack', 150, 0, 2, 300, 20, 0)

        // STRUCTURES & PONDS
        const structMats = ['shadeGray', 'shadePurple', 'shadeEmeraldGreen', 'shadeYellow']
        for(let i=0; i<150; i++) {
            const x = (Math.random() - 0.5) * 280
            const y = (Math.random() - 0.5) * 280
            if(inProtectedArea(x, y)) continue

            if(Math.random() > 0.7) {
                // Pond (scale: x, y, z)
                addStatic(pondGeo, 'shadeBlue', x, y, 1 + Math.random()*2, 1 + Math.random()*2, 1, 0, false)
            } else {
                // Structure
                const w = 2 + Math.random() * 8
                const d = 2 + Math.random() * 8
                const h = 5 + Math.random() * 25
                const mat = structMats[Math.floor(Math.random() * structMats.length)]
                addStatic(boxGeo, mat, x, y, w, d, h, Math.random() * Math.PI)
            }
        }

        // TREES & GRASS
        for(let i=0; i<1500; i++) {
            const x = (Math.random() - 0.5) * 280
            const y = (Math.random() - 0.5) * 280
            if(inProtectedArea(x, y)) continue
            
            if(Math.random() > 0.5) {
                addTree(x, y)
            } else {
                addStatic(grassGeo, 'shadeGreen', x, y, 1, 1, 1, 0, false)
            }
        }

        // ROADS (Procedural grid)
        for(let i = -14; i <= 14; i++) {
            for(let j = -14; j <= 14; j++) {
                const x = i * 10
                const y = j * 10
                if(inProtectedArea(x, y)) continue
                
                if(Math.random() > 0.8) {
                    const rMesh = new THREE.Mesh(roadGeo, new THREE.MeshBasicMaterial())
                    rMesh.name = 'shadeGray'
                    rMesh.position.set(x, y, 0.05) // Z is height, so slightly above ground
                    base.add(rMesh)
                }
            }
        }

        this.objects.add({
            base: base,
            collision: collision,
            offset: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
            mass: 0
        })
    }
}
