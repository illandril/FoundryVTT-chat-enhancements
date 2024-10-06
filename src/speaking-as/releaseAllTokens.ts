const releaseAllTokens = () => {
  if (game.canvas.tokens?.controlled) {
    for (const token of game.canvas.tokens.controlled) {
      token.release();
    }
  }
};

export default releaseAllTokens;
