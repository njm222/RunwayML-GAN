// CODE TAKEN FROM https://editor.p5js.org/codingtrain/sketches/K6l0JbS6u
// and https://editor.p5js.org/codingtrain/sketches/KVXguIFNg
// by the coding train / Daniel Shiffman (https://www.youtube.com/watch?v=QzRW0xzm10c&t=6622s)

let outputImage;

const n = [];
const imgSize = 512; //our image will be 512x512 pixels, which is what StyleGAN requires


//let amt = 0.0; //unused?
let angle = 0;
let count = 0;

function setup() {
    createCanvas(2048, 2048);
    for (let i = 0; i < imgSize; i++) {
        n[i] = new NoiseLoop(20, -1, 1); //diameter, min, max
    }
    generateImage();
}


function generateImage() {
    const path = "http://localhost:8000/query"; //the default path used by Runway / StyleGAN for receiving post requests
    //a is loaded via the data js array and represents our initial starting vector / latent space image representation from which we sample to get random new images.
    for (let i = 0; i < imgSize; i++) { //loop through all pixels, and select the corresponding value for the vector with the randomness generated from our Noise Loop function
        a[i] = n[i].value(angle);
    }
    //amt += 0.05; //unused?
    let da = (2*Math.PI) / (24*60); //MH - not sure why these values are used (1440 = 360*4)
    angle += da;

    const data = {
        z: a, //generated latent space vector
        truncation: 0.2, //variation in image generations - higher is more random, lower is more similar
    };
    httpPost(path, 'json', data, generateUpscaledImage, gotError); // change the gotImage callback to another Post request that gets the upscalled image
}

function generateUpscaledImage(results) {
    /*const path = "http://localhost:8001/query"; //the default path used by Runway / StyleGAN for receiving post requests

    const data = {
        image: image.image
    };

    httpPost(path, 'json', data, gotImage, gotError); // change the gotImage callback to another Post request that gets the upscalled image*/

    console.log(results);
    const path = "http://localhost:8001/data";
    httpGet(path, 'json', gotImage, gotError);
}

function gotError(error) { //if the generate image post request fails
    console.error(error);
}


function gotImage(result) { //called once generate image has received a response
    outputImage = createImg(result.image, imageReady);
    outputImage.hide();
}


function imageReady() { //saves the image
    image(outputImage, 0, 0);
    //save(`outputImage${nf(count, 4)}`); //nf formats numbers to strings //if you don't want to output to Runway, you can save the images straight from processing by uncommenting this line.
    count++;
    if (angle <= Math.PI*2) { //once we have traversed all pixels, generated a new image
        setTimeout(generateImage, 100);
    }
}

class NoiseLoop { //introduces the randomness we need to generate images from the latent space
    constructor(diameter, min, max) {
        this.diameter = diameter;
        this.min = min;
        this.max = max;
        this.cx = random(1000);
        this.cy = random(1000);
    }

    value(a) {
        let xoff = map(cos(a), -1, 1, this.cx, this.cx + this.diameter);
        let yoff = map(sin(a), -1, 1, this.cy, this.cy + this.diameter);
        let r = toxi.math.noise.simplexNoise.noise(xoff,yoff); //requires toxic libs library
        return map(r, -1, 1, this.min, this.max);
    }
}