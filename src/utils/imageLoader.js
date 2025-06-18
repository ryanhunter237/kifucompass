import black00 from "../assets/stones/black00_128.png";
import black01 from "../assets/stones/black01_128.png";
import black02 from "../assets/stones/black02_128.png";
import black03 from "../assets/stones/black03_128.png";
import white00 from "../assets/stones/white00_128.png";
import white01 from "../assets/stones/white01_128.png";
import white02 from "../assets/stones/white02_128.png";
import white03 from "../assets/stones/white03_128.png";
import white04 from "../assets/stones/white04_128.png";
import white05 from "../assets/stones/white05_128.png";
import white06 from "../assets/stones/white06_128.png";
import white07 from "../assets/stones/white07_128.png";
import white08 from "../assets/stones/white08_128.png";
import white09 from "../assets/stones/white09_128.png";
import white10 from "../assets/stones/white10_128.png";

const blackSources = [black00, black01, black02, black03];
const whiteSources = [
  white00,
  white01,
  white02,
  white03,
  white04,
  white05,
  white06,
  white07,
  white08,
  white09,
  white10,
];

export function createImages(srcArr) {
  return srcArr.map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });
}

export const blackImages = createImages(blackSources);
export const whiteImages = createImages(whiteSources);
