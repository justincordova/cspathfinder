/**
 * Common abbreviations, nicknames, and alternate names for schools.
 * Keys must match the slug field in schools.json exactly.
 * Values are lowercase aliases to match against search queries.
 * The school's own name/city/state/slug fields are already searched — only add things
 * that differ meaningfully from those fields.
 */
export const SCHOOL_ALIASES: Record<string, string[]> = {
  // ── A ─────────────────────────────────────────────────────────────────
  alabama: ["bama", "crimson tide", "roll tide"],
  asu: ["arizona state", "sun devils", "tempe"],
  auburn: ["war eagle", "tigers"],

  // ── B ─────────────────────────────────────────────────────────────────
  baylor: ["bears", "waco"],
  "boston-u": ["bu", "terriers", "beantown"],
  brown: ["brunonians"],

  // ── C ─────────────────────────────────────────────────────────────────
  caltech: ["cal tech", "california tech", "cit"],
  "carnegie-mellon": ["cmu", "carnegie mellon university", "tartans"],
  "case-western": ["cwru", "case", "spartan"],
  clemson: ["tigers"],
  columbia: ["columbia nyc", "lions"],
  cornell: ["big red", "cu"],
  csu: ["colorado state", "rams", "fort collins"],
  "cu-boulder": ["cu", "buffaloes", "colorado boulder", "university of colorado"],

  // ── D ─────────────────────────────────────────────────────────────────
  dartmouth: ["big green", "hanover"],
  delaware: ["ud", "blue hens", "fightin blue hens"],
  duke: ["blue devils"],

  // ── E ─────────────────────────────────────────────────────────────────
  emory: ["eagles"],

  // ── F ─────────────────────────────────────────────────────────────────
  fsu: ["seminoles", "noles", "florida state", "tallahassee"],

  // ── G ─────────────────────────────────────────────────────────────────
  "george-mason": ["gmu", "mason", "patriots", "fairfax"],
  "georgia-tech": ["gt", "gatech", "ga tech", "yellow jackets"],
  gwu: ["gw", "george washington", "colonials"],

  // ── H ─────────────────────────────────────────────────────────────────
  harvard: ["crimson"],

  // ── I ─────────────────────────────────────────────────────────────────
  iit: ["illinois tech", "illinois institute of technology", "chicago tech"],
  indiana: ["iu", "hoosiers", "bloomington"],
  iowa: ["hawkeyes", "iowa city"],
  "iowa-state": ["isu", "cyclones", "ames"],

  // ── J ─────────────────────────────────────────────────────────────────
  "johns-hopkins": ["jhu", "hopkins", "blue jays"],

  // ── K ─────────────────────────────────────────────────────────────────
  kstate: ["k-state", "kansas state", "wildcats", "manhattan ks"],
  ku: ["kansas", "jayhawks", "lawrence ks"],

  // ── L ─────────────────────────────────────────────────────────────────
  lehigh: ["mountain hawks", "bethlehem"],
  lsu: ["tigers", "baton rouge", "louisiana state"],

  // ── M ─────────────────────────────────────────────────────────────────
  michigan: ["umich", "wolverines", "ann arbor", "u of m"],
  "michigan-state": ["msu", "spartans", "east lansing"],
  mines: ["csm", "colorado mines", "orediggers", "golden co"],
  mit: ["massachusetts institute of technology"],
  mizzou: ["missouri", "tigers", "columbia mo"],

  // ── N ─────────────────────────────────────────────────────────────────
  "nc-state": ["ncsu", "wolfpack", "raleigh", "north carolina state"],
  ncat: ["nc a&t", "north carolina a&t", "aggies", "greensboro"],
  njit: ["nj tech", "new jersey tech", "new jersey institute of technology", "highlanders"],
  northeastern: ["neu", "huskies"],
  northwestern: ["nu", "wildcats", "evanston"],
  "notre-dame": ["nd", "fighting irish", "south bend"],
  nyu: ["new york u", "violets"],

  // ── O ─────────────────────────────────────────────────────────────────
  "ohio-state": ["osu", "buckeyes", "columbus"],
  okstate: ["osu", "cowboys", "stillwater", "oklahoma state"],
  "oregon-state": ["osu", "beavers", "corvallis"],
  ou: ["oklahoma", "sooners", "norman ok"],

  // ── P ─────────────────────────────────────────────────────────────────
  "penn-state": ["psu", "nittany lions", "state college", "happy valley"],
  pitt: ["panthers", "pittsburgh"],
  princeton: ["tigers"],
  purdue: ["boilermakers", "west lafayette"],

  // ── R ─────────────────────────────────────────────────────────────────
  rice: ["owls", "houston tx"],
  rit: ["rochester tech", "rochester institute of technology", "tigers"],
  rochester: ["u of r", "yellowjackets"],
  rpi: ["rensselaer", "rensselaer polytechnic", "troy ny"],
  rutgers: ["scarlet knights", "rug"],

  // ── S ─────────────────────────────────────────────────────────────────
  stanford: ["su", "the farm", "cardinal", "palo alto"],
  stevens: ["sit", "stevens tech", "hoboken"],
  "stony-brook": ["sbu", "suny stony brook", "stonybrook"],
  syracuse: ["cuse", "orange"],

  // ── T ─────────────────────────────────────────────────────────────────
  tamu: ["texas a&m", "texas a and m", "a&m", "aggies", "college station"],
  temple: ["owls"],
  tufts: ["jumbos", "medford"],
  tulane: ["green wave", "new orleans"],

  // ── U ─────────────────────────────────────────────────────────────────
  "u-arizona": ["ua", "wildcats", "tucson", "arizona"],
  "uc-berkeley": ["ucb", "cal", "bears", "berkeley"],
  "uc-davis": ["ucd", "aggies", "davis"],
  uci: ["uc irvine", "irvine", "anteaters"],
  ucla: ["bruins", "uc la"],
  uconn: ["huskies", "storrs", "connecticut"],
  ucr: ["uc riverside", "riverside", "highlanders"],
  ucsb: ["uc santa barbara", "santa barbara", "gauchos"],
  ucsc: ["uc santa cruz", "santa cruz", "banana slugs"],
  ucsd: ["uc san diego", "san diego", "tritons"],
  uf: ["gators", "gainesville", "florida"],
  uic: ["illinois chicago", "flames"],
  uiuc: ["illinois", "u of i", "champaign", "urbana", "fighting illini", "university of illinois"],
  uky: ["kentucky", "wildcats", "lexington ky"],
  umass: ["amherst", "minutemen", "u mass"],
  // University of Maryland — College Park (only MD campus in dataset)
  // "umd" also catches UMBC / UMGC queries since those campuses share the UMD system
  umd: [
    "maryland",
    "terps",
    "terrapins",
    "college park",
    "umcp",
    "umbc",
    "baltimore county",
    "university of maryland baltimore county",
    "umgc",
    "global campus",
    "university of maryland global campus",
  ],
  umn: ["minnesota", "gophers", "twin cities", "u of m"],
  unc: ["north carolina", "tar heels", "chapel hill"],
  unl: ["nebraska", "cornhuskers", "lincoln ne"],
  upenn: ["penn", "wharton", "quakers"],
  usc: ["trojans", "southern cal", "southern california"],
  usf: ["south florida", "bulls", "tampa"],
  "ut-austin": ["ut", "longhorns", "texas", "university of texas"],
  "ut-dallas": ["utd", "comets", "richardson"],
  utah: ["utes", "salt lake", "slc"],
  utk: ["tennessee", "vols", "volunteers", "knoxville"],
  uva: ["virginia", "cavaliers", "wahoos", "hoos", "charlottesville"],
  uw: ["washington", "huskies", "seattle", "u dub"],
  "uw-madison": ["wisconsin", "badgers", "madison"],

  // ── V ─────────────────────────────────────────────────────────────────
  vanderbilt: ["vandy", "commodores"],
  "virginia-tech": ["vt", "hokies", "blacksburg", "virginia polytechnic"],

  // ── W ─────────────────────────────────────────────────────────────────
  wpi: ["worcester polytechnic", "worcester", "engineers"],
  wsu: ["washington state", "cougars", "cougs", "pullman wa"],

  // ── Y ─────────────────────────────────────────────────────────────────
  yale: ["bulldogs", "new haven"],
};
