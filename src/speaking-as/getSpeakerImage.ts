import module from '../module';

const cssTokenThumbnail = module.cssPrefix.child('token-thumbnail');

const getSpeakerImage = (imageSource: string | null | undefined) => {
  const img = document.createElement('img');
  img.src = imageSource || foundry.CONST.DEFAULT_TOKEN;
  img.classList.add(cssTokenThumbnail);
  return img.outerHTML;
};

export default getSpeakerImage;
