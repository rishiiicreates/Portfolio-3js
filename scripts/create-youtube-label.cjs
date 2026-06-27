const { createCanvas } = require('canvas')   // npm install canvas
const fs = require('fs')

const canvas = createCanvas(512, 128)
const ctx = canvas.getContext('2d')
ctx.clearRect(0, 0, 512, 128)
ctx.fillStyle = '#ffffff'
ctx.font = 'bold 64px "Comic Neue", cursive'  // match Bruno's font
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText('Youtube', 256, 64)
fs.writeFileSync('static/models/information/static/contactYoutubeLabel.png',
    canvas.toBuffer('image/png'))
