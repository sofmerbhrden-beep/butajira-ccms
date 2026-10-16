import { api } from "./api.js";

function base64ToFile(base64, filename = "photo.jpg") {
  try {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++)
      ia[i] = byteString.charCodeAt(i);
    return new File([ab], filename, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

export async function lookupTin(tin) {
  const data = await api.businessRegistration(tin);
  return {
    ...data,
    photoFile: data.photoBase64
      ? base64ToFile(data.photoBase64, `photo_${tin}.jpg`)
      : null,
  };
}
