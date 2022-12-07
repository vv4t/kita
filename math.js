
export class Vector2 {
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  }
  
  add(v)
  {
    this.x += v.x;
    this.y += v.y;
    
    return this;
  }
  
  rotate(angle)
  {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    
    const rotX = this.x;
    const rotY = this.y;
    
    this.x = rotX * cosAngle - rotY * sinAngle;
    this.y = rotX * sinAngle + rotY * cosAngle;
    
    return this;
  }
  
  copy()
  {
    return new Vector2(x, y);
  }
};

export function degToRad(degAngle)
{
  return degAngle * Math.PI / 2.0;
}

export function clamp(value, rangeMin, rangeMax)
{
  return Math.max(Math.min(value, rangeMax), rangeMin);
}

export function rand()
{
  return Math.random() - 0.5;
}
