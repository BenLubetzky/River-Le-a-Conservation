// Photos of the Rio Leça used around the site, from Wikimedia Commons. Their licences need the
// author credited (shown in the footer). Each has a full-width version and an 800px "-sm" one.

export type PhotoName =
  | "rio-leca-bosque" | "rio-leca-balio" | "ponte-sao-lazaro" | "rio-leca-moinho"
  | "rio-leca-margem" | "rio-leca-verde" | "rio-leca-ponte" | "rio-leca-caminho";

export const photo = (name: PhotoName, small = false) => `/photos/${name}${small ? "-sm" : ""}.jpg`;

export const PHOTO_CREDITS: { name: PhotoName; title: string; author: string; license: string; source: string }[] = [
  { name: "rio-leca-bosque", title: "Rio Leça V", author: "Pedro from Maia", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Rio_Le%C3%A7a_V_(48848157167).jpg" },
  { name: "rio-leca-balio", title: "Rio Leça em Leça do Balio", author: "Joseolgon", license: "CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Rio_Le%C3%A7a_em_Le%C3%A7a_do_Balio.jpg" },
  { name: "ponte-sao-lazaro", title: "Ponte de São Lázaro", author: "Pedro from Maia", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Ponte_de_S%C3%A3o_L%C3%A1zaro_(48795321928).jpg" },
  { name: "rio-leca-moinho", title: "Rio Leça IV", author: "Pedro from Maia", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Rio_Le%C3%A7a_IV_(48847604408).jpg" },
  { name: "rio-leca-margem", title: "Rio Leça III", author: "Pedro from Maia", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Rio_Le%C3%A7a_III_(48848157872).jpg" },
  { name: "rio-leca-verde", title: "Rio Leça XIII", author: "Pedro from Maia", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Rio_Le%C3%A7a_XIII_(48851936671).jpg" },
  { name: "rio-leca-ponte", title: "Over the Leça River", author: "Pedro from Maia", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Over_the_Le%C3%A7a_River_(48795819162).jpg" },
  { name: "rio-leca-caminho", title: "Rio Leça VI", author: "Pedro from Maia", license: "CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Rio_Le%C3%A7a_VI_(48847963941).jpg" },
];
