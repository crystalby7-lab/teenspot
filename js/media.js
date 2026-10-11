// 사진 압축: 가운데를 비율에 맞게 자르고, 크기를 줄여 JPEG로 다시 저장해요.
// 다시 저장하면서 촬영 위치(GPS) 같은 사진 정보도 함께 지워져요.
(function () {
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이 사진 형식은 올릴 수 없어요. JPG나 PNG로 올려주세요")); };
      img.src = url;
    });
  }
  // ratio = 가로/세로 (3:4 → 0.75), maxW = 결과 가로 픽셀, maxChars = 결과 데이터 길이 상한
  async function compress(file, ratio, maxW, maxChars) {
    if (!file || !/^image\//.test(file.type || "image/")) throw new Error("사진 파일만 올릴 수 있어요");
    const img = await loadImage(file);
    const iw = img.naturalWidth, ih = img.naturalHeight;
    let sw = iw, sh = Math.round(iw / ratio);
    if (sh > ih) { sh = ih; sw = Math.round(ih * ratio); }
    const sx = Math.round((iw - sw) / 2), sy = Math.round((ih - sh) / 2);
    let w = Math.min(maxW, sw);
    for (let attempt = 0; attempt < 4; attempt++) {
      const h = Math.round(w / ratio);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h);
      g.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      for (let q = 0.82; q >= 0.5; q -= 0.08) {
        const data = c.toDataURL("image/jpeg", q);
        if (data.length <= maxChars) return data;
      }
      w = Math.round(w * 0.8);
    }
    throw new Error("사진 용량이 너무 커요. 다른 사진을 골라주세요");
  }
  window.TSMedia = { compress };
})();
