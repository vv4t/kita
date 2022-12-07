"use strict";

export class Bitmap {
  constructor(width, height)
  {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement("CANVAS");
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext("2d");
    this.data = this.ctx.getImageData(0, 0, width, height);
    this.dataU8 = new Uint8Array(this.data.data.buffer);
    
    for (let i = 0; i < this.dataU8.length; i += 4)
      this.dataU8[i + 3] = 255;
  }
  
  putRGB(x, y, r, g, b)
  {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height)
      return;
    
    const i = (x + y * this.width) * 4;
    
    this.dataU8[i + 0] = r;
    this.dataU8[i + 1] = g;
    this.dataU8[i + 2] = b;
  }
  
  swap()
  {
    this.ctx.putImageData(this.data, 0, 0);
  }
};
