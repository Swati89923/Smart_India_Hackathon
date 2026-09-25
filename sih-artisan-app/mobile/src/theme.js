// Design tokens — same palette as web/src/styles.css (SIH26090 mockup):
// green = artisan / primary, blue = buyer, navy = headings, saffron accent on warm cream.
export const C = {
  green: "#2F7D4A",
  greenDark: "#24663B",
  greenSoft: "#E7F3EA",
  blue: "#1F5FBF",
  blueDark: "#174A96",
  blueSoft: "#E8F0FB",
  orange: "#E07A2E",
  orangeSoft: "#FDF0E3",
  red: "#D9463B",
  redSoft: "#FCEBEA",
  teal: "#13908F",
  tealSoft: "#E3F4F4",
  purple: "#7C4DCC",
  purpleSoft: "#F1EBFB",
  navy: "#1F3A6B",
  brown: "#8B3A1A",
  bg: "#FBF8F3",
  bgWarm: "#FDF3E7",
  bgBlue: "#F5F8FC",
  card: "#FFFFFF",
  border: "#E7E1D7",
  borderStrong: "#D6CEBF",
  ink: "#1E2A36",
  muted: "#6B7280",
  white: "#FFFFFF",
};

export const TONES = {
  green: { bg: C.greenSoft, fg: C.greenDark },
  blue: { bg: C.blueSoft, fg: C.blueDark },
  orange: { bg: C.orangeSoft, fg: "#A8541A" },
  red: { bg: C.redSoft, fg: "#B3342A" },
  gray: { bg: "#F0EEEA", fg: "#57534E" },
  teal: { bg: C.tealSoft, fg: C.teal },
  purple: { bg: C.purpleSoft, fg: C.purple },
};

export const R = { sm: 8, md: 12, lg: 16, pill: 999 };

export const shadow = {
  shadowColor: "#1E2A36",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
};
