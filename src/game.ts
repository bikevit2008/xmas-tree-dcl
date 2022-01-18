import * as utils from '@dcl/ecs-scene-utils'

// let ip = 'test-xmas.maff.io'
// const ws = new WebSocket(`wss://${ip}:3000`);


const sceneMessageBus = new MessageBus()



// ws.onmessage = (message) => {
//   let { data } = message
//   try {
//     let parsedJSON = JSON.parse(data)
//     if (parsedJSON.groups) {
//       initBalls(parsedJSON.groups)
//     }
//   }
//   catch (e) {

//   }

// }
const wsEntity = new Entity()
engine.addEntity(wsEntity)

let ws:any

function connect() {
  // let ip = 'test-xmas.maff.io'
  let ip = 'xmas.maff.io'

  ws = new WebSocket(`wss://${ip}:3000`);  ws.onopen = function() {
  };

  ws.onmessage = function(message) {
      let { data } = message
      try {
        let parsedJSON = JSON.parse(data)
        if (parsedJSON.groups) {
          initBalls(parsedJSON.groups)
        }
      }
      catch (e) {

      }
  };

  ws.onclose = function(e) {
    log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);

    wsEntity.addComponent(
      new utils.Delay(2000, () => {
        log('Reconnect', e.reason);
        connect();
      })
    )
    // new utils.Delay(1000, function() {
    //   log('Reconnect', e.reason);
    //   connect();
    // });
  };

  ws.onerror = function(err) {
    ws.close();
  };
}

connect();


function randomInteger(min: number, max: number) {
  // получить случайное число от (min-0.5) до (max+0.5)
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

//add floor
let Floor = new Entity()
Floor.addComponent(new PlaneShape())
let FloorColor = new Material()
FloorColor.albedoColor = Color3.White()
FloorColor.metallic = 0.1
// FloorColor.roughness = 0.1
Floor.addComponent(new Transform
  ({
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(16, 16, 16)
  }))
Floor.addComponent(FloorColor)
engine.addEntity(Floor)


//add tree
const tree = new Entity("tree")
tree.addComponent(new GLTFShape("models/TreeOpt.glb"))
tree.addComponent(new Transform({
  position: new Vector3(8, 0.01, 8),
}))
engine.addEntity(tree)


// const screenTransform = new Entity()
// screenTransform.addComponent(new Transform({ position: new Vector3(3, 2.8, 0) }))
// screenTransform.getComponent(Transform).rotate(Vector3.Right(), 0)
// engine.addEntity(screenTransform) scale: new Vector3(19.2, 10.8, 1)

const screen = new Entity()
screen.addComponent(new PlaneShape())
screen.addComponent(new Transform({position: new Vector3(8, 5, 1)}))
// screen.addComponent(new Transform({ position: new Vector3(1, 2, 1), scale:new Vector3(192, 108, 1) }))
// screen.getComponent(Transform).scale.setAll(0.3)
let StartSize = new Vector3(1, 1, 1)
let EndSize = new Vector3(15, 7, 1)

// Move entity
screen.addComponent(new utils.ScaleTransformComponent(StartSize, EndSize, 0))
// screen.getComponent(Transform).rotate(Vector3.Up(), 180)
// screen.setParent(screenTransform)

// screenTransform.getComponent(Transform).scale.setAll(0.3) // You can change the scale of the screen here...

// Video stream link from Vimeo
// const videoClip = new VideoClip("https://player.vimeo.com/external/659639462.m3u8?s=7ec2fe64f07cc7cddc24afdb17db32444cb4fc31")
const videoClip = new VideoClip("https://qlbao8oxmuv.a.trbcdn.net/livemaster/mjv6e_live-5y7frv6x31h.smil/playlist.m3u8")

const videoTexture = new VideoTexture(videoClip)
videoTexture.play()
videoTexture.loop = true

// // Adjust screen material to increase the brightness and clarity
const screenMaterial = new Material()
screenMaterial.albedoTexture = videoTexture
screenMaterial.emissiveTexture = videoTexture
screenMaterial.emissiveColor = Color3.White()
screenMaterial.emissiveIntensity = 0.6
screenMaterial.roughness = 1.0
screen.addComponent(screenMaterial)
engine.addEntity(screen)


// screen.addComponent(
//   new utils.TriggerComponent(
//     new utils.TriggerBoxShape(new Vector3(8, 3, 8), new Vector3(0, 0, 0)), {
//     onCameraEnter: () => videoTexture.play(),
//     onCameraExit: () => videoTexture.pause()
//   }
//   )
// )

function initBalls(groups: any) {
  //coords for all balls
  //x,y,z
  let coordsLines = JSON.parse('[[0.56277,0.347129,1.3156],[0.73099,0.288841,0.748654],[0.032913,0.301703,2.35702],[-0.42075,0.431363,1.34633],[-0.216606,0.683872,0.74109],[-0.661474,0.2753,0.760409],[-0.570394,-0.359392,1.3156],[-0.739836,-0.304758,0.748654],[-0.203129,-0.172545,2.36687],[0.414718,-0.422322,1.34633],[0.34169,-0.674765,0.745954],[0.701582,-0.309508,0.803555],[-0.203129,-0.172545,2.36687],[-0.203129,-0.172545,2.36687],[-0.450067,0.021775,1.91601],[0.452819,-0.051587,1.84542],[-0.049417,-0.523841,1.71844],[0.10714,-0.173099,2.51788],[0.115318,0.51482,1.68184]]')

  for (let i = 0; i < 19 - 1; i += 3) {

    let group = i / 3
    let { red, green, blue } = groups[`setAllLedsGroup${group}`]
    red = red / 255
    green = green / 255
    blue = blue / 255

    let color = new Color3(red, green, blue)

    const myMaterial = new Material()
    myMaterial.albedoColor = color

    for (let j = 0; j < 3; j++) {
      //xzy
      let x = coordsLines[i + j][0]
      let y = coordsLines[i + j][2]
      let z = coordsLines[i + j][1]


      let sphere = setSphere(x, y, z, myMaterial, group)

      /// --- Receive messages ---
      sceneMessageBus.on(`setAllLedsGroup${group}`, (payload) => {
        let { red, green, blue } = payload
        myMaterial.albedoColor = new Color3(red, green, blue)
        sphere.addComponentOrReplace(myMaterial)
      })
      if (i === 15 && j === 2) {
        let x = coordsLines[i + j + 1][0]
        let y = coordsLines[i + j + 1][2]
        let z = coordsLines[i + j + 1][1]
        let sphere = setSphere(x, y, z, myMaterial, group)
        sphere.addComponentOrReplace(myMaterial)
      }




    }
  }
}




function setSphere(x: number, y: number, z: number, myMaterial: Material, group: number) {
  const sphereShape = new SphereShape()
  const sphere = new Entity()
  sphere.addComponent(sphereShape)
  sphere.addComponent(myMaterial)
  sphere.addComponent(new Transform({ position: new Vector3(x, y, z), scale: new Vector3(0.187, 0.187, 0.187) }))
  sphere.setParent(tree)


  sphere.addComponent(
    new OnPointerDown(
      (e) => {

        let { r, g, b } = setRandomLightColor()
        ws.send(JSON.stringify({ method: `setAllLedsGroup${group}`, data: { red: r, green: g, blue: b } }))
        let emissiveK = 0

        r = r / 255 + emissiveK
        g = g / 255 + emissiveK
        b = b / 255 + emissiveK
        myMaterial.albedoColor = new Color3(r, g, b)
        sceneMessageBus.emit(`setAllLedsGroup${group}`, { red: r, green: g, blue: b })
        sphere.addComponentOrReplace(myMaterial)

      },
      { button: ActionButton.PRIMARY }
    )
  )

  return sphere
}



function setRandomLightColor() {
  var r = randomInteger(0, 255)
  var g = randomInteger(0, 255)
  var b = randomInteger(0, 255)



  return { r, g, b }
}

