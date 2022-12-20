
// A structure containing all continuous input for a given frame of the game
export class UserCommand {
  constructor(side, forward, rot)
  {
    this.side = side;
    this.forward = forward;
    this.rot = rot;
  }
}
