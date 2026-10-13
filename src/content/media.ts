/**
 * Every photo and video used on the site lives here, so assets can be swapped
 * without touching components.
 *
 * Images are hot-linked from Unsplash (free licence) as stand-ins: replace with
 * commissioned photography before launch.
 */

export type Photo = { id: string; alt: string };

const p = (id: string, alt: string): Photo => ({ id, alt });

export const photos = {
  // Studio and people
  studioDesk: p("1497215728101-856f4ea42174", "Bright studio desk beside tall windows"),
  studioLoft: p("1497366811353-6870744d04b2", "Open loft studio with a long meeting table"),
  studioHall: p("1497366216548-37526070297c", "Glass-walled studio corridor"),
  studioLounge: p("1524758631624-e2822e304c36", "Studio lounge with shelving and soft chairs"),
  teamReview: p("1551434678-e076c223a692", "Two designers reviewing work at a screen"), // REPLACE with real team
  workshop: p("1556761175-5973dc0f32e7", "Team workshop in a brick-walled room"), // REPLACE with real team
  wireframes: p("1531403009284-440f080d1e12", "Hand arranging paper interface sketches on a wall"),
  sketching: p("1581291518857-4e27b48ff24e", "Sketching a wireframe by hand"),
  tablet: p("1586717791821-3f44a563fa4c", "Interface layout on a tablet"),
  swatches: p("1561070791-2526d30994b5", "Printed colour swatches and layouts on a desk"),
  code: p("1517694712202-14dd9538aa97", "Laptop showing code beside a plant"),
  launchDesk: p("1499951360447-b19be8fe80f5", "Finished website open on a desktop display"),

  // Architecture and light
  arches: p("1524230572899-a752b3835840", "White arched corridor in soft daylight"),
  whiteBlock: p("1479839672679-a46483c0e7c8", "White apartment block against a pale sky"),
  whiteAngles: p("1487958449943-2429e8be8625", "Angular white building under an overcast sky"),
  blueCurves: p("1518005020951-eccb494ad742", "Curved glass towers seen from below"),
  facade: p("1493397212122-2b85dda8106b", "Rippled metal facade against blue sky"),
  towers: p("1486406146926-c627a92ad1ab", "Glass office towers seen from the street"),
  lamp: p("1494438639946-1ebd1d20bf85", "Black wall lamp on a sage wall"),

  // Interiors and products (used inside the interface mockups)
  sofaGreen: p("1555041469-a586c61ea9bc", "Green velvet sofa"),
  sofaTan: p("1540574163026-643ea20ade25", "Tan leather sofa"),
  sofaGrey: p("1493663284031-b7e3aefcae8e", "Grey sofa with patterned cushions"),
  armchair: p("1567538096630-e0c55bd6374c", "White tufted armchair"),
  stool: p("1503602642458-232111445657", "White wooden stool"),
  chairBlack: p("1592078615290-033ee584e267", "Black moulded chair"),
  chairYellow: p("1586023492125-27b2c045efd7", "Yellow armchair in a white room"),
  roomBeige: p("1631679706909-1844bbd07221", "Beige living room with round mirrors"),
  roomWarm: p("1616046229478-9901c5536a45", "Warm living room with plants"),
  roomLight: p("1616486338812-3dadae4b4ace", "Pale living room with a low table"),
  roomPlants: p("1513694203232-719a280e022f", "White room with a sofa and plants"),
  roomWhite: p("1519710164239-da123dc03ef4", "White dining nook with dried flowers"),
  bedroom: p("1505693416388-ac5ce068fe85", "Bedroom with a tufted bench"),
  houseDusk: p("1600585154340-be6161a56a0c", "Modern house lit at dusk"),
  houseLiving: p("1600607687939-ce8a6c25118c", "Open-plan living room"),
  houseWood: p("1618221195710-dd6b41faaea6", "Wood-panelled living room"),
} satisfies Record<string, Photo>;

export const photoUrl = (photo: Photo, w: number, h?: number) =>
  `https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&q=72&w=${w}${h ? `&h=${h}` : ""}`;
